var Wiz = require('./Wiz')
	,	params = require('../models/Params')
	,	client = Wiz.client
	,	config = require('../../conf/config')
	,	Redis = require('./Redis')
	,	Document = require('../models/Document')
	,	kb = require('../models/KnowledgeBase')
	, DeletedItem = require('../models/DeletedItem')
	,	fs = require('fs')
  , url = require('url')
	,	ValueUtil = require('../util/ValueUtil')
  , querystring = require('querystring')
	,	CommonService = require('./CommonService');

function getParams(httpParams) {
	var requestParams = params.getDefaultParams();
	requestParams.token = httpParams.token;
	requestParams.kb_guid = httpParams.kb_guid;
	if (httpParams.value) {
		requestParams.category = httpParams.value;	
	}
	if (httpParams.count) {
		requestParams.count = httpParams.count;	
	}
	return requestParams;
}

var FILE_SEPARATOR = ValueUtil.getFileSeparator(),
		_documentHtmlPath = FILE_SEPARATOR + 'index.html',
		_docIndexFilePath = FILE_SEPARATOR + 'index_files',
		_tempSuffix = 'temp',
		UTF8_BOM = '\ufeff',
		DOCUMENT_TYPE = 'document';

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

function getPostOptions(kapi_url) {
	var urlObj = Wiz.getUrlOptions(kapi_url);
	var host = urlObj.hostname || config.post.host;
	var port = urlObj.port || config.post.port;
  var options = {
    headers: {
      'Content-Type': config.post.contentType
    },
    hostname: host,
    port: port,
    path: config.post.path,
    method: config.post.method
  };
  return options;
}


var DocumentService = function () {

	var mapping = {
		category: getListByCategory,
		tag: getListByTag,
		noTag: getListByNoTag,
		keyword: getListByKey
	};

	function getListCallback(error, value, key, callback) {
		// 1、删除之前缓存的key
		var deleteKeys = getDeleteKeys(key);
		Redis.deleteKeys(deleteKeys);
		// 2、存入当前的value
		Redis.addListToSet(key, value);

		callback(error, value);
	};

	/**
	 * 通过目录查询文档列表
	 * @param  {object}   httpParams 接收的params
	 * @param  {Function} callback   回调函数
	 * @param  {string} 	options    kapi_url
	 * @return {undefined}           
	 */
	function getListByCategory(httpParams, callback, options, key) {
		var requestParams = getParams(httpParams);
		requestParams.category = httpParams.action_value;
		//获取xmlrpc client对象
		var client = Wiz.getClient(options);
		client.methodCall(Wiz.api.DOCUMENT_GET_BY_CATEGORY, [requestParams], function(error, value) {
			getListCallback(error, value, key, callback);
		});
	}

	/**
	 * 通过标签查询文档列表
	 * @param  {object}   httpParams 接受的params
	 * @param  {Function} callback   回调函数
	 * @param  {string} 	options    kapi_url
	 * @return {undefined}              
	 */
	function getListByTag(httpParams, callback, options, key) {
		var requestParams = getParams(httpParams);
		requestParams.tag_guid = httpParams.action_value;

		var client = Wiz.getClient(options);
		client.methodCall(Wiz.api.DOCUMENT_GET_BY_TAG, [requestParams], function(error, value) {
			getListCallback(error, value, key, callback);
		});
	}	
	
	/**
	 * 无标签的文档列表
	 * @param  {object}   httpParams 接收的params
	 * @param  {Function} callback   回调函数
	 * @param  {string} 	options    kapi_url
	 * @return {undefined}              
	 */
	function getListByNoTag(httpParams, callback, options, key) {
		var requestParams = getParams(httpParams);
		var client = Wiz.getClient(options);
		client.methodCall(Wiz.api.DOCUMENT_GET_BY_NOTAG, [requestParams], function(error, value) {
			getListCallback(error, value, key, callback);
		});
	}

	/**
	 * 通过关键字查询文档列表
	 * @param  {object}   httpParams 接收的params
	 * @param  {Function} callback   回调函数
	 * @param  {string} 	options    kapi_url
	 * @return {undefined}              
	 */
	function getListByKey(httpParams, callback, options) {
		var requestParams = getParams(httpParams);
		requestParams.key = httpParams.action_value;
		// TODO first的默认值 
		requestParams.first = httpParams.first ? httpParams.first : 0;
		// 通过关键字查询的文档列表不做缓存处理
		var client = Wiz.getClient(options);
		client.methodCall(Wiz.api.DOCUMENT_GET_BY_KEY, [requestParams], callback);
	}

	/**
	 * 获取redis中的key
	 * @param  {string} kbGuid      当前kb的guid
	 * @param  {string} itemGuid    查询对象的guid
	 * @param  {string} itemVersion 查询对象的最大version
	 * @return {string}             key
	 */
	function getRedisKey(kbGuid, itemGuid, itemVersion) {
		return 'document.' + kbGuid + '.' + itemGuid + '.' + itemVersion;
	}


	/**
	 * 获取需要删除的key，需要通配符*来查询
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	function getDeleteKeys(key) {
		var keyList = key.split('.');
		var deleteKeys = keyList[0] + '.' + keyList[1] + '.' + keyList[2] + '*';
		return deleteKeys;
	}

	/**
	 * 获取文档列表
	 * @param  {object}   action    action.cmd---动作,action.value---关键字
	 * @param  {string}   token     token
	 * @param  {string}   kbGuid    不能为空
	 * @param  {Function} callback  [description]
	 * @param  {[type]}   callError [description]
	 * @return {undefined}             
	 */
	function getList(httpParams, callback) {
		if ((typeof httpParams.action_cmd !== 'string') || (typeof httpParams.action_value !== 'string') ) {
			// TODO 错误
			return;
		}
		if (mapping[httpParams.action_cmd]) {
			//首先获取版本号，统一处理
			CommonService.getVersion(httpParams.token, httpParams.kb_guid, DOCUMENT_TYPE, function (error, version, options) {
				if (error) {
					callback(error, null);
					return;
				}
				//对获取无标签文档列表的特殊处理
				itemGuid = httpParams.action_value ? httpParams.action_value : httpParams.action_cmd;
				// 判断数据库中是否有保存
				var key = getRedisKey(httpParams.kb_guid, itemGuid, version);
				//是否在数据库中如果没有，则调用getAll重新向服务器申请
				Redis.exists(key, function (exist) {
					if (exist) {
						Redis.getSet(key, function (data) {
							try {
								var list = Document.parseList(data);
							} catch (error) {
								console.log('Document.parseList() Error: ' + error.message ? error.message : error);
								//从数据库获取错误，应该不返回给调用者，记录错误，方便日后排查问题
								// TODO 删除该key
								mapping[httpParams.action_cmd](httpParams, callback, options, key);
							}
							callback(null, list);
						});
					} else {
						// 未保存，则从服务端获取
						mapping[httpParams.action_cmd](httpParams, callback, options, key);
					}
				});
			}, null, true);
		} else {
			callback('getList Error: no such handler ' + httpParams.action_cmd , null);
		}
	}

	/**
	 * 获取文档内容--未完成
	 * @param  {[type]}   httpParams [description]
	 * @param  {Function} callback   [description]
	 * @return {[type]}              [description]
	 */
	function getBody(httpParams, callback) {
		var kbGuid = httpParams.kb_guid
			,	docGuid = httpParams.document_guid
			,	version = httpParams.version
			,	token = httpParams.token;
			//TOTO !version
		if (!version) {
			version = Math.random();
		}
  	// var cachedPath = ValueUtil.getCachedPath(kbGuid, DOCUMENT_TYPE)
			// ,	unzipPath = ValueUtil.getUnzipPath(kbGuid, docGuid, version)
			// ,	cachedName = cachedPath + FILE_SEPARATOR + 'ziw.' + docGuid + '.' + version;

		CommonService.getVersion(httpParams.token, httpParams.kb_guid, DOCUMENT_TYPE, function (error, maxVersion, options) {
			if (error) {
				callback(error, null);
				return;
			}
			getDocumentHtml(token, kbGuid, docGuid, version, options, callback);
			// 增加最大版本号的校验
			// unzipPath = unzipPath + '.' + maxVersion;
			// fs.exists(unzipPath + _documentHtmlPath, function (exists) {
		 //    if (exists){
		 //      readFromCache(unzipPath, kbGuid, docGuid, version, callback);
		 //    }else {
		 //      //首先判断是否有该目录，如果没有，需要创建
			// 		if (!fs.existsSync(cachedPath)) {
			// 			ValueUtil.mkdirSync(cachedPath, null, function(error) {
			// 				if (error) {
			// 					console.log('ValueUtil.mkdirSync Error: ' + error);
			// 				} else {
			// 					downloadFromServer(cachedName, kbGuid, docGuid, unzipPath, token, version, options, callback);
			// 				}
			// 			});
			// 		} else {
			// 			downloadFromServer(cachedName, kbGuid, docGuid, unzipPath, token, version, options, callback);
			// 		}
		 //    }
		 //  });
		});
	}

	function getDocumentHtml(token, kbGuid, docGuid, version, options, callback) {
  	var cachedPath = ValueUtil.getCachedPath(kbGuid, DOCUMENT_TYPE)
			,	unzipPath = ValueUtil.getUnzipPath(kbGuid, docGuid, version)
			,	cachedName = cachedPath + FILE_SEPARATOR + 'ziw.' + docGuid + '.' + version;
		// 增加最大版本号的校验
			// unzipPath = unzipPath + '.' + maxVersion;
			fs.exists(unzipPath + _documentHtmlPath, function (exists) {
		    if (exists){
		      readFromCache(unzipPath, kbGuid, docGuid, version, callback);
		    }else {
		      //首先判断是否有该目录，如果没有，需要创建
					if (!fs.existsSync(cachedPath)) {
						ValueUtil.mkdirSync(cachedPath, null, function(error) {
							if (error) {
								console.log('ValueUtil.mkdirSync Error: ' + error);
							} else {
								downloadFromServer(cachedName, kbGuid, docGuid, unzipPath, token, version, options, callback);
							}
						});
					} else {
						downloadFromServer(cachedName, kbGuid, docGuid, unzipPath, token, version, options, callback);
					}
		    }
		  });
	}


	/**
	 * 获取文档数据，包括dt_created、tag_guid等其他info信息，并且包括内容
	 * @return {[type]} [description]
	 */
	function getData(httpParams, callback) {
		CommonService.getVersion(httpParams.token, httpParams.kb_guid, DOCUMENT_TYPE, function (error, maxVersion, options) {
			if (error) {
				callback(error, null);
				return;
			}
			var requestParams = getParams(httpParams);
			requestParams.kb_guid = httpParams.kb_guid;
			requestParams.token = httpParams.token;
			requestParams.document_guid = httpParams.document_guid;
			var client = Wiz.getClient(options);
			client.methodCall(Wiz.api.DOCUMENT_GET_INFO, [requestParams], function(error, value) {
				if (error) {
					callback(error, null);
					return;
				}
				var documentInfo = value;
				getDocumentHtml(httpParams.token, httpParams.kb_guid, httpParams.document_guid, value.version, options, function(error, value) {
					if (error) {
						callback(error, null);
						return;
					}
					documentInfo.document_body = value;
					callback(null, documentInfo);
				});
			});
		});
	}

	function downloadFromServer(cachedName, kbGuid, docGuid, unzipPath, token, version, options, callback) {

	  var options = getDownloadOptions(kbGuid, options);

	  var query = querystring.stringify({y: 'doc', v: 'ziw', g: docGuid, t: token});
	  options.path = options.path + query;
		Wiz.download(options, cachedName, function (err) {
      if(err){
        callback(err, null);
      }else{
      	//首先检查并创建目录
				if (!fs.existsSync(unzipPath)) {
					//解压缩目录需要nginx代理，要777权限
					ValueUtil.mkdirSync(unzipPath, 0777)
				}
        ValueUtil.unzip(cachedName, unzipPath, function (err,stdout) {
          if(err){
            console.log('解压失败:' + docGuid);
            callback('unzip fail',null);
          }else{
            readFromCache(unzipPath, kbGuid, docGuid, version, callback);
          }
        });
      }
    });
	}

	/**
	 * 从缓存中加载内容
	 * 暂时无用
	 */
	function readFromCache (unzipPath, kbGuid, docGuid, version, callback) {
	  fs.readFile(unzipPath + _documentHtmlPath,function (err, buffer) {
	    var content = '';
	    if(!err){
	      var charset = recognizeCharset(buffer);
	      content = buffer.toString(charset);
	      content = content.replace(/index_files/g, ValueUtil.getHttpServicePath(kbGuid, docGuid, version) + '/index_files');
	    }else{
	      console.log('读取缓存文件出错,' + unzipPath);
	      fs.rmdir(unzipPath);
	      err = '读取出错，请重试!';
	    }

	    callback(err, content);
	  });
	}

	function recognizeCharset (buffer) {
	  var charset = 'utf-8'
	  if(buffer[0]==255 && buffer[1]==254){
	    charset = 'utf-16le';
	  }else if(buffer[0] == 254 && buffer[1] == 255){
	    charset = 'utf-16be';
	  }else if(buffer[0]== 0xEF && buffer[1]== 0xBB && buffer[2]== 0xBF){
	    charset = 'utf-8'
	  }
	  // console.log('识别编码:<'+ buffer[0] + ','+buffer[1] + ','+ buffer[2]+'>,编码为:'+ charset);
	  
	  return charset;
	}

	/**
	 * 新建文档
	 * @param  {object}   httpParams 参数
	 * @param  {Function} callback   回调函数
	 * @return {[type]}              [description]
	 */
	function createDocument(httpParams, callback) {
		var documentGuid = httpParams.document_guid,
				kbGuid = httpParams.kb_guid,
				bTemp = httpParams.temp;
		// 需要在缓存中创建临时目录和文件，不把该文件上传到服务端。\
		if (bTemp === 'true') {
			var tempFile = ValueUtil.getUnzipPath(kbGuid, documentGuid, _tempSuffix);
			if (!fs.existsSync(tempFile)) {
				ValueUtil.mkdirSync(tempFile, null, function(error) {
					if (error) {
						callback(error);
					} else {
						fs.writeFile(tempFile + _documentHtmlPath, '', function (err) {
						  if (err) {
						  	callback(err);
						  }
							callback(null, {document_guid: documentGuid});
						});
					}
				});
			}
		} else {
			callback({faultCode: 500, faultString: 'temp param error!'});
		}
	}
	/**
	 * 使用新接口上传文档ziw包
	 * @param  {[type]}   httpParams [description]
	 * @param  {Function} callback   [description]
	 * @return {[type]}              [description]
	 */
	function updateNew(httpParams, callback) {
		var kbGuid = httpParams.kb_guid,
				documentGuid = httpParams.document_guid,
				version = httpParams.version || 'temp',
				documentBody = httpParams.document_body;
		// 测试模拟表单
		CommonService.getVersion(httpParams.token, httpParams.kb_guid, DOCUMENT_TYPE, function (error, maxVersion, options) {
			if (error) {
				callback(error);
				return;
			}
			var suffix = version ? version : _tempSuffix,
					tempFile = ValueUtil.getUnzipPath(kbGuid, documentGuid, version),
					zipPath = ValueUtil.getCachedPath(kbGuid, DOCUMENT_TYPE),
					zipFile = zipPath + FILE_SEPARATOR + 'ziw.' + documentGuid + '.' + version;
			fs.exists(tempFile, function(exists) {
				if (exists) {
					sendDocument(tempFile, zipPath, httpParams, options, sendDocCallback);
				} else {
					if (typeof httpParams.origin_kb_guid ==='string') {
						tempFile = ValueUtil.getUnzipPath(httpParams.origin_kb_guid, documentGuid, version);
						zipFile = ValueUtil.getCachedPath(httpParams.origin_kb_guid, DOCUMENT_TYPE);
						sendDocument(tempFile, zipPath, httpParams, options, sendDocCallback);
					} else {
						callback({code: 502, message: 'no such document'});
					}
				}
			});

		function sendDocCallback(error, value) {
			if (error) {
        //失败后，直接删除ziw文件和解压目录，重新到服务器下载
        fs.unlink(zipFile,function (err) {
          console.log('删除上传失败的文件:' + zipFile + (err ? err :''));
        });
        ValueUtil.rmDirForced(tempFile, function(error, stdout, strerr) {
        	console.log('删除上传失败的文件: ' + tempFile);
        });
			}
			callback(error, value);
		}
			// 处理index_files中的图片文件
		});
	}

	function sendDocument(tempFile, zipPath, httpParams, options, callback) {
		var documentGuid = httpParams.document_guid,
				version = httpParams.version || 'temp',
				documentBody = httpParams.document_body,
				zipFile = zipPath + FILE_SEPARATOR + 'ziw.' + documentGuid + '.' + version;
		// 首先删除无效的图片资源
		removeImageResourcesFromIndexFiles(tempFile, documentBody);
		// 先把文档内容写入到index.html中
		// 内容之前必须要加上UTR8_BOM头，否则无BOM的utf8文档在PC客户端显示为乱码
		fs.writeFile(tempFile + _documentHtmlPath, UTF8_BOM + convertDocBody(documentBody), 'utf-8', function (err) {
		  if (err) {
		  	callback(err);
		  	return;
		  }
		  // 压缩之前首先创建目录
		 	fs.exists(zipPath, function(exists) {
		 		if (!exists) {
		 			ValueUtil.mkdirSync(zipPath);
		 		};
				ValueUtil.zip(tempFile, zipFile, function (error, value){
					if (error) {
						callback(error, null);
						return;
					}
					// 打包成功后，发送到服务器上
					try {
						httpParams.options = options;
						httpParams.dispositionName = 'document_file';
						httpParams.version = -1;
						Wiz.sendForm(zipFile, httpParams, callback);	
					} catch (error) {
						console.log('Wiz.sendForm Error');
						console.log(error);
						callback(error, null);
					}
				});
		 	});
		});
	}

	/**
	 * 删除index_files中无效的图片资源
	 * @param  {[string]} filePath 文档的目录地址
	 * @return {[type]}          [description]
	 */
	function removeImageResourcesFromIndexFiles(filePath, documentBody) {
		try {
			var fileList = fs.readdirSync(filePath + _docIndexFilePath);
		} catch (error) {
			return;
		}
		var fullPath;
		fileList.forEach(function(fileName, index) {
			if (documentBody.indexOf(fileName) < 0) {
				var fullPath = filePath + _docIndexFilePath + FILE_SEPARATOR + fileName;
				try {
					console.log('start deleted: ' + fullPath);	
					fs.unlinkSync(fullPath);
				} catch(error) {
					// 只记录不做处理
					console.log('error to deleted file: ' + fullPath);
				}
			}
		})
	}

	// 由于之前协议不一致，所以必须要对参数做处理
	// 主要为了兼容旧版本
	function parseParams(httpParams) {
		var keyMap = {
			'document_guid': 'guid',
			'document_title': 'title',
			'document_body': 'body',
			'document_tag_guids': 'tag_guids', 
			'document_category': 'category',
			'token_guid': 'token_guid',
			'api_version': 'api_version',
			'client_type': 'client_type'
		}
		var o = {};
		for (var key in httpParams) {
			if (keyMap[key]) {
				o[keyMap[key]] = httpParams[key];
				if (key === 'document_guid') {
					o[key] = httpParams[key];
				}
			}
		}
		// 对文档内容做处理
		o.body = convertDocBody(o.body);
		return o;
	}

	/**
	 * 对接受过来的bodyHtml进行处理，主要是处理index_files的问题
	 * @param  {string} bodyHtml [description]
	 * @return {string}          [description]
	 */
	function convertDocBody(bodyHtml) {
	  var reg = /http[\S]+index_files/g;
	  var returnValue = '';
	  if (bodyHtml) {
	  	returnValue = bodyHtml.replace(reg, 'index_files');	
	  }
		return returnValue;
	}

	function insertImage(httpParams, file, callback) {
		// 为传入version,则当做新文档来处理
		// 调用端如果有version值，必须要传入
		var version = (httpParams.version !== 'undefined') ? httpParams.version : _tempSuffix,
				token = httpParams.token,
				kbGuid = httpParams.kb_guid,
				docGuid = httpParams.document_guid;
		CommonService.getVersion(token, kbGuid, DOCUMENT_TYPE, function (error, maxVersion, options) {
			if (error) {
				callback(error, null);
				return;
			}
			var unzipPath = ValueUtil.getUnzipPath(kbGuid, docGuid, version);

			if (fs.existsSync(unzipPath)) {
				fs.readFile(file.path, function (err, data) {
				  if (err) {
				  	callback(err, null);
				  	return;
				  }
				  // 首先获取父目录，并创建父目录
				  var imageParentPath = unzipPath + _docIndexFilePath;
				  ValueUtil.mkdirSync(imageParentPath);
				  var fileName = ValueUtil.renameFile(file.name);
				  // 获取文件的完整名称，包括路径
				  // 对file.name进行特殊处理,否则会有中文乱码的问题
				  var imagePath = imageParentPath + FILE_SEPARATOR + fileName;
				  // 将读出的内容写入到图片文件中
				  fs.writeFile(imagePath, data, 'utf-8', function(error, value) {
				  	if (error) {
				  		callback(error, null);
				  		return;
				  	}
				  	var imageUrl = ValueUtil.getHttpServicePath(kbGuid, docGuid, version) + '/index_files/' + fileName;
				  	callback(null, imageUrl);
				  });
				});
			} else {
				// 不存在暂时抛出错误
				// TODO改善
				callback({faultCode: 500, faultString: 'could not find document file'}, null);
			}
		});
	}

	/**
	 * 写入文档的index.html文件
	 * @return {[type]} [description]
	 */
	function writeIndexFile(indexPath, docBody, callback) {
		// TODO需要补全？
		fs.writeFile(indexPath, docBody, 'utf-8', function(err) {
			callback(err, null);
		});
	}

	function deleteDocument(httpParams, callback) {

		var token = httpParams.token,
				kbGuid = httpParams.kb_guid,
				docGuid = httpParams.document_guid;
		CommonService.getVersion(token, kbGuid, DOCUMENT_TYPE, function (error, maxVersion, options) {
			if (error) {
				callback(error, null);
				return;
			}

			var requestParams = getParams(httpParams),
					client = Wiz.getClient(options);
			var deletedList = [];

			// TODO 参数的简单校验
			if (typeof docGuid === 'string' && docGuid.indexOf('*') > -1) {
				// 批量删除
				var docList=docGuid.split('*'), i=0, length=docList.length;
				for ( ; i<length; i++) {
					deletedList.push(new DeletedItem('document', '', docList[i]));
				}
				requestParams.deleteds = deletedList;
				client.methodCall(Wiz.api.UploadDeletedList, [requestParams], callback);
			} else {
				// 单一删除
				requestParams.document_guid = docGuid;
				client.methodCall(Wiz.api.DOCUMENT_DELETE, [requestParams], callback);
			}
		});
	}

	function getAbstract(httpParams, callback) {
		httpParams.type = 3;
	  var query = querystring.stringify(httpParams);
		var options = {
		  hostname: 'search.wiz.cn',
		  port: 80,
		  path: '/wizsearch/abstract?' + query,
		  method: 'GET'
		};
		console.log('getAbstract');
		Wiz.sendRequest(options, '', callback);
	}

	//接口
	return {
		getList: getList,
		getBody: getBody,
		createDocument: createDocument,
		update: updateNew,
		insertImage: insertImage,
		delete: deleteDocument,
		getDetailInfo: getData,
		getAbstract: getAbstract
	}
};
module.exports = new DocumentService();
