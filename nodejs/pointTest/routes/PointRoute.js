var HttpHelper = require('../libs/HttpHelper');
var SessionHelper = require('../libs/SessionHelper');
var Point = require('../libs/models/Point');
var User = require('../libs/models/User');
var Util = require('../libs/Util');
var fs = require('fs');


function filter(arr1, arr2) {
    var bCheck = false;
    arr1.forEach(function(obj1, index1){
        arr2.forEach(function(obj2, index2) {
            if(obj1.point_to == obj2.point_to) {
                bCheck = true;
                return bCheck;
            }
        });
    });
    return bCheck;
}

var PointRoute = {
	grade: function(req, res) {
        var responseJson = {};
        res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
		var user = req.session.user;
		var params = HttpHelper.getHttpPostParams(req);
		var pointList = [];
		var paramList = JSON.parse(params.list);
		if (paramList.length > 0) {
            paramList.forEach(function(info, index) {
				info.point_status = user.user_status;
				info.from = user.user_name;
				pointList.push(new Point(info));
			});
    } else {
        responseJson = {status: 'failed', message: '打分出错，请稍后重试', code: 333};
return res.end(JSON.stringify(responseJson));
}
		// 检查是否已经打过分
		Point.get({point_from: user.user_name, dt_created: Util.getCurDateStr()}, function(err, points) {
			if (err) {
				responseJson = {status: 'failed', message: '打分出错，请稍后重试', code: 333};
				return res.end(JSON.stringify(responseJson));
			} else {
				if (points.length == 0 || user.user_status == 2) {
                   			if(user.user_status == 2) {
						points.forEach(function(point, index) {
							pointList.forEach(function(reqPoint, index2) {
								if(reqPoint.point_to == point.point_to) {
									Point.delete(point.point_id, function(error, data){
										
									});
								}
							});	
						});
					}
					Point.update(pointList, function(error, data) {
						if (error) {
							responseJson = {status: 'failed', message: error.message  || '打分出错，请稍后重试', code: 333};
						} else {
							responseJson = {status: 'success', message: '打分成功!', code: 200};
						}
						return res.end(JSON.stringify(responseJson));
					});
				} else {
                    if (filter(points, pointList)) {
                        responseJson = {status: 'failed', message: '您本月已经打过分', code: 333};
                        return res.end(JSON.stringify(responseJson));
                    } else {
                        Point.update(pointList, function(error, data) {
                            if (error) {
                                responseJson = {status: 'failed', message: error.message  || '打分出错，请稍后重试', code: 333};
                            } else {
                                responseJson = {status: 'success', message: '打分成功!', code: 200};
                            }
                            return res.end(JSON.stringify(responseJson));
                        });
                    }

				}
			}
		});
	},
	// getFinalPoint: function(req, res) {
	// 	var user = req.session.user;
	// 	var params = HttpHelper.getHttpGetParams(req);
	// 	var filter = {
	// 		point_status: 2,
	// 		dt_created: params.dtCreated || Util.getCurDateStr()
	// 	};
	// 	Point.get(filter, function(error, data) {
	// 		if (error) {
	// 			console.log(error || error.message);
	// 		} else {
	// 		}
	// 	});
	// },
	getPoints: function(req, res) {
        var responseJson = {};
        res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
		var user = req.session.user;
		var params = HttpHelper.getHttpGetParams(req);
		var filter = Util.merger({}, params);
		if(!filter.dt_created) {
			filter.dt_created = Util.getCurDateStr();
		}

		

		Point.get(filter, function(error, data) {
			console.log('getPoints');
			console.log(data);
			if (error) {
				responseJson = {status: 'failed', message: '取分数出错，请稍后重试', code: 333};
                return res.end(JSON.stringify(responseJson));
			} else {
		console.log(filter);
                User.get(filter.point_to, function(error, userTo) {
			console.log('point get user');
			console.log(arguments);
                    responseJson = {
                        status: 'success',
                        message: '获取分数成功!',
                        code: 200,
                        pointList: data,
                        file: userTo ? getUserWorksPath(userTo) : []
                    };
                    return res.end(JSON.stringify(responseJson));
                });
			}
		});
	}
}

var FILE_BASE = 'E:\\point\\pointTest\\public\\works';
var FILE_SEPARATOR = '\\';
function getUserWorksPath(user) {
    var date = new Date(new Date() - 1000 * 60 * 60 * 24 * 15)
    var path = FILE_BASE + FILE_SEPARATOR + user.user_id + FILE_SEPARATOR + date.getFullYear()+ '/' + (date.getMonth()+1);
    var files = [];
	console.log('getUserWorksPath');
	console.log(path);
    if (!fs.existsSync(path))           {
        return files;
    }
    var fileArray = fs.readdirSync(path );
    fileArray.forEach(function(file, index){
        files.push('/works/' + user.user_id + '/' + date .getFullYear() + '/'+ (date .getMonth()+1) + '/' + file);
    });
    return files;
}



module.exports = PointRoute;