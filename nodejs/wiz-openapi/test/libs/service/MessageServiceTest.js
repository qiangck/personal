var params = {
	token: '7de560b2a27e2ca16b062eb7e943a8cbpa987f7n0ckv41',
  kb_guid: '060c5928-ba8d-11e1-a930-00237def97cc',
	attachment_guid: '5cdc2996-4135-6530-5c89-af6eb811a2fb',
  document_guid: '15cdc2996-4135-6530-5c89-af6eb811a2fb',
  new_name: 'test1.jpg',
},
	MessageService = require('../../../libs/service/MessageService');

function testSetReadStatus() {
	var params = {
		token: '7de560b2a27e2ca16b062eb7e943a8cbf0jp7xsrfapwqa',
		ids: '39'
	};
	MessageService.setReadStatus(params, function() {
		console.log(arguments);
	});
}

testSetReadStatus();