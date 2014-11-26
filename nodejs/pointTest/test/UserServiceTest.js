var UserService = require('../routes/UserRoute');
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

function downloadwork() {
	UserService.download(2014, 10, function() {
		console.log(arguments);
	})
}
downloadwork();