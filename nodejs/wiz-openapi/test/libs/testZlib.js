var zlib = require('zlib'),
		fs = require('fs'),
		buffer = require('buffer');

function testZlib() {
	fs.readFile('D:\\rechie\\jsWork\\wiz-openapi\\cache\\zip\\325a4734-66d1-11e1-a992-00237def97cc\\attachment\\ziw.e7917ce1-27b3-4e9f-936b-cc77c29d3c21.0.005270982161164284', function(error, buf) {
		
		// console.log(typeof buf);
		var length = buf.length;
		var bufferStr;
		var buffersStr = '';
		for (var i=30; i<85; i++) {
			bufStr = '00' + buf[i].toString(16);
			bufStr = bufStr.substr(bufStr.length - 2);
			buffersStr = buffersStr + bufStr + ' ';
			// console.log(bufStr);
			// console.log(buffer[i].toString(16));
			// console.log(typeof buffer[i]);
			// console.log(buffer.readUInt8(i));

		}
		var bufStr2, buffersStr2 = '';
		for (var i=140445; i<140500; i++) {
			bufStr2 = '00' + buf[i].toString(16);
			bufStr2 = bufStr2.substr(bufStr2.length - 2);
			buffersStr2 = buffersStr2 + bufStr2 + ' ';
		}
		// console.log('filename buffer from zip');
		// console.log(buffersStr);
		// console.log('central filename');
		// console.log(buffersStr2);

		// console.log(buf.readUInt8(140445));
		// console.log(buf.readUInt8(30));
		// console.log(buffersStr);
		// console.log(buffer);
		// zip Archive zip : header :504b0304  
		// Extended local header start 504b0708 
		// Central directory start:  504b0102
		// End of central directory record start 504b0506
		var list = buffersStr.split('504b0102');
		// console.log(list[0].length/2 + 46);
		// console.log(list[1].length);
		// console.log(list.length);
		// console.log('ziw.e7917ce1-27b3-4e9f-936b-cc77c29d3c21.0.005270982161164284'.length);
		zlib.deflate(buf, function(error, value) {
			console.log('deflate');
			console.log(arguments);
			console.log(value.length);
			fs.wriet
			zlib.inflate(value, function(err, inValue) {
				console.log('inflate');
				console.log(arguments);
				var length = inValue.length, i=0;
				console.log(length);
				for ( ;i<length; i++) {
					// console.log(inValue[i]);
				}
			})
		});
		// zlib.inflate(zlib.deflate(buf)).toString('utf8')
		zlib.inflate(buf, function() {
			console.log('utf8');
			console.log(arguments);
		});
	});
	// zlib.unzip
}
// testZlib();

function test() {
	fs.readdir('D:\\test\\e7917ce1-27b3-4e9f-936b-cc77c29d3c21', function(error, value) {
		// console.log(arguments);
		var fileName = value[0];
		var buf = new Buffer(fileName, 'utf-8');
		// console.log('filename buffer length');
		// console.log(buf);
		// console.log(buf.length);
		var i=0, length = buf.length;
		var bufStr, buffersStr = '';
		for ( ;i<length; i++) {
			bufStr = '00' + buf[i].toString(16);
			bufStr = bufStr.substr(bufStr.length - 2);
			// console.log(bufStr);
			buffersStr = buffersStr + bufStr + ' ';
		}
		// console.log('fileName buffer');
		// console.log(buffersStr);
		// console.log(value[0].length);
	});
}
// test();

function test1() {
	var input = new Buffer('lorem ipsum dolor sit amet', 'utf8');

 // What's 'input'?

 // Compress it

// Compress it and convert to utf8 string, just for the heck of it
 zlib.deflate(input, function() {
 	console.log('deflate');
 	console.log(arguments);
 		console.log(arguments[1].toString());
 	console.log(arguments[1].length);
 });

 // Compress, then uncompress (get back what we started with)
 zlib.deflate(input, function(error, value) {
 	console.log('deflate 1');
 	console.log(arguments);
 		console.log(arguments[1].toString());
 	console.log(arguments[1].length);
 	zlib.inflate(value, function() {
 		console.log('deflate & inflate');
 		console.log(arguments);
 		console.log(arguments[1].toString());
 		console.log(arguments[1].length);
 	});
 });

 // Again, and convert back to our initial string
 // zlib.inflate(zlib.deflate(input));
}
test1();