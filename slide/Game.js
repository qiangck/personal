/**
 * Created by rechie on 14-8-21.
 */
define( function() {
    var bgImg = new Image();
    bgImg.src = 'images/tfz.jpg';
    var arrowImg = new Image();
    arrowImg.src = 'images/image.jpeg';
    var Game = function(id){
        this.canvasElem = document.getElementById('gameScreen');
        this.ctx = this.canvasElem.getContext('2d');
        this.init();
    };
    Game.prototype.init = function() {
        this.resize();
        this.draw();
    };
    Game.prototype.draw = function () {
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
        this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);
        this.ctx.drawImage(bgImg, 0, 0, nowWidth, nowHeigh);
    };
    Game.prototype.drawArrow = function(angle, length, x, y) {
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

    Game.prototype.resize = function() {
        this.canvasElem.width = window.outerWidth;
        this.canvasElem.height = window.outerHeight;
        this.ctx.width = window.outerWidth;
        this.ctx.height = window.outerHeight;
    }
    return Game;
});