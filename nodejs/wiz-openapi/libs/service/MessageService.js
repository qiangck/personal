var Wiz = require('./Wiz')
	,	params = require('../models/Params')
	,	client = Wiz.client
	,	config = require('../../conf/config')
	,	Redis = require('./Redis')
	,	ValueUtil = require('../util/ValueUtil')
  , http = require('http')
  , querystring = require('querystring')
	,	CommonService = require('./CommonService');

var MessageService = {
	getList: function(httpParams, callback) {
	  var query = querystring.stringify(httpParams);
		var options = {
			hostname: 'message.wiz.cn',
			port: 80,
		  // hostname: '42.121.133.131',
		  // port: 8100,
		  path: '/wizmessage/messages?' + query,
		  method: 'GET'
		};
		var req = http.request(options, function(res) {
			var body = '';
		  console.log('STATUS: ' + res.statusCode);
		  console.log('HEADERS: ' + JSON.stringify(res.headers));
		  res.setEncoding('utf8');
		  res.on('data', function (chunk) {
		  	// 将data拼接到一起，在end的时候，进行反序列化操作
		  	body += chunk;
		  });

			res.on('end', function(){
		    try {
		    	// console.log(body);
          var bodyJson = JSON.parse(body);
          callback(null, bodyJson);
        } catch (error) {
          console.log('MessageService.getList Error: ' + error);
          callback(error);
        }
			});
		});

		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		  callback(e, null);
		});

		// write data to request body
		req.end();
	},
	setMessageStatus: function(httpParams, callback) {
	  var query = querystring.stringify(httpParams);
		var options = {
			hostname: 'message.wiz.cn',
			port: 80,
		  // hostname: '42.121.133.131',
		  // port: 8100,
		  path: '/wizmessage/messages/status?' + query,
		  method: 'POST'
		};
		console.log('wiz.setMessageStatus');
		Wiz.sendRequest(options, '', callback);
	}
};
module.exports = MessageService;