const db = require('../../db/mongodb').db;

const run = ((req, res) => {
    const data = req.fields;
    const email = data.email;
    if (!data) {
        res.status(200).send({"data": {"err": "Wrong data"}});
        return;
    }
    db.getVoteList(email).then(val => {
        res.status("200").send({"data": {"list": val}})
    }).catch(err => {
        res.status("200").send({"err": err})
    })

});


module.exports = {
    run
};