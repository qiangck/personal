var ValueUtil = require('../util/ValueUtil'),
		config = require('../../conf/config'),
		url = require('url'),
		redis = require('../service/Redis');

var ATT_PREFIX = 'attachment.';

function Attachment() {}

/**
 * 对获取到的list进行处理
 * @param  {[type]} attList [description]
 * @param  {[type]} kbGuid  [description]
 * @param  {[type]} token   [description]
 * @return {[type]}         [description]
 */
Attachment.parseList = function(attList, kbGuid, token) {
	if (!attList || attList.length < 1 || Array.isArray(attList) !== true) {
		return attList;
	}
	attList.forEach(function(attItem, index) {
		var downloadUrl = Attachment.getDownloadUrl(kbGuid, token, attItem.attachment_guid);
		attItem.download_url = downloadUrl;
		// 缓存attGuid对应的name
		redis.setString(getRedisKey(attItem.attachment_guid), attItem.attachment_name);
		delete attItem.attachment_guid;
	});

	return attList;
};


Attachment.getNameByGuid = function (attGuid, callback) {
	redis.getString(getRedisKey(attGuid), callback);
};

/**
 * 获取加密后的下载地址
 * @param  {[type]} kbGuid  [description]
 * @param  {[type]} token   [description]
 * @param  {[type]} attGuid [description]
 * @return {[type]}         [description]
 */
Attachment.getDownloadUrl = function (kbGuid, token, attGuid) {
	var baseUrl = config.attachmentDownloadBaseUlr,
			urlParamsStr = 'kb_guid=' + kbGuid + '&attachment_guid=' + attGuid + '&token=' + token;

	var cipherredStr = ValueUtil.cipher(urlParamsStr);
	return baseUrl + cipherredStr;
};

/**
 * 解密downloadUrl后的参数
 * @param  {[type]} cipherStr [description]
 * @return {[type]}           [description]
 */
Attachment.revertCipherredToParams = function(cipherStr) {
	var params = null;
	try {
		// 解密
		var decipherStr = ValueUtil.decipher(cipherStr);
		var params = url.parse('?' + decipherStr, true).query;
	} catch (error) {
		console.log('Attachment.revertCipherredToParams Error: ' + error);
		console.log('cipherStr: ' + cipherStr);
	}
	return params;
};

function getRedisKey(attGuid) {
	return  ATT_PREFIX + attGuid;
}

module.exports = Attachment;