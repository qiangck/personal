/**
 * Created by rechie on 14-8-7.
 */
define(['../core/RC', '../util/MathUtil', '../util/ElementUtil', 'Game'], function (RC, MathUtil, ElemUtil, Game){
    var game;
    var startPoint = null;
    var endPoint = null;
    var slide = new RC.Slide({
        elemQuery: 'body',
        slideBegin: function(touch){
            startPoint = touch;
            game.drawArrow(0, 1, startPoint.pageX, startPoint.pageY);
        },
        slideMove: function(touch) {
            endPoint = touch;
            var offsetX = endPoint.pageX - startPoint.pageX;
            var offsetY = endPoint.pageY - startPoint.pageY;
            var length = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
            var angle =  360 - MathUtil.getAngleDirect(startPoint, endPoint);
            game.drawArrow(angle, length, startPoint.pageX, startPoint.pageY);
            showInfo2(angle, length);
//            showArrow(angle, length);
        },
        slideEnd: function(touch){
            startPoint = null;
            endPoint = null;
            game.drawArrow(0, 0, 0, 0);
        }
    });

    function init() {
        var canvasElem = document.getElementById('gameScreen');
        var ctx = canvasElem.getContext('2d');
        canvasElem.width = window.outerWidth;
        canvasElem.height = window.outerHeight;
        game = new Game('gameScreen');
    }


    init();
    function showInfo(htmlStr) {
        ElementUtil.query('.info').innerHTML += (htmlStr + '<br>');
    }
    function showInfo2(angle, length) {
        ElementUtil.query('.info').innerHTML = ('当前角度: ' + angle + '<br>当前距离:' + length + '<br>');
    }
});