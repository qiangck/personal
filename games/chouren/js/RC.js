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
    that.touchIdentifier = null;
    // 配置文件
    that.opt = RC.merge({
        elemQuery: 'body',
        slideEnd: null,
        slideBegin: null,
        slideMove: null
    },opt);
    var elemQuery = opt.elemQuery;
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
    this.elems.forEach(function(obj, index) {
        obj.addEventListener(RC.EVENT.TOUCH_START, that.startHandler);
        obj.addEventListener(RC.EVENT.TOUCH_MOVE, that.moveHandler);
        obj.addEventListener(RC.EVENT.TOUCH_END, that.endHandler);
    });
};

RC.Slide.prototype.cancel = function() {
    var that = this;
    this.elems.forEach(function(obj, index){
        obj.removeEventListener(RC.EVENT.TOUCH_START, that.startHandler, false);
        obj.removeEventListener(RC.EVENT.TOUCH_MOVE, that.moveHandler, false);
        obj.removeEventListener(RC.EVENT.TOUCH_END, that.endHandler, false);
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

RC.UTILS = {
    UrlParam: (function(){
        var url = location.href;
        var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
        var paraObj = {};
        var i , j;
        for (i = 0; j = paraString[i]; i++) {
            paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
        }
        return paraObj;
    })(),
    getUrlParam: function (paras) {
        var url = location.href;
        var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
        var paraObj = {};
        var i , j;
        for (i = 0; j = paraString[i]; i++) {
            paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
        }
        var returnValue = paraObj[paras.toLowerCase()];
        if ( typeof (returnValue) == "undefined") {
            return "";
        } else {
            return returnValue;
        }
    },
    getUrlValue: function(key) {
        var returnValue = RC.UTIL.UrlParam[key.toLowerCase()];
        if ( typeof (returnValue) == "undefined") {
            return "";
        } else {
            return returnValue;
        }
    },
    merger: function(a, b) {
        for(var key in b) {
            if(b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
    },
    mergerNew: function(a, b){
        var c = RC.UTILS.merger({}, a);
        return RC.UTILS.merger(c, b);
    }
}