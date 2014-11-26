var UserRoute = require('./UserRoute');
var PointRoute = require('./PointRoute');
var SessionHelper = require('../libs/SessionHelper');

// 静态变量
var API_BASE = '';

//配置的路由规则
//url为匹配的uri
//action---对应的http action
//callback---执行的函数
var routesRules = {

	//用户相关
  // 登录
  HOME: {
      url: API_BASE + '/',
      action: 'all',
      bCheck: true,
      callback: UserRoute.home
  },
  HOME1: {
      url: API_BASE + '/home',
      action: 'all',
      bCheck: true,
      callback: UserRoute.home
  },
  SIGNIN: {
    url: API_BASE + '/signin',
    action: 'post',
    bCheck: false,
    callback: UserRoute.signIn
  },
  // 注册
  SIGNUP: {
    url: API_BASE + '/signup',
    action: 'all',
    bCheck: true,
    callback: UserRoute.signUp
  },
  // 登录页面
  LOGIN: {
    url: API_BASE + '/login',
    action: 'all',
    bCheck: false,
    callback: UserRoute.login
  },
  // 
  SIGNOUT: {
    url: API_BASE + '/signout',
    action: 'all',
    bCheck: false,
    callback: UserRoute.signOut
  },
  CHANGE_PWD: {
    url: API_BASE + '/pwd',
      action: 'post',
      bCheck: true,
      callback:UserRoute.changePwd
  },
  GET_USERS: {
    url: API_BASE + '/users',
    action: 'get',
    bCheck: true,
    callback: UserRoute.getUserInGroup
  },
  DELETE_USER: {
    url: API_BASE + '/user/delete',
    action: 'post',
    bCheck: true,
    callback: UserRoute.delete
  },
  UPDATE_ICON: {
      url: API_BASE + '/user/icon',
      action: 'post',
      bCheck: true,
      callback: UserRoute.updateIcon
  },
  GRADE: {
    url: API_BASE + '/point/grade',
    action: 'post',
    bCheck: true,
    callback: PointRoute.grade
  },
    GET_POINT: {
        url: API_BASE + '/point',
        action: 'get',
        bCheck: true,
        callback: PointRoute.getPoints
    },
    UPLOAD_WORKS: {
        url: API_BASE + '/works',
        action: 'post',
        bCheck: true,
        callback: UserRoute.receiveClient
    },
    GET_WORKS: {
        url: API_BASE + '/works',
        action: 'get',
        bCheck: true,
        callback: UserRoute.getWorks
    },
    DOWNLOAD_WORKS: {
        url: API_BASE + '/works/download',
        action: 'get',
        bCheck: true,
        callback: UserRoute.downloadWork
    }
};
function checkSession(req, res, next) {
  var user = req.session.user;
  if (!user || SessionHelper.authorize(user) == false) {
    return res.redirect('/login');
  } else {
    next();
  }
}

function initialize(app) {
	var rule = null;
  var filter = function(req, res, next) {
    next();
  };
	console.log('routes initialize start: ');
	for (key in routesRules) {
		rule = routesRules[key];
		if (rule.action && rule.url && rule.callback) {
      console.log('Url: ' + rule.url + '  &&  Action: ' + rule.action);
      (function(rule) {
        app[rule.action](rule.url, function(req, res, next) {
          if (rule.bCheck) {
            checkSession(req, res, next);
          } else {
            next();
          }
        }, rule.callback);
      })(rule);
		}
	}
}

exports.init = initialize;