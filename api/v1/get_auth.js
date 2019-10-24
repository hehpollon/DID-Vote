const db = require('../../db/mongodb').db;

const run = ((req, res) => {
    const data = req.fields;
    const email = data.email;
    if (!data) {
        res.status(200).send({"data": {"err": "Wrong data"}});
        return;
    }
    db.getUser(email).then(val => {
        if(val.length === 0) {
            db.setUser(email)
                .then((data)=>{send_request(data,true, res)})
                .catch((err)=>{send_error(err, res)});
            return;
        }
        send_request(val[0], false, res)
    }).catch(send_error.bind(null, res));

});

const send_request = (val, is_init, res) => {
    if(is_init) {
        val = val.ops[0];
    }
    res.status(200).send(
        {
            "is_mail_send": val.is_mail_send,
            "is_auth_user": val.is_auth_user
        });
};

const send_error = (err, res) => {
    res.status(200).send({"err": err});
};

module.exports = {
    run
};