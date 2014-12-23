var account = require('./account'),
    kb = require('./kb'),
    biz = require('./biz');

// 静态变量
var API_BASE = '/api',
    CATEGORY_BASE = API_BASE + '/category',
    TAG_BASE = API_BASE + '/tag',
    BIZ_BASE = API_BASE + '/biz',
    DOCUMENT_BASE = API_BASE + '/document',
    ATTACHMENT_BASE =API_BASE + '/attachment';

//配置的路由规则
//url为匹配的uri
//action---对应的http action
//callback---执行的函数
var routesRules = {

	//用户相关
	LOGIN: {
		url: API_BASE + '/login',
		action: 'post',
		callback: account.login
	},
  LOGOUT: {
  	url: API_BASE + '/logout',
  	action: 'post',
    callback: account.logout
 	},
	REGISTER: {
		url: API_BASE + '/register',
		action: 'post',
		callback: account.register
	},
  KEEPALIVE: {
  	url: API_BASE + '/keepalive',
  	action: 'post',
    callback: account.keepAlive
  },
	GET_USER_INFO: {
		url: API_BASE + '/user/info',
		action: 'get',
		callback: account.getUserInfo
	},
	GET_GROUP_LIST: {
		url: API_BASE + '/user/grouplist',
		action: 'get',
		callback: account.getGroupKbList
	},
  GET_KB_INFO: {
    url: API_BASE + '/kb/info',
    action: 'get',
    callback: account.getKbInfo
  },

  // 消息接口
  GET_MESSAGE: {
    url: API_BASE + '/messages/list',
    action: 'get',
    callback: biz.getMessageList
  },
  SET_MESSAGE_STATUS: {
    url: API_BASE + '/messages/status',
    action: 'post',
    callback: biz.setMessageStatus
  },

  // biz相关
  GET_BIZ_USER: {
    url: BIZ_BASE + '/user/list',
    action: 'get',
    callback: biz.getUserList
  },

  //目录相关接口
  CATEGORY_GET_ALL: {
  	url: CATEGORY_BASE + '/all',
  	action: 'get',
  	callback: kb.getAllCategory
  },
  CATEGORY_GET_ROOT: {
  	url: CATEGORY_BASE + '/root',
  	action: 'get',
  	callback: kb.getRootCategory
  },
  CATEGORY_GET_CHILD: {
  	url: CATEGORY_BASE + '/child',
  	action: 'get',
  	callback: kb.getChildCategory
  },
  CATEGORY_RENAME: {
    url: CATEGORY_BASE + '/item',
    action: 'put',
    callback: kb.renameCategory
  },
  CATEGORY_CREATE: {
    url: CATEGORY_BASE + '/item',
    action: 'post',
    callback: kb.createCategory
  },
  CATEGORY_DELETE: {
  	url: CATEGORY_BASE + '/item',
  	action: 'delete',
    callback: kb.deleteCategory
  },

  //标签相关接口
  TAG_GET_ALL: {
  	url: TAG_BASE + '/all',
  	action: 'get',
  	callback: kb.getAllTag
  },
  TAG_GET_ROOT: {
  	url: TAG_BASE + '/root',
  	action: 'get',
  	callback: kb.getRootTag
  },
  TAG_GET_CHILD: {
  	url: TAG_BASE + '/child',
  	action: 'get',
  	callback: kb.getChildTag
  },
  TAG_CREATE: {
  	url: TAG_BASE + '/item',
  	action: 'post',
    callback: kb.createTag
  },
  TAG_DELETE: {
  	url: TAG_BASE + '/item',
  	action: 'delete',
    callback: kb.deleteTag
  },
  TAG_RENAME: {
  	url: TAG_BASE + '/item',
  	action: 'put',
    callback: kb.renameTag
  },

  // 文档相关接口
  DOCUMENT_LIST: {
  	url: DOCUMENT_BASE + '/list',
  	action: 'get',
    callback: kb.getDocumentList
  },
  // 被安全联盟屏蔽做的临时修改
  DOCUMENT_GET_DATA: {
  	url: DOCUMENT_BASE + '/data',	
  	action: 'get',
    callback: kb.getDocumentBody
  },
  DOCUMENT_GET_INFO: {
  	url: DOCUMENT_BASE + '/info',
  	action: 'get',
    callback: kb.getDetailInfo
  },	
  DOCUMENT_GET_BODY: {
    url: DOCUMENT_BASE + '/body',
    action: 'get',
    callback: kb.getDocumentBody
  },
  DOCUMENT_CREATE_DATA: {
  	url: DOCUMENT_BASE + '/data',
  	action: 'post',
    callback: kb.createDocument
  },
  // 保存文档调用方法，必须要传入document_guid
  DOCUMENT_UPDATE_DATA: {
    url: DOCUMENT_BASE + '/data',
    action: 'put',
    callback: kb.updateDocument
  },
  DOCUMENT_RENAME: {
  	url: DOCUMENT_BASE + '/rename',
  	action: 'put'
  },
  DOCUMENT_LELETE_TAG: {
  	url: DOCUMENT_BASE + '/tag',
  	action: 'delete'
  },
  DOCUMENT_ADD_TAG: {
  	url: DOCUMENT_BASE + '/tag',
  	action: 'post'
  },
  DOCUMENT_DELETE: {
  	url: DOCUMENT_BASE + '/data',
  	action: 'delete',
    callback: kb.deleteDocument
  },
  DOCUMENT_CHANGET_CATEGORY: {
  	url: DOCUMENT_BASE + '/move',
  	action: 'put'
  },
  DOCUMENT_COPY_TO_GROUP: {
  	url: DOCUMENT_BASE + '/share',
  	action: 'post'
  },
  DOCUMENT_COPY_TO_PRIVATE: {
  	url: DOCUMENT_BASE + '/copy',
  	action: 'post'
  },
  DOCUMENT_INSERT_IMAGE: {
    url: DOCUMENT_BASE + '/images',
    action: 'post',
    callback: kb.insertImageToDocument
  },
  DOCUMENT_GET_ABSTRACT: {
    url: DOCUMENT_BASE + '/abstract',
    action: 'get',
    callback: kb.getDocAbstract
  },
  
  // 附件接口
  ATTACHMENT_DELETE: {
  	url: ATTACHMENT_BASE + '/data',
  	action: 'delete',
    callback: kb.deleteAttachment
  },
  ATTACHMENT_RENAME: {
  	url: ATTACHMENT_BASE + '/data',
  	action: 'put'
  },
  ATTACHMENT_GET: {
    url : ATTACHMENT_BASE + '/data',
    action: 'get',
    callback: kb.downloadAttachment
  },
  ATTACHMENT_GETLIST_BY_DOC: {
  	url: ATTACHMENT_BASE + '/list',
  	action: 'get',
    callback: kb.getAttachmentList
  },
  ATTACHMENT_CREATE: {
    url: ATTACHMENT_BASE + '/data',
    action: 'post',
    callback: kb.createAttachment
  }
}

function initialize(app) {
	var rule = null;
	console.log('routes initialize start: ');
	for (key in routesRules) {
		rule = routesRules[key];
		if (rule.action && rule.url && rule.callback) {
			console.log('Url: ' + rule.url + '  &&  Action: ' + rule.action);
			app[rule.action](rule.url, rule.callback);
		}
	}
}

exports.init = initialize;