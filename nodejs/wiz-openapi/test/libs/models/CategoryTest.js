var Category = require('../../../libs/models/Category');

var testCategories = 'Aaaaaaaaa*/My Drafts/*/goodweb/*/My Notes/*';

function testParseCategories() {
	var list = Category.parseDate(testCategories);
	console.log(list);
}

testParseCategories();