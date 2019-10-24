const db = require('../../db/mongodb').db;

const run = ((req, res) => {
    const data = req.fields;
    const email = data.email;
    const vote_id = data.vote_id;
    if (!data) {
        res.status(200).send({"data": {"err": "Wrong data"}});
        return;
    }
    db.deleteVote(email, vote_id).then(val=>{
        if(val.result.n === 0) {
            res.status(200).send({
                "deleted": false,
            });
            return
        }
        res.status(200).send({
            "deleted": true,
        })
    }).catch(err => {
        res.status(200).send({"err": err})
    })
});

module.exports = {
    run
};