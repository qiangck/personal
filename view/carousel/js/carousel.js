define(function() {
	function Carousel(wrapElem, opts) {
		this.opt = opts;
		this.wrapElem = wrapElem;
	}
	Carousel.prototype = {
		constructor: Carousel,
		init: function() {
			console.log('init')
			this.ctElem = this.wrapElem.find('ul');
			this.itemList = this.ctElem.children();
			this.itemLength = this.itemList.length;
			this.winWidth = $(window).width();
			this.curIndex = 0;
			this.curCount = 0;
			this.timeId = null;
			this.changeIndex = this.itemLength - 1;
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
			this.changeLeft = (this.curCount + this.incNum) * this.winWidth;
			this.initWrapPostion();
			this.initListPostion();
			this.bindTransitionHandler();
			this.bindTouchEvent();
		},
		bindTransitionHandler: function() {
			var that = this;
			// 先取消以前的transition属性，否则之前的transition结束后会触发transitionend事件句柄
			this.ctElem.css({
				'-webkit-transition': 'none',
				'transition': 'none'
			});
			this.ctElem[0].addEventListener('webkitTransitionEnd', function() {
				that.setChange.call(that)
			}, false);
		},
		// 设置上两级父元素的位置，如在css设置，这里可以不设置最外层容器的高度
		initWrapPostion: function() {
			console.log('initWrapPostion')
			this.wrapElem.css({
				height: this.itemList.find('img').height()
			});
			this.ctElem.css({
				width: this.itemLength * this.winWidth,
				position: 'relative',
			});
		},
		// 初始化列表的位置
		initListPostion: function() {
			var that = this;
			this.itemList.each(function(index, item) {
				var left = that.winWidth * index;
				if (index === that.itemLength - 1 && that.itemLength > 2) {
					left = -that.winWidth;
				}
				setPostion(item, that.winWidth, 'absolute', left);
			});

			function setPostion(elem, width, position, left) {
				console.log('setPostion')
				console.log(arguments);
				$(elem).css({
					width: width,
					position: position, //absolute',
					left: left //that.this.winWidth * index
				});
			}
		},
		bindTouchEvent: function() {
			console.log('bindTouchEvent')
			var that = this;
			var offset = {
				x: 0,
				y: 0
			}
			if (this.itemLength === 2) {
				var bSpecial = true;
			}
			this.ctElem.bind('touchstart', function(e) {
				that.stopAuto();
				var touch = e.touches[0]
				offset.x = touch.pageX;
				offset.y = touch.pageY;
			});
			this.ctElem.bind('touchmove', function(e) {
				that.stopAuto();
				var touch = e.changedTouches[0];
				var offsetX = touch.pageX - offset.x;
				// 对于只有两个子元素做特殊处理
				if (bSpecial === true) {
					that.curIndex = (that.curCount + 1) % that.itemLength;
					if (offsetX * that.incNum < 0) {
						that.itemList.eq(that.curIndex).css({
							'left': that.changeLeft
						})
					} else {
						that.itemList.eq(that.curIndex).css({
							'left': that.changeLeft - (that.winWidth * 2 * that.incNum)
						})
					}
				}
				if (Math.abs(offsetX) > 10) {
					that.ctElem.css({
						'-webkit-transition': '0ms ' + that.opt.timeFunc,
						'-webkit-transform': 'translate3d(' + (-that.winWidth * (that.curCount) + offsetX) + 'px,0,0)'
					});
				}
			});
			this.ctElem.bind('touchend', function(e) {
				var touch = e.changedTouches[0];
				var offsetX = touch.pageX - offset.x;
				var moveDir = 0;
				if (Math.abs(offsetX) > that.winWidth / 10) {
					if (offsetX > 0) {
						moveDir = -1;
					} else {
						moveDir = 1;
					}
				}
				that.move(moveDir);
				that.runAuto();
			});
		},
		move: function(dirNum) {
			this.IncNum = typeof dirNum === 'number' ? dirNum : this.incNum;
			this.curCount += this.IncNum;
			this.curIndex = this.curCount % this.itemLength;
			var duration = this.opt.duration || 250;
			var timeFunc = this.opt.timeFunc || 'ease'
			this.ctElem.css({
				'-webkit-transition': duration + 'ms ' + timeFunc,
				'-webkit-transform': 'translate3d(' + (-this.winWidth * this.curCount) + 'px,0,0)'
			});
			var changeNum = (this.itemLength === 2 ? this.incNum : this.IncNum)
			this.changeIndex = (this.curIndex + changeNum + this.itemLength) % this.itemLength;
			this.changeLeft = (this.curCount + changeNum) * this.winWidth;
		},
		setChange: function() {
			this.itemList.eq(this.changeIndex).css({
				'left': this.changeLeft
			})
		},
		runAuto: function(incNum) {
			var that = this;
			if (this.timeId === null) {
				this.timeId = setInterval(function() {
					that.move.call(that, this.incNum)
				}, this.opt.delay);
			}
		},
		stopAuto: function() {
			if (this.timeId) {
				clearInterval(this.timeId);
				this.timeId = null;
			}
		}
	}
	
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