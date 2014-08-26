var Sprite = function(ctx, src, width, height, offsetX, offsetY, frames, duration) {
	this.ctx = ctx
	this.spritesheet = null;
	this.offsetX = 0;
	this.offsetY = 0;
	this.vx =  Math.random() * 6 - 3;
	this.vy =  Math.random() * 6 - 3;
	this.lastVx = this.vx;
	this.lastVy = this.vy;
	this.width = width;
	this.height = height;
	this.frames = 1;
	this.currentFrame = 0;
	this.duration = 1;
	this.animate = true;
	this.posX = 0;
	this.posY = 0;
	this.needDetect = true; //是否需要检测
	this.shown = true;
	this.zoomLevel = 1;
	this.setSpritesheet(src);
	this.setOffset(offsetX, offsetY);
	this.setFrames(frames);
	this.setDuration(duration);
	var d = new Date();
	if(this.duration > 0 && this.frames > 0) {
		this.ftime = d.getTime() + (this.duration/this.frames);
	} else {
		this.ftime = 0;
	}
};

Sprite.prototype.setContext = function(ctx) {
	this.ctx = ctx;
}

Sprite.prototype.resetVelocity = function() {
	this.hitCount = 0;
	this.vx =  Math.random() * 100 - 60;
	this.vy =  Math.random() * 100 - 60;
}

Sprite.prototype.setVelocity = function(vx, vy) {
	this.vx = vx;
	this.vy = vy;
}

Sprite.prototype.setSpritesheet = function(src) {
	if(src instanceof Image) {
		this.spritesheet = src;
	} else {
		this.spritesheet = new Image();
		this.spritesheet.src = src;
	}
};

Sprite.prototype.setPosition = function(x, y) {
	this.posX = x;
	this.posY = y;
}

Sprite.prototype.setOffset = function(x, y) {
	this.offsetX = x;
	this.offsetY = y;
}

Sprite.prototype.setFrames = function(fcount) {
	this.currentFrame = 0;
	this.frames = fcount;
}

Sprite.prototype.setDuration = function(duration) {
	this.duration = duration;
}

// 系列图片的变化动画，例如walk
Sprite.prototype.animate = function(c, t) {
	if(t.getMilliseconds() > this.ftime) {
		this.nextFrame();
	}
	this.draw(c);
}

Sprite.prototype.nextFrame = function() {
	if(this.duration > 0 ) {
		var d = new Date();
	} 
	if(this.duration > 0 && this.frames > 0) {
		this.ftime = d.getTime() + (this.duration / this.frames);
	} else {
		this.ftime = 0;
	}
	this.offsetX = this.width * this.currentFrame;
	if(this.currentFrame === (this.frames -1)) {
		this.currentFrame = 0;
	} else {
		this.currentFrame++;
	}
}

Sprite.prototype.move = function() {
	var bounce = -0.85;
	var gravity = 0.1;

	var BC = bounce, BX = this.posX, BT = this.posY;
	this.vy += gravity;
	var left = (BX+ this.vx);
	var top = (BT + this.vy);
	// 圆形检测
	// TODO提出来单独配置
	if(this.needDetect === true) {
		var point = {
			x: 160,
			y: 173,
			diameter: 180
		};
		var xDistance = left + this.width/2 - point.x;
		var yDistance = top + this.height/2 - point.y;
		if((xDistance * xDistance + yDistance * yDistance) * 2 > (point.diameter/2 + this.width/2) * (point.diameter/2 + this.width/2)) {

			this.vx *= BC;
			this.vy *= BC;
			left = BX;
			top  = BT;
		}
	} else {
		if(this.posY > 280) {
			if(Math.abs(this.vy*BC) + gravity > Math.abs(this.vy)) {
				this.animate = false;
			} else {
				this.vx *= BC;
				this.vy *= BC;
				left = BX + this.vx;
				top = BT + this.vy;
			}
		}
	}
	this.setPosition(left, top)
	this.draw(this.ctx);
}


Sprite.prototype.draw = function(c) {
	if(this.shown) {
		c.drawImage(this.spritesheet, this.offsetX, this.offsetY, this.width, this.height, this.posX, this.posY, this.width*this.zoomLevel, this.height*this.zoomLevel);
	}
}
