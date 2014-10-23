var params = {
	token: '7de560b2a27e2ca16b062eb7e943a8cbpgkr2lvpausvar',
  kb_guid: '060c5928-ba8d-11e1-a930-00237def97cc',
  old_category_path: '/测试新建2/',
  new_title: '测试目录改名2'
},
  CategoryService = require('../../../libs/service/CategoryService');

function testRename() {
	CategoryService.rename(params, function() {
		console.log(arguments);
	});
}

function testDelete() {
	CategoryService.delete(params, function() {
		console.log(arguments);
	});
}
 
testDelete();