/**
 * Created by rechie on 14-11-5.
 */
define(['../core/Slide', '../util/MathUtil', '../util/ElemUtil', './ScratchGame'], function (Slide, MathUtil, ElemUtil, ScratchGame){
    var game;
    var startPoint = null;
    var endPoint = null;
    // 记录上次缓存的位置
    var lastPoint = null;
    var showTrack = true;
    var radius = 30;
    var canvasElem = document.getElementById('gameScreen');
    var ctx = canvasElem.getContext('2d');
    var workId = 0;
    window.ctx = ctx;
//    var baseUrl = 'http://192.168.1.101';
    var baseUrl = 'http://182.92.186.42';
    init();
    // 定义半径
    var slide = new Slide({
        elemQuery: '#gameScreen',
        slideBegin: function(touch){
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
            game = new ScratchGame('gameScreen');
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
//            $('.weixinState').html('ready');
                // 你可以在这里对分享的数据进行重组
            },
            // 分享被用户自动取消
            cancel:function (resp) {
//            $('.weixinState').html('cancel');
                // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
            },
            // 分享失败了
            fail:function (resp) {
//            $('.weixinState').html('fail');
                // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
            },
            // 分享成功
            confirm:function (resp) {
//            $('.weixinState').html('confirm');
                // 分享成功了，我们是不是可以做一些分享统计呢？
            },
            // 整个分享过程结束
            all:function (resp) {
                // $('.weixinState').html('end');
                // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
            }
        };

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        Api.shareToFriend(wxData, wxCallbacks);

        // 点击分享到朋友圈，会执行下面这个代码
        Api.shareToTimeline(wxData, wxCallbacks);

        // 点击分享到腾讯微博，会执行下面这个代码
        Api.shareToWeibo(wxData, wxCallbacks);
    });
});