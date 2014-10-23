var ValueUtil = require('../libs/util/ValueUtil');

var FILE_SEPARATOR = '\\';
function ExtraServiceRoutes() {}
// 转发邮件功能
ExtraServiceRoutes.prototype.forwardMail = function(req, res) {
	var body = req.body;
	if(body != null && body != undefined){
		var receiver =  req.body.receiver || '741846980@qq.com';
		ValueUtil.sendMail(receiver,'用户反馈', JSON.stringify(body), function (error, status) {
			if (error) {
				// 出错后记录
				var path = config.mailService.cachePath + FILE_SEPARATOR;
				var date = new Date();
				var file = path + 'crash.' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + '-' + date.getHours() + '-' + date.getMinutes();
				fs.writeFile(file,JSON.stringify(body));
			}
		});
  }  
	// 无论成功或者失败，均返回成功
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('send mail success');
	res.end();
}

module.exports =  new ExtraServiceRoutes();