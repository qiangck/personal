define('core/RC', [], function () {
    var RC = {};
    RC.touchable = 'ontouchend' in document;
    RC.EVENT = {
        TOUCH_START: 'touchstart',
        TOUCH_MOVE: 'touchmove',
        TOUCH_END: 'touchend'
    };
    RC.merge = function (a, b) {
        for (var key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        return a;
    };
    return RC;
});
define('core/EventUtil', ['core/RC'], function () {
    var EventUtil = {
        touchable: 'ontouchend' in document,
        TYPE: {
            TOUCH_START: 'touchstart',
            TOUCH_MOVE: 'touchmove',
            TOUCH_END: 'touchend'
        },
        addEventListener: function (elem, type, handler, useCapture) {
            if (elem.addEventListener) {
                elem.addEventListener(type, handler, useCapture);
            } else if (elem.attachEvent) {
                elem.attachEvent('on' + type, handler);
            } else {
                elem['on' + type] = handler;
            }
        },
        removeEventListener: function (elem, type, handler) {
            if (elem.removeEventListener) {
                elem.removeEventListener(type, handler);
            } else if (elem.detacjEvent) {
                elem.detacjEvent('on' + type, handler);
            } else {
                elem['on' + type] = null;
            }
        },
        fixEvent: function (event) {
            event = event || window.event;
        },
        getTarget: function (event) {
            return event.target || event.srcElement;
        }
    };
    return EventUtil;
});
define('core/Slide', [
    'core/RC',
    'core/EventUtil'
], function (RC, EventUtil) {
    RC.Slide = function (opt) {
        var that = this;
        that.isSlide = false;
        that.touchIdentifier = null;
        that.opt = RC.merge({
            elemQuery: 'body',
            slideEnd: null,
            slideBegin: null,
            slideMove: null
        }, opt);
        this.elems = [].slice.call(document.querySelectorAll(that.opt.elemQuery));
        that.startHandler = function (e) {
            return that.StartHandler.apply(that, arguments);
        };
        that.moveHandler = function (e) {
            return that.MoveHandler.apply(that, arguments);
        };
        that.endHandler = function (e) {
            return that.EndHandler.apply(that, arguments);
        };
        this.addHandlers();
    };
    RC.Slide.prototype.addHandlers = function () {
        var that = this;
        that.elems.forEach(function (obj, index) {
            obj.addEventListener(EventUtil.TYPE.TOUCH_START, that.startHandler);
            obj.addEventListener(EventUtil.TYPE.TOUCH_MOVE, that.moveHandler);
            obj.addEventListener(EventUtil.TYPE.TOUCH_END, that.endHandler);
        });
    };
    RC.Slide.prototype.removeHandlers = function () {
        var that = this;
        this.elems.forEach(function (obj, index) {
            obj.removeEventListener(EventUtil.TYPE.TOUCH_START, that.startHandler, false);
            obj.removeEventListener(EventUtil.TYPE.TOUCH_MOVE, that.moveHandler, false);
            obj.removeEventListener(EventUtil.TYPE.TOUCH_END, that.endHandler, false);
        });
    };
    RC.Slide.prototype.StartHandler = function (e) {
        e.preventDefault();
        var that = this;
        var touches = e.touches;
        if (this.touchIdentifier == null) {
            this.touchIdentifier = touches[0].identifier;
        } else {
            [].slice.apply(touches).forEach(function (touch, index) {
            });
        }
        if (e.touches.length > 1) {
            return;
        }
        if (this.isSlide === false) {
            this.isSlide = true;
            if (typeof this.opt.slideBegin === 'function') {
                that.opt.slideBegin.call(that, RC.merge({}, touches[0]));
            }
        }
    };
    RC.Slide.prototype.MoveHandler = function (e) {
        var that = this;
        e.preventDefault();
        var touches = e.targetTouches.length ? e.targetTouches : e.changedTouches;
        if (that.isSlide = true) {
            [].slice.apply(touches).forEach(function (touch, index) {
                if (touch.identifier == that.touchIdentifier && typeof that.opt.slideMove === 'function') {
                    that.opt.slideMove.call(that, RC.merge({}, touch));
                }
            });
        }
    };
    RC.Slide.prototype.EndHandler = function (e) {
        var that = this;
        e.preventDefault();
        var touches = e.changedTouches;
        if (that.isSlide === true) {
            [].slice.apply(touches).forEach(function (touch, index) {
                if (touch.identifier == that.touchIdentifier) {
                    that.isSlide = false;
                    that.touchIdentifier = null;
                    if (typeof that.opt.slideEnd === 'function') {
                        var bCancel = that.opt.slideEnd.call(that, RC.merge({}, touch));
                        if (bCancel == true) {
                            that.cancel();
                        }
                    }
                }
            });
        }
    };
    return RC.Slide;
});
define('ft/Game', [], function () {
    var bgImg;
    var arrowImg = new Image();
    arrowImg.src = 'images/arrow.png';
    var rectRecords = [];
    function Game(id) {
        this.canvasElem = document.getElementById('gameScreen');
        this.ctx = this.canvasElem.getContext('2d');
        this.init();
    }
    ;
    Game.prototype.init = function () {
        this.resize();
        this.draw();
    };
    Game.prototype.clear = function () {
        this.draw();
    };
    Game.prototype.draw = function () {
    };
    Game.prototype.resize = function () {
        this.canvasElem.width = $(window).width();
        this.canvasElem.height = $(window).height() - 150;
        this.ctx.width = $(window).width();
        this.ctx.height = $(window).height() - 150;
    };
    return Game;
});
define('src/ScratchGame', ['ft/Game'], function (Game) {
    var bgImg = new Image();
    function ScratchGame(id) {
        console.log('init ScratchGame');
        Game.apply(this, [id]);
        this.canvasElem.style.backgroundSize = 'cover';
        this.canvasElem.style.backgroundPosition = 'center';
    }
    ;
    ScratchGame.prototype = new Game();
    ScratchGame.prototype.constructor = ScratchGame;
    ScratchGame.prototype.draw = function () {
        var self = this;
        self.ctx.fillStyle = '#333';
        self.ctx.fillRect(0, 0, self.canvasElem.width, self.canvasElem.height);
        bgImg.onload = function () {
            console.log(bgImg);
            self.ctx.drawImage(bgImg, 0, 0, self.canvasElem.width, self.canvasElem.height);
        };
        bgImg.src = '../images/canvas.jpg';
    };
    Game.prototype.resize = function () {
        console.log('resize');
        this.canvasElem.width = $(window).width();
        this.canvasElem.height = $(window).height();
        this.ctx.width = $(window).width();
        this.ctx.height = $(window).height();
    };
    ScratchGame.prototype.scratch = function (sx, sy, ex, ey, r) {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.lineWidth = r;
        sy = sy;
        ey = ey;
        this.ctx.moveTo(sx, sy);
        this.ctx.lineTo(ex, ey);
        this.ctx.stroke();
    };
    ScratchGame.prototype.scratchArc = function (x, y, r) {
        x -= this.canvasElem.offsetLeft;
        y -= this.canvasElem.offsetTop;
        with (this.ctx) {
            beginPath();
            arc(x, y, r / 2, 0, Math.PI * 2);
            fill();
        }
    };
    return ScratchGame;
});
define('dist/main', [
    'core/Slide',
    'src/ScratchGame'
], function (Slide, ScratchGame) {
    var game;
    var startPoint = null;
    var endPoint = null;
    var lastPoint = null;
    var showTrack = true;
    var radius = 30;
    var canvasId = 'gameScreen';
    var canvasElem = document.getElementById(canvasId);
    var ctx = canvasElem.getContext('2d');
    var workId = 0;
    var touchNum = 0;
    window.ctx = ctx;
    var baseUrl = 'http://182.92.186.42';
    init();
    var slide = new Slide({
        elemQuery: '#gameScreen',
        slideBegin: function (touch) {
            touchNum++;
            try {
                lastPoint = startPoint = touch;
                game.scratchArc(startPoint.pageX, startPoint.pageY, radius);
            } catch (e) {
                console.log('begin error: ' + e.message);
            }
        },
        slideMove: function (touch) {
            touchNum++;
            try {
                endPoint = touch;
                game.scratch(lastPoint.pageX, lastPoint.pageY, endPoint.pageX, endPoint.pageY, radius);
            } catch (e) {
                console.log('move error: ' + e.message);
            }
            lastPoint = touch;
        },
        slideEnd: function (touch) {
            try {
                startPoint = lastPoint = endPoint = null;
                if (touchNum > 100) {
                    document.getElementById(canvasId).style.display = 'none';
                    $('.jt_left').show();
                }
            } catch (e) {
                console.log('end error: ' + e.message);
            }
        }
    });
    function init() {
        console.log('start init');
        try {
            game = new ScratchGame(canvasId);
            $('.sl-slider').height($(window).height());
        } catch (e) {
            console.log('init error');
            console.log(e);
        }
    }
    WeixinApi.ready(function (Api) {
        var wxData = {
            'imgUrl': 'http://www.helloweba.com/demo/guaguaka/p_1.jpg',
            'link': window.location.href,
            'desc': '\u522E\u522E\u5361',
            'title': '\u522E\u522E\u5361'
        };
        var wxCallbacks = {
            ready: function () {
            },
            cancel: function (resp) {
            },
            fail: function (resp) {
            },
            confirm: function (resp) {
            },
            all: function (resp) {
            }
        };
        Api.shareToFriend(wxData, wxCallbacks);
        Api.shareToTimeline(wxData, wxCallbacks);
        Api.shareToWeibo(wxData, wxCallbacks);
    });
    return {};
});