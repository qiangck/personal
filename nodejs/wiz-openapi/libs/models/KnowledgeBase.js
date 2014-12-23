var redis = require('../service/Redis');

function filter(kb) {
	if (!kb) {
		return;
	}
	var kapi_url = kb.kapi_url
	redis.setString(getKey(kb.kb_guid), kapi_url);
	//不做delete操作
	kb.kapi_url = null;
};

function getKey(kbGuid) {
	return kbGuid + 'kapi_url';
}

function getKapiUrl(kbGuid, callback) {
	var key = getKey(kbGuid);
	redis.getString(key, callback);
}

exports.getKapiUrl = getKapiUrl;
exports.filter = filter;