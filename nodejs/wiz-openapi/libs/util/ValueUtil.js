var fs = require('fs')
  , os = require('os')
  , child = require('child_process')
  , exec = child.exec
  , config = require('../../conf/config')
  , path = require('path')
  , crypto = require('crypto')
  , zip = require("node-native-zip")
  , nodemailer = require('nodemailer')
  , crypto = require('crypto');

var WIN_FILE_SEPARATOR = '\\',
  UNIX_FILE_SEPARATOR = '/',
  FILE_SEPARATOR = (os.platform().toLowerCase().indexOf('win') > -1) ? WIN_FILE_SEPARATOR : UNIX_FILE_SEPARATOR; //'/';

var ValueUtil = {
  getFileSeparator: function() {
    return FILE_SEPARATOR;
  },
  /**
   * 同步创建目录
   * @param  {string}   url      目录路径。以/aa/bb开始表示在根目录下创建，aa/bb表示在当前目录下创建子目录
   * @param  {number}   mode     目录权限
   * @param  {Function} callback 回调函数
   * @return {[type]}            [description]
   */
  mkdirSync: function(url, mode, callback){
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
    function inner(cur){
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

  rmDirForced: function(directories, callback) {
    if(typeof directories === 'string') {
      directories = [directories];
    }
    var args = directories;
    args.unshift('-rf');
    child.execFile('rm', args, {env:process.env}, function(err, stdout, stderr) {
      callback.apply(this, arguments);
    });
  },
  /**
   * 判断是否是GUID
   * 格式如下：2a312914-e4f4-11e1-b390-00237def97cc
   */
  isGuid: function(value) {

    if(value == null || value.length !== 36){
      return false;
    }

    for(var i = 0; i < 36; i++ ){
      if( i === 8 || i === 13 || i === 18 || i === 23){
        if (value.charAt(i) !== '-') {
          return false;
        }
        continue;
      }
      var intValue = parseInt(value.charAt(i),16);
      if(isNaN(intValue) || intValue < 0 || intValue > 15){
        return false;
      }
    }

    return true;
  },
 

  /**
   * unzip the file to path
   * callback(err,stdout);
   */
  unzip: function(zipfile, path, callback) {
    var unzipCommand = 'unzip ' + zipfile + ' -d ' + path;
    var child = exec(unzipCommand,{maxBuffer: 500 * 1024},function(err, stdout, stderr){
      // console.log('解压文件,命令为:'+ unzipCommand);
      if(err !== null){
        console.log('解压出错:' + err);
        //失败后，直接删除ziw文件和解压目录，重新到服务器下载
        fs.unlink(zipfile,function (err) {
          console.log('删除解压失败的文件:' + zipfile + (err ? err :''));
        });
        fs.rmdir(path,function (err) {
          console.log('删除解压失败的目录:' + path + (err ? err :''));
        });
      } else {
        // 由于在macos客户端上创建的文档，到openapi这台服务器上解压缩之后
        // 权限会变成000，导致无法读取，所以增加修改权限的这步操作
        // 
        // lsl 2012-12-27
        var chmodCmd = 'chmod -R 777 ' + path;
        exec(chmodCmd, function(error, stdout, stderr) {
          if (error) {
            console.log('unzip && chmod path: ' + path + ' error: ' + error);
          }
          // console.log('end chmod file: ' + path);
        });
      }
      callback(err,stdout);
    });
  },

  readInnerDir: function(filePath) {
    // TODO check params
    function inner(path, parentPath) {
      var fileList = fs.readdirSync(path),
          innerList = [],
          parentPath = parentPath || '';
      fileList.forEach(function (file, index) {
        var stats = fs.lstatSync(path + FILE_SEPARATOR + file);
        if (stats.isFile() === false) {
          innerList = innerList.concat(inner(path + FILE_SEPARATOR + file, parentPath + file + FILE_SEPARATOR));
        } else {
          innerList.push({name: parentPath + file, path: path + FILE_SEPARATOR + file});
        }
      });
        
      return innerList;
    }

    return inner(filePath);
  },

  // 压缩文件，filePath是存放临时文件的目录，zipPath为压缩后的文件路径
  zipByModule: function(filePath, zipPath, callback) {
    var archive = new zip();
    // 获取需要的列表
    var fileList = ValueUtil.readInnerDir(filePath);

    archive.addFiles(fileList, function (err) {
      if (err) {
        console.log("err while adding files", err);
        callback(err, null);
        return ;
      }
      var buff = archive.toBuffer();
      fs.writeFile(zipPath, buff, function () {
        callback();
      });
    });
  },

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

  /**
   * ziw包完整路径名
   * @param  {string} kbGuid   所属kb的guid
   * @param  {string} itemGuid 相应的对象guid
   * @param  {string} type     document---文档，attachment---附件
   * @param  {number} version  最大版本号
   * @return {string}          包括路径的完整文件名
   */		
  getCachedPath: function(kbGuid, type) {
  	var filePath = config.cache.ZIP_PATH + FILE_SEPARATOR + 'zip' + FILE_SEPARATOR + kbGuid + FILE_SEPARATOR + type;
  	return filePath;
  },
  /**
   * 获取已经解压缩的文件路径
   * @param  {string} kbGuid   所属kb的guid
   * @param  {string} itemGuid 相应对象的guid
   * @param  {string} type     document---文档；attachment---附件
   * @param  {number} version  最大版本号
   * @return {string}          文件路径
   */
  getUnzipPath: function(kbGuid, itemGuid, version) {
  	var filePath = config.cache.UNZIP_PATH + FILE_SEPARATOR +  'unzip' + FILE_SEPARATOR + kbGuid + FILE_SEPARATOR + itemGuid + '.' + version;
  	return filePath;
  },

  /**
   * 静态服务器的文件地址，临时
   * @param  {[type]} kbGuid   [description]
   * @param  {[type]} itemGuid [description]
   * @param  {[type]} version  [description]
   * @return {[type]}          [description]
   */
  getHttpServicePath: function(kbGuid, itemGuid, version) {
    var filePath = config.httpService.host + config.httpService.path + '/' + kbGuid + '/' + itemGuid + '.' + version;
    return filePath;
  },

  // 获取文件MD5
  getFileMd5: function(filename, callback) {

    var md5sum = crypto.createHash('md5');

    var s = fs.ReadStream(filename);
    s.on('data', function(d) {
      md5sum.update(d);
    });

    s.on('end', function() {
      var fileMd5 = md5sum.digest('hex');
      callback(fileMd5);
    });
  },
  /**
   * 
   * 转发邮件功能
   * @param  {string} mailto  收件人
   * @param  {string} subject 邮件主题
   * @param  {string} content 邮件内容
   * @param  {Function} callback 回调函数
   * @return {[type]}            [description]
   */
  sendMail: function(mailto, subject, content, callback) {
    var transport = nodemailer.createTransport(config.mailService.protocol, config.mailService.mailer);

    var mailOptions = {
      from: '15937167121@sina.cn',
      to: mailto,
      subject: subject,
      text: content
    }
    transport.sendMail(mailOptions,function (error,response) {
      if(error){
        callback(error, null);
      }else{
        callback(null, 'sendMail success');
      }
    });
  },
  renameFile: function(fileName){
    var list = fileName.split('.');
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4() + '.' + list[list.length-1]);
  },
  // 暂时未使用
  // 加密用户名密码
  // 用来存放在cookie中
  cipher: function (originStr) {
    var cipher = crypto.createCipher('aes-256-cbc','WizNote2013');
    var text = originStr;
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
  },
  // 解密
  decipher: function(cipherredStr) {
    var decipher = crypto.createDecipher('aes-256-cbc','WizNote2013');
    var dec = decipher.update(cipherredStr,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  },
  /**
   * 获取html字符串中img的所有src列表
   * @param  {string} htmlStr 传入的html字符串
   * @return {Array}         image src list
   */
  getImgSrcListFromHtmlStr: function(htmlStr) {
    var re = /<img([^>]+?)>/ig;
    var imgSrcList = [];
    var tempImg="";
    var re2=/src\s*=\s*(["'])([^"']+)\1/i
    while(re.exec(htmlStr)) {
      tempImg=RegExp.$1;
      re2.test(tempImg);
      imgSrcList.push((re2.test(tempImg)) ? RegExp.$2 : "");
    }
    return imgSrcList;
  }
};

module.exports = ValueUtil;