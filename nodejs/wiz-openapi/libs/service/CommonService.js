var Wiz = require('./Wiz')
	, params = require('../models/Params')
	, client = Wiz.client
	, kb = require('../models/KnowledgeBase');

var CommonService = {
	//kb的路由方法，都要先调用getVersion方法。验证登陆状态，并获取版本号
	//typeKey为选填项，从km中获取时，不传该值，从kv获取数据时，需要传入
	getVersion: function (token, kbGuid, type, callback, typeKey, bAddDeletedVersion) {
		if (typeof token === 'string' && typeof kbGuid === 'string') {
			//准备数据
		  var requestParams = params.getDefaultParams()
		  	,	apiMethod = Wiz.api.GET_VERSION;
		  // if (type !== null) {
		  // 	requestParams.type = type;
		  // }
		  requestParams.kb_guid = kbGuid;
		  requestParams.token = token;
		  if (typeKey) {
		  	requestParams.key = typeKey;
		  	apiMethod = Wiz.api.KB_VALUE_VERSION;
		  }
		  //获取kapi_url
			kb.getKapiUrl(kbGuid, function (value) {
				//如果数据库中未保存，取出来的值为undefined，type是string
				if (value === 'undefined') {
					value = null;
				}
				var client = Wiz.getClient(value);
				// if (type === 'folders') {
				// 	client = Wiz.getTestClient();
				// }
		    client.methodCall(apiMethod, [requestParams], function (err,result) {
		    	//把kapi_url传递给回调函数，少一次查询redis数据库的操作
		      if (err){
		        console.log('CommonService.getVersion() Error: ' + err);
		        console.log('apiMethod: ' + apiMethod);
		        if (apiMethod === Wiz.api.KB_VALUE_VERSION) {
		        	// 对于kv上的查询，忽略错误
		        	err = null;
		        }
		        callback(err, null, value);
		      }else{
						// lsl 2012-12-28  传入null的情况，一般是查询文档列表的操作，固定写死，version为document_version.deleted_version
						// 否则会造成其他客户端删除后，网页版仍然显示的问题
						// TODO 标签同步也会出现如上问题，同样需要处理
						var version = result.version ? result.version : result[type + '_version'];
						if (bAddDeletedVersion === true) {
							version = version + '.' + result.deleted_version;
						}
		        // console.log('Success get version：{' + type + ':' + version +'}');
		        callback(null, version, value);
		      }
		    });
			});
		} else {
			callback({faultCode: 500, faultString: 'server error'}, null);
		}
	},
	getKapiUrl: function(callback) {
		kb.getKapiUrl(kbGuid, function (value) {
			callback(value);
		});
	}
}
module.exports = CommonService;