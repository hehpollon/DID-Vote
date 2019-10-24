const db = require('../../db/mongodb').db;
var crypto = require('crypto');

const run = ((req, res) => {
    const data = req.fields;
    const email = data.email;
    const pw = data.pw;
    if (!data) {
        res.status(200).send({"data": {"err": "Wrong data"}});
        return;
    }
    db.getUser(email).then(val => {
        const hash = crypto.createHash('sha256').update(pw).digest('base64');
        if(hash === val[0].pw){
            res.status(200).send({
                "pw_confirm": true
            })
        }else{
            res.status(200).send({
                "pw_confirm": false
            })
        }
    })
});

module.exports = {
    run
};