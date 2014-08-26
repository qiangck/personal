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
    $('.wrap').css({
        top: '-' + 50/scale + '%',
        left: '-' + 50/scale + '%'
    });
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
            slideBegin: function(touch){
                try{
                    startPoint = touch;
                    var element = document.elementFromPoint(touch.pageX, touch.pageY);
                    if($(element).attr('id') === 'userWrap') {
                        if(bOver === false) {
                            console.log('start shake');
                            console.log(element);
                            bOver = true;
                            index ++ ;
                            Game.View.setScore(index);
                            console.log('shake time: ' + index);
                            animate1(0, function(){
                            });
                        }
                    } else {
                        bOver = false;
                    }
                } catch(e) {
                    alert('begin error: ' + e.message);
                }
            },
            slideMove: function(touch) {
                try{
                    var element = document.elementFromPoint(touch.pageX, touch.pageY);
                    if($(element).attr('id') === 'userWrap') {
                        if(bOver === false) {
                            console.log('move shake');
                            console.log(element);
                            bOver = true;
                            index ++ ;
                            Game.View.setScore(index);
                            console.log('shake time: ' + index);
                            animate1(0, function(){
                            });
                        }
                    } else {
                        bOver = false;
                    }
                } catch(e) {
                    alert('move error: ' + e.message);
                }
            },
            slideEnd: function(touch){
                try{
                    bOver = false;
                } catch(e) {
                    alert('end error: ' + e.message);
                }
            }
        });
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