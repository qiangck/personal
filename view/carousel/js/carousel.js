define(function() {
	var carousel = (function() {

		var opt = {};
		var ctElem, 
			itemList, 
			itemLength, 
			winWidth, 
			curIndex = 0,
			curCount = 0,
			timeId = null,
			changeIndex, 
			incNum, 
			changeLeft;
		var carousel = {
			init: function(opts) {
				console.log('init')
				opt = opts;
				ctElem = $(opt.ctSelector); //$('.pc_banner>ul');
				itemList = ctElem.children();
				itemLength = itemList.length;
				winWidth = $(window).width();
				curIndex = 0;
				curCount = 0;
				timeId = null;
				changeIndex = itemLength - 1;
				incNum = 1;
				this.initWrapPostion();
				this.initListPostion();
				this.bindTransitionHandler();
				this.bindTouchEvent();
			},
			bindTransitionHandler: function() {
				var that = this;
				// 先取消以前的transition属性，否则之前的transition结束后会触发transitionend事件句柄
				ctElem.css({
					'-webkit-transition': 'none',
					'transition': 'none'
				});
				ctElem[0].addEventListener('webkitTransitionEnd', function() {
					that.setChange.call(that)
				}, false);
			},
			// 设置上两级父元素的位置，如在css设置，这里可以不设置最外层容器的高度
			initWrapPostion: function() {
				console.log('initWrapPostion')
				$(opt.wrapSelector).css({
					height: itemList.find('img').height()
				});
				ctElem.css({
					width: itemLength * winWidth,
					position: 'relative',
				});
			},
			// 初始化列表的位置
			initListPostion: function() {
				var that = this;
				itemList.each(function(index, item) {
					var left = winWidth * index;
					if (index === itemLength - 1) {
						left = -winWidth;
					}
					setPostion(item, winWidth, 'absolute', left);
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
				console.log('bindTouchEvent')
				var that = this;
				var offset = {
					x: 0,
					y: 0
				}
				ctElem.bind('touchstart', function(e) {
					console.log('touchstart')
					that.stopAuto();
					var touch = e.touches[0]
					offset.x = touch.pageX;
					offset.y = touch.pageY;
				});
				ctElem.bind('touchmove', function(e) {
					that.stopAuto();
					var touch = e.changedTouches[0];
					var offsetX = touch.pageX - offset.x;
					if (Math.abs(offsetX) > 10) {
						ctElem.css({
							'-webkit-transition': '0ms ' + opt.timeFunc,
							'-webkit-transform': 'translate3d(' + (-winWidth * (curCount) + offsetX) + 'px,0,0)'
						});
					}
				});
				ctElem.bind('touchend', function(e) {
					var touch = e.changedTouches[0];
					var offsetX = touch.pageX - offset.x;
					if (Math.abs(offsetX) < winWidth / 10) {
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
				incNum = typeof num === 'number' ? num : incNum;
				curCount += incNum;
				curIndex = curCount % itemLength;
				var duration = opt.duration || 250;
				var timeFunc = opt.timeFunc || 'ease'
				ctElem.css({
					'-webkit-transition': duration + 'ms ' + timeFunc,
					'-webkit-transform': 'translate3d(' + (-winWidth * curCount) + 'px,0,0)'
				});
				changeIndex = (curIndex + incNum + itemLength) % itemLength;
				changeLeft = (curCount + incNum) * winWidth;
			},
			setChange: function() {
				itemList.eq(changeIndex).css({
					'left': changeLeft
				})
			},
			runAuto: function(incNum) {
				var that = this;
				if (timeId === null) {
					timeId = setInterval(function() {
						that.move.call(that, incNum)
					}, opt.delay);
				}
			},
			stopAuto: function() {
				if (timeId) {
					clearInterval(timeId);
					timeId = null;
				}
			}
		}
		return carousel;
	})();
	return {
		init: carousel.init.bind(carousel),
		run: carousel.runAuto.bind(carousel),
		stop: carousel.stopAuto.bind(carousel)
	}
});