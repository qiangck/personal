/**
 * Created by rechie on 14-8-8.
 */
define(function (){
    var RC = {};
    RC.touchable = 'ontouchend' in document;
    RC.EVENT = {
        TOUCH_START: 'touchstart',
        TOUCH_MOVE: 'touchmove',
        TOUCH_END: 'touchend'
    };
    RC.merge = function(a, b) {
        for(var key in b) {
            if(!a[key] && b.hasOwnProperty(key)) {
                a[key] = b[key]
                
            }
        }
        return a;
    }

    return RC;
});