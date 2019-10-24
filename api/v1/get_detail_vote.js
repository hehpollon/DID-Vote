const db = require('../../db/mongodb').db;

const run = ((req, res) => {
    const data = req.fields;
    const email = data.email;
    const vote_id = data.vote_id;
    if (!data) {
        res.status(200).send({"data": {"err": "Wrong data"}});
        return;
    }
    db.getDetailVote(email, vote_id).then(val => {
        res.status("200").send({"data": val[0]})
    }).catch(err => {
        res.status("200").send({"err": err})
    })

});


module.exports = {
    run
};