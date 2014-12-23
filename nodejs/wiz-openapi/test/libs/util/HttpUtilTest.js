var HttpUtil = require('../../../libs/util/HttpUtil');



var cookieStr = 'bdshare_firstime=1358247018713; _ourplusFirstTime=113-1-15-18-50-18; _ourplusReturnCount=26; _ourplusReturnTime=113-1-16-17-22-45; CNZZDATA4274540=cnzz_eid=57431901-1358244564-http%253A%252F%252Flocalhost%252Fweb&ntime=1358328120&cnzz_a=23&retime=1358328165382&sin=none&ltime=1358328165382&rtime=1; un=waste1985%40163.com; up=111111; keepCookie=checked; token=103e86e0-db45-4747-a825-157a7e0c057c; debug_model='
		
function getCookiesObjTest() {
	var req = {headers: {}};
	req.headers.cookie = cookieStr;
	var cookiesObj = HttpUtil.getCookiesObj(req);
	console.log(cookiesObj);
	console.log(typeof cookiesObj);
}

getCookiesObjTest();