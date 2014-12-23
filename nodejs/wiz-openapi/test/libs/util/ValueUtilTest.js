var ValueUtil = require('../../../libs/util/ValueUtil');


console.log('test zip function');
// var filePath = 'D:\\rechie\\jsWork\\wiz-openapi(backup)',
var filePath = 'D:\\rechie\\jsWork\\wiz-openapi\\cache\\unzip\\f7796865-e5ff-11e1-ab4e-144b3c4ed02b\\0e11fa19-fcc3-4420-adec-3f1d6503e040.335',
		zipPath = 'D:\\rechie\\jsWork\\wiz-openapi\\cache\\unzip\\test.ziw';

// todo test类，顺序执行，报错提示具体方法名和错误信息，执行完结束

// 测试zip功能
function testZip() {
	ValueUtil.zip(filePath, zipPath, function() {
		console.log(arguments);
	});
}


// 测试readInnerDir功能
function testReadInnerDir() {
	console.log(ValueUtil.readInnerDir(filePath));	
}

function testSendMail() {
	var body = {crashe: '错误报告'};
  ValueUtil.sendMail('77397943@qq.com','Crash Report','Crash report:'+JSON.stringify(body), function() {
  	console.log('sendmail callback');
  	console.log(arguments);
  });
}	

function testZip() {
	var filePath = 'D:\\rechie\\jsWork\\wiz-openapi\\public\\unzip\\325a4734-66d1-11e1-a992-00237def97cc\\649f2db4-8320-9ef7-557a-13b54583beb0.temp'
	var zipName = 'D:\\rechie\\jsWork\\wiz-openapi\\cache\\zip\\325a4734-66d1-11e1-a992-00237def97cc\\document\\649f2db4-8320-9ef7-557a-13b54583beb0.ziw';
	ValueUtil.zip(filePath, zipName, function() {
		console.log(arguments);
	});
}

function testRenameFile() {
	var oldName = '捕获.asdf.png';
	var newName = ValueUtil.renameFile(oldName);
	console.log(newName);
}

function testCipher() {
	var uname = 'rechie1985@126.com',
			password = '561213';
	var cipherred = ValueUtil.cipher(uname, password);
	console.log('cipher');
	console.log(cipherred);
	var dec = ValueUtil.decipher('ba7ac2fddd93574c3629a8f774d18d043a251ea99b9c5ac7471d1d3c966d649696ca2a633c2b7a361609093b24e26075ffa70fe7e050d1b575bd7c4ba5e4336a');
	console.log('decipher');
	console.log(dec);
}

function testRmDiv() {
	var path = 'D:\\rechie\\jsWork\\wiz-openapi\\public\\unzip\\d04b2980-1add-4268-bea1-d33ed3f0209c\\f6f30f9f-3d6e-cd08-3928-f956bb8a08f6.temp';
	ValueUtil.rmDirForced(path, function() {
		console.log(arguments);
	});
}

testRmDiv();