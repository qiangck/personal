(function(window){
	var Swipe;  

	// 内部调用方法
    var _ = {};
	/**
	 * 判断是否为父元素
	 * @param  {HTMLElement}  obj       目标元素
	 * @param  {HTMLElement}  parentObj 父元素
	 * @return {Boolean}           [description]
	 */
    _.isParent = function (obj, parentObj) {
        while (obj != undefined && obj != null && obj.tagName.toUpperCase() != 'BODY') {
            if (obj == parentObj) {	
                return true;
            }
            obj = obj.parentNode;
        }
        return false;
    }
	_.merge = function (a, b) {
        for(var key in b) {
            if(b.hasOwnProperty(key)) {
                a[key] = b[key]
            }
        }
        return a;
    }
    Swipe = (function () {
        function Swipe(options) {
        	var defaults = {
		        direction: 'vertical', // horizontal水平, vertical垂直方向
		        respOffset: 0,		//滑动开始响应的偏移量
		        swipeMove: null,		
		        swipeEnd: null,
		        beforeSwipe: null
		    };
            this.settings = _.merge(defaults, options);
            this.elems = [].slice.call(document.querySelectorAll(this.settings.elemQuery));
            this.touchIdentifier = null;
            this._startPoint = null;
            this._swipeElem = null;
            this._isSwipe = false; 
            this.init();
        }

        /**
         * 当touchstart时，记录当前的touch点和HTMLElement对象
         * 并绑定touchmove和touchend处理函数
         * @param  {Touch List} touches touchstart触发的touch列表
         * @param  {HTML Element} elem    响应的元素
         * @return {}         
         */
        Swipe.prototype.begin = function(touches, elem) {
        	if(typeof this.settings.beforeSwipe === 'function') {
        		this.settings.beforeSwipe.call(this, this.elems);
        	}
            if(this._swipeElem || (typeof this.settings.beforeSwipe === 'function' && this.settings.beforeSwipe.call(this, this.elems))) {
                return;
            }
            if(this.touchIdentifier == null) {
                this.touchIdentifier = touches[0].identifier;
            }
            if(touches.length > 1) {
                // 增加点触摸时，不处理
                return;
            }
            this._startPoint = _.merge({}, touches[0]);
            this._swipeElem = elem;
            // 点击后再绑定move事件，如果判断不是swipe动作时，在解绑touchmove事件
            this.bindRelateHandler();
        }

        /**
         * 根据touch list判断是否处理滑动函数
         * @param  {Touch List} touches Touch列表
         * @return {}         
         */
        Swipe.prototype.doSwip = function(touches) {
        	if(this._swipeElem === null) {
        		return;
        	}
        	var _this = this;
            // 判断是否是触发slide的touch
            _this.getSwipeTouch(touches, function(touch) {
                if(touch.identifier == _this.touchIdentifier) {
                    // 判断是否在滑动未开始时，触点已经离开当前元素范围
                    if(_this._isSwipe === false && _this.checkTouchLeave(touch)) {
                    	_this.clearSwipe();
	                    return;
                    }
                    // 根据响应方向计算偏移量，并执行回调
                    _this.executeSwipe(touch);
                }
            });
        };

        /**
         * 根据记录的touchIdentifier，从touches列表中找到相应的touch
         * @param  {Touch List}   touches  
         * @param  {Function} callback 回调函数，第一个参数返回为touch对象，如果未找到，返回{}
         * @return {}            
         */
        Swipe.prototype.getSwipeTouch = function(touches, callback) {
        	var _this = this;
        	var obj = {};
            [].slice.apply(touches).forEach(function(touch, index) {
                if(touch.identifier == _this.touchIdentifier) {
                	obj = touch;
                	return;
                }
            });
        	if(typeof callback === 'function') {
        		callback(obj);
        	}
        }
        /**
         * 当滑动未执行时，判断触点是否已经离开当前绑定滑动事件的元素
         * @param  {Touch Object} 屏幕触点对象
         * @return {Boolean}       是否离开
         */
        Swipe.prototype.checkTouchLeave = function(touch) {
            var overElem = document.elementFromPoint(touch.pageX, touch.pageY);
            var bOver = _.isParent(overElem, this._swipeElem);
            if(bOver === false) {
                return true;
            }
            return false;
        };
        /**
         * 滑动判断执行函数
         * @param  {Touch Object} touch 
         * @return {[type]}       
         */
        Swipe.prototype.executeSwipe = function(touch) {
           	var key = (this.settings.direction === 'horizontal') ? 'pageX' : 'pageY';
           	var offset = touch[key] - this._startPoint[key];
             if(this._isSwipe || Math.abs(offset) > this.settings.respOffset) {
   				this._isSwipe = true;
            	if(typeof this.settings.swipeMove === 'function') {
                    this.settings.swipeMove.call(this._swipeElem, offset);
                }
            }
        }

        /**
         * 滑动结束后清除相应的属性
         * 并解除touchmove和touchend的响应事件
         * @return {[type]} [description]
         */
        Swipe.prototype.clearSwipe = function() {
            this._swipeElem = null;
            this._startPoint = null;
        	this.removeRelateHandler();
        }

        /**
         * 当触发touchend时，执行的函数
         * @param  {Touch List} touches 
         * @return {}         
         */
        Swipe.prototype.endSwipe = function(touches) {
        	var _this = this;
            if(_this._swipeElem === null) {
                return;
            }
            _this.getSwipeTouch(touches, function(touch) {
                // 手指离开，关闭
                _this._isSwipe === true ? _this._isSwipe = false : '';
                var Xoffset = touch.pageX - _this._startPoint.pageX;
                // 需要回调
                if(typeof _this.settings.swipeEnd === 'function') {
                    _this.settings.swipeEnd.call(_this._swipeElem, Xoffset);
                }
                // touchend 必须要解绑moveHandler
                _this.clearSwipe();
            });
        }

        /**
         * 初始化函数
         * @return {[type]} [description]
         */
        Swipe.prototype.init = function () {
            var _this = this;

	        this.moveHandler = function(e) {
	            e = e.originalEvent ? e.originalEvent : e;
	            var touches = (e.targetTouches.length) ? e.targetTouches : e.changedTouches;
                _this.doSwip.call(_this, touches);
	        }
            this.endHandler = function(e) {
                e = e.originalEvent ? e.originalEvent : e;
                var touches = e.changedTouches;
                _this.endSwipe.call(_this, touches);
            }
            this.bindRelateHandler = function() {
	            document.body.addEventListener('touchmove', this.moveHandler, false);
	            document.body.addEventListener('touchend', this.endHandler, false);
	            document.body.addEventListener('touchcancel', this.endHandler, false);
            }
            this.removeRelateHandler = function(){
	            document.body.removeEventListener('touchmove', this.moveHandler, false);
	            document.body.removeEventListener('touchend', this.endHandler, false);
	            document.body.removeEventListener('touchcancel', this.endHandler, false);
            }

            // start事件绑定 
            _this.elems.forEach(function(elem, index){
            	elem.addEventListener('touchstart', startHandler, false);
	            function startHandler (e) {
	                e = e.originalEvent ? e.originalEvent : e;
	                var touches = e.touches;
	                _this.begin.call(_this, touches, this);
	            }
            });
        };

        return Swipe;
 
    })();
	if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
	    define("mod/common/m.fastclick", [], function() {
	        return Swipe
	    })
	} else if (typeof module !== "undefined" && module.exports) {
	    module.exports = Swipe;
	} else {
	    window.Swipe = Swipe
	}
})(window);


