/**
 * Created by hugohua on 14-4-1.
 * zepto plugin template
 */
 
/**
 * 将插件封装在一个闭包里面，防止外部代码污染  冲突
 */
(function ($) {
    /**
     * 定义一个插件 Plugin
     */
    var Plugin;  //插件的私有方法，也可以看做是插件的工具方法集
    function isParent(obj, parentObj) {
        while (obj != undefined && obj != null && obj.tagName.toUpperCase() != 'BODY') {
            if (obj == parentObj) {
                return true;
            }
            obj = obj.parentNode;
        }
        return false;
    }

    Plugin = (function () {
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.swipe.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            //初始化调用一下
            this.init();
            this.touchIdentifier = null;
            this._startPoint = null;
            this._curPoint = null;
            this._isSwipe = false;
        }

        Plugin.prototype.init = function () {
            var _this = this;
            _this.$element.bind('touchstart', function(e) {
                if(_this._isSwipe === true) {
                    return;
                }
                e = e.originalEvent ? e.originalEvent : e;
                var touches = e.touches;
                if(_this.touchIdentifier == null) {
                    _this.touchIdentifier = touches[0].identifier;
                }
                if(e.touches.length > 1) {
                    // 增加点触摸时，不处理
                    return;
                }
                _this._startPoint = merger({}, touches[0]);
                _this._isSwipe = true;
                // 点击后再绑定move事件，如果判断不是swipe动作时，在解绑touchmove事件
                bindMoveHandler.call(_this, $(this));
            });

            function bindMoveHandler($elem) {
                var _this = this;
                $(document.body).bind('touchmove', function(e) {
                    if(_this._isSwipe === false) {
                        return;
                    }
                    e = e.originalEvent ? e.originalEvent : e;
                    var touches = (e.targetTouches.length) ? e.targetTouches : e.changedTouches;

                    // 判断是否是触发slide的touch
                    [].slice.apply(touches).forEach(function(touch, index) {
                        if(touch.identifier == _this.touchIdentifier) {
                            var Xoffset = touch.pageX - _this._startPoint.pageX;
                            // 
                            if(typeof _this.settings.callback === 'function') {
                                if(Math.abs(Xoffset) > 10) {
                                    _this.settings.callback.call($elem, Xoffset);
                                }
                            }
                            // 判断是否已经离开当前元素范围
                            var overElem = document.elementFromPoint(touch.pageX, touch.pageY);
                            var bOver = isParent(overElem, $elem[0]);
                            if(bOver === false) {
                                $(document.body).unbind('touchmove');
                            }
                        }
                    });
                });
            }
            // TODO 判断是否为触发touchstart元素
            $(document.body).bind('touchend', function(e) {
                e = e.originalEvent ? e.originalEvent : e;
                var touches = e.changedTouches;

                [].slice.apply(touches).forEach(function(touch, index) {
                    if(touch.identifier == _this.touchIdentifier) {
                        // 手指离开，关闭
                        _this._isSwipe === true ? _this._isSwipe = false : '';
                        var Xoffset = touch.pageX - _this._startPoint.pageX;
                        // 需要回调
                        if(typeof _this.settings.callback === 'function') {
                            _this.settings.swipeEnd.call(_this.$element, Xoffset);
                        }
                        if(Xoffset < -50) {
                            // console.log(count++)
                        }
                        $(document.body).unbind('touchmove');
                    }
                });
            });
        };
        return Plugin;
 
    })();
 
    /**
     * 插件的私有方法
     */
    function merger(a, b) {
        for(var key in b) {
            if(b.hasOwnProperty(key)) {
                a[key] = b[key]
            }
        }
        return a;
    }
 
    /**
     * 这里是将Plugin对象 转为jq插件的形式进行调用
     * 定义一个插件 plugin
     * zepto的data方法与jq的data方法不同
     * 这里的实现方式可参考文章：http://trentrichardson.com/2013/08/20/creating-zepto-plugins-from-jquery-plugins/
     */
    $.fn.swipe = function(options){
        return this.each(function () {
            // console.log(this)
            var $this = $(this),
                instance = $.fn.swipe.lookup[$this.data('plugin')];
            if (!instance) {
                //zepto的data方法只能保存字符串，所以用此方法解决一下
                $.fn.swipe.lookup[++$.fn.swipe.lookup.i] = new Plugin(this,options);
                $this.data('plugin', $.fn.swipe.lookup.i);
                instance = $.fn.swipe.lookup[$this.data('plugin')];
            }
 
            // if (typeof options === 'string') instance[options]();
        })
    };
 
    $.fn.swipe.lookup = {i: 0};
 
    /**
     * 插件的默认值
     */
    $.fn.swipe.defaults = {
        direction: 'left',
        callback: null
    }
 
    /**
     * 优雅处： 通过data-xxx 的方式 实例化插件。
     * 这样的话 在页面上就不需要显示调用了。
     * 可以查看bootstrap 里面的JS插件写法
     */
    // $(function () {
    //     return new Plugin($('[data-plugin]'));
    // });
})(Zepto);