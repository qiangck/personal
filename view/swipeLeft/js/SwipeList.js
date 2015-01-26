
define('js/SwipeList', ['js/Swipe'], function(Swipe){

    function merge(a, b) {
        for(var key in b) {
            if(b.hasOwnProperty(key)) {
                a[key] = b[key]
            }
        }
        return a;
    }

    // 滑动删除功能，基于Swipe扩展 
    function SwipeList(options){
        var defaultOpts = {
            offsetLimit: {
                max: 20,
                min: -80
            },
            elemQuery: '.xh_list_wrap ul li',
            animElemQuery: '.info',
            respOffset: 10,
            criticalityOffset: 40
        };
        var opts = merge(defaultOpts, options);
        var swipeLeftFlag = false;
        var swipeElem = null;

        function beforeSwipe(elems) {
            if(this.target.className.indexOf('btn') > -1) {
                return true;
            }
            if(swipeLeftFlag === true) {
                resetOffset(elems);
            }
            return swipeLeftFlag;
        }

        /**
         * 重置位置
         * @return {[type]} [description]
         */
        function resetOffset(elems) {
            var count = 0;
            elems.forEach(function(obj, index) {
                var reg = /[-]?\d+/ig;
                var curoffset = obj.querySelectorAll(opts.animElemQuery)[0].style['transform'] || obj.querySelectorAll(opts.animElemQuery)[0].style['webkitTransform']|| 0;
                if(curoffset) {
                    curoffset = curoffset.replace(/[0-9]d/ig, '').match(reg)[0]
                }
                animate(obj.querySelectorAll(opts.animElemQuery)[0], curoffset, 0, function() {
                    count ++;
                    if(count > elems.length-1) {
                        swipeLeftFlag = false;
                        swipeElem = null;
                    }
                });
            });
        }

        function swipeMove(Xoffset){
            if(Xoffset < opts.offsetLimit.min ||  Xoffset > opts.offsetLimit.max) {
                return;
            }
            this.querySelectorAll(opts.animElemQuery)[0].style['transform'] = 'translate3d(' + Xoffset + 'px,0,0)'
            this.querySelectorAll(opts.animElemQuery)[0].style['webkitTransform'] = 'translate3d(' + Xoffset + 'px,0,0)'
        }
        function swipeEnd(Xoffset) {
            var elem = this.querySelectorAll(opts.animElemQuery)[0];
            if(Xoffset > 0) {
                animate(elem, opts.offsetLimit.max);
                swipeLeftFlag = false;
                swipeElem = null;
            } else if(Math.abs(Xoffset) < opts.criticalityOffset) {
                animate(elem, Xoffset);
                swipeLeftFlag = false;
                swipeElem = null;
            } else if(Math.abs(Xoffset) > opts.criticalityOffset) {
                Xoffset < opts.offsetLimit.min ? Xoffset = opts.offsetLimit.min : ''
                animate(elem, Xoffset, opts.offsetLimit.min);
                swipeLeftFlag = true;
                swipeElem = this;
            }
        }
        /**
         * 位移动画
         * @param {zepto object} $elem        zepto封装的对象
         * @param {Number} Xoffset      现在的偏移量
         * @param {Number} targetOffset 要移动到的偏移量
         */
        function animate($elem, Xoffset, targetOffset, callback) {
            targetOffset = targetOffset ? targetOffset : 0;
            $elem.style['transform'] = 'translate3d(' + Xoffset + 'px, 0, 0)';
            $elem.style['webkitTransform'] = 'translate3d(' + Xoffset + 'px,0,0)'
            if(Xoffset == targetOffset) {
                if(typeof callback === 'function') {
                    callback();
                }
                return;
            }
            if(Xoffset > targetOffset) {
                Xoffset --;
            } else {
                Xoffset ++
            }
            setTimeout(function() {
                animate($elem, Xoffset, targetOffset, callback);
            });
        }   
        var options = {
            elemQuery: opts.elemQuery,
            direction: 'horizontal',
            respOffset: opts.respOffset, 
            beforeSwipe: beforeSwipe,
            swipeMove: swipeMove,
            swipeEnd: swipeEnd   
        }
        var swipe = new Swipe(options);
        swipe.init();


        return {
            bSwipe: function() {
                return swipeLeftFlag;
            },
            getSwipeElem: function() {
                return swipeElem;
            },
            removeLast: function() {
                if(swipeElem) {
                    swipeElem.parentNode.removeChild(swipeElem);
                    swipeElem = null;
                    swipeLeftFlag = false;
                }
            },
            reset: function(){
                var elems = [].slice.call(document.querySelectorAll(opts.elemQuery));
                resetOffset(elems)
            }
        }
    }
    // 滑动删除功能，基于Swipe扩展 END
    return SwipeList;
})