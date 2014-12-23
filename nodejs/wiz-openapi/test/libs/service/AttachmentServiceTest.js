var params = {
	token: '7de560b2a27e2ca16b062eb7e943a8cbpa987f7n0ckv41',
  kb_guid: '060c5928-ba8d-11e1-a930-00237def97cc',
	attachment_guid: '5cdc2996-4135-6530-5c89-af6eb811a2fb',
  document_guid: '15cdc2996-4135-6530-5c89-af6eb811a2fb',
  new_name: 'test1.jpg',
  cipherredStr: 'c00cd1ce62ed1a9fd0847fadeaf80d0d3e1337e33fec6d0913c3c5814de2e711ca6931fa3724c9c6809e5182a393664b96e335778d49cf2ddae65a8a5084de763a8ee607ba58dd3c27d674b54adf4e4ee01f0387e37bb5ffb84a077cc93f53bf673ba5215ffdc728dee42436de813a9c8bf38ccda49609c60c9e300d86ab8aa8bdf7e271c439a392878507c10e914351c9ce415b8e83c1b7485abe7e2d687b57'
},
	AttachmentService = require('../../../libs/service/AttachmentService');

function testGetList() {
	AttachmentService.getList(params, function () {
		console.log(arguments);
	});
}

function testDownload() {
	AttachmentService.download(params, function() {
		console.log(arguments);
	});
}

function testDelete() {
	AttachmentService.delete(params, function(error, value) {
		console.log(arguments);
		if (error) {
			console.log(error.faultCode);
			console.log(error.faultString);
		}
	});
}

function testRename() {
	AttachmentService.rename(params, function(error, value) {
		console.log(arguments);
	});
}

testDelete();
