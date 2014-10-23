// 正式
// var HOST = 'as-internal.wiz.cn',
// PORT = 8800;
// 本机测试
// var HOST = 'as.wiz.cn',
// PORT = 80;
// 备机
// var HOST = '42.121.57.81',
// PORT = 8080;
// 联调
var HOST = '192.168.0.99',
    PORT = 80;
// 线上测试
// var HOST = '42.121.35.107'
// PORT = 80;
var config = {
  rpc: {
    host: HOST,
    port: PORT,
    path: '/wizas/xmlrpc'
  },
  // 默认值，如果是debug模式，会根据相应的kapi_url做修改
  httpServer: {
    host: HOST,
    port: PORT,
    path: '/wizkm/a/web/get?'
  },
  // 文件上传client配置
  documentPost: {
    host: HOST,
    port: PORT,
    path: '/wizks/k/upload/document',
    method: 'POST'
  },
  attachmentPost: {
    host: HOST,
    port: PORT,
    path: '/wizks/k/upload/attachment',
    method: 'POST'
  },
  // express实现的静态服务器的相关配置
  // 增加图片的地址信息
  httpService: {
    // 正式
    // host: 'http://www.wiz.cn',
    // 测试
    host: 'http://localhost',
    // host: 'http://42.121.133.131',
    port: 80,
    path: '/unzip'
  },

  // 默认的邀请码，可以取消
  inviteCode: 'c736da49',

  // 
  limit : {
    LOGIN_ERR_TIME: 5,
    REGISTER_ERR_TIME: 3,
    INTERVAL_MS: 1 * 60 * 1000
  },
  //httpResponse的一些固定配置
  response: {
    CONTENT_TYPE: 'application/json;charset=UTF-8'
  },
  // 缓存的目录配置
  cache: {
    // 测试，配置自己的测试目录
    ZIP_PATH: 'D:\\rechie\\jsWork\\wiz-openapi\\cache',
    UNZIP_PATH: 'D:\\rechie\\jsWork\\wiz-openapi\\public'
    // 正式环境的目录
    // ZIP_PATH: '/wiz/temp/openapi',
    // UNZIP_PATH: '/wiz/temp/openapi'
  },
  // 分块下载默认的最小块  512kb
  // 未实现
  data: {
    BLOCK_SIZE: 512 * 1024
  },
  // 附件下载的地址
  attachmentDownloadBaseUlr: '/api/attachment/data?',

  // 邮件服务的配置
  // 未使用
  mailService: {
    protocol: 'SMTP',
    mailer: {
      service: 'sina',
      host: 'smtp.sina.cn',
      auth: {
        user: '15937167121@sina.cn',
        pass: 'abc123abc123'
      }
    },
    // 邮件发送失败后，把错误的邮件写入
    cachePath: 'D:\\rechie\\jsWork\\wiz-openapi\\mail-error'
    // cachePath: '/wiz/temp/openapi/mail-error'
  }
}

module.exports = config;
