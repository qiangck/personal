var Wiz = require('./Wiz'),
	config = require('../../conf/config'),
	params = require('../models/Params'),
	fs = require('fs'),
 	url = require('url'),
	ValueUtil = require('../util/ValueUtil'),
 	querystring = require('querystring'),
	CommonService = require('./CommonService'),
	HttpUtil = require('../util/HttpUtil');


var BizService = {
	getUserList: function(httpParams, callback) {
	  var query = querystring.stringify(httpParams);
		var options = {
		  hostname: config.rpc.host,
		  port: config.rpc.port,
		  path: '/wizas/a/biz/user_aliases?' + query,
		  method: 'GET'
		};
		Wiz.sendRequest(options, '', callback);
	}
};

module.exports = BizService;

