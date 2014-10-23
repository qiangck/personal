
/**
 * Module dependencies.
 */

var express = require('express');
var routesRoles = require('./routes/routesRoles');
var http = require('http');
var path = require('path');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');//同时支持ejs
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('sctalk admin manager'));
app.use(express.session({maxAge:1 * 60 * 1000}));
app.use(function(req, res, next){
    var err = req.session.error;
    var user = req.session.user;
    delete req.session.error;
    res.locals.error = '';
    if (err) {
        res.locals.error =  {message:err};
    }
    if (user) {
    	res.locals.user = user;
    }
    next();
});
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// 初始化路由规则
routesRoles.init(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
