require(['js/carousel'], function(carousel) {
	$(document).ready(function() {
		console.log(carousel)
		carousel.init({
			wrapSelector: '.pc_banner',
			delay: 2000,
			duration: 300,
			timeFunc: 'ease-in-out'
		});
	})
});
