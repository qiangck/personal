var url = require('url');
var HttpHelper = {
	getHttpPostParams: function (req) {
		//获取http post的参数
		return req.body;
	},
    // 兼容所有浏览器
    getContentDispositionByUserAgent: function(userAgent, fileName) {
        var contentDisposition = 'attachment;filename="' + encodeURIComponent(fileName) + '"';
        if (userAgent.indexOf('Firefox') > -1) {
            contentDisposition = 'attachment;filename*="utf8\'\'' + encodeURIComponent(fileName) + '"';
        }
        return contentDisposition;
    },
	getHttpGetParams: function (req) {
		//获取http get的参数
		return url.parse(req.url, true).query;
	}
}

module.exports = HttpHelper;