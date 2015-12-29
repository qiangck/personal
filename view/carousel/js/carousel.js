define(function() {
    /**
     * [Carousel description]
     * @param {jQueryObject} wrapElem jQuery对象
     * @param {Object} opts     配置
     * @param {String} dir 自动滚动的方向,left/right
     * @param {String} timeFunc 速度曲线
     * @param {Number} duration 每次滚动持续时间
     * @param {Number} delay 两次滚动的间隔时间
     * @example
     * var carousel = new Carousel($('.pc_banner'), {
     *     dir: 'left',
     *     delay: 2000,
     *     duration: 300,
     *     timeFunc: 'ease-in-out'
     * })
     */
    function Carousel(wrapElem, opts) {
        this.opt = opts;
        /** @type {jQueryObject} 父容器 */
        this.wrapElem = wrapElem;
        /** @type {jQueryObject} 列表的容器 */
        this.ctElem = this.wrapElem.find('ul');
        /** @type {Number} 列表元素 */
        this.itemList = this.ctElem.children();
        /** @type {Number} 列表的长度 */
        this.itemLength = this.itemList.length;
        /**
         * 屏幕的宽度
         * @type {Number}
         */
        this.winWidth = $(window).width();
        /**
         * 当前滚动的图片索引，不会超过itemLength
         * @type {Number}
         */
        this.curIndex = 0;
        /**
         * 滚动次数，持续增加
         * @type {Number}
         */
        this.curCount = 0;
        /**
         * 自动执行时的timeId
         * @type {Number}
         */
        this.timeId = null;
        /**
         * 控制移动的开关，如果正在移动，则禁止滑动功能
         * @type {Boolean}
         */
        this.bScroll = false;
        /**
         * 是否需要循环，默认为false
         * @todo 没有实现
         * @type {Boolean}
         */
        this.bCirculate = false;
        /**
         * 每次移动完成后，需要改变位置的元素的索引
         * @type {[type]}
         */
        this.changeIndex = this.itemLength - 1;
        // incNum 为 偏移量
        if (this.opt.dir === 'left') {
            this.incNum = 1;
        } else if (this.opt.dir === 'right') {
            this.incNum = -1;
        } else {
            console.warn('dir should be left or right');
            console.warn('set dir default: left');
            this.incNum = 1;
        }
        this.changeIndex = (this.curIndex + this.incNum + this.itemLength) % this.itemLength;
        /**
         * 初始化需要改变元素的偏移量
         * @type {Number}
         */
        this.changeLeft = (this.curCount + this.incNum) * this.winWidth;
    }
    Carousel.prototype = {
        constructor: Carousel,
        /**
         * 初始化
         * @return {undefined} 
         */
        init: function() {
            console.log('init');
            if (this.itemLength === 1) {
                return;
            }
            this.initWrapPostion();
            this.initListPostion();
            this.bindTransitionHandler();
            this.bindTouchEvent();
        },
        /**
         * 绑定transitionend事件监听函数
         * @return {undefined} 
         */
        bindTransitionHandler: function() {
            var that = this;
            // 先取消以前的transition属性，否则之前的transition结束后会触发transitionend事件句柄
            this.ctElem.css({
                '-webkit-transition': 'none',
                'transition': 'none'
            });
            // 判断是否支持
            if (false === this.transitionSupport.bSupport) {
                return;
            }
            this.ctElem[0].addEventListener(this.transitionSupport.name, function() {
                console.log('transitionend');
                // 重置开关
                that.bScroll = false;
                that.setChange();
            }, false);
        },
        /**
         * 设置上两级父元素的位置，如在css设置，这里可以不设置最外层容器的高度
         * @return {undefined} 
         */
        initWrapPostion: function() {
            var that = this;
            console.log('initWrapPostion');
            resizeWrap();

            function resizeWrap() {
                var height = that.itemList.find('img').height();
                if (height === 0) {
                    setTimeout(resizeWrap, 500);
                    return;
                }
                that.wrapElem.css({
                    height: height
                });
            }
            console.log(this.itemList.find('img').height());
            this.wrapElem.css({
                height: this.itemList.find('img').height()
            });
            this.ctElem.css({
                width: this.itemLength * this.winWidth,
                position: 'relative',
            });
        },
        /**
         * 初始化列表的位置
         * @return {undefined} 
         */
        initListPostion: function() {
            var that = this;
            // 计算真实的宽度
            var marginLeft = parseInt(that.wrapElem.css('margin-left'), 10) || 0;
            var marginRight = parseInt(that.wrapElem.css('margin-right'), 10) || 0;
            that.width = that.winWidth - marginLeft - marginRight;
            // 排列列表的位置
            this.itemList.each(function(index, item) {
                var left = that.winWidth * index;
                if (index === that.itemLength - 1 && that.itemLength > 2) {
                    left = -that.winWidth;
                }
                setPostion(item, that.width, 'absolute', left);
            });

            function setPostion(elem, width, position, left) {
                console.log('setPostion');
                $(elem).css({
                    width: width,
                    position: position, //absolute',
                    left: left //that.this.winWidth * index
                });
            }
        },
        /**
         * 绑定相关的touch时间
         * @todo  这里处理比较Low，没有抽出通用的方法，后续完善
         * @return {} 
         */
        bindTouchEvent: function() {
            console.log('bindTouchEvent');
            var that = this;
            var offset = {
                x: 0,
                y: 0
            };
            if (this.itemLength === 2) {
                var bSpecial = true;
            }
            this.ctElem.bind('touchstart', function(e) {
                // 停止自动播放
                that.stopAuto();
                // 记录当前的点击的identifier及位置
                var touch = e.touches[0];
                that.touchId = touch.identifier;
                offset.x = touch.pageX;
                offset.y = touch.pageY;
            });
            this.ctElem.bind('touchmove', function(e) {
                // 如果正在移动中，则不做任何处理
                if (true === that.bScroll) {
                    console.log('scrolling');
                    return;
                }
                // 这里可以优化，当上下滑动时，不需要组织默认形式
                // 否则图片高度特别高的时候，无法向下滑动
                e.preventDefault();
                that.stopAuto();
                // 比较是否为touchstart时的触摸点
                var touch = e.changedTouches[0];
                if (that.touchId !== touch.identifier) {
                    that.touchId = null;
                    that.move(0);
                    return;
                }
                var offsetX = touch.pageX - offset.x;
                // 对于只有两个子元素做特殊处理
                if (bSpecial === true) {
                    that.curIndex = (that.curCount + 1) % that.itemLength;
                    // 两张图片的时候，滑动一张，另外一张要进行移动
                    // @todo增加排重,否则会多次触发修改
                    if (offsetX * that.incNum < 0) {
                        that.itemList.eq(that.curIndex).css({
                            'left': that.changeLeft
                        });
                    } else {
                        that.itemList.eq(that.curIndex).css({
                            'left': that.changeLeft - (that.winWidth * 2 * that.incNum)
                        });
                    }
                }
                if (Math.abs(offsetX) > 10) {
                    // 这里每次都回改transition的时间，android上性能未测试
                    that.ctElem.css({
                        '-webkit-transition': '0ms ' + that.opt.timeFunc,
                        '-webkit-transform': 'translate3d(' + (-that.winWidth * (that.curCount) + offsetX) + 'px,0,0)'
                    });
                }
                return false;
            });
            this.ctElem.bind('touchend', function(e) {
                if (true === that.bScroll) {
                    console.log('scrolling');
                    return;
                }
                var touch = e.changedTouches[0];
                if (that.touchId !== touch.identifier) {
                    // 不是同一个触摸点
                    that.touchId = null;
                    that.move(0);
                    that.bScroll = true;
                    return;
                }
                var offsetX = touch.pageX - offset.x;
                var moveDir = 0;
                // 确定最终的滑动方向
                if (Math.abs(offsetX) > that.winWidth / 10) {
                    if (offsetX > 0) {
                        moveDir = -1;
                    } else {
                        moveDir = 1;
                    }
                }
                that.move(moveDir);
                // 自动执行
                // @todo 增加opt的判断
                that.runAuto();
            });
        },
        /**
         * 滑动函数
         * @param  {Number} dirNum 偏移量
         * @return {}        
         */
        move: function(dirNum) {
            var _self = this;
            _self.IncNum = typeof dirNum === 'number' ? dirNum : _self.incNum;
            // 计算当前元素的索引和滑动的计数
            _self.curCount += _self.IncNum;
            _self.curIndex = _self.curCount % _self.itemLength;
            // 默认的设置
            // @todo 提到上面Merge
            var duration = _self.opt.duration || 250;
            var timeFunc = _self.opt.timeFunc || 'ease';
            _self.ctElem.css({
                '-webkit-transition': duration + 'ms ' + timeFunc,
                '-webkit-transform': 'translate3d(' + (-_self.winWidth * _self.curCount) + 'px,0,0)'
            });
            // 计算滑动结束后，需要改变位置的元素及其left值
            var changeNum = (_self.itemLength === 2 ? _self.incNum : _self.IncNum);
            _self.changeIndex = (_self.curIndex + changeNum + _self.itemLength) % _self.itemLength;
            _self.changeLeft = (_self.curCount + changeNum) * _self.winWidth;
            var transitionend = _self.transitionSupport;
            // 关闭滑动开关
            _self.bScroll = true;
            // 如果不transitionend不支持，做了个兼容处理，使用定时器来重置bScroll
            if (false === transitionend.bSupport) {
                setTimeout(function() {
                    _self.bScroll = false;
                    _self.setChange();
                }, duration);
            }
        },
        /**
         * 判断是否支持transitionend方法
         * @param  {} function( [description]
         * @return {Object}           是否支持的对象
         * @param {String} name  返回支持的事件名
         * @param {Boolean} bSupport 是否支持
         */
        transitionSupport: (function() {
            var support;
            console.log('isSupportTransition');
            var el = document.createElement('bootstrap')
            var transEndEventNames = {
                'WebkitTransition': 'webkitTransitionEnd',
                'MozTransition': 'transitionend',
                'OTransition': 'oTransitionEnd otransitionend',
                'transition': 'transitionend'
            }
            for (var name in transEndEventNames) {
                if (el.style[name] !== undefined) {
                    support = {
                        name: transEndEventNames[name],
                        bSupport: true
                    }
                    return support;
                }
            }
            support = {
                bSupport: false
            };
            return support;
        })(),
        setChange: function() {
            this.itemList.eq(this.changeIndex).css({
                'left': this.changeLeft
            });
        },
        runAuto: function(incNum) {
            var that = this;
            if (this.itemLength === 1) {
                return;
            }
            var lastTime;
            if (this.timeId === null) {
                this.timeId = setInterval(function() {
                    var curTime = +new Date();
                    if (false === that.bScroll) {
                        console.log('auto run');
                        that.move.call(that, this.incNum);
                    }
                    lastTime = curTime;
                }, this.opt.delay);
            }
        },
        stopAuto: function() {
            if (this.timeId) {
                clearInterval(this.timeId);
                this.timeId = null;
            }
        }
    };


    return {
        init: function(opts) {
            $(opts.wrapSelector).each(function(index, elem) {
                var item = new Carousel($(elem), opts);
                item.init();
                item.runAuto();
            });
        }
    }
});
