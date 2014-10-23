var redis = require('../../../libs/service/Redis');


function testGetKeys() {
	var key = '*';
	redis.deleteKeys(key);
}
var count = 1000;
function setKeys() {
	for (var i=0; i<count; i++) {
		redis.setString(i, i);
	}
	console.log('setKeys');
}

function deleteKeys() {
	for(var i=0; i<count; i++) {
		redis.deleteKey(i);
	}
	console.log('deleteKeys');
}

setKeys();
setTimeout(function(){
	deleteKeys();
}, 5000);

