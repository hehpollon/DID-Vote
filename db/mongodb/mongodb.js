const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const crypto = require('crypto');
let db;

const uri = "mongodb://root:password@127.0.0.1:27017";
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, database) => {
    if (err) {
        console.error('MongoDB 연결 실패', err);
        return;
    }
    console.log("MongoDB connected!");
    db = database.db('cop');

    db.collection('users').createIndex( { "email": 1 } );
    db.collection('vote').createIndex( { "email": 1 } );
    db.collection('vote_to_vote').createIndex( { "email": 1 } );
});

function getUser(email){
    return new Promise((resolve, reject) => {
        db.collection("users").find({"email": email}).toArray(function(err, items) {
            if (err) {
                reject(err)
            }else{
                resolve(items)
            }
        });
    });
}

function setUser(email){
    return db.collection('users').insertOne({
        email: email,
        is_auth_user: false,
        is_mail_send: false,
        grade: "",
        group: "",
        pw: "",
    });
}

function setPw(email, pw){
    const hash = crypto.createHash('sha256').update(pw).digest('base64');
    return db.collection('users').updateOne({
        email: email
    }, {
        $set:{
            "pw": hash
        }
    });
}

function makeVote(email, vote_data){
    let title = vote_data.title;
    let start_date = vote_data.start_date;
    let end_date = vote_data.end_date;
    let content = vote_data.content;
    let vote_list = vote_data.vote_list;
    let vote_result = vote_data.vote_result;
    let count = vote_data.count;
    let is_public = vote_data.public;

    return db.collection('vote').insertOne({
        email: email,
        title: title,
        start_date: start_date,
        end_date: end_date,
        content: content,
        vote_list: vote_list,
        vote_result:vote_result,
        count:count,
        public: is_public,
        valid: true
    });
}

function deleteVote(email, vote_id){
    return db.collection('vote').updateOne({
        _id: ObjectID(vote_id),
        email: email,
    }, {
        $set:{
            "valid": false
        }
    });
}

function voteToVote(email, vote_id, vote_list_pos, vote_list_value){
    return new Promise((resolve, reject) => {
        is_already_vote(email, vote_id).then(is_vote => {
            if(is_vote) {
                reject("Already voted!")
            }else{
                db.collection('vote_to_vote').insertOne({
                    vote_id: vote_id,
                    email: email,
                    vote_list_pos: vote_list_pos,
                    vote_list_value: vote_list_value,
                }).then(val => {
                    let inc = {};
                    inc["vote_result." + vote_list_value] = 1;
                    inc["count"] = 1;
                    db.collection('vote').updateOne({
                        _id: ObjectID(vote_id)
                    }, {
                        $inc: inc
                    }).then(resolve).catch(reject)
                }).catch(reject)
            }
        }).catch(reject)
    })
}

function is_already_vote(email, vote_id) {
    return new Promise((resolve, reject) => {
        db.collection('vote_to_vote').findOne({
            vote_id: vote_id,
            email: email
        }).then(val => {
            if(val !== null) {
                resolve(true)
            }else{
                resolve(false)
            }
        }).catch(reject)
    })
}

function getVoteList(email){
    return new Promise((resolve, reject) => {
        db.collection("vote").find({"valid": true}).toArray(function(err, items) {
            if (err) {
                reject(err)
            }else{
                resolve(items)
            }
        });
    });
}

function getDetailVote(email, vote_id){
    return new Promise((resolve, reject) => {
        db.collection("vote").find({"valid": true, _id: ObjectID(vote_id)}).toArray(function(err, items) {
            if (err) {
                reject(err)
            }else{
                resolve(items)
            }
        })
    });
}

function updateUserInfo(email, group, grade){
    return db.collection('users').updateOne({
        email: email,
    }, {
        $set:{
            "group": group,
            "grade": grade,
        }
    });
}

module.exports = {
    getUser:getUser,
    setUser:setUser,
    setPw:setPw,
    makeVote:makeVote,
    deleteVote:deleteVote,
    voteToVote:voteToVote,
    getVoteList:getVoteList,
    getDetailVote:getDetailVote,
    updateUserInfo:updateUserInfo,
};