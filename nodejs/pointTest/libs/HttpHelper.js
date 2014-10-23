var url = require('url');
var HttpHelper = {
	getHttpPostParams: function (req) {
		//获取http post的参数
		return req.body;
	},
	getHttpGetParams: function (req) {
		//获取http get的参数
		return url.parse(req.url, true).query;
	}
}

module.exports = HttpHelper;