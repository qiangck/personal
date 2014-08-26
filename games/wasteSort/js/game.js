

// 总控制
var Game = function(options){
	this.opts = options;
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
	var i=0;
	var $parent = null;
	for(; i<this.opts.itemSize; i++) {
		$(this.opts.itemWrapSelector).append('<div class="rubbish-item" ></div>');
		$parent = $(this.opts.itemContainerSelector).eq(i);
		this.addItem($parent);
	}
};

Game.prototype.assetLoadStatus = false;
Game.prototype.loadImg = function(callback) {
	var loader = new AssetLoad({
		success: callback
	});

	this.categoryList.forEach(function(obj, index) {
		var length = obj.size;
		var i = 1;
		var imgUrl;
		for( ; i<length+1; i++) {
			var index = i<10 ? ('0'+i) : i;
			imgUrl = 'images/' + obj.category + index + '.png';
			loader.preLoadImg(imgUrl);
		}
	});
	var binsList = [
		'images/recycled-close.png',
		'images/recycled-open.png',
		'images/harmful-close.png',
		'images/harmful-open.png',
		'images/other-close.png',
		'images/other-open.png',
		'images/kitchen-close.png',
		'images/kitchen-open.png'
	];
	binsList.forEach(function(obj, index) {
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

Game.prototype.categoryList = [
	{
		category: 'recycled',
		baseUrl: 'images/recycled',
		size: 21
	}, {
		category: 'harmful',
		baseUrl: 'images/harmful',
		size: 7
	}, {
		category: 'other',
		baseUrl: 'images/other',
		size: 1
	}, {
		category: 'kitchen',
		baseUrl: 'images/kitchen',
		size: 8
	}];

Game.prototype.refreshItem = function($parent) {
	this.removeItem($parent);
	this.addItem($parent);
};
Game.prototype.removeItem = function($parent) {
	$parent[0].removeChild($parent.find('img')[0]);
};

Game.prototype.addItem = function($parent) {
	var cateList = this.categoryList;
	var index = Math.floor(Math.random()*cateList.length);
	var imgIndex = Math.ceil(Math.random()*cateList[index].size);
	var imgHtml = '';
	if(imgIndex<10) {
		imgIndex =  '0'+imgIndex;
	}
	imgHtml = '<img class="itemAnimation" src="images/' + cateList[index].category + imgIndex + '.png" data-category="' + cateList[index].category + '" >';
 	$parent.append(imgHtml);
};
/**
 * 成功得分
 * @return {[type]} [description]
 */
Game.prototype.goal = function(dragEl, dropEl) {
	if(this._hitCombo > this._maxCombo) {
		this._maxCombo = this._hitCombo;
	}
	this.setScore(this._score + this._hitCombo + 1);
	this._hitCombo ++;
	Game.View.setScore(this._score);
	Game.View.setHitCombo(this._hitCombo);
	Game.View.changeStatus(dropEl, true);
};

/**
 * 失败
 * @return {[type]} [description]
 */
Game.prototype.failed = function(dragEl, dropEl) {
	this._hitCombo = 0;
	this.timer.doMinus();
	Game.View.setHitCombo(this._hitCombo);
	Game.View.changeStatus(dropEl, false);
};

/**
 * start the game
 * @return {[type]} [description]
 */
Game.prototype.start = function() {
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
			console.log(123);
			go();
		});
	} else {
		console.log('no load');
		go();
	}
	function go(){
		if(that.timer != null) {
			$('#gameIntro').hide();
			$('#gameScreen').show();
			that.timer.run();
		}
	}
};

Game.prototype.reset = function() {
	this._score = 0;
	this._hitCombo = 0;
	this._maxCombo = 0;
	Game.View.setScore(this._score);
	Game.View.setHitCombo(this._hitCombo);
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
		$('#timer .numb').html('00:' + (remain<10 ? ('0' + remain ): remain));
		$('#gameScreen .bottom .progress-wrap .progress').width(Math.floor(remain/sum*100) + '%');
	},
	setHitCombo: function(hitCombo) {
		$('#hitCombo').html(hitCombo);
	},
	setScore: function(score) {
		// 补零方法
	    var len = score.toString().length;
	    while(len < 3) {
	        score = "0" + score;
	        len++;
	    }
		$('#score').html(score);
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
		$('#timer .numb').html('01:00');
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
		if(that.current < that.sum) {
			that.current ++
			that.run.call(that);
			that.countFunc(that.current, that.sum);
		} else {
			that.running = false;
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

/**
 * 资源加载器
 * @return {[type]} [description]
 */
var AssetLoad = function(conf){
	this.conf = conf;
	this.urlList = [];
	this.sum = 0;
	this.current = 0;
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
		that.showPrograss();
	};
	image.onerror = function(){
		that.showPrograss();
	};
	image.src = imgUrl;
};
AssetLoad.prototype.showPrograss = function() {
	this.current ++;
	var prograss = this.current / this.urlList.length * 100;
	var prograssElem = document.querySelector('#prograss span');
	//console.log(prograssElem);
	
	$('.prograss-wrap div').css('width', (prograss|0) + '%');
	prograssElem.innerHTML = (prograss|0) + '%';
	// prograssElem.innerHTML = prograss; 
	//console.log('prograss: ' + (prograss|0));
	if(this.current == this.urlList.length) {
		this.success();
	}
};	
AssetLoad.prototype.success = function() {
	if(typeof this.conf.success === 'function') {
		this.conf.success();
	}
};