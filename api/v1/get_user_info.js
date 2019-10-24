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
            res.status(200).send({"err": "No such user"});
            return;
        }
        val = val[0];
        let result = {};
        result.email = val.email;
        result.grade = val.grade;
        result.group = val.group;
        res.status(200).send(result)
    }).catch(err => {
        res.status(200).send({"err": err})
    });
});


module.exports = {
    run
};