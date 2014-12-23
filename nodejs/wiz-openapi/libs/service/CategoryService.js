var Wiz = require('./Wiz')
	,	params = require('../models/Params')
	,	client = Wiz.client
	,	Redis = require('./Redis')
	,	Category = require('../models/Category')
	,	kb = require('../models/KnowledgeBase')
	,	CommonService = require('./CommonService');

var FOLDERS = 'folders'
	,	FOLDERS_POS = 'folders_pos';

var CategoryService = {
	TYPE: 'folders',
	getAll: function (token, kbGuid, callback, rootValue) {
		var requestParams = params.getDefaultParams();
		requestParams.token = token;
		requestParams.kb_guid = kbGuid;

		CommonService.getVersion(token, kbGuid, CategoryService.TYPE, function (error, version, options) {
			if (error) {
				//
				callback(error, null);
				return;
			};
			var client = Wiz.getClient(options)
				//回调处理函数，需要把数据缓存
				,	getAllCallback = function (error, value) {
					if (error) {
						callback(error, value);
						return;
					}
					CategoryService.getCategoryPos(token, kbGuid, function(error, position){
						if (error) {
							// callback(error, null);
							// 记录错误，不回调
							console.log('CategoryService.getCategoryPos Error: ' + error);
						}
						//没有报错执行下列操作
						if (value) {
							var categories = value.categories || value.value_of_key
								,	categoryList = Category.parseDate(categories, position)
								, version = value.version ? value.version : -1;
							value.categories = categoryList;
							//写入数据库
							//TODO 写入目录的版本号，无需写入文档版本号
							var key = CategoryService.getRedisKey(kbGuid, version);
							// 判断是否为Array?
							if (categoryList) {
								var deleteKeys = CategoryService.getDeleteKeys(kbGuid);
								Redis.deleteKeys(deleteKeys);
								Redis.addListToSet(key, categoryList);
							}
						}
						// 获取child 节点数据
						if (rootValue) {
							var childList = Category.getChildList(categoryList, rootValue);
							callback(null, {return_code: 200, categories: childList});
						} else {
							callback(error, value);
						}
					});
				};

			requestParams.key = CategoryService.TYPE;
			client.methodCall(Wiz.api.KB_GET_VALUE, [requestParams], function(error, value) {
				// 有错误或者数据不存在，直接调用以前接口获取数据   lsl--2012-11-28
				if (error || value.return_code !== 200) {
					// console.log('request category from old api');
					client.methodCall(Wiz.api.CATEGORY_GET_ALL, [requestParams], getAllCallback);
				} else {
					getAllCallback(error, value);
				}
			});
		}, CategoryService.TYPE);
	},

	getRoot: function (token, kbGuid, callback) {
		CategoryService.getChild(token, kbGuid, '/', callback);
	},

	getChild: function (token, kbGuid, rootValue, callback) {

		CommonService.getVersion(token, kbGuid, CategoryService.TYPE, function (error, version, options) {
			if (error) {
				callback(error, null);
				return;
			}
			var key = CategoryService.getRedisKey(kbGuid, version);
			Redis.exists(key, function (exist) {
				if (exist) {
					//存在，直接获取并返回
					Redis.getSet(key, function (data) {
						CategoryService.getCategoryPos(token, kbGuid, function(error, position){
							var categories = Category.parseListToString(data);
							var categoryList = Category.parseDate(categories, position);
							var childList = Category.getChildList(categoryList, rootValue);
							callback(null, {return_code: 200, categories: childList});
						});
					});
				} else {
					// 数据库中如果没有，则调用getAll重新向服务器申请
					CategoryService.getAll(token, kbGuid, callback, rootValue);
				}
			});
		}, CategoryService.TYPE);
	},
	create: function(token, kbGuid, newName, callback) {
		CommonService.getVersion(token, kbGuid, CategoryService.TYPE, function (error, version, options) {
			if (error) {
				callback(error, null);
				return;
			}
			var location = '/' + newName + '/';
			// 防止出现多个'/'
			location = location.replace(/\/+/g, '/');
			var key = CategoryService.getRedisKey(kbGuid, version);
			// 获取数据后的处理函数
			var convertCategories = function (data) {
						
				if (Category.exist(data, location)) {
					// 已经存在
					callback({faultCode: 500, faultString: 'folder already exists!'});
					return;
				}

				CategoryService.getCategoryPos(token, kbGuid, function(error, position){
					if (error) {
						callback(error, null);
					}
					var oldCategories = Category.parseListToString(data)
						,	newCategories = (oldCategories ? oldCategories + '*' : '') + location
						,	newList = Category.parseDate(newCategories)
					// 删除redis中旧数据
					// TODO删除oldKey
						,	oldKey = CategoryService.getRedisKey(kbGuid, version)
						, client = Wiz.getClient(options)
						, requestParams = params.getDefaultParams();

					requestParams.token = token;
					requestParams.kb_guid = kbGuid;
					requestParams.key = CategoryService.TYPE;
					requestParams.value_of_key = newCategories;

					client.methodCall(Wiz.api.KB_SET_VALUE, [requestParams], function (error, value) {

						var deleteKeys = CategoryService.getDeleteKeys(kbGuid);
						Redis.deleteKeys(deleteKeys);
						var newKey = CategoryService.getRedisKey(kbGuid, value.version);
						// 增加新数据到redis中
						Redis.addListToSet(newKey, newList);
						callback(error, value);
					});
				});
			};

			Redis.exists(key, function (exist) {
				if (exist) {
					//存在，直接获取并返回
					Redis.getSet(key, function (data) {
						convertCategories(data);
					});
				} else {
					// 数据库中如果没有，则调用getAll重新向服务器申请
					// 回调函数处理逻辑同上方
					CategoryService.getAll(token, kbGuid, function(error, value) {
						if (error) {
							callback(error, null);
							return;
						}
						if(value) {
							convertCategories(value.categories);
						}
					});
				}
			});
		}, CategoryService.TYPE);
	},

	delete: function(httpParams, callback) {
		var token = httpParams.token,
				kbGuid = httpParams.kb_guid,
				categoryPath = httpParams.old_category_path;
		CommonService.getVersion(token, kbGuid, CategoryService.TYPE, function (error, version, options) {
			if (error) {
				callback(error, null);
				return;
			}
			var requestParams = params.getDefaultParams();
			requestParams.token = token;
			requestParams.kb_guid = kbGuid;
			requestParams.old_category_path = categoryPath;
			var client = Wiz.getClient(options);
			client.methodCall(Wiz.api.CATEGORY_DELETE, [requestParams], function(error, value) {
				if(error) {
					callback(error, null);
					return;
				}
				// 这里直接返回，KV的操作失败可以忽略 
				var key = CategoryService.getRedisKey(kbGuid, version);
				callback(error, value);
				// 下面的操作不需要调用回调函数
				Redis.exists(key, function (exist) {
					if (exist) {
						//存在，直接获取
						Redis.getSet(key, function (data) {
							var categoryList = Category.delete(data, categoryPath);
							var categories = Category.parseListToString(categoryList);

							var requestParams = params.getDefaultParams();
							requestParams.token = token;
							requestParams.kb_guid = kbGuid;
							requestParams.key = CategoryService.TYPE;
							requestParams.value_of_key = categories;
							client.methodCall(Wiz.api.KB_SET_VALUE, [requestParams], function (error, value) {

								if (!error) {
									var deleteKeys = CategoryService.getDeleteKeys(kbGuid);
									Redis.deleteKeys(deleteKeys);
									var newKey = CategoryService.getRedisKey(kbGuid, value.version);
									// 增加新数据到redis中
									Redis.addListToSet(newKey, categoryList);	
								}
							});
						});
					}
				});
			});
		}, CategoryService.TYPE);
	},
	rename: function(httpParams, callback) {
		var token = httpParams.token,
				kbGuid = httpParams.kb_guid,
				categoryPath = httpParams.old_category_path,
				newName = httpParams.new_title;
		CommonService.getVersion(token, kbGuid, CategoryService.TYPE, function (error, version, options) {
			if (error) {
				callback(error, null);
				return;
			}
			var requestParams = params.getDefaultParams();
			requestParams.token = token;
			requestParams.kb_guid = kbGuid;
			requestParams.old_category_path = categoryPath;
			requestParams.new_title = newName;
			var client = Wiz.getClient(options);
			client.methodCall(Wiz.api.CATEGORY_RENAME, [requestParams], function(error, value) {
				if (error || value.return_code != 200) {
					callback(error, null);
					return;
				}
				if (value.return_code != 200) {
					callback({faultCode: 500, faultString: value.err_msg});
					return;
				}
				// ks请求返回正确后，执行处理kv请求
				var key = CategoryService.getRedisKey(kbGuid, version);
				Redis.exists(key, function (exist) {
					if (exist) {
						//存在，直接获取
						Redis.getSet(key, function (data) {
							var categoryList = Category.rename(data, categoryPath, newName);
							var categories = Category.parseListToString(categoryList);

							var requestParams = params.getDefaultParams();
							requestParams.token = token;
							requestParams.kb_guid = kbGuid;
							requestParams.key = CategoryService.TYPE;
							requestParams.value_of_key = categories;
							client.methodCall(Wiz.api.KB_SET_VALUE, [requestParams], function (error, value) {

								if (!error) {
									var deleteKeys = CategoryService.getDeleteKeys(kbGuid);
									Redis.deleteKeys(deleteKeys);
									var newKey = CategoryService.getRedisKey(kbGuid, value.version);
									// 增加新数据到redis中
									Redis.addListToSet(newKey, categoryList);	
								}
								callback(error, value);
							});
						});
					} else {
						// 如果redis中不存在，直接返回
						callback(null, value);
					}
				});
			});
		},CategoryService.TYPE);
	},
	getRedisKey: function (kbGuid, version) {
		//目录记录的版本号，是文档的最大版本号
		return 'category.' + kbGuid + '.' + version;
	},
	getDeleteKeys: function (kbGuid) {
		//目录记录的版本号，是文档的最大版本号
		return 'category.' + kbGuid + '*';
	},
	getCategoryPos: function (token, kbGuid, callback) {
		CommonService.getVersion(token, kbGuid, FOLDERS_POS, function (error, version, kapiUrl) {
			if (error) {
				callback(error, null);
			}
			var key = 'categorypos.' + kbGuid + '.' + version;
			Redis.exists(key, function(exist) {
				if (exist) {
					Redis.getString(key, function(positionStr) {
						callback(null, positionStr);
					});
				} else {
					var client = Wiz.getClient(kapiUrl)
						,	requestParams = params.getDefaultParams();
					requestParams.token = token;
					requestParams.kb_guid = kbGuid;
					requestParams.key = FOLDERS_POS;
					client.methodCall(Wiz.api.KB_GET_VALUE, [requestParams], function(error, value) {
						if (error) {
							callback(error, null);
						}
						if (value) {
							var deleteKeys = 'categorypos.' + kbGuid + '*';
							Redis.deleteKeys(deleteKeys);
							// 加入到缓存中
							Redis.setString(key, value.value_of_key);
							callback(null, value.value_of_key);	
						} else {
							callback({}, null);
						}
					});
				}
			});
		}, FOLDERS_POS);
	}
};


exports.getAll = CategoryService.getAll;
exports.getRoot = CategoryService.getRoot;
exports.getChild = CategoryService.getChild;
exports.create = CategoryService.create;
exports.rename = CategoryService.rename;
exports.delete = CategoryService.delete;