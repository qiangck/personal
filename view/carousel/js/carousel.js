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
			needResetOther = true,
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
				if(opt.dir === 'left') {
					incNum = 1;
				} else if(opt.dir === 'right') {
					incNum = -1;
				} else {
					console.warn('dir should be left or right');
					console.warn('set dir default: left');
					incNum = 1;
				}
				changeIndex = (curIndex + incNum + itemLength) % itemLength;
				changeLeft = (curCount + incNum) * winWidth;
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
					if (index === itemLength - 1 && itemLength > 2) {
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
				if (itemLength === 2) {
					var bSpecial = true;
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
					// 对于只有两个子元素做特殊处理
					console.log(changeLeft);
					if (bSpecial === true) {
						var curIndex = (curCount + 1) % itemLength;
						// console.log(curIndex)
						// console.log(changeLeft, 'changeLeft')
						if (offsetX * incNum < 0) {
							itemList.eq(curIndex).css({
								'left': changeLeft
							})
						} else {
							itemList.eq(curIndex).css({
								'left': changeLeft - (winWidth * 2 * incNum)
							})
						}
					}
					if (Math.abs(offsetX) > 10) {
						ctElem.css({
							'-webkit-transition': '0ms ' + opt.timeFunc,
							'-webkit-transform': 'translate3d(' + (-winWidth * (curCount) + offsetX) + 'px,0,0)'
						});
					}
				});
				ctElem.bind('touchend', function(e) {
					console.log('touchend');
					var touch = e.changedTouches[0];
					var offsetX = touch.pageX - offset.x;
					var moveDir = 0;
					if (Math.abs(offsetX) > winWidth / 10) {
						if (offsetX > 0) {
							moveDir = -1;
						} else {
							moveDir = 1;
						}
					}
					if (moveDir * incNum < 0 && bSpecial) {
						// needResetOther = false;	
					}
					that.move(moveDir);
					that.runAuto();
				});
			},
			move: function(dirNum) {
				var curIncNum = typeof dirNum === 'number' ? dirNum : incNum;
				curCount += curIncNum;
				curIndex = curCount % itemLength;
				var duration = opt.duration || 250;
				var timeFunc = opt.timeFunc || 'ease'
				ctElem.css({
					'-webkit-transition': duration + 'ms ' + timeFunc,
					'-webkit-transform': 'translate3d(' + (-winWidth * curCount) + 'px,0,0)'
				});
				console.log('curCount', curCount);
				console.log('curIncNum', curIncNum);
				var changeNum = (itemLength === 2 ? incNum : curIncNum)
				changeIndex = (curIndex + changeNum + itemLength) % itemLength;
				changeLeft = (curCount + changeNum) * winWidth;
				console.log('changeLeft', changeLeft);
			},
			setChange: function() {
				console.log('setChange')
				if (needResetOther === true) {
					itemList.eq(changeIndex).css({
						'left': changeLeft
					})
				}
				needResetOther = true;
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