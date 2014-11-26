var fs = require('fs')
  , os = require('os');
var WIN_FILE_SEPARATOR = '\\',
  UNIX_FILE_SEPARATOR = '/',
  FILE_SEPARATOR = (os.platform().toLowerCase().indexOf('win') > -1) ? WIN_FILE_SEPARATOR : UNIX_FILE_SEPARATOR; //'/';
var exec = require('child_process').exec,
    child;

var Util = {
	// 合并json对象
	merger: function(obj1, obj2) {
		for(var key in obj2) {
			if (obj2.hasOwnProperty(key)) {
				obj1[key] = obj2[key];
			}
		}
		return obj1;
	},
	getCurDateStr: function() {
        // 时间放在半个月前
		var date = new Date(new Date() - 1000 * 60 * 60 * 24 * 15)
		var month = (date.getMonth() < 10) ? ('0' + (date.getMonth()+1)) : (date.getMonth()+1);
		var dateStr = date.getFullYear() + '-' + month;
		return dateStr;
	},
    /**
     * 同步创建目录
     * @param  {string}   url      目录路径。以/aa/bb开始表示在根目录下创建，aa/bb表示在当前目录下创建子目录
     * @param  {number}   mode     目录权限
     * @param  {Function} callback 回调函数
     * @return {[type]}            [description]
     */
    mkdirSync: function(url, mode, callback){
        FILE_SEPARATOR = '/'
        var arr = url.split(FILE_SEPARATOR);
        mode = mode || 0755;
        callback = callback || function(){};
        // if (arr[0] ==='') {//处理/aaa
        //   arr.shift();
        // }
        if (arr[0] === '.'){//处理 ./aaa
            arr.shift();
        }
        if (arr[0] === '..'){//处理 ../ddd/d
            arr.splice(0,2,arr[0]+FILE_SEPARATOR+arr[1])
        }
        console.log(FILE_SEPARATOR)
        function inner(cur){
            console.log(cur)
            if(cur !== '' && !fs.existsSync(cur)){//不存在就创建一个
                try {
                    fs.mkdirSync(cur, mode)
                } catch (err) {
                    console.log('fs.mkdirSync Error: ' + err);
                }
            }
            if(arr.length){
                inner(cur + FILE_SEPARATOR +arr.shift());
            }else{
                callback();
            }
        }
        arr.length && inner(arr.shift());
    },
    getSuffix: function(filename) {
	var suffix = '';
	if(typeof filename == 'string') {
	    var index = filename.lastIndexOf('.');
	    suffix = filename.substring(index);
	}
	return suffix;
    },
    /**
     * 压缩文件，调用zip命令
     * @param filePath
     * @param zipFile
     * @param callback
     */
    zip: function(filePath, zipFile, callback) {
        // 空格不能取消
        var zipCmd = 'cd ' + filePath + '&&' + 'zip -r ' + zipFile + ' ./';
        exec(zipCmd, {maxBuffer: 500 * 1024}, function(err, stdout, stderr){
            // console.log('压缩文件,命令为:'+ zipCmd);
            if(err !== null){
                console.log('压缩出错:' + err);
                fs.rmdir(zipFile,function (err) {
                    console.log('删除压缩失败的压缩包:' + zipFile + (err ? err :''));
                });
            }
            callback(err,stdout);
        });
    },
    copyFile: function(originPath, targetPath) {
        child = exec('cp -R ' + originPath + ' ' + targetPath,
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
    },
    recognizeCharset: function(buffer) {
        var charset = 'utf-8'
        if(buffer[0]==255 && buffer[1]==254){
            charset = 'utf-16le';
        }else if(buffer[0] == 254 && buffer[1] == 255){
            charset = 'utf-16be';
        }else if(buffer[0]== 0xEF && buffer[1]== 0xBB && buffer[2]== 0xBF){
            charset = 'utf-8'
        }
        // console.log('识别编码:<'+ buffer[0] + ','+buffer[1] + ','+ buffer[2]+'>,编码为:'+ charset);

        return charset;
    }

};

module.exports = Util;