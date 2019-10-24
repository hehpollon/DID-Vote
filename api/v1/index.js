const getAuth = require("./get_auth");
const setPw = require("./set_pw");
const confirmPw = require("./confirm_pw");
const makeVote = require("./make_vote");
const deleteVote = require("./delete_vote");
const getVoteList = require("./get_vote_list");
const voteToVote = require("./vote_to_vote");
const getDetailVote = require("./get_detail_vote");
const getUserInfo = require("./get_user_info");
const editUserInfo = require("./edit_user_info");

module.exports = {
    getAuth,
    setPw,
    confirmPw,
    makeVote,
    deleteVote,
    voteToVote,
    getVoteList,
    getDetailVote,
    getUserInfo,
    editUserInfo,
};