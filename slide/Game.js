/**
 * Created by rechie on 14-8-21.
 */
define( function() {
    var bgImg ;
    var arrowImg = new Image();
    arrowImg.src = 'images/arrow.png';
    var rectRecords = [];
    function Game(id){
        this.canvasElem = document.getElementById('gameScreen');
        this.ctx = this.canvasElem.getContext('2d');
        this.init();
    };
    Game.prototype.init = function() {
        this.resize();
        this.draw();
    };
    Game.prototype.clear = function(){
        this.draw();
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
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvasElem.width, this.canvasElem.height);
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

    Game.prototype.drawTrack = function(sx, sy, ex, ey , r) {
//        this.draw();
        Game.CanvasHelper.drawTrack(this.ctx, r, sx, sy, ex, ey, '#c00');
    };

    Game.prototype.resize = function() {
        this.canvasElem.width = $(window).width();
        this.canvasElem.height = $(window).height()-150;
        this.ctx.width = $(window).width();
        this.ctx.height = $(window).height()-150;
    }
    Game.prototype.record = function(point, bNew, radius) {
        if(bNew) {
            rectRecords[rectRecords.length] = {
                color: '#c00',
                radius: radius,
                pointList: []
            };
        }
        if(!!point) {
            rectRecords[rectRecords.length-1].pointList.push(point);
        }
    };
    Game.prototype.clearRecord = function() {
        rectRecords = [];
    };
    /**
     * 撤销功能
     */
    Game.prototype.undo = function() {
        this.clear();
        this.draw();
        var index = 0;
        rectRecords.pop();
        while(index<rectRecords.length) {
            this.reDraw(rectRecords[index])
            index ++;
        }
    };
    Game.prototype.reDraw = function(record) {
        var r = record.radius;
        var color = record.color;
        var i = 1;
        var pointList = record.pointList;
        while(i<pointList.length) {
            var sPoint = pointList[i-1];
            var ePoint = pointList[i];
            Game.CanvasHelper.drawTrack(this.ctx, r, sPoint.pageX, sPoint.pageY, ePoint.pageX, ePoint.pageY, color);
            i++;
        }
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
        },
        drawTrack: function(ctx, r, sx, sy, ex, ey, color){
            //Create a rounded corner when the two lines meet
            ctx.lineJoin = "round";
            //Draw a line with rounded end caps
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.lineWidth = '' + r;
            ctx.strokeStyle = color; // Green path
            sy = sy - 50;
            ey = ey - 50;
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke(); // Draw it
        }
    }
    return Game;
});