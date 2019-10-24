const db = require('../../db/mongodb').db;

const run = ((req, res) => {
    const data = req.fields;
    const email = data.email;
    const vote_id = data.vote_id;
    const vote_list_pos = data.vote_list_pos;
    const vote_list_value = data.vote_list_value;
    if (!data) {
        res.status(200).send({"data": {"err": "Wrong data"}});
        return;
    }
    db.voteToVote(email, vote_id, vote_list_pos, vote_list_value).then(val => {
        if(val.result.n === 1){
            res.status(200).send({"result": true});
            return;
        }
        res.status(200).send({"err": "vote failed"});
    }).catch(err => {
        res.status(200).send({"err": err});
    })
});

module.exports = {
    run
};