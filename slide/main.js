/**
 * Created by rechie on 14-8-7.
 */
require(['../core/RC', '../util/MathUtil'], function (RC, MathUtil){
    var startPoint = null;
    var endPoint = null;
    var slide = new RC.Slide({
        elemQuery: 'body',
        slideBegin: function(touch){
            startPoint = touch;
            try {
                showArrow(null, null, touch);
            } catch(e) {
                alert(e.message);
            }
        },
        slideMove: function(touch) {
            endPoint = touch;
            try {

                var offsetX = endPoint.pageX - startPoint.pageX;
                var offsetY = endPoint.pageY - startPoint.pageY;
                var length = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
                var angle = MathUtil.getAngleDirect(startPoint, endPoint);
                angle = 360 - angle;
                showInfo2(angle, length);
                showArrow(angle, length);
            } catch(e) {
                alert(e.message);
            }
        },
        slideEnd: function(touch){
            startPoint = null;
            endPoint = null;
            try {
                hideArrow();
            } catch(e) {
                alert(e.message);
            }
        }
    });

    function hideArrow() {
        document.querySelector('.arrow').style.width = 0;
        document.querySelector('.arrow').style['-webkit-transform'] = 'rotate(0deg)';
    }

    function showArrow(angle,length, point) {
        if(point) {
            document.querySelector('.arrow').style.left = point.pageX + 'px';
            document.querySelector('.arrow').style.top = point.pageY + 'px';
        } else {

            document.querySelector('.arrow').style.width = length + 'px';
            document.querySelector('.arrow').style['-webkit-transform'] = 'rotate(' + angle + 'deg)';
        }
    }

    function showInfo(htmlStr) {
        document.querySelector('.info').innerHTML += (htmlStr + '<br>');
    }
    function showInfo2(angle, length) {
        document.querySelector('.info').innerHTML = ('当前角度: ' + angle + '<br>当前距离:' + length + '<br>');
    }
});