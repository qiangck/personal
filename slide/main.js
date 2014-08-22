/**
 * Created by rechie on 14-8-7.
 */
require.config({
    urlArgs: "bust=" + (new Date()).getTime()
});
require(['../core/RC', '../util/MathUtil', '../util/ElemUtil', 'Game'], function (RC, MathUtil, ElemUtil, Game){
    var game = new Game('gameScreen');
    var startPoint = null;
    var endPoint = null;
    var slide = new RC.Slide({
        elemQuery: 'body',
        slideBegin: function(touch){
            startPoint = touch;
            showArrow(null, null, touch);
        },
        slideMove: function(touch) {
            endPoint = touch;
            var offsetX = endPoint.pageX - startPoint.pageX;
            var offsetY = endPoint.pageY - startPoint.pageY;
            var length = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
            var angle = 360 - MathUtil.getAngleDirect(startPoint, endPoint);
            showInfo2(angle, length);
            showArrow(angle, length);
        },
        slideEnd: function(touch){
            startPoint = null;
            endPoint = null;
            hideArrow();
        }
    });

    function init() {
        var canvasElem = document.getElementById('gameScreen');
        var ctx = canvasElem.getContext('2d');
        canvasElem.width = window.outerWidth;
        canvasElem.height = window.outerHeight;
        console.log(ctx)
        ctx.clearRect(0, 0, ctx.width, ctx.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.width, ctx.height);
        var bgImg = new Image();
        bgImg.src = 'images/tfz.jpg';
        ctx.drawImage(bgImg, 0, 0);
    }




    function hideArrow() {
        var arrow = ElemUtil.query('.arrow');
        arrow.style.width = 0;
        arrow.style['-webkit-transform'] = 'rotate(0deg)';
    }

    function showArrow(angle,length, point) {
        var arrow = ElemUtil.query('.arrow');
        if(point) {
            arrow.style.left = point.pageX + 'px';
            arrow.style.top = point.pageY + 'px';
        } else {
            arrow.style.width = length + 'px';
            arrow.style['-webkit-transform'] = 'rotate(' + angle + 'deg)';
        }
    }

    function showInfo(htmlStr) {
        ElemUtil.query('.info').innerHTML += (htmlStr + '<br>');
    }
    function showInfo2(angle, length) {
        ElemUtil.query('.info').innerHTML = ('当前角度: ' + angle + '<br>当前距离:' + length + '<br>');
    }
});