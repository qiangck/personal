document.onreadystatechange = function () { 
	if(document.readyState == "complete"){ 
		init();
	}  
}
var offsetLimit = {
    max: 30,
    min: -100
};
var options = {
    elemQuery: '.container ul li',
    direction: 'horizontal',
    respOffset: 15, 
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
        }
    }   
}
/**
 * 位移动画
 * @param {zepto object} $elem        zepto封装的对象
 * @param {Number} Xoffset      现在的偏移量
 * @param {Number} targetOffset 要移动到的偏移量
 */
function Animate($elem, Xoffset, targetOffset) {
    targetOffset = targetOffset ? targetOffset : 0;
    $elem.style['transform'] = 'translateX(' + Xoffset + 'px)'
    if(Xoffset == targetOffset) {
        return;
    }
    if(Xoffset > targetOffset) {
        Xoffset --;
    } else {
        Xoffset ++
    }
    setTimeout(function() {
        Animate($elem, Xoffset, targetOffset);
    });
}
function init(){
	var swipe = new Swipe(options);
	FastClick.attach(document.querySelectorAll('.container')[0]);
	document.querySelectorAll('.container')[0].addEventListener('click', function() {
		console.log(123)
	});
}