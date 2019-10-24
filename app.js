let express = require('express');
let api = require('./api/v1');
var cors = require('cors');
var morgan = require('morgan');
const formidable = require('express-formidable');

const MongoClient = require('mongodb').MongoClient;


//////////////  express setting
let app = express();
app.use(formidable());
app.use(cors());
app.use(morgan('combined'));
///////////////////////////////


const uri = "mongodb://root:password@127.0.0.1:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log("connecting...");
    if(err) {
        console.log(err);
        return;
    }
    console.log("connected");
});

app.get('/api/v1/status', function(req, res) {
    res.status(200).send({"status":"good"});
});

app.post('/api/v1/get_auth', api.getAuth.run);
app.post('/api/v1/set_pw', api.setPw.run);
app.post('/api/v1/confirm_pw', api.confirmPw.run);
app.post('/api/v1/make_vote', api.makeVote.run);
app.post('/api/v1/delete_vote', api.deleteVote.run);
app.post('/api/v1/get_list', api.getVoteList.run);
app.post('/api/v1/vote_to_vote', api.voteToVote.run);
app.post('/api/v1/get_detail_vote', api.getDetailVote.run);
app.post('/api/v1/get_user_info', api.getUserInfo.run);
app.post('/api/v1/edit_user_info', api.editUserInfo.run);

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
