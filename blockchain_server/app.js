// test-klaytn.js
const Caver = require('caver-js');
const caver = new Caver('http://127.0.0.1:8551');
const request = require('request');
const ConfigParser = require('configparser');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

const config = new ConfigParser();
config.read('config.cfg');
const userAddress = config.get('User', 'Address')
const userPrivKey = config.get('User', 'Key')


// contract
const Ballot = require('./build/contracts/Ballot.json');
let abi = Ballot.abi
let code = Ballot.bytecode

const Did = require('./build/contracts/DID.json');
let did_abi = Did.abi
let did_code = Did.bytecode

// express
var express = require('express');
var app = express();

// set user
caver.klay.accounts.wallet.add(userPrivKey)

// init db
db.defaults({
        votes: [],
        accounts: [],
        did: []
    })
    .write()

// init wallet
appendAllWallet()

function writeAddress(name, address, param) {
    db.get('votes')
        .push({
            name: name,
            address: address,
            param: param,
            date: new Date()
        }).write()
}

function writeDID(name, address, param) {
    db.get('did')
        .push({
            name: name,
            address: address,
            param: param,
            date: new Date()
        }).write()
}

function appendAllWallet() {
    let val = db.get('accounts')
        .value()
    for (let i = 0; i < val.length; i++) {
        caver.klay.accounts.wallet.add(val[i].key)
    }
}

function writeAccount(name, key, address, group, grade) {
    db.get('accounts')
        .push({
            name: name,
            key: key,
            address: address,
            group: group,
            grade: grade,
            date: new Date()
        }).write()
}

function sTob(mstring) {
    return caver.utils.padRight(caver.utils.utf8ToHex(mstring), 64)
}

function getBalance() {
    caver.klay.getBalance(userAddress).then(console.log)
}

function deployContract(name, param, cb, err) {
    let encode_param = [];
    for (let i = 0; i < param.length; i++) {
        encode_param.push(sTob(param[i]))
    }
    caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_DEPLOY',
        from: userAddress,
        data: caver.klay.abi.encodeContractDeploy(abi, code, encode_param),
        gas: '2000000',
        value: 0
    }).on('transactionHash', function (hash) {
        console.log("tHash: " + hash)
    }).on('receipt', function (receipt) {
        let contractAddress = receipt.contractAddress;
        writeAddress(name, contractAddress, param)
        cb(contractAddress)
    }).on('error', err)
}

function deployContractDID(name, param, cb, err) {
    let encode_param = [];
    for (let i = 0; i < param.length; i++) {
        encode_param.push(sTob(param[i]))
    }
    caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_DEPLOY',
        from: getUserAddress(name),
        data: caver.klay.abi.encodeContractDeploy(did_abi, did_code, encode_param),
        gas: '2000000',
        value: 0
    }).on('transactionHash', function (hash) {
        console.log("tHash: " + hash)
    }).on('receipt', function (receipt) {
        let contractAddress = receipt.contractAddress;
        writeDID(name, contractAddress, param)
        cb(contractAddress)
    }).on('error', err)
}

function makeDID(name, param, cb){
    deployContractDID(name, param, (val) => {
        console.log(val)
        cb(val)
    }, (err) => {
        console.log(err)
        cb(err)
    })
}

function getChairperson(contractAddress) {
    const ballot = new caver.klay.Contract(Ballot.abi, contractAddress);
    ballot.methods.chairperson().call().then(console.log);
}

function makeVote(contractAddress, address, index, cb, err) {
    const ballot = new caver.klay.Contract(Ballot.abi, contractAddress);
    ballot.methods.vote(index).send({
            from: address,
            gas: 3000000
        }).then(cb)
        .catch(err);
}

function giveRightToVote(contractAddress, address, cb, err) {
    const ballot = new caver.klay.Contract(Ballot.abi, contractAddress);
    ballot.methods.giveRightToVote(address).send({
            from: userAddress,
            gas: 3000000
        }).then(cb)
        .catch(err);
}

function getProposals(contractAddress, index, cb, err) {
    const ballot = new caver.klay.Contract(Ballot.abi, contractAddress);
    ballot.methods.proposals(index).call().then(val => {
        proposal_name = caver.utils.hexToUtf8(caver.utils.toHex(val.name))
        proposal_count = val.voteCount
        cb(proposal_name + "/" + proposal_count)
    }).catch(err)
}

function getWinner(contractAddress, cb, err) {
    const ballot = new caver.klay.Contract(Ballot.abi, contractAddress);
    ballot.methods.winnerName().call().then(val => {
        cb(caver.utils.hexToUtf8(caver.utils.toHex(val)))
    }).catch(err);
}

function getContractAddress(name) {
    let val = db.get('votes')
        .find({
            name: name
        })
        .value()
    if (typeof val === "undefined") {
        return val
    }
    return val.address
}

function createUser(name, group, grade) {
    if (getUserAddress(name) !== "") {
        return "undefined"
    }
    let account = caver.klay.accounts.create()
    let key = account.privateKey
    let address = account.address
    writeAccount(name, key, address, group, grade);
    get_klay(address)
    makeDID(name, "", function(){
        return address;
    })
}

function getUserAddress(name) {
    let val = db.get('accounts')
        .find({
            name: name
        })
        .value()
    if (typeof val === "undefined") {
        return ""
    } else {
        let address = caver.klay.accounts.privateKeyToAccount(val.key).address
        return address
    }
}

function privateKeyToAccount(privateKey) {
    let account = caver.klay.accounts.privateKeyToAccount(privateKey)
}

app.get('/create-user', function (req, res) {
    let name = req.query.name
    let group = req.query.group
    let grade = req.query.grade
    if (typeof name === "undefined") {
        res.send('')
    }
    let result = createUser(name, group, grade)
    if (result !== "undefined") {
        res.send(result)
    } else {
        res.send("")
    }
});

app.get('/proposals', function (req, res) {
    let contract = req.query.contract
    let index = req.query.index
    if (typeof contract === "undefined") {
        res.send('')
    }
    let contract_address = getContractAddress(contract)
    getProposals(contract_address, index, (val) => {
        res.send(val)
    }, (err) => {
        res.send(false)
    })
})

app.get('/user-address', function (req, res) {
    let name = req.query.name
    if (typeof name === "undefined") {
        res.send('err')
    }
    let result = getUserAddress(name)
    if (result !== "undefined") {
        res.send(result)
    } else {
        res.send("err")
    }
});

app.get('/vote', function (req, res) {
    let name = req.query.name
    let contract = req.query.contract
    if (typeof name === "undefined") {
        res.send('')
    }
    let address = getUserAddress(name)
    let contract_address = getContractAddress(contract)
    makeVote(contract_address, address, 0, (val) => {
        console.log(val);
        res.send('true')
    }, (err) => {
        console.log(err);
        res.send('false')
    })
})

app.get('/give-right', function (req, res) {
    let name = req.query.name
    let contract = req.query.contract
    if (typeof name === "undefined") {
        res.send('')
    }
    let address = getUserAddress(name)
    let contract_address = getContractAddress(contract)
    giveRightToVote(contract_address, address, (val) => {
        console.log(val);
        res.send('true')
    }, (err) => {
        console.log(err);
        res.send('false')
    })
})

app.get('/make-vote', function (req, res) {
    let contract = req.query.contract
    let param = req.query.param.split(",")
    if (typeof contract === "undefined") {
        res.send('')
    }
    let contract_address = getContractAddress(contract)
    if (typeof contract_address !== "undefined") {
        res.send(false)
        return;
    }
    deployContract(contract, param, (val) => {
        console.log(val)
        res.send(val)
    }, (err) => {
        console.log(err)
        res.send(false)
    })
})


app.get('/getWinner', function (req, res) {
    let contract = req.query.contract

    if (typeof contract === "undefined") {
        res.send('')
    }
    let contract_address = getContractAddress(contract)
    getWinner(contract_address, (val) => {
        console.log(val)
        res.send(val)
    }, (err) => {
        console.log(err)
        res.send(false)
    })
})

app.listen(3000, function () {
    console.log('server listening on port 3000!');
});

function get_klay(faucet_address) {
    request({
        headers: {
            'Content-Length': '0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'authority': 'api-baobab.wallet.klaytn.com',
            'origin': 'https://baobab.wallet.klaytn.com',
        },
        uri: 'https://api-baobab.wallet.klaytn.com/faucet/run?address=' + faucet_address,
        method: 'POST'
    }, function (err, res, body) {
        console.log(body)
    });
}