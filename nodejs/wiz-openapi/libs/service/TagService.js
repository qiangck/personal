var Wiz = require('./Wiz')
	,	params = require('../models/Params')
	,	client = Wiz.client
	,	Redis = require('./Redis')
	,	Tag = require('../models/Tag')
	,	kb = require('../models/KnowledgeBase')
	, DeletedItem = require('../models/DeletedItem')
	,	CommonService = require('./CommonService');

var TagService = {
	getAll: function (token, kbGuid, callback, rootValue) {
		CommonService.getVersion(token, kbGuid, 'tag', function (error, version, options) {
			//获取版本错误
			if (error) {
				callback(error, null);
			};
			var getAllCallback = function (error, value) {
					if (!error) {
						var tagList = Tag.parseData(value);
						// 首先删除以前缓存的数据
						var deleteKeys = TagService.getDeleteKeys(kbGuid);
						Redis.deleteKeys(deleteKeys);
						//写入数据库
						var key = TagService.getRedisKey(kbGuid, version);
						Redis.addListToSet(key, tagList);
						if (typeof rootValue === 'string') {
							var childList = Tag.getChildList(tagList, rootValue); 
							callback(null, {return_code: 200, 'tagList': childList});
						}
					}
					callback(error, {return_code: 200, 'tagList': value});
			};
			//组合参数
			var requestParams = params.getDefaultParams();
			requestParams.token = token;
			requestParams.kb_guid = kbGuid;
			requestParams.version = '0';
			requestParams.count = 2000;
			//获取xmlrpc client
			var client = Wiz.getClient(options);
			client.methodCall(Wiz.api.TAG_GET_ALL, [requestParams], getAllCallback);
		}, null, true);
	},

	getRoot: function (token, kbGuid, callback) {
		TagService.getChild(token, kbGuid, '', callback);
	},

	getChild: function (token, kbGuid, rootValue, callback) {
		CommonService.getVersion(token, kbGuid, 'tag', function (error, version, options) {
			//获取版本错误
			if (error) {
				callback(error, null);
			};
			var key = TagService.getRedisKey(kbGuid, version);
			//是否在数据库中如果没有，则调用getAll重新向服务器申请
			Redis.exists(key, function (exist) {
				if (exist) {
					Redis.getSet(key, function (data) {
						var childList = Tag.getChildList(data, rootValue);
						callback(null, {return_code: 200, 'tagList': childList});
					});
				} else {
					TagService.getAll(token, kbGuid, callback, rootValue);
				}
			});
		}, null, true);
	},
	create: function(httpParams, callback) {
		var token = httpParams.token,
				kbGuid = httpParams.kb_guid,
				name = httpParams.new_name,
				parentGuid = httpParams.parent_guid;
				// TODO 验证name
		CommonService.getVersion(token, kbGuid, 'tag', function (error, version, options) {
			if (error) {
				callback(error, null);
				return;
			}
			httpParams.tag_name = name;
			var client = Wiz.getClient(options);
			client.methodCall(Wiz.api.TAG_CREATE, [httpParams], callback);
		});
	},

	delete: function(httpParams, callback) {
		var token = httpParams.token,
				kbGuid = httpParams.kb_guid,
				tagGuid = httpParams.tag_guid;
		TagService.getAll(token, kbGuid, function(error, value) {
			if (error) {
				callback(error, null);
				return;
			}
			var tagList = value.tagList;
			var i = 0;
			var deletedList = [];
			var childList = Tag.getAllChildList(tagList, tagGuid);
			var length = childList.length;
			// 把所有子标签放到deletedList中
			for ( ; i<length; i++) {
				var tag = childList[i];
				deletedList.push(new DeletedItem('tag', tag.version, tag.tag_guid));
			}
			// 将自己放入deletedList中
			deletedList.push(new DeletedItem('tag', '', tagGuid));

			CommonService.getVersion(token, kbGuid, 'tag', function (error, version, options) {
				if (error) {
					callback(error, null);
					return;
				}
				var requestParams = params.getDefaultParams();
				requestParams.token = token;
				requestParams.kb_guid = kbGuid;
				requestParams.deleteds = deletedList;
				var client = Wiz.getClient(options);
				client.methodCall(Wiz.api.UploadDeletedList, [requestParams], callback);
			});
		});
	},
	rename: function(httpParams, callback) {
		var token = httpParams.token,
				kbGuid = httpParams.kb_guid,
				tagGuid = httpParams.tag_guid,
				newName = httpParams.new_name;
		if (!newName) {
			callback({faultCode: 490, faultString: 'new name error, please check'});
			return;
		}
		CommonService.getVersion(token, kbGuid, 'tag', function(error, version, options) {
			if (error) {
				callback(error, null);
				return;
			}
			var requestParams = params.getDefaultParams();
			requestParams.token = token;
			requestParams.kb_guid = kbGuid;
			requestParams.tag_guid = tagGuid;
			requestParams.new_name = newName;
			var client = Wiz.getClient(options);
			client.methodCall(Wiz.api.TAG_RENAME, [requestParams], callback);
		});
	},
	getRedisKey: function (kbGuid, version) {
		return 'tag.' + kbGuid + '.' + version;
	},
	getDeleteKeys: function(kbGuid) {
		return 'tag.' + kbGuid + '*';
	}
};


exports.getAll = TagService.getAll;
exports.getRoot = TagService.getRoot;
exports.getChild = TagService.getChild;
exports.create = TagService.create;
exports.delete = TagService.delete;
exports.rename = TagService.rename;