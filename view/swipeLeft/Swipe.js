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
            var _this = this;
        	_defaults = {
		        direction: 'vertical', // horizontal水平, vertical垂直方向
		        respOffset: 0,		//滑动开始响应的偏移量
		        swipeMove: null,		
		        swipeEnd: null,
		        beforeSwipe: null
		    };
            _touchIdentifier = null;
            _startPoint = null;
            _swipeElem = null;
            _isSwipe = false; 

            _settings = _.merge(_defaults, options);
            _elems = [].slice.call(document.querySelectorAll(_settings.elemQuery));

	        function moveHandler(e) {
                e.preventDefault();
	            e = e.originalEvent ? e.originalEvent : e;
	            var touches = (e.targetTouches.length) ? e.targetTouches : e.changedTouches;
                doSwip(touches);
	        }
            function endHandler(e) {
                e.preventDefault();
                e = e.originalEvent ? e.originalEvent : e;
                var touches = e.changedTouches;
                endSwipe(touches);
            }
            function bindRelateHandler() {
	            document.body.addEventListener('touchmove', moveHandler, false);
	            document.body.addEventListener('touchend', endHandler, false);
	            document.body.addEventListener('touchcancel', endHandler, false);
            }
            function removeRelateHandler(){
	            document.body.removeEventListener('touchmove', moveHandler, false);
	            document.body.removeEventListener('touchend', endHandler, false);
	            document.body.removeEventListener('touchcancel', endHandler, false);
            }
            /**
             * 当touchstart时，记录当前的touch点和HTMLElement对象
             * 并绑定touchmove和touchend处理函数
             * @param  {Touch List} touches touchstart触发的touch列表
             * @param  {HTML Element} elem    响应的元素
             * @return {}         
             */
            function begin(touches, elem) {
                // if(typeof _settings.beforeSwipe === 'function') {
                //     _settings.beforeSwipe.call(_this, _elems);
                // }
                if(_swipeElem) {
                    return;
                }
                if(_touchIdentifier == null) {
                    _touchIdentifier = touches[0].identifier;
                }
                if(touches.length > 1) {
                    // 增加点触摸时，不处理
                    return;
                }
                _startPoint = _.merge({}, touches[0]);
                _swipeElem = elem;
                // 点击后再绑定move事件，如果判断不是swipe动作时，在解绑touchmove事件
                bindRelateHandler();
            }

            /**
             * 根据touch list判断是否处理滑动函数
             * @param  {Touch List} touches Touch列表
             * @return {}         
             */
            function doSwip (touches) {
                if(_swipeElem === null) {
                    return;
                }
                // 判断是否是触发slide的touch
                getSwipeTouch(touches, function(touch) {
                    if(touch.identifier == _touchIdentifier) {
                        // 判断是否在滑动未开始时，触点已经离开当前元素范围
                        if(_isSwipe === false && checkTouchLeave(touch)) {
                            clearSwipe();
                            return;
                        }
                        // 根据响应方向计算偏移量，并执行回调
                        executeSwipe(touch);
                    }
                });
            };

            /**
             * 根据记录的touchIdentifier，从touches列表中找到相应的touch
             * @param  {Touch List}   touches  
             * @param  {Function} callback 回调函数，第一个参数返回为touch对象，如果未找到，返回{}
             * @return {}            
             */
            function getSwipeTouch(touches, callback) {
                var obj = {};
                [].slice.apply(touches).forEach(function(touch, index) {
                    if(touch.identifier == _touchIdentifier) {
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
            function checkTouchLeave(touch) {
                var overElem = document.elementFromPoint(touch.pageX, touch.pageY);
                var bOver = _.isParent(overElem, _swipeElem);
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
            function executeSwipe(touch) {
                var key = (_settings.direction === 'horizontal') ? 'pageX' : 'pageY';
                var offset = touch[key] - _startPoint[key];
                 if(_isSwipe || Math.abs(offset) > _settings.respOffset) {
                    _isSwipe = true;
                    if(typeof _settings.swipeMove === 'function') {
                        _settings.swipeMove.call(_swipeElem, offset);
                    }
                }
            }

            /**
             * 滑动结束后清除相应的属性
             * 并解除touchmove和touchend的响应事件
             * @return {[type]} [description]
             */
            function clearSwipe() {
                _swipeElem = null;
                _startPoint = null;
                removeRelateHandler();
            }

            /**
             * 当触发touchend时，执行的函数
             * @param  {Touch List} touches 
             * @return {}         
             */
            function endSwipe(touches) {
                if(_swipeElem === null) {
                    return;
                }
                getSwipeTouch(touches, function(touch) {
                    var Xoffset = touch.pageX - _startPoint.pageX;
                    if(_isSwipe === false) {
                        Xoffset = 0;
                    }
                    // 手指离开，关闭
                    _isSwipe === true ? _isSwipe = false : '';
                    // 需要回调
                    if(typeof _settings.swipeEnd === 'function') {
                        _settings.swipeEnd.call(_swipeElem, Xoffset);
                    }
                    // touchend 必须要解绑moveHandler
                    clearSwipe();
                });
            }

            
            this.init = function() {
                // start事件绑定 
                _elems.forEach(function(elem, index){
                    elem.addEventListener('touchstart', startHandler, false);
                    function startHandler (e) {
                        e = e.originalEvent ? e.originalEvent : e;
                        var touches = e.touches;
                        if(typeof _settings.beforeSwipe === 'function' && _settings.beforeSwipe.call(e, _elems)) {
                            // console.log('preventDefault')
                            e.preventDefault();
                            return ;
                        }
                        begin(touches, this);
                    }
                });
            }
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


