


var SqlHelper = {
	getInsertUserQuery: function(user, connection) {
		var insertUserStr = 'INSERT INTO `point_test`.`user`(`user_name`,`password`,`user_team`,`user_profession`,`dt_created`,`user_status`,`user_info`) VALUES '
            + '(<{user_name}>,<{password}>,<{user_team}>,<{user_profession}>,<{dt_created}>,<{user_status}>,<{user_info}>);'
	    var queryStr = insertUserStr;
	    for(var key in user) {
	        if(user.hasOwnProperty(key)) {
	            queryStr = queryStr.replace('<{' + key + '}>', connection.escape(user[key]));
	        }
	    }
	    return queryStr;
	},
    changePwd: function(userId, pwd, connection) {
        var queryStr = 'UPDATE `point_test`.`user` SET `password`=' + connection.escape(pwd) + ' WHERE `user_id`=' + userId + ';'
        return queryStr;
    },
	// 获取用户信息
	getSelectUserQuery: function(userName, connection) {
		var queryStr = 'SELECT * FROM point_test.user where user_name=' + connection.escape(userName) + ';';
		return queryStr;
	},
	// 删除用户
	getDeleteUserQuery: function(userName, connection) {
		var queryStr = 'DELETE FROM point_test.user where user_name=' + connection.escape(userName) + ';';
		return queryStr;
	},
	getTeamUsersQuery: function(userTeam, connection) {
		var queryStr = 'SELECT * FROM point_test.user';
        if (userTeam) {
            queryStr += ' where user_team=' + connection.escape(userTeam);
        }
        queryStr +=  ';';
		return queryStr;
	},
	getDeletePointQuery:function(pointId, connection) {
		var queryStr = 'DELETE FROM `point_test`.`point` WHERE point_id=' + connection.escape(pointId) + ';';
		return queryStr;
	},
	getSelectPointListQuery: function(filter, connection) {
		var queryStr = 'SELECT * FROM point_test.point';
		if (filter != null) {
			var filterStr = ' where 1=1 ';
			for(var key in filter) {
				filterStr = filterStr + ' and ' + key + '=' + connection.escape(filter[key]);
			}
			queryStr += filterStr;
		}
		return queryStr;
	},
	// 写入每条分数
	getInsertPointListQuery: function(pointList, connection) {
		var queryStr = 'INSERT INTO `point_test`.`point`(`point_num`,`point_from`,`point_to`,`dt_created`,`point_status`) VALUES ';
		var valueStr = '(<{point_num}>,<{point_from}>,<{point_to}>,<{dt_created}>,<{point_status}>) '
		pointList.forEach(function(point, index) {
            var tmpStr = valueStr;
			for(var key in point) {
		        if(point.hasOwnProperty(key)) {
                    tmpStr = tmpStr.replace('<{' + key + '}>', connection.escape(point[key]));
		        }
		    }
		    if (index === 0) {
		    	queryStr = queryStr + tmpStr;
		    } else {
		    	queryStr = queryStr + ',' + tmpStr;
		    }
		});
	    return queryStr;
	}
	// 其他用户的打分
	
	// 领导的打分

}


module.exports = SqlHelper;