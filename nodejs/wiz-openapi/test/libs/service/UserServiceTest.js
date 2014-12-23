var UserService = require('../../../libs/service/UserService');

var userId = '1@1.com',
		password = '111111',
		debug = false,
		token = null,
		interValTimer = null;


var keepCounts = 0;
function testLogin() {
	UserService.login(userId, password, '', function(error, value) {
		console.log(arguments);
		token = value.token;
		console.log('登陆成功');
		if (interValTimer === null) {
			interValTimer = setInterval(function() {
				testKeepAlive();
			}, 5 * 60 * 1000);
		}
		testKeepAlive();
	}, debug);
}


function testKeepAlive() {
	keepCounts ++;
	console.log('第 ' + keepCounts + ' 次keepalive');
	console.log('token: ' + token);
	UserService.keepAlive(token, function(error, value) {
		console.log(arguments);
		if (value.return_code != 200) {
			console.log('出错了，token失效');
		}
	}, debug);
}

testLogin();