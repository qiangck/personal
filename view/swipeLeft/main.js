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
        if(this.target.className.indexOf('btn') > -1) {
            return true;
        }
    	if(swipeLeftFlag === true) {
    		var count = 0;
    		elems.forEach(function(obj, index) {
    			var reg = /[-]?\d+/ig;
                var curoffset = obj.getElementsByTagName('span')[0].style['transform'] || 0;
                if(curoffset) {
                    curoffset = curoffset.replace(/[0-9]d/ig, '').match(reg)[0]
                }
    			// var curoffset = obj.getElementsByTagName('span')[0].style.cssText.match(reg) || 0;
                console.log(curoffset)
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
        this.getElementsByTagName('span')[0].style['transform'] = 'translate3d(' + Xoffset + 'px,0,0)'
    },
    swipeEnd: function(Xoffset) {
        var elem = this.getElementsByTagName('span')[0];
        if(Xoffset > 0) {
            Animate(elem, offsetLimit.max);
        } else if(Math.abs(Xoffset) < 50) {
            Animate(elem, Xoffset);
        } else if(Math.abs(Xoffset) > 49) {
            Xoffset < offsetLimit.min ? Xoffset = offsetLimit.min : ''
            Animate(elem, Xoffset, offsetLimit.min);
            swipeLeftFlag = true;
        }
    }   
}
var count = 0;
/**
 * 位移动画
 * @param {zepto object} $elem        zepto封装的对象
 * @param {Number} Xoffset      现在的偏移量
 * @param {Number} targetOffset 要移动到的偏移量
 */
function Animate($elem, Xoffset, targetOffset, callback) {
    targetOffset = targetOffset ? targetOffset : 0;
    $elem.style['transform'] = 'translate3d(' + Xoffset + 'px, 0, 0)';
    // console.log('Xoffset', Xoffset);
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
	window.swipe = new Swipe(options);
    swipe.init()
	FastClick.attach(document.querySelectorAll('.container')[0]);
    console.log(document.querySelectorAll('.container')[0])
	document.querySelectorAll('.container')[0].addEventListener('click', function(e) {
        var target = e.target;
		if(!swipeLeftFlag && target.className.indexOf('title') > -1) {
			console.log('title click')
		} else if(target.className.indexOf('btn') > -1) {
            console.log('delete click');
        }
	});
}