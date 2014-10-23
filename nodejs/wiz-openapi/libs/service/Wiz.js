var xmlrpc = require('xmlrpc')
  , config = require('../../conf/config')
  , url = require('url')
  , fs = require('fs')
  , http = require('http')
  , ValueUtil = require('../util/ValueUtil')
  , path = require('path')
  , querystring = require('querystring');

var _client = xmlrpc.createClient({
  'host': config.rpc.host,
  'port': config.rpc.port,
  'path': config.rpc.path
});

var wizapi = {
  GET_VERSION:'wiz.getVersion',

  // 账号相关接口
  LOGIN: 'accounts.clientLogin',
  LOGOUT: 'accounts.clientLogout',
  KEEPALIVE: 'accounts.keepAlive',
  REGISTER: 'accounts.createAccount',
  GROUP_KB_LIST: 'accounts.getGroupKbList',

  // 消息接口
  MESSAGE_GET: 'accounts.getMessages',
  MESSAGE_SEND_STATUS: ' accounts.setReadStatus',

  // kv服务接口
  ACCOUNT_GET_VALUE: 'accounts.getValue',
  ACCOUNT_SET_VALUE:'accounts.setValue',
  ACCOUNT_VALUE_VERSION:'accounts.getValueVersion',
  KB_GET_VALUE:'kb.getValue',
  KB_SET_VALUE:'kb.setValue',
  KB_VALUE_VERSION:'kb.getValueVersion',
  KB_INFO: 'wiz.getInfo',

  //目录相关接口
  CATEGORY_GET_ALL: 'category.getAll',
  CATEGORY_RENAME: 'category.rename',
  CATEGORY_DELETE: 'category.delete',

  //标签相关接口
  TAG_GET_ALL: 'tag.getList',
  TAG_CREATE: 'tag.create',
  TAG_DELETE: 'tag.delete',
  TAG_RENAME: 'tag.rename',

  // 文档相关接口
  DOCUMENT_GET_BY_CATEGORY: 'document.getSimpleListByCategory',
  DOCUMENT_GET_BY_TAG: 'document.getSimpleListByTag',
  DOCUMENT_GET_BY_NOTAG: 'document.getSimpListByNoTags',
  DOCUMENT_GET_BY_KEY: 'document.getSimpleListByKey',
  DOCUMENT_GET_DATA: 'document.getSimpleData',
  DOCUMENT_GET_INFO: 'document.getSimpleInfo',
  DOCUMENT_POST_DATA: 'document.postWebData', 
  DOCUMENT_RENAME: 'document.rename',
  DOCUMENT_LELETE_TAG: 'document.deleteTag',
  DOCUMENT_ADD_TAG: 'document.addTag',
  DOCUMENT_DELETE: 'document.delete',
  DOCUMENT_CHANGET_CATEGORY: 'document.move',
  DOCUMENT_COPY_TO_GROUP: 'document.shareGroup',
  DOCUMENT_COPY_TO_PRIVATE: 'document.copyFromGroup',
  
  // 附件接口
  ATTACHMENT_DELETE: 'attachment.delete',
  ATTACHMENT_RENAME: 'attachment.rename',
  ATTACHMENT_GET_BY_DOC: 'attachment.getSimpleListByDoc',

  // 分块上传下载接口
  BLOCK_DATA_DOWNLOAD: 'data.download',
  BLOCK_DATA_UPLOAD: 'data.upload',

  DownloadDeletedList: 'deleted.getList',
  UploadDeletedList: 'deleted.postList',
}; 


/**
 * 根据url动态创建client
 *  TODO 会不会创建过多，有影响? 
 * @param  {[string]} kapi_url [description]
 * @return {[type]}     [description]
 */
function getClient(kapi_url, ip) {
  var options = {
    'host': config.rpc.host,
    'port': config.rpc.port,
    'path': config.rpc.path
  }
  if (ip) {
    options.headers = {};
    options.headers['X-Client-IP'] = ip;
  }
  var urlObj = getUrlOptions(kapi_url);
  if (urlObj === null) {
    return xmlrpc.createClient(options);
  }
  var port = urlObj.port || 80;
  var client = xmlrpc.createClient({
    host: urlObj.hostname,
    port: port,
    path: urlObj.path
  });
  return client;
}

function getUrlOptions(kapi_url) {
  if (!kapi_url && typeof kapi_url !== 'string') {
    return null;
  }
  var urlObj = url.parse(kapi_url, true);
  return urlObj;
}

function download(options, cachedName, callback) {
  var req = http.request(options, function(res) {
    //createWriteStream(path, {flag: 'w', encoding: null, mode: 0666});  {……}为默认值可不写
    var writeStream = fs.createWriteStream(cachedName, {flag: 'w', encoding: null, mode: 0666});
    res.on('close',function (err) {
      if(err){
        err= '网络错误';
        console.log('下载数据出错,close 异常!');
      }
      callback('网络错误');
    });

    //res.pipe错误时，捕获并记录事件，防止进程结束
    writeStream.on('error', function(error) {
      console.log('writeStream.onerror');
      console.log(error);
      callback(error, null);
      // TODO Error
    });

    //关闭后调用回调函数
    writeStream.on('close', function() {
      callback();
    });
    //调用pipe写入流
    res.pipe(writeStream);  
  });

  req.on('error', function(e) {
    callback(e.message);
    console.log('problem with request: ' + e.message);
  });
  req.end();
}

function getDebugClient() {
  var client = xmlrpc.createClient({
    'host': config.rpc_huawei.host,
    'port': config.rpc_huawei.port,
    'path': config.rpc_huawei.path
  });
  return client;
}

function sendForm(filePath, params, callback) {
  // 获取md5值
  ValueUtil.getFileMd5(filePath, function (fileMd5) {
    fs.stat(filePath, function (error, stat) {
      if (error) {
        callback(error, null);
        return;
      }

      var fileSize = stat.size;
      var fileName = params.attachment_name;
      // 临时解决
      var type = (params.dispositionName === 'attachment_file') ? 'attachment' : 'document';
      params.data_md5 = fileMd5;
      //随机数，目的是防止上传文件中出现分隔符导致服务器无法正确识别文件起始位置
      var boundaryKey = Math.random().toString(16), 
        options = getUploadParams(params.options, type),
        // 文件信息体
        payload = '--' + boundaryKey + '\r\n'
      // use your file's mime type here, if known
      + 'Content-Type: application/octet-stream\r\n' 
      + 'Content-Disposition: form-data; name="' + params.dispositionName + '"; filename="' + fileName + '"\r\n\r\n';
      + 'Content-Transfer-Encoding: binary\r\n\r\n';
      // 把其他表单元素加入
      var paramsPayload =  getPayLoadStr(params, boundaryKey);
      var enddata  = '\r\n--' + boundaryKey + '--';
      var req = http.request(options, function(res) {
        var body = '';
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);
        if (res.statusCode !== 200) {
          callback({'faultCode': res.statusCode}, null);
          return;
        }

        res.on('data', function(chunk) {
          // 将data拼接到一起，在end的时候，进行反序列化操作
          body += chunk;
        });

        res.on('end', function(){
          try {
            console.log('body: ' + body);
            var bodyJson = JSON.parse(body.toString());
            if (bodyJson.return_code == 200) {
              callback(null, bodyJson);
            } else {
              callback({faultCode: bodyJson.return_code, faultString: bodyJson.return_message});
            }
          } catch (error) {
            console.log('sendForm Error: ' + body);
            callback(error);
          }
        });
      });
      req.setHeader('Content-Type', 'multipart/form-data; boundary='+boundaryKey+'');
      // 必须使用Buffer.byteLength，否则会造成Content-Length不正确，服务器使用nginx代理时，会出错
      // lsl 2012-12-31
      req.setHeader('Content-Length', Buffer.byteLength(payload)+Buffer.byteLength(enddata) + fileSize + Buffer.byteLength(paramsPayload));
      // 不能设置Tranfer-Encoding:chunked，nginx会拒绝并返回411错误
      req.setHeader('Connection','keep-alive');
      req.setHeader('Cache-Control','max-age=0');
      // 必须先写入其他参数
      req.write(paramsPayload);
      // 表单文件域后必须跟其内容，否则会读取其他域的值
      req.write(payload);


      var fileStream = fs.createReadStream(filePath, { bufferSize: 64 * 1024 });
      fileStream.pipe(req, {end: false});
      fileStream.on('data', function(data) {
        console.log('fileStream data');
      });
      fileStream.on('end', function() {
          // mark the end of the one and only part
        console.log('fileStream end');
        req.end(enddata); 
      });
      fileStream.on('error', function(error, value) {
        console.log('fileStream error');
        console.log(arguments);
        callback(error, value);
      });

      // TODO 查找具体原因
      // events.js:71
      // throw arguments[1]; // Unhandled 'error' event
      req.on('error', function(e) {
        console.log(params.options);
        console.log('problem with request: ' + e.message);
      });
    });
  });
}

function getUploadParams(options, type) {
  var urlObj = getUrlOptions(options);
  urlObj = urlObj || {};
  var port = urlObj.port || 80;
  var host = urlObj.hostname || config[type + 'Post'].host;
  var options = {
    host: host,
    port: port,
    path: config[type + 'Post'].path,
    method: config[type + 'Post'].method
  };
  return options;
}

// 应该提取到上一层来操作
function getPayLoadStr(httpParams, boundaryKey) {
  var payLoadStr = '';
  var splitter = '--' + boundaryKey + '\r\n';
  for (var key in httpParams) {
    if (key !== 'document_body' && key !== 'dispositionName' && key !== 'fileName' && key !== 'options') {
        var payLoadStr = payLoadStr + splitter
          + 'Content-Disposition: form-data; name="' + key + '"\r\n\r\n' + httpParams[key] + '\r\n';
    }

  }
  return payLoadStr;
}


/**
 * [sendRequest description]
 * @param  {object}   options     http options,see http://nodejs.org/api/http.html#http_http_request_options_callback
 * @param  {string}   requestBody 请求体
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
function sendRequest(options, requestBody, callback) {
  var req = http.request(options, function(res) {
    var body = '';
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      // 将data拼接到一起，在end的时候，进行反序列化操作
      body += chunk;
    });

    res.on('end', function(){
      try {
        var bodyJson = JSON.parse(body);
        callback(null, bodyJson);
      } catch (error) {
        console.log('Wiz.sendRequest Error: ' + error);
        callback(error);
      }
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    callback(e, null);
  });

  req.setHeader('Content-Length', requestBody.length);
  // 不能设置Tranfer-Encoding:chunked，nginx会拒绝并返回411错误
  req.setHeader('Connection','keep-alive');
  req.setHeader('Cache-Control','max-age=0');

  // write data to request body
  req.write(requestBody);
  req.end();
}

exports.sendRequest = sendRequest;
exports.download = download;
exports.getDebugClient = getDebugClient;
exports.getClient = getClient;
exports.client = _client;
exports.api = wizapi;
exports.sendForm = sendForm;
exports.getUrlOptions = getUrlOptions;