const db = require('../../db/mongodb').db;

const run = ((req, res) => {
    const data = req.fields;
    const email = data.email;
    const title = data.title;
    const start_date = data.start_date;
    const end_date = data.end_date;
    const content = data.content;
    const vote_list = data.vote_list.split(",");
    const is_public = data.public;
    if (!data) {
        res.status(200).send({"data": {"err": "Wrong data"}});
        return;
    }
    let vote_candidate = [];
    let vote_result = {};
    for(let i = 0; i < vote_list.length; i++) {
        let candidate = vote_list[i].trim();
        vote_candidate.push(candidate);
        vote_result[candidate] = 0;
    }
    let vote_data = {
        "title": title,
        "start_date": start_date,
        "end_date": end_date,
        "content": content,
        "vote_list": vote_candidate,
        "vote_result": vote_result,
        "public": is_public,
        "count": 0
    };
    db.makeVote(email, vote_data).then(val=>{
        res.status(200).send({
            "vote_made": true,
            "vote_id": val.ops[0]._id
        })
    }).catch(err => {
        res.status(200).send({"err": err})
    })
});

module.exports = {
    run
};