
window.onload = function(){
	var canvasElem = document.getElementById('gameScreen');
	var ctx = canvasElem.getContext('2d');
	
	var spriteConf = [
		{x:0,y:0}, 
		{x:39,y:0},
		{x:196,y:0}, 
		{x:236,y:0}, 
		{x:276,y:0}, 
		{x:315,y:0}, 
		{x:355,y:0}, 
		{x:394,y:0}, 
		{x:434,y:0}, 
		{x:473,y:0}, 
		{x:77,y:0}, 
		{x:117,y:0}, 
		{x:156,y:0}
	];
	var spritesheet  = 'images/ball-sprite.png';
	var balls = [];
	for(var i=0; i<spriteConf.length; i++) {
		var position = getPosition();
		this['ball' + i] = new Sprite(ctx, spritesheet, 36, 34, spriteConf[i].x, spriteConf[i].y, 0, 5, 5000);
		this['ball' + i].setPosition(position.x, position.y);
		balls.push(this['ball'+i]);
		this['ball' + i].animate = true;
	}
	var bgImg = new Image();
	bgImg.src = 'images/bg.jpg';
	
	var shadowImg = new Image();
	shadowImg.src = 'images/shadow.png';
	
	var tipImg = new Image();
	tipImg.src = 'images/choujiang.png';
	
	var coverImg = new Image();
	coverImg.src = 'images/cover.png';
	var coverOpenImg = new Image();
	coverOpenImg.src = 'images/cover-open.png';
	
	var playImg = new Image();
	playImg.src = 'images/playBtn.png';
	
	var dropBall = null;
	draw();
	
	function draw() {
		// 加载背景图
		if (bgImg.naturalWidth  != ctx)
			ctx.width = bgImg.naturalWidth ;
		if (bgImg.naturalHeight != ctx.height)
			ctx.height = bgImg.naturalHeight;
	
		ctx.clearRect(0, 0, ctx.width, ctx.height);
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, ctx.width, ctx.height);
		try{
			ctx.drawImage(bgImg, 0, 0);
		}catch(e){
			alert('draw bgImg');
		}
		try{
			ctx.drawImage(playImg, 130, 280);
		}catch(e){
			alert('draw playImg');
		}
	
		if(dropBall !== null) {
			ctx.drawImage(coverOpenImg, 263, 131);
		} else {
			ctx.drawImage(coverImg, 262, 148);
		}
		ctx.save();
		hitTest();
		ctx.drawImage(tipImg, 105, 90);
		ctx.drawImage(shadowImg, 80, 130);
		ctx.restore();
		setTimeout(draw, 20);
	}
	function hitTest() {
		var num = balls.length,
			diameter = 25, //距离
			spring = 0.08;//弹力加速度
		for (var i = 0; i < num-1; i++) {
			var hitBall = balls[i];
			hitBall.hitCount = 0;
			for (var j = i + 1; j < num; j++) {
				var hitedBall = balls[j];
				var dx = hitedBall.posX - hitBall.posX;
				var dy = hitedBall.posY - hitBall.posY;
				var dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < diameter) {
					var ax = ((hitBall.posX + dx / dist * diameter) - hitedBall.posX) * spring;
					var ay = ((hitBall.posY + dy / dist * diameter) - hitedBall.posY) * spring;
					hitBall.vx -= ax;
					hitBall.vy -= ay;
					hitedBall.vx += ax;
					hitedBall.vy += ay;
				} 
			}
		}
		if(awardsNum > -1 && dropBall === null) {
			dropBall = balls.splice(awardsNum,1)[0];
			dropBall.setPosition(255, 155);
			dropBall.setVelocity(0.5, 1)
			dropBall.needDetect = false;
		}
		if(dropBall !== null) {
			if(dropBall.animate == true) {
				dropBall.move();
			} else {
				dropBall.draw(ctx);
			}
		}
		for(i=0; i<balls.length; i++) {
			try{
				balls[i].move();
				
			}catch(e){
				//alert('draw ball' + i);
			}
		}
	}
	
	function start() {
		for(var i=0; i<balls.length; i++) {
			balls[i].resetVelocity();
		}
	}

	function getPosition() {
		var x = Math.ceil(86 + Math.random() * 120);
		var y = Math.sqrt(Math.abs(Math.pow(55, 2) - Math.pow(x-160, 2)));
		y = 173-y + Math.random()*2*y
		return {
			x: x,
			y: y
		}
	}
	var eventType = 'ontouchend' in document ? 'touchend' : 'click';
	canvasElem.addEventListener(eventType, touchendHandler, false);
	function touchendHandler(e) {
		var left, top;
		if('ontouchend' in document) {
			var touch = e.targetTouches[0] || e.changedTouches[0] || e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			left = touch.pageX-canvasElem.offsetLeft;
			top  = touch.pageY-canvasElem.offsetTop;
		} else {
			left = e.pageX-canvasElem.offsetLeft;
			top  = e.pageY-canvasElem.offsetTop;
		}
		if(left > 130 && left < 130 + playImg.naturalWidth  && top > 280 && top < 280+playImg.naturalHeight) {
			if(!playImg.bClick) {
				playImg.bClick = true;
				getAwardsJsonp();
				start();
			}
		}
	}
	var awardsNum = -1;
	window.showAwards = function (data) {
		if(typeof data === 'string') {
			data = JSON.parser(data);
		}
		awardsNum = data.result;
		var jsonpElem = document.getElementById('jsonp');
		document.getElementsByTagName('head')[0].removeChild(jsonpElem);
		window.showAwards = null;
	}
	function getAwardsJsonp(){
		var url = "http://fahao.game.people.com.cn/qg_choujiang/choujiang.php?type=2&callback=showAwards&userName=rechie1985";
		// 创建script标签，设置其属性
		var script = document.createElement('script');
		script.setAttribute('src', url);
		script.id = 'jsonp'
		script.onerror = function(e) {
			showAwards(0);
		}
		
		// 把script标签加入head，此时调用开始
		document.getElementsByTagName('head')[0].appendChild(script); 
	};
}
