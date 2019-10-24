const db = require('../../db/mongodb').db;

const run = ((req, res) => {
    const data = req.fields;
    const email = data.email;
    const pw = data.pw;
    if (!data) {
        res.status(200).send({"data": {"err": "Wrong data"}});
        return;
    }
    db.setPw(email, pw).then(
        res.status(200).send({"set_pw": true})
    ).catch(err => {
        res.status(200).send({"err": err})
    })
});

module.exports = {
    run
};