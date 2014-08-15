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
    RC.Slide = function(opt){
        var that = this;
        that.isSlide = false;
        that.currentTarget = null;
        that.touchIdentifier = null;
        // 配置文件
        that.opt = RC.merge({
            elemQuery: 'body',
            slideEnd: null,
            slideBegin: null,
            slideMove: null
        },opt);
        var elemQuery = 'body';
        var elems = [].slice.call(document.querySelectorAll(elemQuery));
        elems.forEach(function(obj, index) {
            obj.addEventListener(RC.EVENT.TOUCH_START, function(e) {
                e.preventDefault();
                var touches = e.touches;
                if(that.touchIdentifier == null) {
                    that.touchIdentifier = touches[0].identifier;
                } else {
                    [].slice.apply(touches).forEach(function(touch, index) {
                    });
                }
                if(e.touches.length > 1) {
                    // 增加点触摸时，不处理
                    return;
                }
                if(that.isSlide ===  false) {
                    that.isSlide = true;
                    that.currentTarget = obj;
                    if(typeof that.opt.slideBegin === 'function') {
                        that.opt.slideBegin(touches[0]);
                    }
                }
            });
            obj.addEventListener(RC.EVENT.TOUCH_MOVE, function(e) {
                e.preventDefault();
                var touches = (e.targetTouches.length) ? e.targetTouches[0] : e.changedTouches[0];
                if(that.isSlide = true) {
                    // 判断是否是触发slide的touch
                    [].slice.apply(touches).forEach(function(touch, index) {
                        if(touch.identifier == that.touchIdentifier && typeof that.opt.slideMove === 'function') {
                            that.opt.slideMove(touch);
                        }
                    });
                }
            });
            obj.addEventListener(RC.EVENT.TOUCH_END, function(e) {
                e.preventDefault();
                var touches = e.changedTouches;
                if(that.isSlide === true) {
                    // 判断是否是触发slide的touch
                    [].slice.apply(touches).forEach(function(touch, index) {
                        if(touch.identifier == that.touchIdentifier) {
                            that.isSlide = false;
                            that.currentTarget = null;
                            that.touchIdentifier = null;
                            if(typeof that.opt.slideEnd === 'function') {
                                that.opt.slideEnd(touch);
                            }
                        }
                    });
                }
            });
        });
    };
    RC.Slide.prototype.showArrow = function() {

    };
    return RC;
});