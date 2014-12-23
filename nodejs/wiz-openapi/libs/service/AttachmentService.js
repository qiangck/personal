var Wiz = require('./Wiz'),
	config = require('../../conf/config'),
	params = require('../models/Params'),
	fs = require('fs'),
 	url = require('url'),
	ValueUtil = require('../util/ValueUtil'),
 	querystring = require('querystring'),
	CommonService = require('./CommonService'),
	Attachment = require('../models/Attachment'),
	HttpUtil = require('../util/HttpUtil');



var FILE_SEPARATOR = ValueUtil.getFileSeparator(),
		DOCUMENT_TYPE = 'document',
		ATTACHMENT_TYPE = 'attachment';



// TODO 增加DocumentService和AttachmentService基类
function getDownloadOptions(kbGuid, kapi_url) {
	var host = config.httpServer.host,
			port = config.httpServer.port,
			path = config.httpServer.path;
  if (kapi_url) {
  	var urlObj = url.parse(kapi_url, true);
  	host = urlObj.hostname;
  	port = urlObj.port;
  	path = urlObj.pathname.replace('xmlrpc', 'a/web/get?');
  }
  var options = {
    host: host,
    port: (port || 80),
    path: path,
    method: 'get',
    headers:{'wiz-kb-guid': kbGuid}
  }
  return options;
}


function downloadFromServer(cachedName, kbGuid, itemGuid, unzipPath, token, version, options, callback) {
  var options = getDownloadOptions(kbGuid, options),
  		downloadType = 'att',
  		query = querystring.stringify({y: 'att', v: 'ziw', g: itemGuid, t: token});
  options.path = options.path + query;
	Wiz.download(options, cachedName, function (err) {
    if(err){
      callback(err, null);
    }else{
      readFromCache(cachedName, kbGuid, itemGuid, version, callback);
    }
  });
}


/**
 * 从缓存中加载内容
 * 暂时无用
 */
function readFromCache (cacheFilePath, kbGuid, attGuid, version, callback) {
	fs.readFile(cacheFilePath, function(error, file) {
		if (error) {
			console.log('readFromCache error');
			callback(error, null);
      fs.rmdir(cacheFilePath,function () {
      });
			return;
		}
		Attachment.getNameByGuid(attGuid, function(filename) {
			var lastPrefIndex = filename.lastIndexOf('.');
			lastPrefIndex = lastPrefIndex > 0 ? lastPrefIndex : filename.length;
			var fileZipName = filename.substr(0, lastPrefIndex) + '.zip';
			callback(error, {fileName: fileZipName, file: file});
		});
	});
}

var AttachmentService = function() {};

AttachmentService.prototype.getParams = function(httpParams) {
	var requestParams = params.getDefaultParams();
	requestParams.token = httpParams.token;
	requestParams.kb_guid = httpParams.kb_guid;
	requestParams.document_guid = httpParams.document_guid;
	return requestParams;
};

// 附件
AttachmentService.prototype.getList = function(httpParams, callback) {
	var self = this;
	CommonService.getVersion(httpParams.token, httpParams.kb_guid, DOCUMENT_TYPE, function (error, version, options) {
		if (error) {
			callback(error, null);
			return;
		}
		var client = Wiz.getClient(options),
				requestParams = self.getParams(httpParams);
		client.methodCall(Wiz.api.ATTACHMENT_GET_BY_DOC, [requestParams], function(error, value) {
			if (error) {
				callback(error, null);
				return;
			}
			// 获取处理后的list
			var attList = Attachment.parseList(value, httpParams.kb_guid, httpParams.token);
			callback(error, attList);
		});
	});
};

AttachmentService.prototype.download = function(httpParams, reqCookie, callback) {
	// 第一层校验首先要解密params
	if (!httpParams && httpParams.length > 1) {
		callback({faultCode: 490, faultString: 'download attachment error, params incorrect'});
		return;
	}
	var cipherredStr = '';
	for (var key in httpParams) {
		cipherredStr = key;
	}
	var params = Attachment.revertCipherredToParams(cipherredStr);

	if (params === null) {
		callback({faultCode: 490, faultString: 'download attachment error, params incorrect'});
		return;
	}

	var	kbGuid = params.kb_guid,
			attGuid = params.attachment_guid,
			version = params.version,
			token = params.token;

	var cookieToken = HttpUtil.getCookieByName(reqCookie, 'token');
	// 第二层校验，比较cookie中的token值是否和参数中的token值相同
	if (cookieToken !== token) {
		callback({faultCode: 490, faultString: 'download attachment error, params incorrect'});
		return;
	}

	if (typeof token !== 'string' || typeof attGuid !== 'string' || typeof kbGuid !== 'string' || token.length < 1 || kbGuid.length < 1 || attGuid.length < 1) {
		callback({faultCode: 490, faultString: 'download attachment error, params incorrect'});
		return;
	};

	CommonService.getVersion(params.token, params.kb_guid, ATTACHMENT_TYPE, function (error, maxVersion, options) {
		if (error) {
			callback(error, null);
			return;
		}
		var cachedPath = ValueUtil.getCachedPath(kbGuid, ATTACHMENT_TYPE)
			, unzipPath = cachedPath + FILE_SEPARATOR + attGuid
			,	cachedName = cachedPath + FILE_SEPARATOR + 'ziw.' + attGuid + '.' + maxVersion;
		fs.exists(cachedName, function (exists) {
	    if (exists){
	      readFromCache(cachedName, kbGuid, attGuid, maxVersion, callback);
	    }else {
	      //首先判断是否有该目录，如果没有，需要创建
				if (!fs.existsSync(cachedPath)) {
					ValueUtil.mkdirSync(cachedPath, null, function(error) {
						if (error) {
							console.log('ValueUtil.mkdirSync Error: ' + error);
						} else {
							downloadFromServer(cachedName, kbGuid, attGuid, unzipPath, token, maxVersion, options, callback);
						}
					});
				} else {
					downloadFromServer(cachedName, kbGuid, attGuid, unzipPath, token, maxVersion, options, callback);
				}
	    }
	  });
	});
};

AttachmentService.prototype.create = function(file, httpParams, callback) {
	CommonService.getVersion(httpParams.token, httpParams.kb_guid, ATTACHMENT_TYPE, function (error, maxVersion, options) {
		if (error) {
			console.log('CommonService.getVersion error');
			console.log(error);
			callback(error, null);
			return;
		}
		httpParams.options = options;
		httpParams.dispositionName = 'attachment_file';
		httpParams.attachment_name = file.name;
		Wiz.sendForm(file.path, httpParams, callback);
	});
};

AttachmentService.prototype.rename = function(httpParams, callback) {
	var self = this;
	CommonService.getVersion(httpParams.token, httpParams.kb_guid, ATTACHMENT_TYPE, function (error, maxVersion, options) {
		if (error) {
			callback(error, null);
			return;
		}
		var params = Attachment.revertCipherredToParams(httpParams.cipherredStr);
		var requestParams = self.getParams(httpParams);
		requestParams.new_name = httpParams.new_name;
		requestParams.attachment_guid = params.attachment_guid;
		
		console.log(requestParams);
		AttachmentService.removeFile(httpParams.kb_guid, params.attachment_guid, maxVersion);
		client.methodCall(Wiz.api.ATTACHMENT_RENAME, [requestParams], callback);
	});
};

AttachmentService.prototype.delete = function(httpParams, callback) {
	var self = this;
	CommonService.getVersion(httpParams.token, httpParams.kb_guid, ATTACHMENT_TYPE, function (error, maxVersion, options) {
		if (error) {
			callback(error, null);
			return;
		}
		var params = Attachment.revertCipherredToParams(httpParams.cipherredStr);
		if (params === null) {
			callback({faultCode: 490, faultString: 'wrong params'});
			return;
		}
		var requestParams = self.getParams(httpParams);
		requestParams.attachment_guid = params.attachment_guid;
		var client = Wiz.getClient(options);
		AttachmentService.removeFile(httpParams.kb_guid, params.attachment_guid, maxVersion);
		client.methodCall(Wiz.api.ATTACHMENT_DELETE, [requestParams], callback);
	});

};

AttachmentService.removeFile = function(kbGuid, attGuid, version) {
	var cachedPath = ValueUtil.getCachedPath(kbGuid, ATTACHMENT_TYPE)
		,	cachedName = cachedPath + FILE_SEPARATOR + 'ziw.' + attGuid + '.' + version;
	fs.exists(cachedName, function(exists) {
		if (exists) {
      fs.unlink(cachedName,function (err) {
      	err && console.log('delete file ===' + cachedName + '==== error: ' + err);
      });
		}
	})
}

module.exports = new AttachmentService();