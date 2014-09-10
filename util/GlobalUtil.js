define(function (require, exports, module){
	'use strict';
	// var moment = require('./moment');
	var GlobalUtil = {
		getCookieOptions: function() {
			var options = {path: '/'}
			if (/^[0-9]\.+|\.[0-9]+$/g.test(document.domain) === false && document.domain.indexOf('localhost') < 0) {
				options.domain = GlobalUtil.getTopDomain();
			}
			return options;
		},
		getTopDomain: function() {
			var domain = document.domain;
			var matchList = domain.match(/\.([^\.])+\.([^\.])+$/g);
			if (matchList && matchList.length > 0) {
				domain = matchList[0].substr(1);
			}
			return domain;
		},
		// 对电子邮件的验证
		verifyEmail: function (str_email) {
			var myreg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
			if (myreg.test(str_email)) {
				return true;
			}
		},
		// 对密码的验证
		checkValidPasswd: function (str_password) {
			var password = $.trim(str_password);

			if (password == "") {
				return false;
			}

			var res = GlobalUtil.isGoodPassword(password);
			if (res == false) {
				return false;
			}

			var len;
			var i;
			var isPassword = true;
			len = 0;
			for ( i = 0; i < password.length; i++) {
				if (password.charCodeAt(i) > 255)
					isPassword = false;
			}

			if (!isPassword || password.length < 6) {
				return false;
			}
			if (password.length > 16) {
				return false;
			}

			return true;
		},
		// 由于需要在调试、测试和正式上都单独修改，所以封装个获取host的方法，传入二级域名的开头，如果host是域名的格式，即可返回相应的二级域名
		getHost: function(pref) {
			var host = location.host;
			/\.[0-9]$/.test(host)
			if (/\.[0-9]$/.test(host) === false) {
				host = pref + '.wiz.cn';
			}
			return host;
		},

		 /*判断是否为合法密码*/
		isGoodPassword: function (str){ 
			    var badChar ="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
			    badChar += "abcdefghijklmnopqrstuvwxyz"; 
			    badChar += "0123456789"; 
			    badChar += " "+"　";//半角与全角空格 
			    badChar += "`~*!@#$%^&.()-_=+]\\|:;\"\\'<,>?/";//不包含*或.的英文符号 支持*和.，lsl-2013.02.05
			    // 密码长度限制为6-24
			    if(""==str || str.length < 6 || str.length > 24){ 
			     return false; 
			    } 
			    var len=str.length
			    for(var i=0;i<len;i++){
			        var c = str.charAt(i);
			        if(badChar.indexOf(c) == -1){ 
			            return false; 
			            } 
			    }
			       return true; 
		} ,

		/* 函数功能：改变指定id元素的class属性值 */
		changeClass: function (obj_id, obj_class) {
			$("#" + obj_id + "").removeClass().addClass(obj_class);
		},

		/* 取得url参数 (未经过decodeURIComponent处理的)*/
		getUrlParam: function (paras) {
			var url = location.href;
			var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
			var paraObj = {};
			var i , j;
			for (i = 0; j = paraString[i]; i++) {
				paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
			}
			var returnValue = paraObj[paras.toLowerCase()];
			if ( typeof (returnValue) == "undefined") {
				return "";
			} else {
				return returnValue;
			}
		},
		// 判断系统信息
		isWinPlatform: function() {
			var platform = window.navigator.platform,
				isMac = (platform.toLowerCase().indexOf('mac') === 0),//(platform === "Mac68K") || (platform === "MacPPC") || (platform === "Macintosh");
				isLinux = (platform.toLowerCase().indexOf('linux') === 0);
			if (isMac || isLinux) {
				return false;
			}
			return true;
		},
		// 格式化日期timestamp
		formatDate: function (dateStr, formatStr) {
			//标准游览器，如果数组里面最后一个字符为逗号，JS引擎会自动剔除它。
			//参考https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Values,_variables,_and_literals?redirectlocale=en-US&redirectslug=Core_JavaScript_1.5_Guide%2FValues%2C_Variables%2C_and_Literals#Literals
			var ie = GlobalUtil.bIe();
			if (ie) {
				//ie6,7下 new Date(dateStr) 不支持dateStr为xxxx-xx-xx格式，需要转换格式
				dateStr = dateStr.replace(/\-/ig, '/').split('.')[0];
			}
			var date = new Date(dateStr);
			return moment(date).format(formatStr);
		},
		//判断是否为ie浏览器
		bIe: function () {
			if(document.all) {
				return true;
			}
			return false;
		},
		// 通过classname获取jquery对象
		getJqObjByClass: function (className) {
			return $('.' + className);
		},
		// 通过id获取jquery对象
		getJqObjById: function (id) {
			return $('#' + id);
		},
		isConSpeCharacters: function (value) {
			var special = '\\,/,:,<,>,*,?,\",&,\'',
				specialList = special.split(',');
			for(var index=0, length=specialList.length; index < length; index++) {
				if (value.indexOf(specialList[index]) > -1) {
					return true;
				}
			}
			return false;
		},
		fireEvent: function(element,event){
            if (document.createEventObject){
            // IE浏览器支持fireEvent方法
            var evt = document.createEventObject();
            return element.fireEvent('on'+event,evt)
            }
            else{
            // 其他标准浏览器使用dispatchEvent方法
            var evt = document.createEvent( 'HTMLEvents' );
            // initEvent接受3个参数：
            // 事件类型，是否冒泡，是否阻止浏览器的默认行为
            evt.initEvent(event, true, true);
            return !element.dispatchEvent(evt);
            }
		},
    genGuid: function() {
    	function S4() {
	      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	    }
      return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },
    // 数组的lastIndexOf方法，兼容低版本ecmaScript
    lastIndexOfArray: function (array, item) {
    	if( Array.prototype.lastIndexOf) {
    		return Array.prototype.lastIndexOf.call(array, item);
    	} else {
			  var n = array.length,
			  	i = n-1;
			  if (i < 0) {
					i = Math.max(0, n + i);
				}
			  for (; i >= 0; i--){
			    if (i in array && array[i] === item) {
			    	return i;	
			    }
			  }
			  return -1;
    	}
    },
    // 实现类似String.trim功能，不在Global Object上做扩展
    trimString: String.trim || function(str) {
  		return str.replace(/^\s+|\s+$/g, '');
    },
		/**
		 * 获取当前时间，只显示hour:minutes
		 * 数字小于10补零
		 * @return {[type]} [description]
		 */
    getCurTime: function() {
			var curDate = new Date();
			var hours = curDate.getHours();
			var minutes = curDate.getMinutes();
			var timeStr = '';
			if (minutes < 10) {
				timeStr = hours + ':0' + minutes; 
			} else {
				timeStr = hours + ':' + minutes; 	
			}
			return timeStr;
		},
		/**
		 * 获取iframe的document对象
		 * @param  {[type]} frameObj [description]
		 * @return {[type]}          [description]
		 */
		getFrameDocument: function(frameObj) {
			var fdoc = (frameObj.contentDocument) ? frameObj.contentDocument
					: frameObj.contentWindow.document;//兼容firefox和ie
			return fdoc;
		},


		/**
		 * _event
		 * TODO 提取到eventHelper中
		 * 阻止默认事件
		 * @param  {[type]} event [description]
		 * @return {[type]}       [description]
		 */
    preventDefaultEvent: function(event) {
    	if ( event.preventDefault) {
    	 event.preventDefault();
    	} else {
    	 event.returnValue = false;
    	}
    },
    /**
     * 给指定url增加参数
     * @param {string} url    指定的url
     * @param {json object} params key-value必须都为string
     */
    addParamsToUrl: function(url, params) {
    	if (typeof url === 'string') {
    		var paramsStr = join(params),
    			connector = '&'
    		if (url.indexOf('?') === -1) {
    			connector = '?'
    		}
    		url = url + connector + paramsStr;
    	}
    	return url;

    	// 必须是一个json对象
    	function join(params) {
    		var length = params.length;
    		var paramsStr = '';
    		for (var key in params) {
    			if (typeof params[key] === 'string' || typeof params[key] === 'number') {
    				paramsStr = paramsStr + '&' + key + '=' + encodeURIComponent(params[key]);
    			}
    		}
    		paramsStr = paramsStr.substr(1);
    		return paramsStr;
    	}
    },
    getMousePoint: function(ev) {
			var point = {
				x:0,
				y:0
			};
			if(typeof window.pageYOffset != 'undefined') {
				point.x = window.pageXOffset;
				point.y = window.pageYOffset;
			} else if(typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
				point.x = document.documentElement.scrollLeft;
				point.y = document.documentElement.scrollTop;
			} else if(typeof document.body != 'undefined') {
				point.x = document.body.scrollLeft;
				point.y = document.body.scrollTop;
			}

			point.x += ev.clientX;
			point.y += ev.clientY;

			return point;
		},
		stopBubble: function(e) {
      //如果提供了事件对象，则这是一个非IE浏览器
      if (e && e.stopPropagation) {
        //因此它支持W3C的stopPropagation()方法
        e.stopPropagation();
      }
      else {
      	//否则，我们需要使用IE的方式来取消事件冒泡
      	window.event.cancelBubble = true;
      }
    },
    //阻止浏览器的默认行为
    stopDefault: function(e) {
      //阻止默认浏览器动作(W3C)
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      //IE中阻止函数器默认动作的方式
      else {
      	window.event.returnValue = false;
      }
      return false;
    },
    // 简单处理
    formatISODateString: function(dateStr) {
    	if (!dateStr) {
    		return '';
    	}
    	return dateStr.replace('T', ' ').replace(/:\d+.\d+Z/, '');
    },
    filterDocList: function(docList) {
    	var filterList = [];
    	if (docList && docList.length > 0) {
    		var i=0, length=docList.length;	
    		var doc;
    		for ( ; i<length; i++) {
    			doc = docList[i];
    			if (!doc.document_category || doc.document_category.indexOf('/Deleted Items/') < 0) {
    				filterList.push(doc);
    			}
    		}
    	}
    	return filterList;
    }

	};

	module.exports = GlobalUtil;
});