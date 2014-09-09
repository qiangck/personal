/**
 * Created by rechie on 14-8-26.
 */
function resizeContainer() {
    var widthScale = $(window).width()/320;
    var heightScale = $(window).height()/480;
    if(heightScale < widthScale) {
        $(document.body).addClass('bg-body');
    }
    var scale = Math.min(widthScale, heightScale);
    var realWidth = 320 * scale;
    var realHeight = 480 * scale;
    var transformOrigin = [($(window).width()-realWidth)/2, ($(window).height()-realHeight)/2, 0];
    window.scale = scale;
    var cssObj = {
        '-webkit-transform': 'scale(' + scale + ', ' + scale + ')',
        '-ms-transform': 'scale(' + scale + ', ' + scale + ')',
        '-o-transform': 'scale(' + scale + ', ' + scale + ')',
        'transform': 'scale(' + scale + ', ' + scale + ')',
    };
    $('.container').css(cssObj);
}

var frame1List = [{
        x:'-5px', 
        y:'-0px'
    }, {
        x:'-130px', 
        y:'-0px'
    }, {
        x:'-256px', 
        y:'-0px'
    }, {
        x:'-382px', 
        y:'-0px'
    }, {
        x:'-507px', 
        y:'-0px'
    }, {
        x:'-632px', 
        y:'-0px'
    }, {
        x:'-5px', 
        y:'-130px'
    }, {
        x:'-130px', 
        y:'-130px'
    }, {
        x:'-256px', 
        y:'-130px'
    }, {
        x:'-382px', 
        y:'-130px'
    }, {
        x:'-507px', 
        y:'-130px'
    }, {
        x:'-632px', 
        y:'-130px'
    }, {
        x:'-5px', 
        y:'-273px'
    }, {
        x:'-130px', 
        y:'-273px'
    }, {
        x:'-256px', 
        y:'-273px'
    }, {
        x:'-382px', 
        y:'-273px'
    }, {
        x:'-507px', 
        y:'-273px'
    }, {
        x:'-632px', 
        y:'-273px'
    }, {
        x:'-5px', 
        y:'-409px'
    }, {
        x:'-130px', 
        y:'-409px'
    }, {
        x:'-256px', 
        y:'-409px'
    }, {
        x:'-382px', 
        y:'-409px'
    }, {
        x:'-507px', 
        y:'-409px'
    }, {
        x:'-632px', 
        y:'-409px'
    }
];
$(document).ready(function() {
    resizeContainer();
    var game = new Game();
    // 初始化计时器
    var timer = new Game.Time({
        add:1,
        minus: 5,
        countFunc: Game.View.setTimer,
        end: function() {
            console.log('end')
        }
    });
    game.setTimer(timer);
    $('#play img').bind('click', function(){
        startGame();
    });
    var bOver = false;
    var index = 0;
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
        if($(element).attr('id') === 'userWrap' || $(element).parents('#userWrap').length > 0) {
            if(bOver === false) {
                bOver = true;
                index ++ ;
                Game.View.setScore(index);
                animate1(0, function(){});
            }
        } else {
            bOver = false;
        }
    }

    var timeId = null;
    var bAnimate = false;
    function animate1(index, callback){
        if(bAnimate == true && index == 0) {
            return;
        }
        if(typeof index !== 'number') {
            index = 0;
        }
        var obj = frame1List[index];
        $('#userWrap .user').css({
            'background-position': obj.x + ' ' + obj.y
        });
        index ++ ;
        if(index > frame1List.length - 1) {
            clearTimeout(timeId);
            timeId = null;
            if(typeof callback == 'function') {
                callback();
            }
            bAnimate = false;
        } else {
            bAnimate = true;
            timeId = setTimeout(function(){
                animate1(index, callback)
            }, 2000/frame1List.length);
        }
    }

    function clearAnimate() {
        if(timeId) {
            clearTimeout(timeId);
            timeId = null
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
            $('.weixinState').html('ready');
            // 你可以在这里对分享的数据进行重组
        },
        // 分享被用户自动取消
        cancel:function (resp) {
            $('.weixinState').html('cancel');
            // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
        },
        // 分享失败了
        fail:function (resp) {
            $('.weixinState').html('fail');
            // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
        },
        // 分享成功
        confirm:function (resp) {
            $('.weixinState').html('confirm');
            // 分享成功了，我们是不是可以做一些分享统计呢？
        },
        // 整个分享过程结束
        all:function (resp) {
            $('.weixinState').html('end');
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