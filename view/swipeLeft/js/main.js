// document.onreadystatechange = function () { 
// 	if(document.readyState == "complete"){ 
// 		init();
// 	}  
// }
require.config({

});
require(['js/SwipeList', 'js/Fastclick'], function(SwipeList, FastClick) {
    FastClick.attach(document.body);
    var swipeOpts = {
        offsetLimit: {
            max: 20,
            min: -100
        },
        elemQuery: '.container ul li',
        animElemQuery: '.title',
        respOffset: 5,
        criticalityOffset: 50
    };
    var swipeList = new SwipeList(swipeOpts);
    document.querySelectorAll('.container')[0].addEventListener('click', function(e) {
        var target = e.target;
        if (target.className.indexOf('title') > -1) {
            console.log('title click')
        } else if (target.className.indexOf('btn') > -1) {
            console.log('delete click');
        }
    });
})