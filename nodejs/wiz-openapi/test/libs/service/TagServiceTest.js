var TagService = require('../../../libs/service/TagService');
var token = '7de560b2a27e2ca16b062eb7e943a8cbouylb8rcnstw5t';
var kbGuid = '060c5928-ba8d-11e1-a930-00237def97cc';
var tagGuid = '3af035e1-37c6-4a0f-8a5a-6e713cf7b030';


function testDelete() {
	var params = {
		token: token,
		kb_guid: kbGuid,
		tag_guid: tagGuid
	}
	TagService.delete(params, function() {
		console.log('TagService.delete');
		console.log(arguments);
	});	
}
function testRename() {
	var params = {
		token: token,
		kb_guid: kbGuid,
		tag_guid: tagGuid,
		new_name: '新名字哦'
	};
	TagService.rename(params, function() {
		console.log('TagService.rename');
		console.log(arguments);
	});
}


testRename();