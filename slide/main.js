/**
 * Created by rechie on 14-8-7.
 */
define(['../core/Slide', '../util/MathUtil', '../util/ElemUtil', './Game'], function (Slide, MathUtil, ElemUtil, Game){
    var game;
    var startPoint = null;
    var endPoint = null;
    // 记录上次缓存的位置
    var lastPoint = null;
    var showTrack = false;
    var canvasElem = document.getElementById('gameScreen');
    var ctx = canvasElem.getContext('2d');
    window.ctx = ctx;
    init();
    document.getElementById('showArrow').addEventListener('touchstart', function(){
        document.getElementById('curType').innerHTML = '显示方向';
        showTrack = false;
    }, false);
    document.getElementById('showTrack').addEventListener('touchstart', function(){
        document.getElementById('curType').innerHTML = '显示轨迹';
        showTrack = true;
    }, false);
    document.getElementById('return').addEventListener('touchstart', function(){
        if(game) {
            game.undo()
        }
    });
    document.getElementById('replay').addEventListener('touchstart', function(){
        if(game) {
            game.clear();
            game.clearRecord();
        }
    });
    var slide = new Slide({
        elemQuery: '#gameScreen',
        slideBegin: function(touch){
            try{
                lastPoint = startPoint = touch;
                game.record(touch, true);
                //game.clear();
                //game.drawArrow(0, 1, startPoint.pageX, startPoint.pageY);
            } catch(e) {
                console.log('begin error: ' + e.message);
            }
        },
        slideMove: function(touch) {
            try{
                endPoint = touch;
                var offsetX = endPoint.pageX - startPoint.pageX;
                var offsetY = endPoint.pageY - startPoint.pageY;
                var length = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
                var angle =  360 - MathUtil.getAngleDirect(startPoint, endPoint);
                if(showTrack === true) {
                    game.drawTrack(lastPoint.pageX, lastPoint.pageY, endPoint.pageX, endPoint.pageY, 2);
                } else {
                    game.drawArrow(angle, length, startPoint.pageX, startPoint.pageY);
                }
                game.record(touch);
                //showInfo2(360-angle, length);
            } catch(e) {
                console.log('move error: ' + e.message);
            }
            lastPoint = touch;
        },
        slideEnd: function(touch){
            try{
                startPoint = lastPoint = endPoint = null;
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
        angle = angle.toFixed(1);
        length = length.toFixed(1);
        if(ElemUtil.query('.info').innerHTML !== ('当前角度: ' + angle + '<br>当前距离:' + length)) {
            ElemUtil.query('.info').innerHTML = ('当前角度: ' + angle + '<br>当前距离:' + length);
        }
    }
});