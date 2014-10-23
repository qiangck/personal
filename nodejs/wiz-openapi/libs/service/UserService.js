var Wiz = require('./Wiz'),
		params = require('../models/Params'),
		kb = require('../models/KnowledgeBase'),
		ValueUtil = require('../util/ValueUtil');

var COOKIE_SPLITER = '*wiz*';

var UserService = {
	login: function (userId, password, cookieStr, callback, debug) {
		var requestParams = params.getDefaultParams(),
			bCookieLogin = false,
			client = Wiz.getClient(),
			originCookieStr = '',
			returnCookieStr = '';
		if (debug == 'true') {
			client = Wiz.getDebugClient();
		}

		function initParamsByNoCookie() {
			requestParams.user_id = userId;
			requestParams.password = password;
			originCookieStr = userId + COOKIE_SPLITER + password;
			returnCookieStr = ValueUtil.cipher(originCookieStr);
		}

		// 自动登陆,即通过cookieStr来登陆
		if (typeof cookieStr === 'string' && cookieStr.length > 0) {
			bCookieLogin = true;
			try {
				// 解密cookieStr
				var decipherStr = ValueUtil.decipher(cookieStr);
				var paramsList = decipherStr.split(COOKIE_SPLITER);
				requestParams.user_id = paramsList[0];
				requestParams.password = paramsList[1];
			} catch (error) {
				if (typeof userId !== 'string' || typeof password !== 'string' || userId.length < 1 || password.length < 1) {
					callback({'faultCode': 322, 'faultString': 'email or password error'});
					return;
				} 
				initParamsByNoCookie();
			}
		} else {
				initParamsByNoCookie();
		}

		client.methodCall(Wiz.api.LOGIN, [requestParams], function(error, value) {
			if (error) {
				callback(error, null);
				return;
			}
			if (bCookieLogin === false) {
				value.cookieStr = returnCookieStr;
			}
			kb.filter(value);
			callback(error, value);
		});
	},
	getUserInfo: function (token, callback, debug) {
		var getUserInfoCallback = function (error, value) {
			if (!error && value) {
				kb.filter(value);
			}
			callback(error, value);
		}

		var requestParams = params.getDefaultParams();
		requestParams.token = token;

		
		var client = Wiz.getClient();
		if (debug == 'true') {
			client = Wiz.getDebugClient();
		}
		client.methodCall(Wiz.api.LOGIN, [requestParams], getUserInfoCallback);
	},
	register: function (userId, password, ip, inviteCode, localLanguage, callback, debug) {
		var requestParams = params.getDefaultParams();
		requestParams.user_id = userId;
		requestParams.password = password;
		requestParams.invite_code = inviteCode;
		requestParams.locale = localLanguage;

		// 增加ip
		var client = Wiz.getClient(null, ip);
		if (debug == 'true') {
			client = Wiz.getDebugClient();
		}
		var originCookieStr = userId + COOKIE_SPLITER + password,
			cookieStr = ValueUtil.cipher(originCookieStr);
		client.methodCall(Wiz.api.REGISTER, [requestParams], function(error, value) {
			if (error) {
				callback(error, null);
				return;
			}
			value.cookieStr = cookieStr;
			callback(error, value);
		});
	},
	getGroupKbList: function (token, callback, debug) {
		var requestParams = params.getDefaultParams();
		requestParams.token = token;

		var filterCallback = function (error, value) {
			if (!error && value) {
				value.forEach(function (kbObj) {
					kb.filter(kbObj);
				});
			}
			callback(error, value);
		};

		
		var client = Wiz.getClient();
		if (debug == 'true') {
			client = Wiz.getDebugClient();
		}
		client.methodCall(Wiz.api.GROUP_KB_LIST, [requestParams], filterCallback);
	},
	keepAlive: function (token, callback, debug) {
		var requestParams = params.getDefaultParams();
		requestParams.token = token;

		
		var client = Wiz.getClient();
		if (debug == 'true') {
			client = Wiz.getDebugClient();
		}
		client.methodCall(Wiz.api.KEEPALIVE, [requestParams], callback);
	},
	logout: function (token, callback, debug) {
		var requestParams = params.getDefaultParams();
		requestParams.token = token;

		
		var client = Wiz.getClient();
		if (debug == 'true') {
			client = Wiz.getDebugClient();
		}
		client.methodCall(Wiz.api.LOGOUT, [requestParams], callback);
	},
	getKbInfo: function (token, kbGuid, callback) {
		var requestParams = params.getDefaultParams();
		requestParams.token = token;
		requestParams.kb_guid = kbGuid;
		kb.getKapiUrl(kbGuid, function (kApiUrl) {
			var client = Wiz.getClient(kApiUrl);
			client.methodCall(Wiz.api.KB_INFO, [requestParams], callback)
		});
	}
};

module.exports = UserService;