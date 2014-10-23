/**
 * Created by rechie on 14-8-7.
 */
define(['../core/Slide', '../util/MathUtil', '../util/ElemUtil', './Game'], function (Slide, MathUtil, ElemUtil, Game){
    var game;
    var startPoint = null;
    var endPoint = null;
    // 记录上次缓存的位置
    var lastPoint = null;
    var showTrack = true;
    var radius = 4;
    var canvasElem = document.getElementById('gameScreen');
    var ctx = canvasElem.getContext('2d');
    var workId = 0;
    window.ctx = ctx;
//    var baseUrl = 'http://192.168.1.101';
    var baseUrl = 'http://182.92.186.42';
    init();
//    document.getContext('showArrow').addEventListener('touchstart', function(){
//        document.getElementById('curType').innerHTML = '显示方向';
//        showTrack = false;
//    }, false);
//    document.getElementById('showTrack').addEventListener('touchstart', function(){
//        document.getElementById('curType').innerHTML = '显示轨迹';
//        showTrack = true;
//    }, false);
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
                game.record(touch, true, radius);
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
                    game.drawTrack(lastPoint.pageX, lastPoint.pageY, endPoint.pageX, endPoint.pageY, radius);
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
            $.ajax({
                type: 'get',
                url: baseUrl + '/work/count',
                dataType: 'json',
                success: function(data) {
                    $('#worksCount').html('人民网<br>现已经收录了' + data.num + '个作品');
                },
                error: function() {

                }
            });
//            canvasElem.width = window.outerWidth;
//            canvasElem.height = window.outerHeight;
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

    // 绑定上传事件
    $('#upload').bind('click', function() {
       $('.update-name').show();
        $('.update-name input').val('');
    });
    $('#uploadWork').bind('click', function() {
        var name = $('.update-name input').val();
        if(name == '') {
            alert('名字不能为空');
            return;
        }
        var dataUrl = canvasElem.toDataURL('images/png');
        var imageData = encodeURIComponent(dataUrl);
        var imageData = dataUrl;
        console.log(imageData)
        $.ajax({
            type: 'post',
            url: baseUrl + '/work',
            dataType: 'json',
            data: {
                imageData: imageData,
                name: name
            },
            success:  function(data) {
                if(data.status === 'success') {
                    console.log(data.path);
                }
                $('.update-name .result').html('你的作品编号: ' + data.id + '<br>点击查看').show();
                $('.update-name .inner').hide();
                workId = data.id;
            },
            error: function () {
                console.error(arguments);
            }
        })
    });
    $('.update-name .opacity').bind('click', function() {
        $('.update-name').hide();
        $('.update-name .result').hide();
        $('.update-name .inner').show();
    })


    /**
     * 修改触点半径
     */
    $('#changeRadius').bind('click', function() {
        var currentIndex = $('#changeRadius .active').index();
        $('#changeRadius .active').removeClass('active');
        var next = (currentIndex+1)%($('#changeRadius>div').length)
        radius = $('#changeRadius>div').eq(next).addClass('active').data('radius');
        if(typeof radius === 'string') {
            try{
                radius = parseInt(radius);
            } catch(e) {
                radius = 4;
            }
        }
    });
    $('.update-name .result').on('click', function(){
        $('#workList .viewMyWork').show();
        $('#workList .viewMyWork .work').html('<img src="http://182.92.186.42:3000/images/' + workId + '.png">');
        getWorks();
    });

    function getWorks() {
        $.ajax({
            url: baseUrl + '/work',
            type: 'get',
            dataType: 'json',
            success: function(data) {
                renderWorks(data.works);
            },
            error: function() {

            }
        });
        $('#workList').show();
        $('#drawWrap').hide();
    }
    $('#viewlist').bind('click', getWorks);
    $('#workList .viewMyWork').bind('click', function() {
        $('#workList .viewMyWork').hide();
    })
    function renderWorks(works) {
        var htmlStr = '';
        works.forEach(function(obj, index) {
            htmlStr += '<li><img src="' + baseUrl + ':3000/images/' + obj.id + '.png"><br>' + obj.name + '</li>'
        });
        $('#workList ul').html(htmlStr);
    }

    //微信分享功能

// 微信分享代码
// 所有功能必须包含在 WeixinApi.ready 中进行
        WeixinApi.ready(function(Api){

            // 微信分享的数据
            var wxData = {
                "imgUrl": $('#workList .viewMyWork .work img').attr('src'),
                "link":window.location.href,
                "desc":'人民日报新大楼',
                "title":"人民日报新大楼"
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