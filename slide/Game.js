/**
 * Created by rechie on 14-8-21.
 */
define( function() {
    var bgImg ;
    var arrowImg = new Image();
    arrowImg.src = 'images/arrow.png';
    var Game = function(id){
        this.canvasElem = document.getElementById('gameScreen');
        this.ctx = this.canvasElem.getContext('2d');
        this.init();
    };
    Game.prototype.init = function() {
        this.resize();
        this.draw();
    };
    Game.prototype.clear = function(){
      this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
    };
    Game.prototype.draw = function () {
        var that = this;
        var imgScale = 288 / 455;
        var winScale = this.ctx.width / this.ctx.height;
        var nowWidth, nowHeigh;
        if(imgScale < winScale) {
            nowWidth = this.ctx.height * imgScale;
            nowHeigh = this.ctx.height;
        } else {
            nowWidth = this.ctx.width;
            nowHeigh = this.ctx.width / imgScale;
        }
//        this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);
        if(!bgImg) {
            bgImg = new Image();
            bgImg.src = 'images/tfz.jpg';
            bgImg.onload = function(){
//                that.ctx.drawImage( bgImg, 0, 0, nowWidth, nowHeigh);
            }
        } else {
//            this.ctx.drawImage( bgImg, 0, 0, nowWidth, nowHeigh);
        }
    };
    Game.prototype.drawArrow = function(angle, length, x, y) {
        this.clear();
        this.draw();
        if(length == 0) {
            return;
        }
        var rx = x, ry = y;
        var px = x+length/2, py = y;
        var radius = rx - px;
        var dx = rx ;
        var dy = ry;
        this.ctx.save();
        this.ctx.translate(dx, dy);
        this.ctx.rotate(angle * Math.PI/180);
        this.ctx.drawImage(arrowImg, 0, -10, length, 20);
        this.ctx.translate(-dx, -dy);
        this.ctx.restore();
    };

    Game.prototype.drawTrack = function(x, y , r) {
        this.draw();
        Game.CanvasHelper.fillCircle(this.ctx, x, y, r, '#c00');
    }

    Game.prototype.resize = function() {
        this.canvasElem.width = window.outerWidth;
        this.canvasElem.height = window.outerHeight;
        this.ctx.width = window.outerWidth;
        this.ctx.height = window.outerHeight;
    }

    Game.CanvasHelper = {
        /**
         * 画实心圆方法
         * @param ctx   --- context 2d
         * @param pointX  ------ 圆心X坐标
         * @param pointY ------圆心Y坐标
         * @param r   ------ 半径
         * @param color   颜色
         */
        fillCircle: function(ctx, pointX, pointY, r, color) {
            ctx.fillStyle = color; //等同于fillStyle="rgba(46,129,206,1)";
            ctx.beginPath();
            ctx.arc(pointX, pointY, r, 0, 2 * Math.PI, true);
            ctx.closePath();
            ctx.fill();
        }
    }
    return Game;
});