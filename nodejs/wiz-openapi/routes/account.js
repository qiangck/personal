/*
 * GET account info
 */
var UserService = require('../libs/service/UserService');
var url = require('url');
var config = require('../conf/config');
var LimitService = require('../libs/service/LimitService');
var wizResponse = require('./wizResponse');
var HttpUtil = require('../libs/util/HttpUtil');


function getHttpPostParams(req, key) {
	//获取http post的参数
	return req.body[key];
}

function getHttpGetParams(req) {
	//获取http get的参数
	return url.parse(req.url, true).query;
}


var Account = {
	login: function (req, res) {
		res = wizResponse.initDefault(res);
		//ip校验
		var ip = HttpUtil.getIP(req),
			type = 'login',
		//获取参数
			userId = getHttpPostParams(req, 'user_id'),
			password = getHttpPostParams(req, 'password'),
			cookieStr = getHttpPostParams(req, 'cookie_str'),
		// 增加调试模式，测试新kb使用，暂时需要手动加入
			debugModel = getHttpPostParams(req, 'debug'),
			responseJson = {};

		if (LimitService.isOverLimit(ip, type)) {
			res.end(JSON.stringify({code: 488, message: 'login error over time.'}));
			return;
		}

		if (typeof cookieStr !== 'string' && (typeof userId !== 'string' || typeof password !== 'string')) {
			//用户名或密码非法时提示
			responseJson = {'code': 322, 'message': 'email or password error'};
			res.end(JSON.stringify(responseJson));
			return;
		}

		UserService.login(userId, password, cookieStr, function loginCallback(error, value) {
			LimitService.addRecord(ip, type);
			if (error) {
				responseJson = {'code': error.faultCode, 'message': error.faultString};
				// LimitService.addRecord(ip, type);
			} else {
				// LimitService.removeRecord(ip, type);
				responseJson = {'code': value.return_code, 'message': 'success', 'token': value.token, 'cookie_str': value.cookieStr, 'kb_guid': value.kb_guid};
			}
			res.end(JSON.stringify(responseJson));
		}, debugModel);
	}, 

	register: function (req, res) {

		res = wizResponse.initDefault(res);
		//ip校验
		var ip = HttpUtil.getIP(req);
		var type = 'register';
		if (LimitService.isOverLimit(ip, type)) {
			res.end(JSON.stringify({code: 489, message: 'register over time.'}));
			return;
		}
		//获取参数
		var userId = getHttpPostParams(req, 'user_id');
		var password = getHttpPostParams(req, 'password');
		var inviteCode = getHttpPostParams(req, 'invite_code');
		var localLanguage = getHttpPostParams(req, 'local');
		if (!userId || !password || typeof userId !== 'string' || typeof password !== 'string') {
			//用户名或密码非法时提示
			responseJson = {'code': 322, 'message': 'email or password error'};
			res.end(JSON.stringify(responseJson));
			return;
		}
		if (!inviteCode || typeof inviteCode !== 'string') {
			inviteCode = config.inviteCode;
		}
		//调用注册，成功后记录
		UserService.register(userId, password, ip, inviteCode, localLanguage, function registerCallback(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				LimitService.addRecord(ip, type);	
				responseJson.cookie_str = value.cookieStr;
			}
	   //  if(error){
				// console.log('UserService.register() Error: ' + error.message);
				// responseJson = {'code': error.faultCode, 'message': error.faultString};
	   //  }else{
	   //  	//成功后记录到LimitService中
	   //  	LimitService.addRecord(ip, type);
				// responseJson = {'code': value.return_code, 'message': value.return_message, 'cookie_str': value.cookieStr};
	   //  }
			res.end(JSON.stringify(responseJson));
		});
	},
	getUserInfo: function (req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpGetParams = getHttpGetParams(req);
		var token = httpGetParams.token;
		// 增加调试模式，测试新kb使用，暂时需要手动加入
		var debugModel = httpGetParams.debug;


		UserService.getUserInfo(token, function getUserInfoCallback(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.user_info = value;
			}
			// if (error) {
			// 	console.log('UserService.getUserInfo() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	responseJson = {'code': 200, 'message': 'success', 'user_info': value};
			// }
			res.end(JSON.stringify(responseJson));
		}, debugModel);
	},

	getGroupKbList: function (req, res) {
		res = wizResponse.initDefault(res);

		var responseJson = {};

		var httpGetParams = getHttpGetParams(req);
		var token = httpGetParams.token;
		// 增加调试模式，测试新kb使用，暂时需要手动加入
		var debugModel = httpGetParams.debug;


		UserService.getGroupKbList(token, function getGroupKbListCallback(error, value) {
			// responseJson = wizResponse.getResJson(error, value);
			// if (responseJson.code === 200) {
			// 	responseJson.user_info = value;
			// }
			if (error) {
				console.log('UserService.getGroupKbList() Error: ' + error.message);
				responseJson = {'code': error.faultCode, 'message': error.faultString};
			} else {
				responseJson = {'code': 200, 'message': 'success', 'list': value};
			}
			res.end(JSON.stringify(responseJson));
		}, debugModel);
	},

	keepAlive: function (req, res) {
		res = wizResponse.initDefault(res);

		var responseJson = {};

		var token = getHttpPostParams(req, 'token');
		var debugModel = getHttpPostParams(req, 'debug');
		UserService.keepAlive(token, function keepAliveCallback(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			// if (error) {
			// 	console.log('UserService.keepAlive() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	responseJson = {'code': value.return_code, 'message': 'success'};
			// }
			res.end(JSON.stringify(responseJson));
		}, debugModel);
	},

	logout: function (req, res) {
		res = wizResponse.initDefault(res);

		var responseJson = {};

		var httpGetParams = getHttpGetParams(req);
		var token = httpGetParams.token;
		var debugModel = httpGetParams.debug;

		UserService.logout(token, function getGroupKbListCallback(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.group_list = value;
			}
			// if (error) {
			// 	console.log('UserService.logout() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	responseJson = {'code': value.return_code, 'message': 'success', 'group_list': value};
			// }
			res.end(JSON.stringify(responseJson));
		}, debugModel);
	},
	getKbInfo: function (req, res) {
		res = wizResponse.initDefault(res);

		var responseJson = {};

		var httpGetParams = getHttpGetParams(req);
		var token = httpGetParams.token;
		var kbGuid = httpGetParams.kb_guid;

		UserService.getKbInfo(token, kbGuid, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			// if (error) {
			// 	console.log('UserService.getKbInfo() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	responseJson = {'code': value.return_code, 'message': 'success'};
			// }
			res.end(JSON.stringify(responseJson));
		});
	}
};


exports.login = Account.login;
exports.register = Account.register;
exports.getUserInfo = Account.getUserInfo;
exports.getGroupKbList = Account.getGroupKbList;
exports.keepAlive = Account.keepAlive;
exports.logout = Account.logout;
exports.getKbInfo = Account.getKbInfo;