/**
 * Created by rechie on 14-8-7.
 */
require(['util/RC'], function (RC){
    var slide = new RC.Slide({
        elemQuery: 'body',
        slideEnd: function(touch){
            console.log('slide end');
        },
        slideBegin: function(touch){
            console.log('slide start');
        },
        slideMove: function(touch) {
            console.log('slide move');
        }
    });
});