
	var carousel = {
		init: function(opt) {
			this.opt = opt;
			this.ctElem = $(opt.ctSelector); //$('.pc_banner>ul');
			this.itemList = this.ctElem.children();
			this.itemLength = this.itemList.length;
			this.winWidth = $(window).width();
			this.curIndex = 0;
			this.curCount = 0;
			this.timeId = null;
			this.changeIndex = this.itemLength - 1;
			this.incNum = 1;
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
			$(this.opt.wrapSelector).css({
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
			that.itemList.each(function(index, item) {
				var left = that.winWidth * index;
				if (index === that.itemLength - 1) {
					left = -that.winWidth;
				}
				setPostion(item, that.winWidth, 'absolute', left);
			})

			function setPostion(elem, width, position, left) {
				$(elem).css({
					width: width,
					position: position, //absolute',
					left: left //that.winWidth * index
				})
			}
		},
		bindTouchEvent: function() {
			var that = this;
			var offset = {
				x: 0,
				y: 0
			}
			that.ctElem.bind('touchstart', function(e) {
				that.stopAuto();
				var touch = e.touches[0]
				offset.x = touch.pageX;
				offset.y = touch.pageY;
			});
			that.ctElem.bind('touchmove', function(e) {
				that.stopAuto();
				var touch = e.changedTouches[0];
				var offsetX = touch.pageX - offset.x;
				if (Math.abs(offsetX) > 10) {
					that.ctElem.css({
						'-webkit-transition': '0ms ' + that.opt.timeFunc,
						'-webkit-transform': 'translate3d(' + (-that.winWidth * (that.curCount) + offsetX) + 'px,0,0)'
					});
				}
			});
			that.ctElem.bind('touchend', function(e) {
				var touch = e.changedTouches[0];
				var offsetX = touch.pageX - offset.x;
				if (Math.abs(offsetX) < that.winWidth / 10) {
					that.move(0);
				} else {
					if (offsetX > 0) {
						that.move(-1);
					} else {
						that.move(1);
					}
				}
				that.runAuto();
			});
		},
		move: function(num) {
			var incNum = typeof num === 'number' ? num : this.incNum;
			this.curCount += incNum;
			this.curIndex = this.curCount % this.itemLength;
			var duration = this.opt.duration || 250;
			var timeFunc = this.opt.timeFunc || 'ease'
			this.ctElem.css({
				'-webkit-transition': duration + 'ms ' + timeFunc,
				'-webkit-transform': 'translate3d(' + (-this.winWidth * this.curCount) + 'px,0,0)'
			});
			this.changeIndex = (this.curIndex + incNum + this.itemLength) % this.itemLength;
			this.changeLeft = (this.curCount + incNum) * this.winWidth;
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
					that.move.call(that, incNum)
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