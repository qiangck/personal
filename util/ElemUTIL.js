/**
 * Created by rechie on 14-8-19.
 */
define(function(){
    var ElemUtil = {
        query: function(selector) {
            var fn = null;
            if(document.querySelector) {
                fn = document.querySelector;
            }
            return fn.call(document, selector)
        },
        queryAll: function(selector) {
            var fn = null;
            if(document.querySelectorAll) {
                fn = document.querySelectorAll;
            }
            return fn.call(document, selector)
        }
    };
    return ElemUtil;
});