/**
 * Created by rechie on 14-9-23.
 */
define('RC/Class/Widget', ['./RC'], function(){
    // 使用function Widget来创建类的构造函数
    //不能用var Widget = function(){}来创建，否则实例化后的对象的constructor仍然是Function类，在用于继承会混乱
    // TODO 多个同类widget的问题，应该放到更上一层来处理，这里只处理单个widget，否则容易引起调用混乱
    // TODO 所以这里暂时只处理单个情况，暂用ID，以后可以用querySelector和querySelecotorAll来处理
    function Widget(opt){
        this.handlerMap = {}
        this.elem = function(id){
            if(typeof id !== 'string') {
                throw new TypeError('Widget.elem: opt.id show be string');
            }
            return document.getElementById(id);
        }(opt.id);
    }

    /**
     * 绑定事件函数
     * TODO 判断类型改用Object.prototype.toString.call()，封装到RC的Util中
     * @param type
     * @param handler
     */
    Widget.prototype.on = function(type, handler, useCapture){
        if(typeof type !== 'string') {
            throw new TypeError('Widget.on: type shoul be String');
        }
        if(typeof handler !== 'function') {
            throw new TypeError('Widget.on: handler show be function');
        };
        if(this.elem) {
            this.elem.addEventListener(type ,handler, useCapture);
            // TODO 如何可以减少当前的赋值操作
            this.handlerMap[type] = this.handlerMap[type] || [];
            // 参考jquery方法，手动调用绑定的事件
            this.handlerMap[type].push(handler);
        }
    };
    Widget.prototype.fire = function(type){
        if(typeof type !== 'string') {
            throw new TypeError('Widget.fire: type shoul be String');
        }
        var handlers = this.handlerMap[type];
        if(typeof handlers === 'array') {
            for(var i=0; i<handlers.length; i++) {
                // TODO 参数？模拟EVENT?
                handlers.call(this);
            }
        }
    };
    Widget.prototype.off = function(type, handler) {
        
    }
});