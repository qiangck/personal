(function($) {

  "use strict";

  function isParent(obj, parentObj) {
    while (obj != undefined && obj != null && obj.tagName.toUpperCase() != 'BODY') {
      if (obj == parentObj) {
        return true;
      }
      obj = obj.parentNode;
    }
    return false;
  }

  $.fn.click1 = function(callback) {
    return this.each(function() {
      var that = this;
      var bTap = false;

      function bindBodyTouchMove(clickElem) {
        $(document.body).bind('touchmove', function(event) {
          event.originalEvent ? event = event.originalEvent : 1;
          var pageX = event.touches[0].pageX;
          var pageY = event.touches[0].pageY;
          var overElem = document.elementFromPoint(pageX, pageY);
          if (!isParent(overElem, clickElem)) {
            bTap = false;
            $(document.body).unbind('touchmove');
            $(clickElem).parent().find('.hover').removeClass('hover');
          }
        });
      }

      $(that).bind('touchstart', function(e) {
        bTap = true;
        $(that).addClass('hover');
        bindBodyTouchMove(that);
      });

      $(that).bind('touchend', function(e) {
        if (bTap) {
          if (typeof callback === 'function') {
            callback.apply(that);
          }
          $(document.body).unbind('touchmove');
          $(that).removeClass('hover');
        }
      });
    });
  }
})(Zepto);