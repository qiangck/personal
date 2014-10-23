var UserService = require('../libs/UserService');
function addUser() {
	UserService.addUser({user_name:'李树亮'}, function(error, data) {
		console.log(arguments);
	});
}

function login() {
	var userName = '李树亮';
	var pwd = 'people';
	UserService.login(userName, pwd, function(err, info, fields) {
		console.log(info);
	});
}

login();