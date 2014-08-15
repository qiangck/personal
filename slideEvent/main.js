/**
 * Created by rechie on 14-8-7.
 */
require(['util/RC'], function (RC){
    var startPoint = null;
    var endPoint = null;
    var slide = new RC.Slide({
        elemQuery: 'body',
        slideBegin: function(touch){
            startPoint = touch;
            console.log('slide start');
            showArrow(null, null, touch);
        },
        slideMove: function(touch) {
            console.log('slide move');
            endPoint = touch;
            calculate(startPoint, endPoint);
        },
        slideEnd: function(touch){
            console.log('slide end');
            console.log('go');
            startPoint = null;
            endPoint = null;
            alert("slide end");
            hideArrow();
        }
    });

    function hideArrow() {
        document.querySelector('.arrow').style.width = 0;
        document.querySelector('.arrow').style.transform = 'rotate(0deg)';
    }

    function showArrow(angle,length, point) {
        if(point) {
            document.querySelector('.arrow').style.left = point.pageX + 'px';
            document.querySelector('.arrow').style.top = point.pageY + 'px';
        } else {

            document.querySelector('.arrow').style.width = length + 'px';
            document.querySelector('.arrow').style.transform = 'rotate(' + angle + 'deg)';
        }
    }

    function calculate(startPoint, endPoint) {
        var offsetX = endPoint.pageX - startPoint.pageX;
        var offsetY = endPoint.pageY - startPoint.pageY;
        var angle = getAngle(endPoint.pageX, endPoint.pageY,startPoint.pageX, startPoint.pageY);
        if(offsetY > 0) {
            if(offsetX > 0) {
                angle = 360 - angle;
                // 区域4
            } else {
                // 区域3
                angle = 180 + angle;
            }
        } else {
            if(offsetX > 0) {
                // 区域 1
            } else {
                // 区域2
                angle = 180 - angle;
            }
        }
        var length = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
        angle = 360 - angle;
        showInfo(angle, length);
        showArrow(angle, length);
    }

    function showInfo(angle, length) {
        document.querySelector('.info').innerHTML = ('当前角度: ' + angle + '<br>当前距离:' + length);
    }
    function getAngle(x1, y1, x2, y2) {
        // 直角的边长
        var x = Math.abs(x1 - x2);
        var y = Math.abs(y1 - y2);
        // 斜边长
        var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        // 余弦
        var cos = x / z;
        // 弧度
        var radina = Math.acos(cos);
        // 角度
        var angle =  180 / (Math.PI / radina);
        return angle;
     }
});