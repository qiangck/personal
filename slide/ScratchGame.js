/**
 * Created by rechie on 14-11-5.
 */
define(['./Game'], function(Game) {
    //实现集成
    function ScratchGame(id) {
        Game.apply(this, [id]);
        this.ctx.globalCompositeOperation = 'destination-out';
        console.log(this.canvasElem)
        this.canvasElem.style.backgroundImage = 'url(http://www.helloweba.com/demo/guaguaka/p_1.jpg)';
        this.canvasElem.style.backgroundColor = 'transparent'
    };
    ScratchGame.prototype = new Game();
    ScratchGame.prototype.constructor = ScratchGame;

    /**
     * 重写Game.draw方法
     */
    ScratchGame.prototype.draw = function () {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvasElem.width, this.canvasElem.height);
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
        with(thisctx) {
            beginPath()
            arc(x, y, r, 0, Math.PI * 2);//绘制圆点
            fill();
        }
    };
    return ScratchGame;
});