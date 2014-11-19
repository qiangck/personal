/**
 * Created by rechie on 14-11-5.
 */
define(['core/Slide', 'util/MathUtil', 'util/ElemUtil', 'src/ScratchGame'], function (Slide, MathUtil, ElemUtil, ScratchGame){
    var game;
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
                if(touchNum > 100) {
                    document.getElementById(canvasId).style.display = 'none';
                    $('.jt_left').show()
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
        console.log('start init')
        try{
            game = new ScratchGame(canvasId);
            $('.sl-slider').height($(window).height());
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