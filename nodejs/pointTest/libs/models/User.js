/**
 * Created with JetBrains WebStorm.
 * User: Rechie
 * Date: 13-9-11
 * Time: 上午9:47
 * To change this template use File | Settings | File Templates.
 */

var Util = require('../Util');
var SqlHelper = require('../SqlHelper');
var dbService = require('../dbService');
var connection = dbService.connection;

function User(userInfo){
    this.user_id = 0 || userInfo.user_id
    this.user_name = userInfo.user_name;
    this.password =  userInfo.password || 'people';
    this.user_team =  userInfo.user_team || '设计师';
    this.user_profession = userInfo.user_profession || '设计师';
    this.dt_created = Util.getCurDateStr();
    this.user_status =  userInfo.user_status || 1;
    this.user_info = '' || userInfo.info;
}

User.prototype.getName = function(){
    return this.user_name;
};

User.prototype.getPassword = function(){
    return this.password;
};

User.prototype.getTeam = function() {
    return this.user_team;
};

User.prototype.getProfession = function() {
    return this.user_profession;
};

User.prototype.getStatus = function() {
    return this.user_status;
};

User.prototype.update = function(callback) {
    var self = this;
    User.get(this.user_name, function(error, user) {
        if (error) {
            callback({message: '用户已存在', status: 321}, null);
            return;
        }
        if(user !== null) {
            callback({message: '用户已存在', status: 321}, null);
            return;
        }

        var queryStr = SqlHelper.getInsertUserQuery(self, connection);
        dbService.query(queryStr, callback);
    });
};

User.get = function(name, callback) {
    if (!name || typeof name !== 'string') {
        callback({message: '用户名不能为空'}, null);
        return;
    }
    var queryStr = SqlHelper.getSelectUserQuery(name, connection);
    dbService.query(queryStr, function(error, rows) {
        if (error) {
            callback(error, null);
        } else if (rows.length < 1 || !rows[0]) {
            callback(null, null);
        } else {
            var user = new User(rows[0]);
            callback(null, user);
        }
    });
};

User.delete = function(userName, callback) {
    if (!userName || typeof userName !== 'string') {
        callback({message: '用户名不能为空'}, null);
        return;
    }
    var queryStr = SqlHelper.getDeleteUserQuery(userName, connection);
    dbService.query(queryStr, callback);
};
User.changePwd = function(userId, pwd, callback) {
    var queryStr = SqlHelper.changePwd(userId, pwd, connection);
    dbService.query(queryStr, callback);
};

User.getTeamUsers = function(userTeam, callback) {
    var queryStr = SqlHelper.getTeamUsersQuery(userTeam, connection);
    dbService.query(queryStr, callback);
}

module.exports = User;