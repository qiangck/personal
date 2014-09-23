

// 总控制
var Game = function(options){
	this._score = 0;
	this._hitCombo = 0;
	this._maxCombo = 0;
	this.init();
	// 游戏开关
};

/**
 * initialize
 * @return {[type]} [description]
 */
Game.prototype.init = function() {
};

Game.prototype.assetLoadStatus = true;
Game.prototype.loadImg = function(callback) {
    var loader = new AssetLoad({
        success: callback
    });
    var imgList = [
        'assets/images/pa0.png',
        'assets/images/pa1.png',
        'assets/images/pa2.png',
        'assets/images/pa3.png',
        'assets/images/pa4.png',
        'assets/images/pa4.png',
        'assets/images/dongzuo/donghuaM1.png',
        'assets/images/dongzuo/donghuaM2.png',
        'assets/images/dongzuo/donghuaM3.png',
        'assets/images/dongzuo/donghuaM4.png',
        'assets/images/dongzuo/donghuaM5.png',
        'assets/images/dongzuo/donghuaM6.png',
        'assets/images/dongzuo/donghuaM7.png',
        'assets/images/dongzuo/donghuaM8.png',
        'assets/images/dongzuo/donghuaM9.png',
        'assets/images/dongzuo/donghuaW1.png',
        'assets/images/dongzuo/donghuaW2.png',
        'assets/images/dongzuo/donghuaW3.png',
        'assets/images/dongzuo/donghuaW4.png',
        'assets/images/dongzuo/donghuaW5.png',
        'assets/images/dongzuo/donghuaW6.png',
        'assets/images/dongzuo/donghuaW7.png',
        'assets/images/dongzuo/donghuaW8.png',
        'assets/images/dongzuo/donghuaW9.png'
    ];
    imgList.forEach(function(obj, index) {
        loader.preLoadImg(obj);
    });
    loader.load();

}

Game.prototype.setScore = function(score) {
	this._score = score;
};

Game.prototype.getScore = function() {
	return this._score;
};


Game.prototype.setTimer = function(timer) {
	this.timer = timer;
}

/**
 * drag rubbish to bins
 * @param  {[ElementObject]} dragEl [description]
 * @param  {[ElementObject]} dropEl [description]
 * @return {[type]}        [description]
 */
Game.prototype.dropTo = function(dragEl, dropEl) {
	if(this.timer.running === false) {
		return;
	}
	if($(dragEl).data('category') === $(dropEl).data('category')) {
		this.goal(dragEl, dropEl);
	} else {
		this.failed(dragEl, dropEl);
	}
	this.refreshItem(dragEl.parent());
};

/**
 * 成功得分
 * @return {[type]} [description]
 */
Game.prototype.goal = function(dragEl, dropEl) {
	this.setScore(this._score  + 1);
	Game.View.setScore(this._score);
};


/**
 * start the game
 * @return {[type]} [description]
 */
Game.prototype.start = function(callback) {
	var that = this;
	if(this.timer.running === true) {
		console && console.log('游戏正在进行，请勿作弊.')
		return ;
	}
	if(!that.assetLoadStatus) {
		$('#gameIntro .content').css('visibility', 'hidden');
		$('#prograss').show();
		this.loadImg(function(){
			that.assetLoadStatus = true;
			go();
		});
	} else {
		console.log('no load');
		go();
	}
	function go(){
        console.log('go')
		if(that.timer != null) {
			$('#gameIntro').hide();
			$('#gameScreen').show();
			that.timer.run();
            if(typeof callback == 'function') {
                callback();
            }
		}
	}
};

Game.prototype.reset = function() {
	this._score = 0;
	this._hitCombo = 0;
	this._maxCombo = 0;
	Game.View.setScore(this._score);
};

Game.prototype.replay = function() {
	console && console.log('重启游戏.');
	try{
		this.reset();
		this.timer.reset();
		this.start();
	} catch(e) {
		console.log(e.stack)
	}
};

Game.Utils = Game.Utils || {};

Game.prototype.stop = function() {
	this.timer.running = false;
};
/**
 * 视图控制
 * @type {Object}
 */
Game.View = {
	scoreTimeId : null,
	setTimer: function(current, sum) {
		var remain = sum - current;
        if(remain == 0) {
            return;
        }
		$('#timer').html((remain<10 ? ('0' + remain ): remain) + '<span>秒</span>');
	},
	setHitCombo: function(hitCombo) {
		$('#hitCombo').html(hitCombo);
	},
	setScore: function(score) {
		// 补零方法
	    var len = score.toString().length;
//	    while(len < 3) {
//	        score = "0" + score;
//	        len++;
//	    }
		$('#score').html(score + '<span>次</span>').addClass('hit-count-anim');
        setTimeout(function(){
            $('#score').removeClass('hit-count-anim');
        }, 100)
	},
	/**
	 * 得分状态，true显示成功图标，false显示X
	 * @param  {[type]} bScored [description]
	 * @return {[type]}         [description]
	 */
	changeStatus: function(target, bScored) {
		// console.log(target);
		var $parent = $(target).parent();
		var childSelector = bScored ? '.scored' : '.failed';
		$parent.find(childSelector).show();
		if(Game.View.scoreTimeId !== null) {
			clearTimeout(Game.View.scoreTimeId);
		}
		Game.View.scoreTimeId = setTimeout(function() {
			Game.View.hideStatus();
		}, 1000);
	},
	hideStatus: function() {
		$('.scored').hide();
		$('.failed').hide();
	},
	reset: function() {
		$('#timer').html('60<span>秒</span>');
	}
};


// 计时器
Game.Time = function(opt) {
	this.init(opt);
};

Game.Time.prototype.init = function(opt) {
	this.sum = opt.sum || 60;
	this.add = opt.add;
	this.minus = opt.minus;
	this.countFunc = opt.countFunc;
	this.end = opt.end;
	this.timeId = null;
	this.running = false;
	this.current = 0;
};

Game.Time.prototype.run = function() {
	var that = this;
	this.running = true;
	that.timeId = setTimeout(function(){
		if(that.current < that.sum-1) {
			that.current ++
			that.run.call(that);
			that.countFunc(that.current, that.sum);
		} else {
			that.running = false;
            // 结束时，移除事件监听绑定
			console && console.log('game over');
			if(typeof that.end === 'function') {
				that.end.call(that);
			}
		}
	}, 1000)
};
Game.Time.prototype.stop = function() {
	clearTimeout(this.timeId);
};	

Game.Time.prototype.reset = function() {
	this.running = false;
	clearTimeout(this.timeId);
	this.current = 0;
	Game.View.reset();
};
Game.Time.prototype.doMinus = function() {
	this.current += this.minus;
	if(this.current > this.sum) {
		this.current = this.sum;
	}
	this.countFunc(this.current, this.sum);
};

Game.Animate ={
    bAnimate : false,
    timeId : null,
    timeDelay : 500,
    timeBegin : 0,
    timeNow : 0,
    frameObj : {
        'man_0': 'assets/images/dongzuo/donghuaM1.png',
        'man_1': 'assets/images/dongzuo/donghuaM2.png',
        'man_2': 'assets/images/dongzuo/donghuaM3.png',
        'man_3': 'assets/images/dongzuo/donghuaM4.png',
        'man_4': 'assets/images/dongzuo/donghuaM5.png',
        'man_5': 'assets/images/dongzuo/donghuaM6.png',
        'man_6': 'assets/images/dongzuo/donghuaM7.png',
        'man_7': 'assets/images/dongzuo/donghuaM8.png',
        'man_8': 'assets/images/dongzuo/donghuaM9.png',
        'woman_0': 'assets/images/dongzuo/donghuaW1.png',
        'woman_1': 'assets/images/dongzuo/donghuaW2.png',
        'woman_2': 'assets/images/dongzuo/donghuaW3.png',
        'woman_3': 'assets/images/dongzuo/donghuaW4.png',
        'woman_4': 'assets/images/dongzuo/donghuaW5.png',
        'woman_5': 'assets/images/dongzuo/donghuaW6.png',
        'woman_6': 'assets/images/dongzuo/donghuaW7.png',
        'woman_7': 'assets/images/dongzuo/donghuaW8.png',
        'woman_8': 'assets/images/dongzuo/donghuaW9.png'
    },
    twitch : function(level, sex, frame, dir){
        var that = this;
        if(Game.Animate.bAnimate === false) {
            this.timeBegin = new Date();
            this.bAnimate = true;
            innerAnimate(level, sex, frame, dir);
        }
        function innerAnimate(level, sex, frame, dir, index){
            that.timeNow = new Date();
            //var key = sex + '_' +  level + '_' + frame%3;
            if(that.timeNow - that.timeBegin < that.timeDelay && (typeof index === 'undefined' || index < 10)) {
                Game.Animate.bAnimate = true;
//                $('#gameScreen .shenti img').attr('src', Game.Animate.frameObj[key]);
                if(typeof index === 'undefined') {
                    index = (dir === 'right') ? 1 : 2;
                }
                $('#gameScreen .shenti img').attr('src', Game.Animate.frameObj[sex + '_' + index]);
//                $('#userWrap').animate({
//                    top: 10 * (frame%3-1)
//                }, 10);
                that.timeId = setTimeout(function(){
                    innerAnimate(level, sex, frame+1, dir,  index + 2);
                }, 120);
            } else {
                that.bAnimate = false;
                key = sex + '_' + 0;
                $('#gameScreen .shenti img').attr('src', Game.Animate.frameObj[key]);
//                $('#userWrap').css({'top': 0});
                that.timeBegin = 0;
                that.timeNow = 0;
            }
        }
    }
}


/**
 * 资源加载器
 * @return {[type]} [description]
 */
var AssetLoad = function(conf){
	this.conf = conf;
	this.urlList = [];
	this.sum = 0;
	this.current = 0;
    this.errorList = [];
};
AssetLoad.prototype.preLoadImg = function(imgUrl) {
	if(this.urlList.indexOf(imgUrl) < 0) {
		this.urlList.push(imgUrl);
	}
};	
AssetLoad.prototype.load = function() {
	var that = this;
	that.current = 0;
	that.urlList.forEach(function(imgUrl, index) {
		that.loadImage(imgUrl);
	});
};
AssetLoad.prototype.loadImage = function(imgUrl) {
	var that = this;
	var image = new Image();
	image.onload = function(){
		that.showPrograss.apply(that, arguments);
	};
	image.onerror = function(e){
        that.errorList.push(e.message || e);
        that.showPrograss.apply(that, arguments);
	};
	image.src = imgUrl;
};
AssetLoad.prototype.showPrograss = function(event) {
	this.current ++;
	var prograss = this.current / this.urlList.length * 100;
	var prograssElem = document.querySelector('#progress span');
    prograssElem.innerHTML = (prograss|0) + '%';

	if(this.current == this.urlList.length) {
        $('#progress').hide();
		this.success();
	}
};	
AssetLoad.prototype.success = function() {
	if(typeof this.conf.success === 'function') {
		this.conf.success();
	}
};