var HttpUtils = {
	getCookiesObj: function(cookiesStr) {
		if (typeof cookiesStr !== 'string' || cookiesStr.length < 1) {
			return null;
		}
		var cookiesList = cookiesStr.split(';');
		if (!cookiesList || cookiesList.length < 1) {
			return null;
		}
		var itemList = [],
				cookiesObj = {};
		cookiesList.forEach(function(itemStr, index) {
			itemList = itemStr.split('=');
			cookiesObj[itemList[0].trim()] = itemList[1];
		});

		return cookiesObj;
	},
	getCookieByName: function(cookiesStr, cookieName) {
		var cookiesObj = HttpUtils.getCookiesObj(cookiesStr),
			cookieValue = null;
		if (cookiesObj !== null) {
			cookieValue = cookiesObj[cookieName];
		}
		return cookieValue;
	},
	// 兼容所有浏览器
	getContentDispositionByUserAgent: function(userAgent, fileName) {
		var contentDisposition = 'attachment;filename="' + encodeURIComponent(fileName) + '"';
		if (userAgent.indexOf('Firefox') > -1) {
			contentDisposition = 'attachment;filename*="utf8\'\'' + encodeURIComponent(fileName) + '"';
		}
		return contentDisposition;
	},
	/**
	 * 获取ip地址
	 * @param  {HTTP Request} req http请求信息
	 * @return {String}     ip地址
	 */
	getIP: function(req) {
		var ipAddress;
		var headers = req.headers;
		// nginx代理配置
		var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
		forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
		if (!ipAddress) {
		ipAddress = req.connection.remoteAddress;
		}
		return ipAddress;
	}
}

module.exports = HttpUtils;