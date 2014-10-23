var BizService = require('../libs/service/BizService'),
		MessageService = require('../libs/service/MessageService'),
		url = require('url'),
		wizResponse = require('./wizResponse'),

		Redis = require('../libs/service/Redis'),
		fs = require('fs'),
		HttpUtil = require('../libs/util/HttpUtil');

function getHttpPostParams(req) {
	//获取http post的参数
	return req.body;
}

function getHttpGetParams(req) {
	//获取http get的参数
	return url.parse(req.url, true).query;
}


var BizRoutes = {
	getUserList: function(req, res) {
		res = wizResponse.initDefault(res);
		var httpGetParams = getHttpGetParams(req),
				responseJson = {};
		BizService.getUserList(httpGetParams, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value.result;
			}
			res.end(JSON.stringify(responseJson));
		});
	}
};

var MessageRoutes = {
	getList: function(req, res) {
		res = wizResponse.initDefault(res);
		var httpGetParams = getHttpGetParams(req),
				responseJson = {};
		MessageService.getList(httpGetParams, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value.result;
			}
			res.end(JSON.stringify(responseJson));
		});
	},
	setMessageStatus: function(req, res) {
		res = wizResponse.initDefault(res);
		var httpPostParams = getHttpPostParams(req),
				responseJson = {};
		MessageService.setMessageStatus(httpPostParams, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			res.end(JSON.stringify(responseJson));
		});
	}
};
exports.getMessageList = MessageRoutes.getList;
exports.setMessageStatus = MessageRoutes.setMessageStatus;

exports.getUserList = BizRoutes.getUserList;
