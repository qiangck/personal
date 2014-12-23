/**
 * get kb info
 */


var CategoryService = require('../libs/service/CategoryService'),
		TagService = require('../libs/service/TagService'),
		DocumentService = require('../libs/service/DocumentService'),
		AttachmentService = require('../libs/service/AttachmentService'),
		MessageService = require('../libs/service/MessageService'),
		url = require('url'),
		wizResponse = require('./wizResponse'),

		Redis = require('../libs/service/Redis'),
		fs = require('fs'),
		HttpUtil = require('../libs/util/HttpUtil');

function getHttpPostParams(req) {
	//获取http post的参数
	return req.body;
}

function getHttpGetParams(req) {
	//获取http get的参数
	return url.parse(req.url, true).query;
}



var CategoryRoute = {	
	//获取根节点信息
	getRoot: function (req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpGetParams = getHttpGetParams(req);
		//
		var tokenGuid = httpGetParams.token;
		var kbGuid = httpGetParams.kb_guid;

		CategoryService.getRoot(tokenGuid, kbGuid, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value.categories;
			}
			// if (error) {
			// 	console.log('CategoryService.getRoot() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	//TODO 保存到redis数据库中
			// 	responseJson = {'code': value.return_code, 'message': 'success', 'list': value.categories};
			// }
			res.end(JSON.stringify(responseJson));
		});

	},

	//获取子节点信息
	getChild: function (req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpGetParams = getHttpGetParams(req);
		//
		var tokenGuid = httpGetParams.token;
		var kbGuid = httpGetParams.kb_guid;

		var rootValue = httpGetParams.parent_value;

		CategoryService.getChild(tokenGuid, kbGuid, rootValue, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value.categories;
			}
			// if (error) {
			// 	console.log(error);
			// 	console.log('CategoryService.getChild() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	//TODO 保存到redis数据库中
			// 	responseJson = {'code': value.return_code, 'message': 'success', 'list': value.categories};
			// }
			res.end(JSON.stringify(responseJson));
		});
	},

	getAll: function (req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpGetParams = getHttpGetParams(req);
		//
		var tokenGuid = httpGetParams.token;
		var kbGuid = httpGetParams.kb_guid;

		CategoryService.getAll(tokenGuid, kbGuid, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value.categories;
			}
			// if (error) {
			// 	console.log('CategoryService.getAll() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	//TODO 保存到redis数据库中
			// 	responseJson = {'code': value.return_code, 'message': 'success', 'list': value.categories};
			// }
			res.end(JSON.stringify(responseJson));
		});
	},
	create: function (req, res) {
		res = wizResponse.initDefault(res);
		var responseJson = {},
			httpPostParams = getHttpPostParams(req),
			// name = req.params.new_name,
			token = httpPostParams.token,
			kbGuid = httpPostParams.kb_guid,
			name = httpPostParams.new_name;
		// 校验参数，所有校验方法都放在route这层来操作，补全其他
		if (!token || !kbGuid || !name) {
			responseJson = {'code': 490, 'message': 'wrong params'};
			res.end(JSON.stringify(responseJson));
			return;
		}
		CategoryService.create(token, kbGuid, name, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.message = 'create folder ' + name + ' success';
			}
			// if (error) {
			// 	console.log('CategoryService.create() Error: ' + error.faultString);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	responseJson = {'code': value.return_code, 'message': 'create folder ' + name + ' success'};
			// }
			res.end(JSON.stringify(responseJson));
		});
	},
	delete: function (req, res) {
		res = wizResponse.initDefault(res);
		var responseJson = {},
			httpPostParams = getHttpPostParams(req);
		CategoryService.delete(httpPostParams, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.location = httpPostParams.old_category_path;
				responseJson.type = 'category';
			}
			// if (error) {
			// 	console.log('CategoryService.delete() Error: ' + error.faultString);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	responseJson = {'code': value.return_code, 'location': httpPostParams.old_category_path, 'type': 'category'};
			// }
			res.end(JSON.stringify(responseJson));
		});
	},
	rename: function (req, res) {
		res = wizResponse.initDefault(res);
		var responseJson = {},
			httpPostParams = getHttpPostParams(req);
		CategoryService.rename(httpPostParams, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.message = 'rename folder success';
			}
			// if (error) {
			// 	console.log('CategoryService.rename() Error: ' + error.faultString);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	responseJson = {'code': value.return_code, 'message': 'rename folder success'};
			// }
			res.end(JSON.stringify(responseJson));
		});
	}
};

var TagRoute = {
	getRoot: function (req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpGetParams = getHttpGetParams(req);
		//
		var tokenGuid = httpGetParams.token;
		var kbGuid = httpGetParams.kb_guid;

		TagService.getRoot(tokenGuid, kbGuid, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value.tagList;
			}
			// if (error) {
			// 	console.log('TagService.getRoot() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	//TODO 保存到redis数据库中
			// 	responseJson = {'code': value.return_code, 'message': 'success', 'list': value.tagList};
			// }
			res.end(JSON.stringify(responseJson));
		});
	},
	getChild: function (req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpGetParams = getHttpGetParams(req);
		//
		var tokenGuid = httpGetParams.token;
		var kbGuid = httpGetParams.kb_guid;
		var rootValue = httpGetParams.parent_value;

		TagService.getChild(tokenGuid, kbGuid, rootValue, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value.tagList;
			}
			// if (error) {
			// 	console.log('TagService.getChild() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	//TODO 保存到redis数据库中
			// 	responseJson = {'code': value.return_code, 'message': 'success', 'list': value.tagList};
			// }
			res.end(JSON.stringify(responseJson));
		});
	},
	getAll: function (req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpGetParams = getHttpGetParams(req);
		//
		var tokenGuid = httpGetParams.token;
		var kbGuid = httpGetParams.kb_guid;

		TagService.getAll(tokenGuid, kbGuid, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value.tagList;
			}
			// if (error) {
			// 	console.log('TagService.getAll() Error: ' + error.message);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	//TODO 保存到redis数据库中
			// 	responseJson = {'code': value.return_code, 'message': 'success', 'list': value.tagList};
			// }
			res.end(JSON.stringify(responseJson));
		});
	},
	createTag: function(req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpPostParams = getHttpPostParams(req);

		TagService.create(httpPostParams, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.message = 'success create tag: ' + httpPostParams.new_name;
				responseJson.tag_guid = value.tag_guid;
			}
			// if (error) {
			// 	console.log('TagService.create() Error: ' + error.faultString);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	//TODO 保存到redis数据库中
			// 	responseJson = {'code': value.return_code, 'message': 'success create tag: ' + httpPostParams.new_name, 'tag_guid': value.tag_guid};
			// }
			res.end(JSON.stringify(responseJson));
		});
	},
	delete: function(req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpPostParams = getHttpPostParams(req);

		TagService.delete(httpPostParams, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.message = 'success delete';
				responseJson.tag_guid = httpPostParams.tag_guid;
				responseJson.type = 'tag';
			}
			// if (error) {
			// 	console.log('TagService.delete() Error: ' + error.faultString);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	responseJson = {'code': value.return_code, 'message': 'success delete', 'tag_guid': httpPostParams.tag_guid, 'type': 'tag'};
			// }
			res.end(JSON.stringify(responseJson));
		});
	},
	rename: function(req, res) {
		//所有步骤
		//初始化response对象
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpPostParams = getHttpPostParams(req);
		TagService.rename(httpPostParams, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.message = 'success rename';
				responseJson.tag_guid = httpPostParams.tag_guid;
			}
			// if (error) {
			// 	console.log('TagService.rename() Error: ' + error.faultString);
			// 	responseJson = {'code': error.faultCode, 'message': error.faultString};
			// } else {
			// 	responseJson = {'code': value.return_code, 'message': 'success rename', 'tag_guid': httpPostParams.tag_guid};
			// }
			res.end(JSON.stringify(responseJson));
		});
	}
};

var DocumentRoute = {
	getList: function (req, res) {
		res = wizResponse.initDefault(res);
		var responseJson = {};
		//获取参数
		var httpGetParams = getHttpGetParams(req);
		//
		DocumentService.getList(httpGetParams, function(error, value) {
			if (error) {
				console.log('DocumentService.getList() Error: ' + error.message);
				responseJson = {'code': error.faultCode, 'message': error.faultString ? error.faultString : error.message};
			} else {
				//TODO 保存到redis数据库中
				responseJson = {'code': 200, 'message': 'success', 'list': value};
			}
			res.end(JSON.stringify(responseJson));
		});
	},
	getBody: function (req, res) {
		res = wizResponse.initDefault(res);
		var responseJson = {};
		var httpGetParams = getHttpGetParams(req);
		DocumentService.getBody(httpGetParams, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.body = value;
			}
			res.end(JSON.stringify(responseJson));
		});
	},
	createDocument: function (req, res) {
		res = wizResponse.initDefault(res);
		var responseJson = {};
		var httpPostParams = getHttpPostParams(req);
		DocumentService.createDocument(httpPostParams, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.document_guid = value.document_guid;
			}
			res.end(JSON.stringify(responseJson));
		});
	},
	update: function (req, res) {
		res = wizResponse.initDefault(res);
		var responseJson = {},
			httpPostParams = getHttpPostParams(req);
			
		DocumentService.update(httpPostParams, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.document_guid = value.document_guid;
			}
			res.end(JSON.stringify(responseJson));
		});
	},
	/**
	 * 文档插入图片处理，缓存图片到文档的缓存目录下的index_files中
	 * 返回给json数据{ "url":"图片地址", "title":"图片描述", "state":"上传状态" }
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	insertImage: function ( req, res ) {
		res = wizResponse.initDefault(res);
		var httpPostParams = getHttpPostParams(req),
				responseJson = {};
		var file = req.files.image_file;
		DocumentService.insertImage(httpPostParams, file, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.url = value;
				// ueditor中需要判断state，
				responseJson.state = 'success';
			}
			res.end(JSON.stringify(responseJson));
		});
	},
	delete: function (req, res) {
		res = wizResponse.initDefault(res);
		var httpPostParams = getHttpPostParams(req),
				responseJson = {};
		DocumentService.delete(httpPostParams, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			res.end(JSON.stringify(responseJson));
		});
	},
	getDetailInfo: function (req, res) {
		res = wizResponse.initDefault(res);
		var httpGetParams = getHttpGetParams(req),
				responseJson = {};
		DocumentService.getDetailInfo(httpGetParams, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.document_info = value;
			}
			res.end(JSON.stringify(responseJson));
		});
	},
	getAbstract: function (req, res) {
		res = wizResponse.initDefault(res);
		var httpGetParams = getHttpGetParams(req),
				responseJson = {};
		DocumentService.getAbstract(httpGetParams, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.abstracts = value.result;
			}
			res.end(JSON.stringify(responseJson));
		});
	}
};


var AttachmentRoute = {
	getList: function (req, res) {
		res = wizResponse.initDefault(res);
		var httpGetParams = getHttpGetParams(req),
				responseJson = {};
		AttachmentService.getList(httpGetParams, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value;
			}
			res.end(JSON.stringify(responseJson));
		});
	},
	download: function (req, res) {
		// res = wizResponse.initDefault(res);
		var httpGetParams = getHttpGetParams(req),
				responseJson = {};
		AttachmentService.download(httpGetParams, req.headers.cookie, function (error, value) {
			if (error) {
				console.log(error);
				if (error.faultCode && error.faultString) {
					responseJson = {'code': 501, 'message': error.faultString};
				} else {
					responseJson = {'code': 502, 'message': (typeof error === 'string') ? error: error.message};
				}
				res.end(JSON.stringify(responseJson));
			} else {
				var contentDisposition = HttpUtil.getContentDispositionByUserAgent(req.headers['user-agent'], value.fileName);
	      res.writeHead(200, {'Content-Type': 'application/octet-stream', 'Content-Disposition': contentDisposition});
	      res.write(value.file, "binary");
	      res.end();
			}
		});
	},
	create: function (req, res) {
		// res = wizResponse.initDefault(res);
		// 上传附件单独处理，Content-Type为application/json时，在ie下不会被页面直接接受
		// 会直接弹出下载
		res.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
		var httpPostParams = getHttpPostParams(req),
				responseJson = {};
		if (!httpPostParams.token || !httpPostParams.kb_guid || !httpPostParams.document_guid || !req.files || !req.files.attachment_file) {
			responseJson = {code: 490, message: 'params error'};
	    res.end(JSON.stringify(responseJson));
		}

		var file = req.files.attachment_file;
		if (file.size >= 5 * 1024 * 1024) {
			responseJson = {code: 491, message: 'size too large'};
	    res.end(JSON.stringify(responseJson));
	    return;
		}
		AttachmentService.create(file, httpPostParams, function(error, value) {
			responseJson = wizResponse.getResJson(error, value);
			res.end(JSON.stringify(responseJson));
		});
	},
	delete: function(req, res) {
		res = wizResponse.initDefault(res);
		var httpPostParams = getHttpPostParams(req),
				responseJson = {};
		AttachmentService.delete(httpPostParams, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			res.end(JSON.stringify(responseJson));
		});
	}
};


var MessageRoutes = {
	getList: function(req, res) {
		res = wizResponse.initDefault(res);
		var httpGetParams = getHttpGetParams(req),
				responseJson = {};
		MessageService.getList(httpGetParams, function (error, value) {
			responseJson = wizResponse.getResJson(error, value);
			if (responseJson.code === 200) {
				responseJson.list = value.result;
			}
			res.end(JSON.stringify(responseJson));
		});
	}
};

exports.getAllCategory = CategoryRoute.getAll;
exports.getRootCategory = CategoryRoute.getRoot;
exports.getChildCategory = CategoryRoute.getChild;
exports.createCategory = CategoryRoute.create;
exports.deleteCategory = CategoryRoute.delete;
exports.renameCategory = CategoryRoute.rename;

exports.getAllTag = TagRoute.getAll;
exports.getRootTag = TagRoute.getRoot;
exports.getChildTag = TagRoute.getChild;
exports.createTag = TagRoute.createTag;
exports.deleteTag = TagRoute.delete;
exports.renameTag = TagRoute.rename;

exports.getDocumentList = DocumentRoute.getList;
exports.getDocumentBody = DocumentRoute.getBody;
exports.createDocument = DocumentRoute.createDocument;
exports.updateDocument = DocumentRoute.update;
exports.insertImageToDocument = DocumentRoute.insertImage;
exports.deleteDocument = DocumentRoute.delete;
exports.getDetailInfo = DocumentRoute.getDetailInfo;
exports.getDocAbstract = DocumentRoute.getAbstract;

exports.getAttachmentList = AttachmentRoute.getList;
exports.downloadAttachment = AttachmentRoute.download;
exports.createAttachment = AttachmentRoute.create;
exports.deleteAttachment = AttachmentRoute.delete;




