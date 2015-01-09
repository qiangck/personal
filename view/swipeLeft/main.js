document.onreadystatechange = function () { 
	if(document.readyState == "complete"){ 
		init();
	}  
}
var offsetLimit = {
    max: 30,
    min: -100
};
var swipeLeftFlag = false;
var options = {
    elemQuery: '.container ul li',
    direction: 'horizontal',
    respOffset: 15, 
    beforeSwipe: function(elems) {
    	if(swipeLeftFlag === true) {
    		var count = 0;
    		elems.forEach(function(obj, index) {
    			var reg = /(\+|\-\d*)/ig;
    			var curoffset = obj.getElementsByTagName('span')[0].style.cssText.match(reg);
    			Animate(obj.getElementsByTagName('span')[0], curoffset, 0, function() {
    				count ++;
    				if(count > elems.length-1) {
    					swipeLeftFlag = false;
    				}
    			});
    		});
    	}
    	return swipeLeftFlag;
    },
    swipeMove: function(Xoffset){
        if(Xoffset < offsetLimit.min ||  Xoffset > offsetLimit.max) {
            return;
        }
        this.getElementsByTagName('span')[0].style['transform'] = 'translateX(' + Xoffset + 'px)'
    },
    swipeEnd: function(Xoffset) {
        if(Xoffset > 0) {
            Animate(this.getElementsByTagName('span')[0], offsetLimit.max);
        } else if(Math.abs(Xoffset) < 50) {
            Animate(this.getElementsByTagName('span')[0], Xoffset);
        } else if(Math.abs(Xoffset) > 49) {
            Xoffset < offsetLimit.min ? Xoffset = offsetLimit.min : ''
            Animate(this.getElementsByTagName('span')[0], Xoffset, offsetLimit.min);
            swipeLeftFlag = true;
        }
    }   
}
/**
 * 位移动画
 * @param {zepto object} $elem        zepto封装的对象
 * @param {Number} Xoffset      现在的偏移量
 * @param {Number} targetOffset 要移动到的偏移量
 */
function Animate($elem, Xoffset, targetOffset, callback) {
    targetOffset = targetOffset ? targetOffset : 0;
    $elem.style['transform'] = 'translateX(' + Xoffset + 'px)'
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
        Animate($elem, Xoffset, targetOffset, callback);
    });
}
function init(){
	var swipe = new Swipe(options);
	FastClick.attach(document.querySelectorAll('.container')[0]);
	document.querySelectorAll('.container')[0].addEventListener('click', function() {
		if(!swipeLeftFlag) {
			console.log(123)
		}
	});
}