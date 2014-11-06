/**
 * Created by rechie on 14-11-5.
 */
define(['./Game'], function(Game) {
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