/**
 * Created by rechie on 14-8-7.
 */
define(['../core/RC', '../util/MathUtil', '../util/ElemUtil', 'Game'], function (RC, MathUtil, ElemUtil, Game){
    var game;
    var startPoint = null;
    var endPoint = null;
    init();
    var slide = new RC.Slide({
        elemQuery: 'body',
        slideBegin: function(touch){
            try{
                startPoint = touch;
                game.drawArrow(0, 1, startPoint.pageX, startPoint.pageY);
            } catch(e) {
                alert('begin error: ' + e.message);
            }
        },
        slideMove: function(touch) {
            try{
                endPoint = touch;
                var offsetX = endPoint.pageX - startPoint.pageX;
                var offsetY = endPoint.pageY - startPoint.pageY;
                var length = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
                var angle =  360 - MathUtil.getAngleDirect(startPoint, endPoint);
                game.drawArrow(angle, length, startPoint.pageX, startPoint.pageY);
                showInfo2(angle, length);
            } catch(e) {
                alert('move error: ' + e.message);
            }
        },
        slideEnd: function(touch){
            try{
                startPoint = null;
                endPoint = null;
                game.drawArrow(0, 0, 0, 0);
                // 返回true 取消事件监听
                // return true;
            } catch(e) {
                alert('end error: ' + e.message);
            }
        }
    });


    function init() {
        try{
            var canvasElem = document.getElementById('gameScreen');
            var ctx = canvasElem.getContext('2d');
            canvasElem.width = window.outerWidth;
            canvasElem.height = window.outerHeight;
            game = new Game('gameScreen');
        } catch(e) {
            alert('init error: ' + e.message);
        }
    }

    function showInfo(htmlStr) {
        ElemUtil.query('.info').innerHTML += (htmlStr + '<br>');
    }
    function showInfo2(angle, length) {
        ElemUtil.query('.info').innerHTML = ('当前角度: ' + angle + '<br>当前距离:' + length + '<br>');
    }
});