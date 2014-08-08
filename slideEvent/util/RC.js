/**
 * Created by rechie on 14-8-8.
 */
(function(){
    if(typeof RC === 'undefined') {
        RC = function(){};
    }
    RC.touchable = 'ontouchend' in document;
})();