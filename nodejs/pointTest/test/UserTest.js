var User = require('../libs/models/User');

function getTeamUsers() {
	var userTeam = '创新组';
	User.getTeamUsers(userTeam, function(error, data) {
		if(error) {
			console.log('User.getTeamUsers Error: ' + error.message || error);
		} else {
			console.log('success');
			console.log(data)
		}
	});
}

function deleteUser() {
	var userName = '张三';
	User.delete(userName, function(error, data) {
		console.log('deleteUser');
		console.log(arguments);
	})
}

deleteUser();