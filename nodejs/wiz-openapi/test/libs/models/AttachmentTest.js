var Attachment = require('../../../libs/models/Attachment');
var ValueUtil = require('../../../libs/util/ValueUtil')
  , url = require('url');


var token = '103e86e0-db45-4747-a825-157a7e0c057c',
	kbGuid = '325a4734-66d1-11e1-a992-00237def97cc',
	attGuid = '74e9ec15-3f62-40ca-b228-fcbbaba0d04d';


function testGetDownloadUrl() {
	console.log(kbGuid);
	console.log(attGuid);
	var cipherredUrl = Attachment.getDownloadUrl(kbGuid, token, attGuid);
	console.log(cipherredUrl);
	var paramsStr = cipherredUrl.replace('/api/attachment/data?', '');
	var params = ValueUtil.decipher(paramsStr);
	var urlStr = '?' + params;
  var urlObj = url.parse(urlStr, true);
  console.log(urlObj);
}

testGetDownloadUrl();