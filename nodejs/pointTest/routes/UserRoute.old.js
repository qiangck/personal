﻿
/*
 * GET users listing.
 */
// errorCode:
// 320 用户名或密码不能为空
// 321 用户名已存在
// 322 用户名错误
// 323 密码错误
// 324 用户名或密码错误

var User = require('../libs/models/User');
var Point = require('../libs/models/Point');
var HttpHelper = require('../libs/HttpHelper');
var SessionHelper = require('../libs/SessionHelper');
var Util = require('../libs/Util');
var fs = require('fs');



var UserRoute = {
    login: function(req, res) {
        res.render('login', {title:'设计制作部打分系统'});
    },
	signUp: function(req, res) {
        var responseJson = {};
        res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
        var userStatus = req.session.user.user_status;
        if (userStatus !== 2) {
            responseJson = {status: 'failed', code: 433, message: '没有创建用户的权限'};
            return res.end(JSON.stringify(responseJson));
        }
		var info = HttpHelper.getHttpPostParams(req);
		var user = new User(info);
		// TODO排重
        user.update(function(error, data) {
            if(error) {
                responseJson = {status: 'failed', code: error.code || 433, message: error.message || '创建用户失败，请稍后重试'};
            } else {
                responseJson = {
                    code: 200,
                    status: 'success',
                    message: '用户创建成功!'
                };
            }
            res.end(JSON.stringify(responseJson));
        });
		
	},
	signIn: function(req, res) {
        var responseJson = {};
		var params = HttpHelper.getHttpPostParams(req);
		var userName = params.user_name;
        var password = params.password;
        if (!userName || !password) {
            req.session.error='用户名或密码不正确';
            return res.redirect('/login');
        }
		User.get(userName, function(error, user) {
			if (error || !user || user.password !== password) {
                req.session.error='用户名或密码不正确';
                return res.redirect('/login');
			} else {
                req.session.user = user;
                SessionHelper.add(user);
                console.log('go home');
                return res.redirect('/');
            }
		});
	},
    signOut: function(req, res) {
        var user = req.session.user;
        SessionHelper.delete(user);
        return res.redirect('/login');
    },
    delete: function(req, res) {
        var responseJson = {};
        res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
        var params = HttpHelper.getHttpPostParams(req);
        User.delete(params.user_name, function(error, data) {
            if (error) {
                responseJson = {status: 'failed', message: '删除用户失败', code: 333};
            } else {
                responseJson = {
                    status: 'success', 
                    message: '成功删除用户!', 
                    code: 200, 
                    pointList: data
                };
            }
            res.end(JSON.stringify(responseJson));
        });
    },
    changePwd: function(req, res) {
        var responseJson = {};
        res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
        var user = req.session.user;
        var params = HttpHelper.getHttpGetParams(req);
        if(typeof params.password === 'string' && params.password.length > 5) {
            User.changePwd(user.user_id, params.password, function(error, data) {
                if(error) {
                    responseJson = {status: 'failed', code: error.code || 433, message: error.message || '修改密码失败'};
                    res.end(JSON.stringify(responseJson));
                } else {
                    responseJson = {status: 'success', code: 200, message: '成功修改密码'};
                    res.end(JSON.stringify(responseJson));
                }
            })
        } else {
            responseJson = {status: 'failed', code: 433, message: '修改密码失败'};
            res.end(JSON.stringify(responseJson));
        }
    },
    home: function(req, res) {
        console.log('home');
        res.render('index');
    },
    getUserInGroup: function(req, res) {
        var responseJson = {};
        res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
        var params = HttpHelper.getHttpGetParams(req);
        User.getTeamUsers(params.user_team, function(error, users) {
            if(error) {
                responseJson = {status: 'failed', code: error.code || 433, message: error.message || '获取 ' + params.user_team + ' 成员列表失败'};
                res.end(JSON.stringify(responseJson));
            } else {
                console.log('getUserInGroup');
                var curUser = req.session.user;
                console.log(curUser);
                Point.get({point_from: curUser.user_name, dt_created: Util.getCurDateStr()}, function(err, points) {
                    points = points || [];
                    var count = 0;
                    users.forEach(function(user, index){
                        points.forEach(function(point, index2) {
                            if(user.user_name == point.point_to) {
                                user.point_num = point.point_num;
                                console.log(point);
                            }
                        });
                        user.files = getUserWorksPath(user);
                        return user;
                    });
                    responseJson = {
                        code: 200,
                        status: 'success',
                        users: users
                    };
                    res.end(JSON.stringify(responseJson));
                });
            }
        });
    }
};


var FILE_BASE = 'E:\\point\\pointTest\\public\\works';
var FILE_SEPARATOR = '\\';
// 处理客户端上传的表单
UserRoute.receiveClient = function(req, res) {
    var responseJson = {};
    res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
    var user = req.session.user;
    console.log(req.files);
    var fileName = req.files.client_file.name,
        filePath = req.files.client_file.path;

    if (fs.existsSync(FILE_BASE)) {
        var clientPath = FILE_BASE + FILE_SEPARATOR + user.user_id + FILE_SEPARATOR + fileName;
        console.log(clientPath);
        console.log('fs.readFile');
        console.log(fs.existsSync(FILE_BASE + FILE_SEPARATOR + user.user_id ));
        if(!fs.existsSync(FILE_BASE + FILE_SEPARATOR + user.user_id )) {
            console.log(FILE_BASE + FILE_SEPARATOR + user.user_id);
            fs.mkdirSync(FILE_BASE + FILE_SEPARATOR + user.user_id );
        }
        var fileArray = fs.readdirSync(FILE_BASE + FILE_SEPARATOR + user.user_id );
        if (fileArray.length === 3 && fileArray.indexOf(fileName) < 0) {
            responseJson = {status: 'failed', code: 433, message: '作品已上传三个，请删除后再上传'};
            return res.end(JSON.stringify(responseJson));
        }
        var readStream = fs.createReadStream(filePath);
        var writeStream = fs.createWriteStream(clientPath);

        //readStream.on('open', function (res) {
        readStream.pipe(writeStream);
        //});
        readStream.on('error', function(error) {
            responseJson = {status: 'failed', code: error.code || 433, message: error.message || '上传作品失败'};
            res.end(JSON.stringify(responseJson));
        });
        writeStream.on('error', function(error) {
            responseJson = {status: 'failed', code: error.code || 433, message: error.message || '上传作品失败'};
            res.end(JSON.stringify(responseJson));
        });

        readStream.on('end', function() {
            responseJson = {
                code: 200,
                status: 'success',
                filePath: '/works/' + user.user_id + '/' + fileName
            };
            res.end(JSON.stringify(responseJson));
        });
    } else {
        // 不存在暂时抛出错误
        // TODO改善
        responseJson = {status: 'failed', code: error.code || 433, message: error.message || '上传作品失败'};
        res.end(JSON.stringify(responseJson));
    }
};


function getUserWorksPath(user) {
    var clientPath = FILE_BASE + FILE_SEPARATOR + user.user_id;
    var files = [];
    if (!fs.existsSync(FILE_BASE + FILE_SEPARATOR + user.user_id ))           {
        return files;
    }
    var fileArray = fs.readdirSync(FILE_BASE + FILE_SEPARATOR + user.user_id );
    fileArray.forEach(function(file, index){
        files.push('/works/' + user.user_id + '/' + file);
    });
    return files;
}

UserRoute.getWorks = function(req, res) {
    var responseJson = {};
    res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
    var user = req.session.user;
    var clientPath = FILE_BASE + FILE_SEPARATOR + user.user_id;
    var fileArray = fs.readdirSync(FILE_BASE + FILE_SEPARATOR + user.user_id );
    var files = [];
    fileArray.forEach(function(file, index){
        files.push('/works/' + user.user_id + '/' + file);
    });
    responseJson = {
        code: 200,
        status: 'success',
        files: files
    };
    res.end(JSON.stringify(responseJson));
};
module.exports = UserRoute;
