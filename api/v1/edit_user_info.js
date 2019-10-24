const db = require('../../db/mongodb').db;

const run = ((req, res) => {
    const data = req.fields;
    const email = data.email;
    const grade = data.grade;
    const group = data.group;
    if (!data) {
        res.status(200).send({"data": {"err": "Wrong data"}});
        return;
    }
    db.updateUserInfo(email, group, grade).then(val => {
        if(val.result.n === 1){
            res.status(200).send({"update": true})
        }else{
            res.status(200).send({"err": "Edit user info failed"});
        }
    }).catch(err =>{
        res.status(200).send({"err": err});
    })

});


module.exports = {
    run
};