define(['./RC'], function(){
	/**
	 * TODO 事件处理函数，想分开为兼容PC的全版本和只兼容移动端的移动版本
	 * 先封装只兼容移动端的版本
	 * @type {Object}
	 */
	var EventUtil = {
		// TODO 不支持winPhone 
		touchable: 'ontouchend' in document,
		TYPE: {
	        TOUCH_START: 'touchstart',
	        TOUCH_MOVE: 'touchmove',
	        TOUCH_END: 'touchend',
		},
		/**
		 * 绑定事件函数
		 * TODO 考虑是否可以实现一个内部的handlerMap把传入的handler都封装成一个个的独立函数，这样可以在remove的时候都remove掉?
		 * \TODO 作用域问题，是否可以把handler中的event对象提取出来单独封装后再执行回调函数
		 * @param  {[type]} elem       [description]
		 * @param  {[type]} type       [description]
		 * @param  {[type]} handler    [description]
		 * @param  {[type]} useCapture [description]
		 * @return {[type]}            [description]
		 */
		addEventListener: function(elem, type, handler, useCapture) {
			if(elem.addEventListener) {
				elem.addEventListener(type, handler, useCapture);
			} else if (elem.attachEvent) {
				elem.attachEvent('on' + type, handler);
			} else {
				elem['on' + type] = handler;
			}
		},
		removeEventListener: function(elem, type, handler) {
			if(elem.removeEventListener) {
				elem.removeEventListener(type, handler);
			} else if (elem.detacjEvent) {
				elem.detacjEvent('on' + type, handler);
			} else {
				elem['on' + type] = null;
			}
		},
		fixEvent: function(event) {
			event = event || window.event;
		},
		getTarget: function(event) {
			return event.target || event.srcElement;
		}
	};
    return EventUtil;
});