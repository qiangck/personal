
/*addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false); 
function hideURLbar(){ 
		window.scrollTo(0,1); 
} */
function resizeContainer() {
	var widthScale = $(window).width()/480;
	var heightScale = $(window).height()/320;
	if(heightScale < widthScale) {
		$(document.body).addClass('bg-body');
	}
	var scale = Math.min(widthScale, heightScale);
	var realWidth = 480 * scale;
	var realHeight = 320 * scale;
	var transformOrigin = [($(window).width()-realWidth)/2, ($(window).height()-realHeight)/2, 0];
	window.scale = scale;
	var cssObj = {
		'-webkit-transform': 'scale(' + scale + ', ' + scale + ')',
		'-ms-transform': 'scale(' + scale + ', ' + scale + ')',
		'-o-transform': 'scale(' + scale + ', ' + scale + ')',
		'transform': 'scale(' + scale + ', ' + scale + ')'
	};
	$('.container').css(cssObj);
	$('.wrap').css({
		top: '-' + 50/scale + '%',
		left: '-' + 50/scale + '%'
	});
}
window.onerror = function(e) {
	alert(e.message || e);
};
function scroll(wrapSelector, box1Selector, box2Selector) {
	var speed=50;
	$(box2Selector)[0].innerHTML=$(box1Selector)[0].innerHTML;
	function roll(){
		if($(box2Selector)[0].offsetTop-$(wrapSelector)[0].scrollTop<0)  {  //当滚动到第二部分的顶部位置时
			$(wrapSelector)[0].scrollTop-=$(box1Selector)[0].offsetHeight; //重置至第一部分顶部位置,相当于$$('box').scrollTop=0;
		}
		else{
			$(wrapSelector)[0].scrollTop++ ;
		}
	}
	var start=setInterval(roll,speed);
}




$(document).ready(function() {
	resizeContainer();
	$('#gameIntro').append('<div id="prograss"><div class="prograss-wrap"><div><img src="images/prograss-bar.png"></div></div>正在加载资源……<span></span></div>');
  $(window).bind('orientationchange',function(e){
		resizeContainer();
  });
  var scoreTipMap = [{
    level: 1,
    limit: 1500,
    msg: '恭喜你成为垃圾分类大师，有没有一点小激动呢~多，中奖机会越大！<a href="http://env.people.com.cn/n/2014/0509/c383717-24997751.html">抽奖规则</a><br>神秘奖品正等着你，分数越高，挑战次数越'
  }, {
    level: 2,
    limit: 600,
    msg: '恭喜你成为垃圾分类高级学徒，加油向大师迈进吧~<a href="http://env.people.com.cn/n/2014/0509/c383717-24997751.html">抽奖规则</a><br>神秘奖品正等着你，分数越高，挑战次数越多，中奖机会越大！'
  }, {
    level: 3,
    limit: 200,
    msg: '恭喜你成为垃圾分类中级学徒，加油继续挑战吧~<a href="http://env.people.com.cn/n/2014/0509/c383717-24997751.html">抽奖规则</a><br>神秘奖品正等着你，分数越高，挑战次数越多，中奖机会越大！'
  }, {
    level: 4,
    limit: 50,
    msg: '恭喜你成为垃圾分类初级学徒，继续加油吧~<a href="http://env.people.com.cn/n/2014/0509/c383717-24997751.html">抽奖规则</a><br>神秘奖品正等着你，分数越高，挑战次数越多，中奖机会越大！'
  }, {
    level: 5,
    limit: -1,
    msg: '很遗憾，你的分数有点低啊，还要继续努力哦~<a href="http://env.people.com.cn/n/2014/0509/c383717-24997751.html">抽奖规则</a><br>神秘奖品正等着你，分数越高，挑战次数越多，中奖机会越大！'
  }];
  function endGame() {
    var score = game.getScore();
    var scoreTipMsg = '';
    for(var i=0; i<scoreTipMap.length; i++) {
      if(score > scoreTipMap[i].limit) {
        scoreTipMsg = scoreTipMap[i].msg;
        break;
      }
    }
    $('#result .result-wrap .content h2 b').html(score + '分');
    $('#result .content p').html(scoreTipMsg);
    $('#result').show();
	$('#gameIntro .content').css({'visibility': 'hidden'});
	$('#gameIntro').show();
	$('#gameScreen').hide();
  }
  function getRankHtmlFromXml(xmlList) {
	  var rankList = [];
    for(var i=0; i<xmlList.length; i++) {
    	var phone = xmlList[i].phone;
    	var score = xmlList[i].score;
    	// console.log(phone)
    	// console.log(score);
    	rankList.push('<div class="list-wrap"><div class="serial">' + (i+1) + '</div><div class="phone">' + phone + '</div><div class="score">' + score + '</div></div>');
    }
    return rankList.join('');
  }
  // 获取周排行
  $.ajax({
  	url:'http://fz.people.com.cn/laji/topweekjason.php',
  	type: 'get',
	dataType:"jsonp",
  	success: function(data) {
		if(typeof data === 'string'){
			data = JSON.parse(data);
		}
  		var weekListHtml = getRankHtmlFromXml(data);
	    $('#gameIntro .content .weekRank .list-container').html(weekListHtml);
  		scroll('.weekRank .list-wrap', '.weekRank .list-wrap .week-list1', '.weekRank .list-wrap .week-list2');
  	},
  	error: function() {
  		console.log('error')
  	}
  })
  // 获取总排行
  $.ajax({
  	url:'http://fz.people.com.cn/laji/topalljason.php',
  	type: 'get',
	dataType:"jsonp",
  	success: function(data) {
		if(typeof data === 'string'){
			data = JSON.parse(data);
		}
  		var totalListHtml = getRankHtmlFromXml(data);
	    $('.totalRank .list-container').html(totalListHtml);
  		scroll('.totalRank .list-wrap', '.totalRank .list-wrap .week-list1', '.totalRank .list-wrap .week-list2');
  	},
  	error: function() {
  		console.log('error')
  	}
  })

  $('#play img').bind('touchend', function() {
  	//$('#gameIntro').hide();
//  	$('#gameScreen').show();
  	game.start();
  });
  $('#play img').bind('click', function() {
  /*	$('#gameIntro').hide();
  	$('#gameScreen').show();*/
  	game.start();
  })


	// 初始化游戏
  var gameOptions = {
  	itemSize: 16,
  	itemWrapSelector: '.rubbish-wrap',
  	itemContainerSelector: '.rubbish-item'
  };
  var game = new Game(gameOptions);
  // 初始化计时器
	var timer = new Game.Time({
		add:1, 
		minus: 5,
		countFunc: Game.View.setTimer,
    end: function() {
      endGame();
    }
	});
	game.setTimer(timer);
	// 游戏开始
	// game.start();

	// TODO
	// 拖拽事件绑定，临时解决方案，后续可以集成到游戏控制中
  try{
  var canDrop = false;
  $('#gameScreen').draggable({
  	selector: '.rubbish-item img',
	  start: function (dragEl) {
			Game.View.hideStatus();
			$(dragEl).removeClass('itemAnimation');
			canDrop = false;
	  },
	  stop: function (dragEl) {
	  	$(dragEl).animate({
	  		left:0,
	  		top:0
	  	}, 200);
		canDrop = true;
	  },
	  dropClassName: 'bin',
	  overDrop: function(dragEl, targetEl) {
	  	if(!$(targetEl).parent().hasClass('active')) {
	  		$(targetEl).parent().addClass('active');
	  	}
		canDrop = true;
	  },
	  leaveDrop: function(){
	  	$('.bins .active').removeClass('active');
		canDrop = false;
	  }
	});
	$('#gameScreen .bins .bin').droppable({
    drop: function (e, dragEl, dropEl) {
		if(canDrop){
			game.dropTo(dragEl, dropEl);
			setTimeout(function() {
				$('.bins .active').removeClass('active');
			}, 100);
		}
      return true;
    }
  });
  } catch(e){console.log(e);}
	var bSubmit = false;
  $('#replay').bind('touchend', function() {
	bSubmit = false;
    $('#result').hide();
	$('#gameIntro').hide();
	$('#gameScreen').show();
    if(game) {
      game.replay();
    }
  });

  $('#submit').bind('touchend', function() {
    if($('#name').val() == ''|| $('#tel').val() == '') {
      alert("请填写您的信息.");
      return;
    }
	if(bSubmit === true) {
		alert('请勿重复提交');
		return;
	}
	bSubmit = true;
    $.ajax({
      type: 'post',
      url:'http://fz.people.com.cn/laji/postjason.php?score=' + game.getScore() + '&name=' + $('#name').val() + '&phone=' + $('#tel').val(),
		dataType:"jsonp",
      success: function() {
		  //alert('提交成功.');
      },
      error: function() {
		  //alert('提交成功.');
      }
    });
	alert('提交成功.');
	
  });
  
}); 

