require(['js/carousel'], function(carousel) {
	$(document).ready(function() {
		console.log(carousel)
		carousel.init({
			wrapSelector: '.pc_banner',
			ctSelector: '.pc_banner>ul',
			delay: 2000,
			duration: 250,
			timeFunc: 'ease-in-out'
		});
		carousel.run();
		// carousel.init({
		// 	wrapSelector: '.pc_banner1',
		// 	ctSelector: '.pc_banner1>ul',
		// 	delay: 5000,
		// 	duration: 550,
		// 	timeFunc: 'ease'
		// });
	})
});