define( ['./RC', './EventUtil'], function(RC, EventUtil){
    RC.Slide = function(opt){
        var that = this;
        that.isSlide = false;
        that.touchIdentifier = null;
        // 配置文件
        that.opt = RC.merge({
            elemQuery: 'body',
            slideEnd: null,
            slideBegin: null,
            slideMove: null
        },opt);
        var elemQuery = 'body';
        this.elems = [].slice.call(document.querySelectorAll(elemQuery));
        that.startHandler = function(e){
            return that.StartHandler.apply(that, arguments);
        }
        that.moveHandler = function(e){
            return that.MoveHandler.apply(that, arguments);
        }
        that.endHandler = function(e){
            return that.EndHandler.apply(that, arguments);
        }
        this.addHandlers();
    };
    RC.Slide.prototype.addHandlers = function(){
        var that = this;
        that.elems.forEach(function(obj, index) {
            obj.addEventListener(EventUtil.TYPE.TOUCH_START, that.startHandler);
            obj.addEventListener(EventUtil.TYPE.TOUCH_MOVE, that.moveHandler);
            obj.addEventListener(EventUtil.TYPE.TOUCH_END, that.endHandler);
        });
    };

    RC.Slide.prototype.removeHandlers = function() {
        var that = this;
        this.elems.forEach(function(obj, index){
            obj.removeEventListener(EventUtil.TYPE.TOUCH_START, that.startHandler, false);
            obj.removeEventListener(EventUtil.TYPE.TOUCH_MOVE, that.moveHandler, false);
            obj.removeEventListener(EventUtil.TYPE.TOUCH_END, that.endHandler, false);
        });
    };

    /**
     * touch start事件监听
     * @param e
     * @constructor
     */
    RC.Slide.prototype.StartHandler = function(e) {
        e.preventDefault();
        var that = this;
        var touches = e.touches;
        if(this.touchIdentifier == null) {
            this.touchIdentifier = touches[0].identifier;
        } else {
            [].slice.apply(touches).forEach(function(touch, index) {
            });
        }
        if(e.touches.length > 1) {
            // 增加点触摸时，不处理
            return;
        }
        if(this.isSlide ===  false) {
            this.isSlide = true;
            if(typeof this.opt.slideBegin === 'function') {
                that.opt.slideBegin.call(that, RC.merge({}, touches[0]));
            }
        }
    };

    /**
     * touch move事件监听
     * @param e
     * @constructor
     */
    RC.Slide.prototype.MoveHandler = function(e) {
        var that = this;
        e.preventDefault();
        var touches = (e.targetTouches.length) ? e.targetTouches : e.changedTouches;
        if(that.isSlide = true) {
            // 判断是否是触发slide的touch
            [].slice.apply(touches).forEach(function(touch, index) {
                if(touch.identifier == that.touchIdentifier && typeof that.opt.slideMove === 'function') {
                    that.opt.slideMove.call(that, RC.merge({}, touch));
                }
            });
        }
    };

    /**
     * touch end事件监听
     * @param e
     * @constructor
     */
    RC.Slide.prototype.EndHandler = function(e) {
        var that = this;
        e.preventDefault();
        var touches = e.changedTouches;
        if(that.isSlide === true) {
            // 判断是否是触发slide的touch
            [].slice.apply(touches).forEach(function(touch, index) {
                if(touch.identifier == that.touchIdentifier) {
                    that.isSlide = false;
                    that.touchIdentifier = null;
                    if(typeof that.opt.slideEnd === 'function') {
                        var bCancel = that.opt.slideEnd.call(that, RC.merge({}, touch));
                        if(bCancel == true) {
                            that.cancel();
                        }
                    }
                }
            });
        }
    };
    return RC.Slide;
});