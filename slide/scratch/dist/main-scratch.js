src/main-scratchvar gulp = require("gulp");
var amdOptimize = require("./require-gulp");
var concat = require("gulp-concat");
gulp.task("scripts", function () {

  return gulp.src("**/**/*.js")
    // Traces all modules and outputs them in the correct order.
    .pipe(amdOptimize("src/main-scratch"))
    .pipe(concat("main-scratch.js"))
    .pipe(gulp.dest("dist/"));

});
src/main-scratch// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-prefixer';

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

// plugin level function (dealing with files)
function gulpPrefixer(prefixText) {
  if (!prefixText) {
    throw new PluginError(PLUGIN_NAME, 'Missing prefix text!');
  }

  prefixText = new Buffer(prefixText); // allocate ahead of time

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
    for(var key in file) {
      // console.log('key: ' + key);
      // console.log('value: ' + file[key]);
    }
    // console.log(file.name)
    if (file.isNull()) {
       // do nothing if no contents
    }
    console.log(prefixText)
    if (file.isBuffer()) {
        file.contents = Buffer.concat([prefixText, file.contents]);
    }

    if (file.isStream()) {
        file.contents = file.contents.pipe(prefixStream(prefixText));
    }

    this.push(file);

    return cb();
  });

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = gulpPrefixer;
src/main-scratch/**
 * Created by rechie on 14-11-5.
 */
define(['../../Game'], function(Game) {
    var bgImg = new Image();
    bgImg.src = 'http://d.hiphotos.baidu.com/image/pic/item/503d269759ee3d6d16cc5dc241166d224f4adeb5.jpg';
    //实现集成
    function ScratchGame(id) {
        Game.apply(this, [id]);
        this.ctx.globalCompositeOperation = 'destination-out';
        console.log(this.canvasElem)
        this.canvasElem.style.backgroundImage = 'url(http://f.hiphotos.baidu.com/image/pic/item/8b13632762d0f7039c94beb40afa513d2697c5b7.jpg)';
        this.canvasElem.style.backgroundColor = 'transparent';
        this.canvasElem.style.backgroundSize = 'cover';
        this.canvasElem.style.backgroundPosition = 'center';
    };
    ScratchGame.prototype = new Game();
    ScratchGame.prototype.constructor = ScratchGame;

    /**
     * 重写Game.draw方法
     */
    ScratchGame.prototype.draw = function () {
        var self = this;
        self.ctx.fillStyle = '#333';
        self.ctx.fillRect(0, 0, self.canvasElem.width, self.canvasElem.height);
        self.ctx.drawImage( bgImg, 0, 0, self.canvasElem.width, self.canvasElem.height);
    };
    ScratchGame.prototype.scratch = function(sx, sy, ex, ey, r) {
        this.ctx.lineJoin = "round";
        //Draw a line with rounded end caps
        this.ctx.lineCap = "round";
        this.ctx.beginPath();
        ctx.lineWidth = r;
        sy = sy - 50;
        ey = ey - 50;
        this.ctx.moveTo(sx, sy);
        this.ctx.lineTo(ex, ey);
        this.ctx.stroke(); // Draw it
    };
    ScratchGame.prototype.scratchArc = function(x, y, r) {
        x -= this.canvasElem.offsetLeft;
        y -= this.canvasElem.offsetTop;
        with(this.ctx) {
            beginPath()
            arc(x, y, r/2, 0, Math.PI * 2);//绘制圆点
            fill();
        }
    };
    return ScratchGame;
});
src/main-scratch/**
 * Created by rechie on 14-11-5.
 */
define(['../../../core/Slide', '../../../util/MathUtil', '../../../util/ElemUtil', './ScratchGame'], function (Slide, MathUtil, ElemUtil, ScratchGame){
    var game;
    console.log(123)
    var startPoint = null;
    var endPoint = null;
    // 记录上次缓存的位置
    var lastPoint = null;
    var showTrack = true;
    var radius = 30;
    var canvasId = 'gameScreen';
    var canvasElem = document.getElementById(canvasId);
    var ctx = canvasElem.getContext('2d');
    var workId = 0;
    var touchNum = 0;
    window.ctx = ctx;
//    var baseUrl = 'http://192.168.1.101';
    var baseUrl = 'http://182.92.186.42';
    init();
    // 定义半径
    var slide = new Slide({
        elemQuery: '#gameScreen',
        slideBegin: function(touch){
            touchNum ++;
            try{
                lastPoint = startPoint = touch;
                console.log(game)
                game.record(touch, true, radius);
                game.scratchArc(startPoint.pageX, startPoint.pageY, radius);
            } catch(e) {
                console.log('begin error: ' + e.message);
            }
        },
        slideMove: function(touch) {
            touchNum ++;
            try{
                endPoint = touch;
                game.scratch(lastPoint.pageX, lastPoint.pageY, endPoint.pageX, endPoint.pageY, radius);
                game.record(touch);
            } catch(e) {
                console.log('move error: ' + e.message);
            }
            lastPoint = touch;
        },
        slideEnd: function(touch){
            try{
                startPoint = lastPoint = endPoint = null;
                if(touchNum > 120) {
                    document.getElementById(canvasId).style.display = 'none';
                }
                console.log(this)
                //game.drawArrow(0, 0, 0, 0);
                game.record();
                // 返回true 取消事件监听
                // return true;
            } catch(e) {
                console.log('end error: ' + e.message);
            }
        }
    });

    function init() {
        try{
            game = new ScratchGame(canvasId);
        } catch(e) {
            console.log('init error');
            console.log(e);
        }
    }



    //微信分享功能

// 微信分享代码
// 所有功能必须包含在 WeixinApi.ready 中进行
    WeixinApi.ready(function(Api){
        // 微信分享的数据
        var wxData = {
            "imgUrl": 'http://www.helloweba.com/demo/guaguaka/p_1.jpg',
            "link":window.location.href,
            "desc":'刮刮卡',
            "title":"刮刮卡"
        };
        // 分享的回调
        var wxCallbacks = {
            // 分享操作开始之前
            ready:function () {
            },
            cancel:function (resp) {
            },
            fail:function (resp) {
            },
            confirm:function (resp) {
            },
            all:function (resp) {
            }
        };
        Api.shareToFriend(wxData, wxCallbacks);
        Api.shareToTimeline(wxData, wxCallbacks);
        Api.shareToWeibo(wxData, wxCallbacks);
    });
    return {};
});