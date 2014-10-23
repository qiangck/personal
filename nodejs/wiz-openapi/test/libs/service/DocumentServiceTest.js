var params = {
	token: '7de560b2a27e2ca16b062eb7e943a8cbpa987f7n0ckv41',
  kb_guid: '060c5928-ba8d-11e1-a930-00237def97cc',
	attachment_guid: '5cdc2996-4135-6530-5c89-af6eb811a2fb',
  document_guid: '15cdc2996-4135-6530-5c89-af6eb811a2fb',
  new_name: 'test1.jpg',
},
	DocumentService = require('../../../libs/service/DocumentService');

function testGetData() {
	var params = {
		token: '7de560b2a27e2ca16b062eb7e943a8cbpdm61fjg8vd5c4',
		kb_guid: 'f2cf381a-95e8-4bb6-9bfc-bbfa69c22a77',
		document_guid: '6abc0f5a-1941-4d0e-aea4-e079780894fe'
	};
	DocumentService.getData(params, function() {
		console.log(arguments);
	});
}

function testGetAbstract() {
	var params = {
		token: '2c0ead21e855bc59ad269a92085117a70wtopxv65i7jsh',
		type: '3',
		kb_guid: '541e389b-ef82-41e0-8612-99a0ae0d5a7a',
		document_guids: 'e66ae4c7-1d90-4b5f-8370-b14700173935'
	}
	DocumentService.getAbstract(params, function(){
		console.log(arguments);
	});
}

testGetAbstract();