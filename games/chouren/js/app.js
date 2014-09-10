/**
 * Created by rechie on 14-8-26.
 */
function resizeContainer() {
    var widthScale = $(window).width()/640;
    var heightScale = $(window).height()/960;
    if(heightScale < widthScale) {
        $(document.body).addClass('bg-body');
    }
    var scale = Math.min(widthScale, heightScale);
    var realWidth = 640 * scale;
    var realHeight = 960 * scale;
    window.scale = scale;
    var cssObj = {
        '-webkit-transform': 'scale(' + scale + ', ' + scale + ')',
        '-ms-transform': 'scale(' + scale + ', ' + scale + ')',
        '-o-transform': 'scale(' + scale + ', ' + scale + ')',
        'transform': 'scale(' + scale + ', ' + scale + ')',
    };
    $('body').css(cssObj);
}
// 通过链接参数拼脸
function initFaceFromParams(){
    var defaultSetting = {
        lian: 0,
        toufahou: 122,
        toufaqian: 22,
        bizi: 1,
        meimao: 0,
        tezheng: 1,
        yanjing: 0,
        daiyanjing: 1,
        zui: 0
    };
    RC.UTILS.merger(defaultSetting, RC.UTILS.UrlParam);
    var figureHtml = '<img src="assets/images/lian/TYlian' + defaultSetting.lian + '.png" class="lian zIndex2" id="lian" />'
        + '<img src="assets/images/toufahou/TYtoufahou' + defaultSetting.toufahou + '.png" class="toufahou zIndex1" id="toufahou" />'
        + '<img src="assets/images/toufaqian/TYtoufaqian' + defaultSetting.toufaqian + '.png" class="toufaqian zIndex5" id="toufaqian" />'
        + '<img src="assets/images/bizi/TYbizi' + defaultSetting.bizi + '.png" class="bizi zIndex3" />'
        + '<img src="assets/images/meimao/TYmeimao' + defaultSetting.meimao + '.png" class="meimao zIndex3" />'
        + '<img src="assets/images/tezheng/TYtezheng' + defaultSetting.tezheng + '.png" class="tezheng zIndex3" />'
        + '<img src="assets/images/yanjing/TYyanjing' + defaultSetting.yanjing + '.png" class="yanjing zIndex3" />'
        + '<img src="assets/images/daiyanjing/TYdaiyanjing' + defaultSetting.daiyanjing + '.png" class="daiyanjing zIndex4" />'
        + '<img src="assets/images/zuiba/TYzui' + defaultSetting.zui + '.png" class="zui zIndex3">';
    document.querySelector('#gameIntro .figure').innerHTML = figureHtml;
    var pics = [
        {
            elem: document.getElementById('lian'),
            color: [254, 220, 182]
        },
        {
            elem: document.getElementById('toufahou'),
            color: [199, 131, 136]
        },
        {
            elem: document.getElementById('toufaqian'),
            color: [199, 131, 136]
        }
    ];
    var index = 0;
    for(var i = 0;i < pics.length;i ++){
        (function(i){
            var color = pics[i].color;
            pics[i].elem.loadOnce(function(){
                /*
                 防止用onload事件注册后  replace会改变img的src导致onload事件再次触发形成循环
                 */
                window.color = color;
                index ++ ;
                if(index === pics.length) {
                    // 加载完成后，复制
                    document.querySelector('#userWrap .user .figure').innerHTML = document.querySelector('#gameIntro .figure').innerHTML;
                    document.querySelector('#result .figure').innerHTML = document.querySelector('#gameIntro .figure').innerHTML;
                }
                var picTranseObj = psLib(this);//创建一个psLib对象
                var origin = picTranseObj.clone();//克隆原始对象做为原始副本

                var grayPic = picTranseObj.act("添加杂色");
                grayPic.replace(this);

            });
        })(i);
    }
    var nameNodes = document.querySelectorAll('.name');
    for(var i=0; i<nameNodes.length; i++) {
        nameNodes[i].innerHTML = decodeURIComponent(RC.UTILS.UrlParam.username);
    }
    document.querySelector('#gameIntro .title .info').innerHTML = RC.UTILS.UrlParam.shounve;

}
initFaceFromParams();
$(document).ready(function() {
    resizeContainer();

    var bOver = false;
    var index = 0;
    var game = new Game();
    // 初始化计时器
    var timer = new Game.Time({
        add:1,
        minus: 5,
        countFunc: Game.View.setTimer,
        end: function() {
            $('#gameScreen').hide();
            $('#result .info .title .hit-count').html(index);
            $('#result').show();
//            console.log('end')
        }
    });
    game.setTimer(timer);
    $('#play img').bind('click', function(){
        prepare();
    });
    $('#replay img').bind('click', function(){
        $('#gameIntro').hide();
        $('#result').hide();
        $('#gameScreen').show();
        console.log(123)
        prepareAnimate(true, 0,  function(){
            game.replay();
        });
    });

    function prepare() {
        $('#gameIntro').hide();
        $('#result').hide();
        $('#gameScreen').show();
        prepareAnimate(true, 0,  startGame);
    }

    function prepareAnimate(bShow, timeDelay, callback) {
        timeDelay = timeDelay || 0;
        var timeOut = 500;
        if(timeDelay > 2500) {
            if(typeof callback === 'function'){
                callback();
            }
            return;
        }
        setTimeout(function(){
            prepareAnimate(!bShow, timeDelay + timeOut, callback);
        }, timeOut);
        if(bShow) {
            $('#readyBg').show()
        } else {
            $('#readyBg').hide()
        }
    }

    function startGame() {
        game.start();
        var slide = new RC.Slide({
            elemQuery: 'body',
            slideBegin: resolvePosition,
            slideMove: resolvePosition,
            slideEnd: function(touch){
                try{
                    bOver = false;
                } catch(e) {
                    alert('end error: ' + e.message);
                }
            }
        });
    }

    function resolvePosition(touch) {
        var element = document.elementFromPoint(touch.pageX, touch.pageY);
        if($(element).attr('id') === 'userBody' || $(element).parents('#userBody').length > 0) {
            if(bOver === false) {
                bOver = true;
                index ++ ;
                Game.View.setScore(index);
                Game.Animate.twitch(Math.ceil(Math.random()*4), RC.UTILS.UrlParam.sex, 1);
            }
        } else {
            bOver = false;
        }
    }
});



// 微信分享代码
// 所有功能必须包含在 WeixinApi.ready 中进行
WeixinApi.ready(function(Api){

    // 微信分享的数据
    var wxData = {
        "imgUrl":'http://182.92.186.42/personal/slide/images/tfz.jpg',
        "link":'http://182.92.186.42/personal/slide/images/tfz.jpg',
        "desc":'\u5927\u5bb6\u597d\uff0c\u6211\u662frechie\uff0c\u6d4b\u8bd5\u5fae\u4fe1\u5206\u4eab\u529f\u80fd',
        "title":"\u5927\u5bb6\u597d\uff0c\u6211\u662frechie"
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