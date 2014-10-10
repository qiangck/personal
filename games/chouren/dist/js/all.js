/* Zepto v1.0rc1 - polyfill zepto event detect fx ajax form touch - zeptojs.com/license */
;(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, '') }

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
    Array.prototype.reduce = function(fun){
      if(this === void 0 || this === null) throw new TypeError()
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
      if(typeof fun != 'function') throw new TypeError()
      if(len == 0 && arguments.length == 1) throw new TypeError()

      if(arguments.length >= 2)
       accumulator = arguments[1]
      else
        do{
          if(k in t){
            accumulator = t[k++]
            break
          }
          if(++k >= len) throw new TypeError()
        } while (true)

      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
        k++
      }
      return accumulator
    }

})()
var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,

    // Used by `$.zepto.init` to wrap elements, text/comment nodes, document,
    // and document fragment node types.
    elementTypes = [1, 3, 8, 9, 11],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]+)$/,
    tagSelectorRE = /^[\w-]+$/,
    toString = ({}).toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div')

  zepto.matches = function(element, selector) {
    if (!element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function isFunction(value) { return toString.call(value) == "[object Function]" }
  function isObject(value) { return value instanceof Object }
  function isPlainObject(value) {
    var key, ctor
    if (toString.call(value) !== "[object Object]") return false
    ctor = (isFunction(value.constructor) && value.constructor.prototype)
    if (!ctor || !hasOwnProperty.call(ctor, 'isPrototypeOf')) return false
    for (key in value);
    return key === undefined || hasOwnProperty.call(value, key)
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return array.filter(function(item){ return item !== undefined && item !== null }) }
  function flatten(array) { return array.length > 0 ? [].concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return array.filter(function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name) {
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    if (!(name in containers)) name = '*'
    var container = containers[name]
    container.innerHTML = '' + html
    return $.each(slice.call(container.childNodes), function(){
      container.removeChild(this)
    })
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = arguments.callee.prototype
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, juts return it
    else if (zepto.isZ(selector)) return selector
    else {
      var dom
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // if a JavaScript object is given, return a copy of it
      // this is a somewhat peculiar option, but supported by
      // jQuery so we'll do it, too
      else if (isPlainObject(selector))
        dom = [$.extend({}, selector)], selector = null
      // wrap stuff like `document` or `window`
      else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
      // create a new Zepto collection from the nodes found
      return zepto.Z(dom, selector)
    }
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, whichs makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    slice.call(arguments, 1).forEach(function(source) {
      for (key in source)
        if (source[key] !== undefined)
          target[key] = source[key]
    })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found
    return (element === document && idSelectorRE.test(selector)) ?
      ( (found = element.getElementById(RegExp.$1)) ? [found] : emptyArray ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? emptyArray :
      slice.call(
        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
        element.querySelectorAll(selector)
      )
  }

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
  }

  function funcArg(context, arg, idx, payload) {
   return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  $.isFunction = isFunction
  $.isObject = isObject
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.trim = function(str) { return str.trim() }

  // plugin compatibility
  $.uuid = 0

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $.map(this, function(el, i){ return fn.call(el, i, el) })
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      this.forEach(function(el, idx){ callback.call(el, idx, el) })
      return this
    },
    filter: function(selector){
      return $([].filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result
      if (this.length == 1) result = zepto.qsa(this[0], selector)
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return $(result)
    },
    closest: function(selector, context){
      var node = this[0]
      while (node && !zepto.matches(node, selector))
        node = node !== context && node !== document && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return slice.call(this.children) }), selector)
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return slice.call(el.parentNode.children).filter(function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return this.map(function(){ return this[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = null)
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(newContent){
      return this.each(function(){
        $(this).wrapAll($(newContent)[0].cloneNode(false))
      })
    },
    wrapAll: function(newContent){
      if (this[0]) {
        $(this[0]).before(newContent = $(newContent))
        newContent.append(this)
      }
      return this
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return $(this.map(function(){ return this.cloneNode(true) }))
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return (setting === undefined ? this.css("display") == "none" : setting) ? this.show() : this.hide()
    },
    prev: function(){ return $(this.pluck('previousElementSibling')) },
    next: function(){ return $(this.pluck('nextElementSibling')) },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) this.setAttribute(key, name[key])
          else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ if (this.nodeType === 1) this.removeAttribute(name) })
    },
    prop: function(name, value){
      return (value === undefined) ?
        (this[0] ? this[0][name] : undefined) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + dasherize(name), value)
      return data !== null ? data : undefined
    },
    val: function(value){
      return (value === undefined) ?
        (this.length > 0 ? this[0].value : undefined) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(){
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: obj.width,
        height: obj.height
      }
    },
    css: function(property, value){
      if (value === undefined && typeof property == 'string')
        return (
          this.length == 0
            ? undefined
            : this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

      var css = ''
      for (key in property)
        if(typeof property[key] == 'string' && property[key] == '')
          this.each(function(){ this.style.removeProperty(dasherize(key)) })
        else
          css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'

      if (typeof property == 'string')
        if (value == '')
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (this.length < 1) return false
      else return classRE(name).test(this[0].className)
    },
    addClass: function(name){
      return this.each(function(idx){
        classList = []
        var cls = this.className, newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined)
          return this.className = ''
        classList = this.className
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        this.className = classList.trim()
      })
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
        var newName = funcArg(this, name, idx, this.className)
        ;(when === undefined ? !$(this).hasClass(newName) : when) ?
          $(this).addClass(newName) : $(this).removeClass(newName)
      })
    }
  }

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    $.fn[dimension] = function(value){
      var offset, Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
      if (value === undefined) return this[0] == window ? window['inner' + Dimension] :
        this[0] == document ? document.documentElement['offset' + Dimension] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        var el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function insert(operator, target, node) {
    var parent = (operator % 2) ? target : target.parentNode
    parent ? parent.insertBefore(node,
      !operator ? target.nextSibling :      // after
      operator == 1 ? parent.firstChild :   // prepend
      operator == 2 ? target :              // before
      null) :                               // append
      $(node).remove()
  }

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(key, operator) {
    $.fn[key] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var nodes = $.map(arguments, function(n){ return isObject(n) ? n : zepto.fragment(n) })
      if (nodes.length < 1) return this
      var size = this.length, copyByClone = size > 1, inReverse = operator < 2

      return this.each(function(index, target){
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[inReverse ? nodes.length-i-1 : i]
          traverseNode(node, function(node){
            if (node.nodeName != null && node.nodeName.toUpperCase() === 'SCRIPT' && (!node.type || node.type === 'text/javascript'))
              window['eval'].call(window, node.innerHTML)
          })
          if (copyByClone && index < size - 1) node = node.cloneNode(true)
          insert(operator, target, node)
        }
      })
    }

    $.fn[(operator % 2) ? key+'To' : 'insert'+(operator ? 'Before' : 'After')] = function(html){
      $(html)[key](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.camelize = camelize
  zepto.uniq = uniq
  $.zepto = zepto

  return $
})()

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto
'$' in window || (window.$ = Zepto)
;(function($){
  var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={}

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eachEvent(events, fn, iterator){
    if ($.isObject(events)) $.each(events, iterator)
    else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
  }

  function add(element, events, fn, selector, getDelegate, capture){
    capture = !!capture
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    eachEvent(events, fn, function(event, fn){
      var delegate = getDelegate && getDelegate(fn, event),
        callback = delegate || fn
      var proxyfn = function (event) {
        var result = callback.apply(element, [event].concat(event.data))
        if (result === false) event.preventDefault()
        return result
      }
      var handler = $.extend(parse(event), {fn: fn, proxy: proxyfn, sel: selector, del: delegate, i: set.length})
      set.push(handler)
      element.addEventListener(handler.e, proxyfn, capture)
    })
  }
  function remove(element, events, fn, selector){
    var id = zid(element)
    eachEvent(events || '', fn, function(event, fn){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
        element.removeEventListener(handler.e, handler.proxy, false)
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if ($.isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (typeof context == 'string') {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback)
    })
  }
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback)
    })
  }
  $.fn.one = function(event, callback){
    return this.each(function(i, element){
      add(this, event, callback, null, function(fn, type){
        return function(){
          var result = fn.apply(element, arguments)
          remove(element, type, fn)
          return result
        }
      })
    })
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }
  function createProxy(event) {
    var proxy = $.extend({originalEvent: event}, event)
    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue
        return event[name].apply(event, arguments)
      }
      proxy[predicate] = returnFalse
    })
    return proxy
  }

  // emulates the 'defaultPrevented' property for browsers that have none
  function fix(event) {
    if (!('defaultPrevented' in event)) {
      event.defaultPrevented = false
      var prevent = event.preventDefault
      event.preventDefault = function() {
        this.defaultPrevented = true
        prevent.call(this)
      }
    }
  }

  $.fn.delegate = function(selector, event, callback){
    var capture = false
    if(event == 'blur' || event == 'focus'){
      if($.iswebkit)
        event = event == 'blur' ? 'focusout' : event == 'focus' ? 'focusin' : event
      else
        capture = true
    }

    return this.each(function(i, element){
      add(element, event, callback, selector, function(fn){
        return function(e){
          var evt, match = $(e.target).closest(selector, element).get(0)
          if (match) {
            evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
          }
        }
      }, capture)
    })
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.bind(event, selector) : this.delegate(selector, event, callback)
  }
  $.fn.off = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.unbind(event, selector) : this.undelegate(selector, event, callback)
  }

  $.fn.trigger = function(event, data){
    if (typeof event == 'string') event = $.Event(event)
    fix(event)
    event.data = data
    return this.each(function(){
      // items in the collection might not be DOM elements
      // (todo: possibly support events on plain old objects)
      if('dispatchEvent' in this) this.dispatchEvent(event)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
      e.data = data
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback){ return this.bind(event, callback) }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else if (this.length) try { this.get(0)[name]() } catch(e){}
      return this
    }
  })

  $.Event = function(type, props) {
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
    return event
  }

})(Zepto)
;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/WebKit\/([\d.]+)/),
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/)

    // todo clean this up with a better OS/browser
    // separation. we need to discern between multiple
    // browsers on android, and decide if kindle fire in
    // silk mode is android or not

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)
;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    clearProperties = {}

  function downcase(str) { return str.toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + downcase(vendor) + '-'
      eventPrefix = event
      return false
    }
  })

  clearProperties[prefix + 'transition-property'] =
  clearProperties[prefix + 'transition-duration'] =
  clearProperties[prefix + 'transition-timing-function'] =
  clearProperties[prefix + 'animation-name'] =
  clearProperties[prefix + 'animation-duration'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback){
    if ($.isObject(duration))
      ease = duration.easing, callback = duration.complete, duration = duration.duration
    if (duration) duration = duration / 1000
    return this.anim(properties, duration, ease, callback)
  }

  $.fn.anim = function(properties, duration, ease, callback){
    var transforms, cssProperties = {}, key, that = this, wrappedCallback, endEvent = $.fx.transitionEnd
    if (duration === undefined) duration = 0.4
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssProperties[prefix + 'animation-name'] = properties
      cssProperties[prefix + 'animation-duration'] = duration + 's'
      endEvent = $.fx.animationEnd
    } else {
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) {
          transforms || (transforms = [])
          transforms.push(key + '(' + properties[key] + ')')
        }
        else cssProperties[key] = properties[key]

      if (transforms) cssProperties[prefix + 'transform'] = transforms.join(' ')
      if (!$.fx.off && typeof properties === 'object') {
        cssProperties[prefix + 'transition-property'] = Object.keys(properties).join(', ')
        cssProperties[prefix + 'transition-duration'] = duration + 's'
        cssProperties[prefix + 'transition-timing-function'] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, arguments.callee)
      }
      $(this).css(clearProperties)
      callback && callback.call(this)
    }
    if (duration > 0) this.bind(endEvent, wrappedCallback)

    setTimeout(function() {
      that.css(cssProperties)
      if (duration <= 0) setTimeout(function() {
        that.each(function(){ wrappedCallback.call(this) })
      }, 0)
    }, 0)

    return this
  }

  testEl = null
})(Zepto)
;(function($){
  var jsonpID = 0,
      isObject = $.isObject,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.defaultPrevented
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options){
    var callbackName = 'jsonp' + (++jsonpID),
      script = document.createElement('script'),
      abort = function(){
        $(script).remove()
        if (callbackName in window) window[callbackName] = empty
        ajaxComplete('abort', xhr, options)
      },
      xhr = { abort: abort }, abortTimeout

    if (options.error) script.onerror = function() {
      xhr.abort()
      options.error()
    }

    window[callbackName] = function(data){
      clearTimeout(abortTimeout)
      $(script).remove()
      delete window[callbackName]
      ajaxSuccess(data, xhr, options)
    }

    serializeData(options)
    script.src = options.url.replace(/=\?/, '=' + callbackName)
    $('head').append(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.abort()
        ajaxComplete('timeout', xhr, options)
      }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    accepts: {
      script: 'text/javascript, application/javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0
  }

  function mimeToDataType(mime) {
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (isObject(options.data)) options.data = $.param(options.data)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data)
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {})
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
      return $.ajaxJSONP(settings)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var mime = settings.accepts[dataType],
        baseHeaders = { },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = $.ajaxSettings.xhr(), abortTimeout

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
      baseHeaders['Accept'] = mime
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
      baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings)
          else ajaxSuccess(result, xhr, settings)
        } else {
          ajaxError(null, 'error', xhr, settings)
        }
      }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      return false
    }

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  $.get = function(url, success){ return $.ajax({ url: url, success: success }) }

  $.post = function(url, data, success, dataType){
    if ($.isFunction(data)) dataType = dataType || success, success = data, data = null
    return $.ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType })
  }

  $.getJSON = function(url, success){
    return $.ajax({ url: url, success: success, dataType: 'json' })
  }

  $.fn.load = function(url, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector
    if (parts.length > 1) url = parts[0], selector = parts[1]
    $.get(url, function(response){
      self.html(selector ?
        $(document.createElement('div')).html(response.replace(rscript, "")).find(selector).html()
        : response)
      success && success.call(self)
    })
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var array = $.isArray(obj)
    $.each(obj, function(key, value) {
      if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (traditional ? $.isArray(value) : isObject(value))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace('%20', '+')
  }
})(Zepto)
;(function ($) {
  $.fn.serializeArray = function () {
    var result = [], el
    $( Array.prototype.slice.call(this.get(0).elements) ).each(function () {
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function () {
    var result = []
    this.serializeArray().forEach(function (elm) {
      result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) )
    })
    return result.join('&')
  }

  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this
  }

})(Zepto)
/*
;(function($){
  var touch = {}, touchTimeout

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2){
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  var longTapDelay = 750, longTapTimeout

  function longTap(){
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap(){
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  $(document).ready(function(){
    var now, delta

    $(document.body).bind('touchstart', function(e){
      now = Date.now()
      delta = now - (touch.last || now)
      touch.el = $(parentIfText(e.touches[0].target))
      touchTimeout && clearTimeout(touchTimeout)
      touch.x1 = e.touches[0].pageX
      touch.y1 = e.touches[0].pageY
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true
      touch.last = now
      longTapTimeout = setTimeout(longTap, longTapDelay)
    }).bind('touchmove', function(e){
      cancelLongTap()
      touch.x2 = e.touches[0].pageX
      touch.y2 = e.touches[0].pageY
    }).bind('touchend', function(e){
       cancelLongTap()

      // double tap (tapped twice within 250ms)
      if (touch.isDoubleTap) {
        touch.el.trigger('doubleTap')
        touch = {}

      // swipe
      } else if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                 (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {
        touch.el.trigger('swipe') &&
          touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
        touch = {}

      // normal tap
      } else if ('last' in touch) {
        touch.el.trigger('tap')

        touchTimeout = setTimeout(function(){
          touchTimeout = null
          touch.el.trigger('singleTap')
          touch = {}
        }, 250)
      }
    }).bind('touchcancel', function(){
      if (touchTimeout) clearTimeout(touchTimeout)
      if (longTapTimeout) clearTimeout(longTapTimeout)
      longTapTimeout = touchTimeout = null
      touch = {}
    })
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  })
})(Zepto)
*/
//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()
;(function($) {
  var data = {}, dataAttr = $.fn.data, camelize = $.zepto.camelize,
    exp = $.expando = 'Zepto' + (+new Date())

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    $.each(node.attributes, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] = attr.value
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ?
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        this.length == 0 ? undefined : getData(this[0], name) :
      // set value on all elements
      this.each(function(){ setData(this, name, value) })
  }

  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names, function(){ delete store[camelize(this)] })
    })
  }
})(Zepto)

var RC = {};
RC.touchable = 'ontouchend' in document;
RC.EVENT = {
    TOUCH_START: 'touchstart',
    TOUCH_MOVE: 'touchmove',
    TOUCH_END: 'touchend'
};
RC.merge = function(a, b) {
    for(var key in b) {
        if(!a[key] && b.hasOwnProperty(key)) {
            a[key] = b[key]
        }
    }
    return a;
}
RC.Slide = function(opt){
    var that = this;
    that.isSlide = false;
    that.touchIdentifier = null;
    // 配置文件
    that.opt = RC.merge({
        elemQuery: 'body',
        slideEnd: null,
        slideBegin: null,
        slideMove: null
    },opt);
    var elemQuery = opt.elemQuery;
    this.elems = [].slice.call(document.querySelectorAll(elemQuery));
    that.startHandler = function(e){
        return that.StartHandler.apply(that, arguments);
    }
    that.moveHandler = function(e){
        return that.MoveHandler.apply(that, arguments);
    }
    that.endHandler = function(e){
        return that.EndHandler.apply(that, arguments);
    }
    this.elems.forEach(function(obj, index) {
        obj.addEventListener(RC.EVENT.TOUCH_START, that.startHandler);
        obj.addEventListener(RC.EVENT.TOUCH_MOVE, that.moveHandler);
        obj.addEventListener(RC.EVENT.TOUCH_END, that.endHandler);
    });
};

RC.Slide.prototype.cancel = function() {
    var that = this;
    this.elems.forEach(function(obj, index){
        obj.removeEventListener(RC.EVENT.TOUCH_START, that.startHandler, false);
        obj.removeEventListener(RC.EVENT.TOUCH_MOVE, that.moveHandler, false);
        obj.removeEventListener(RC.EVENT.TOUCH_END, that.endHandler, false);
    });
};


/**
 * touch start事件监听
 * @param e
 * @constructor
 */
RC.Slide.prototype.StartHandler = function(e) {
    e.preventDefault();
    var that = this;
    var touches = e.touches;
    if(this.touchIdentifier == null) {
        this.touchIdentifier = touches[0].identifier;
    } else {
        [].slice.apply(touches).forEach(function(touch, index) {
        });
    }
    if(e.touches.length > 1) {
        // 增加点触摸时，不处理
        return;
    }
    if(this.isSlide ===  false) {
        this.isSlide = true;
        if(typeof this.opt.slideBegin === 'function') {
            that.opt.slideBegin.call(that, RC.merge({}, touches[0]));
        }
    }
};

/**
 * touch move事件监听
 * @param e
 * @constructor
 */
RC.Slide.prototype.MoveHandler = function(e) {
    var that = this;
    e.preventDefault();
    var touches = (e.targetTouches.length) ? e.targetTouches : e.changedTouches;
    if(that.isSlide = true) {
        // 判断是否是触发slide的touch
        [].slice.apply(touches).forEach(function(touch, index) {
            if(touch.identifier == that.touchIdentifier && typeof that.opt.slideMove === 'function') {
                that.opt.slideMove.call(that, RC.merge({}, touch));
            }
        });
    }
};

/**
 * touch end事件监听
 * @param e
 * @constructor
 */
RC.Slide.prototype.EndHandler = function(e) {
    var that = this;
    e.preventDefault();
    var touches = e.changedTouches;
    if(that.isSlide === true) {
        // 判断是否是触发slide的touch
        [].slice.apply(touches).forEach(function(touch, index) {
            if(touch.identifier == that.touchIdentifier) {
                that.isSlide = false;
                that.touchIdentifier = null;
                if(typeof that.opt.slideEnd === 'function') {
                    var bCancel = that.opt.slideEnd.call(that, RC.merge({}, touch));
                    if(bCancel == true) {
                        that.cancel();
                    }
                }
            }
        });
    }
};

RC.UTILS = {
    UrlParam: (function(){
        var url = location.href;
        var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
        var paraObj = {};
        var i , j;
        for (i = 0; j = paraString[i]; i++) {
            paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
        }
        return paraObj;
    })(),
    getUrlParam: function (paras) {
        var url = location.href;
        var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
        var paraObj = {};
        var i , j;
        for (i = 0; j = paraString[i]; i++) {
            paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
        }
        var returnValue = paraObj[paras.toLowerCase()];
        if ( typeof (returnValue) == "undefined") {
            return "";
        } else {
            return returnValue;
        }
    },
    getUrlValue: function(key) {
        var returnValue = RC.UTIL.UrlParam[key.toLowerCase()];
        if ( typeof (returnValue) == "undefined") {
            return "";
        } else {
            return returnValue;
        }
    },
    merger: function(a, b) {
        for(var key in b) {
            if(b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
    },
    mergerNew: function(a, b){
        var c = RC.UTILS.merger({}, a);
        return RC.UTILS.merger(c, b);
    },
    removeTouchHandler: function(selector, type, handler) {
        document.querySelector(selector).removeEventListener(type, handler, false);
    }
}


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
		$('#timer').html(gameTime + '<span>秒</span>');
	}
};


// 计时器
Game.Time = function(opt) {
	this.init(opt);
};

Game.Time.prototype.init = function(opt) {
	this.sum = opt.sum || 30;
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
    timeDelay : 400,
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
                }, 100);
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
	var prograssElem = document.querySelector('#percent');
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

/**!
 * 微信内置浏览器的Javascript API，功能包括：
 *
 * 1、分享到微信朋友圈
 * 2、分享给微信好友
 * 3、分享到腾讯微博
 * 4、隐藏/显示右上角的菜单入口
 * 5、隐藏/显示底部浏览器工具栏
 * 6、获取当前的网络状态
 * 7、调起微信客户端的图片播放组件
 * 8、关闭公众平台Web页面
 *
 * @author zhaoxianlie(http://www.baidufe.com)
 */
var WeixinApi = (function () {

    "use strict";

    /**
     * 分享到微信朋友圈
     * @param       {Object}    data       待分享的信息
     * @p-config    {String}    appId      公众平台的appId（服务号可用）
     * @p-config    {String}    imageUrl   图片地址
     * @p-config    {String}    link       链接地址
     * @p-config    {String}    desc       描述
     * @p-config    {String}    title      分享的标题
     *
     * @param       {Object}    callbacks  相关回调方法
     * @p-config    {Boolean}   async                   ready方法是否需要异步执行，默认false
     * @p-config    {Function}  ready(argv)             就绪状态
     * @p-config    {Function}  dataLoaded(data)        数据加载完成后调用，async为true时有用，也可以为空
     * @p-config    {Function}  cancel(resp)    取消
     * @p-config    {Function}  fail(resp)      失败
     * @p-config    {Function}  confirm(resp)   成功
     * @p-config    {Function}  all(resp)       无论成功失败都会执行的回调
     */
    function weixinShareTimeline(data, callbacks) {
        callbacks = callbacks || {};
        var shareTimeline = function (theData) {
            WeixinJSBridge.invoke('shareTimeline', {
                "appid":theData.appId ? theData.appId : '',
                "img_url":theData.imgUrl,
                "link":theData.link,
                "desc":theData.title,
                "title":theData.desc, // 注意这里要分享出去的内容是desc
                "img_width":"120",
                "img_height":"120"
            }, function (resp) {
                switch (resp.err_msg) {
                    // share_timeline:cancel 用户取消
                    case 'share_timeline:cancel':
                        callbacks.cancel && callbacks.cancel(resp);
                        break;
                    // share_timeline:confirm 发送成功
                    case 'share_timeline:confirm':
                    case 'share_timeline:ok':
                        callbacks.confirm && callbacks.confirm(resp);
                        break;
                    // share_timeline:fail　发送失败
                    case 'share_timeline:fail':
                    default:
                        callbacks.fail && callbacks.fail(resp);
                        break;
                }
                // 无论成功失败都会执行的回调
                callbacks.all && callbacks.all(resp);
            });
        };
        WeixinJSBridge.on('menu:share:timeline', function (argv) {
            if (callbacks.async && callbacks.ready) {
                window["_wx_loadedCb_"] = callbacks.dataLoaded || new Function();
                if(window["_wx_loadedCb_"].toString().indexOf("_wx_loadedCb_") > 0) {
                    window["_wx_loadedCb_"] = new Function();
                }
                callbacks.dataLoaded = function (newData) {
                    window["_wx_loadedCb_"](newData);
                    shareTimeline(newData);
                };
                // 然后就绪
                callbacks.ready && callbacks.ready(argv);
            } else {
                // 就绪状态
                callbacks.ready && callbacks.ready(argv);
                shareTimeline(data);
            }
        });
    }

    /**
     * 发送给微信上的好友
     * @param       {Object}    data       待分享的信息
     * @p-config    {String}    appId      公众平台的appId（服务号可用）
     * @p-config    {String}    imageUrl   图片地址
     * @p-config    {String}    link       链接地址
     * @p-config    {String}    desc       描述
     * @p-config    {String}    title      分享的标题
     *
     * @param       {Object}    callbacks  相关回调方法
     * @p-config    {Boolean}   async                   ready方法是否需要异步执行，默认false
     * @p-config    {Function}  ready(argv)             就绪状态
     * @p-config    {Function}  dataLoaded(data)        数据加载完成后调用，async为true时有用，也可以为空
     * @p-config    {Function}  cancel(resp)    取消
     * @p-config    {Function}  fail(resp)      失败
     * @p-config    {Function}  confirm(resp)   成功
     * @p-config    {Function}  all(resp)       无论成功失败都会执行的回调
     */
    function weixinSendAppMessage(data, callbacks) {
        callbacks = callbacks || {};
        var sendAppMessage = function (theData) {
            WeixinJSBridge.invoke('sendAppMessage', {
                "appid":theData.appId ? theData.appId : '',
                "img_url":theData.imgUrl,
                "link":theData.link,
                "desc":theData.desc,
                "title":theData.title,
                "img_width":"120",
                "img_height":"120"
            }, function (resp) {
                switch (resp.err_msg) {
                    // send_app_msg:cancel 用户取消
                    case 'send_app_msg:cancel':
                        callbacks.cancel && callbacks.cancel(resp);
                        break;
                    // send_app_msg:confirm 发送成功
                    case 'send_app_msg:confirm':
                    case 'send_app_msg:ok':
                        callbacks.confirm && callbacks.confirm(resp);
                        break;
                    // send_app_msg:fail　发送失败
                    case 'send_app_msg:fail':
                    default:
                        callbacks.fail && callbacks.fail(resp);
                        break;
                }
                // 无论成功失败都会执行的回调
                callbacks.all && callbacks.all(resp);
            });
        };
        WeixinJSBridge.on('menu:share:appmessage', function (argv) {
            if (callbacks.async && callbacks.ready) {
                window["_wx_loadedCb_"] = callbacks.dataLoaded || new Function();
                if(window["_wx_loadedCb_"].toString().indexOf("_wx_loadedCb_") > 0) {
                    window["_wx_loadedCb_"] = new Function();
                }
                callbacks.dataLoaded = function (newData) {
                    window["_wx_loadedCb_"](newData);
                    sendAppMessage(newData);
                };
                // 然后就绪
                callbacks.ready && callbacks.ready(argv);
            } else {
                // 就绪状态
                callbacks.ready && callbacks.ready(argv);
                sendAppMessage(data);
            }
        });
    }

    /**
     * 分享到腾讯微博
     * @param       {Object}    data       待分享的信息
     * @p-config    {String}    link       链接地址
     * @p-config    {String}    desc       描述
     *
     * @param       {Object}    callbacks  相关回调方法
     * @p-config    {Boolean}   async                   ready方法是否需要异步执行，默认false
     * @p-config    {Function}  ready(argv)             就绪状态
     * @p-config    {Function}  dataLoaded(data)        数据加载完成后调用，async为true时有用，也可以为空
     * @p-config    {Function}  cancel(resp)    取消
     * @p-config    {Function}  fail(resp)      失败
     * @p-config    {Function}  confirm(resp)   成功
     * @p-config    {Function}  all(resp)       无论成功失败都会执行的回调
     */
    function weixinShareWeibo(data, callbacks) {
        callbacks = callbacks || {};
        var shareWeibo = function (theData) {
            WeixinJSBridge.invoke('shareWeibo', {
                "content":theData.desc,
                "url":theData.link
            }, function (resp) {
                switch (resp.err_msg) {
                    // share_weibo:cancel 用户取消
                    case 'share_weibo:cancel':
                        callbacks.cancel && callbacks.cancel(resp);
                        break;
                    // share_weibo:confirm 发送成功
                    case 'share_weibo:confirm':
                    case 'share_weibo:ok':
                        callbacks.confirm && callbacks.confirm(resp);
                        break;
                    // share_weibo:fail　发送失败
                    case 'share_weibo:fail':
                    default:
                        callbacks.fail && callbacks.fail(resp);
                        break;
                }
                // 无论成功失败都会执行的回调
                callbacks.all && callbacks.all(resp);
            });
        };
        WeixinJSBridge.on('menu:share:weibo', function (argv) {
            if (callbacks.async && callbacks.ready) {
                window["_wx_loadedCb_"] = callbacks.dataLoaded || new Function();
                if(window["_wx_loadedCb_"].toString().indexOf("_wx_loadedCb_") > 0) {
                    window["_wx_loadedCb_"] = new Function();
                }
                callbacks.dataLoaded = function (newData) {
                    window["_wx_loadedCb_"](newData);
                    shareWeibo(newData);
                };
                // 然后就绪
                callbacks.ready && callbacks.ready(argv);
            } else {
                // 就绪状态
                callbacks.ready && callbacks.ready(argv);
                shareWeibo(data);
            }
        });
    }

    /**
     * 加关注（此功能只是暂时先加上，不过因为权限限制问题，不能用，如果你的站点是部署在*.qq.com下，也许可行）
     * @param       {String}    appWeixinId     微信公众号ID
     * @param       {Object}    callbacks       回调方法
     * @p-config    {Function}  fail(resp)      失败
     * @p-config    {Function}  confirm(resp)   成功
     */
    function addContact(appWeixinId,callbacks){
        callbacks = callbacks || {};
        WeixinJSBridge.invoke("addContact", {
            webtype: "1",
            username: appWeixinId
        }, function (resp) {
            var success = !resp.err_msg || "add_contact:ok" == resp.err_msg || "add_contact:added" == resp.err_msg;
            if(success) {
                callbacks.success && callbacks.success(resp);
            }else{
                callbacks.fail && callbacks.fail(resp);
            }
        })
    }

    /**
     * 调起微信Native的图片播放组件。
     * 这里必须对参数进行强检测，如果参数不合法，直接会导致微信客户端crash
     *
     * @param {String} curSrc 当前播放的图片地址
     * @param {Array} srcList 图片地址列表
     */
    function imagePreview(curSrc,srcList) {
        if(!curSrc || !srcList || srcList.length == 0) {
            return;
        }
        WeixinJSBridge.invoke('imagePreview', {
            'current' : curSrc,
            'urls' : srcList
        });
    }

    /**
     * 显示网页右上角的按钮
     */
    function showOptionMenu() {
        WeixinJSBridge.call('showOptionMenu');
    }


    /**
     * 隐藏网页右上角的按钮
     */
    function hideOptionMenu() {
        WeixinJSBridge.call('hideOptionMenu');
    }

    /**
     * 显示底部工具栏
     */
    function showToolbar() {
        WeixinJSBridge.call('showToolbar');
    }

    /**
     * 隐藏底部工具栏
     */
    function hideToolbar() {
        WeixinJSBridge.call('hideToolbar');
    }

    /**
     * 返回如下几种类型：
     *
     * network_type:wifi     wifi网络
     * network_type:edge     非wifi,包含3G/2G
     * network_type:fail     网络断开连接
     * network_type:wwan     2g或者3g
     *
     * 使用方法：
     * WeixinApi.getNetworkType(function(networkType){
     *
     * });
     *
     * @param callback
     */
    function getNetworkType(callback) {
        if (callback && typeof callback == 'function') {
            WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                // 在这里拿到e.err_msg，这里面就包含了所有的网络类型
                callback(e.err_msg);
            });
        }
    }

    /**
     * 关闭当前微信公众平台页面
     */
    function closeWindow() {
        WeixinJSBridge.call("closeWindow");
    }

    /**
     * 当页面加载完毕后执行，使用方法：
     * WeixinApi.ready(function(Api){
     *     // 从这里只用Api即是WeixinApi
     * });
     * @param readyCallback
     */
    function wxJsBridgeReady(readyCallback) {
        if (readyCallback && typeof readyCallback == 'function') {
            var Api = this;
            var wxReadyFunc = function () {
                readyCallback(Api);
            };
            if (typeof window.WeixinJSBridge == "undefined"){
                if (document.addEventListener) {
                    document.addEventListener('WeixinJSBridgeReady', wxReadyFunc, false);
                } else if (document.attachEvent) {
                    document.attachEvent('WeixinJSBridgeReady', wxReadyFunc);
                    document.attachEvent('onWeixinJSBridgeReady', wxReadyFunc);
                }
            }else{
                wxReadyFunc();
            }
        }
    }

    return {
        version         :"1.9",
        ready           :wxJsBridgeReady,
        shareToTimeline :weixinShareTimeline,
        shareToWeibo    :weixinShareWeibo,
        shareToFriend   :weixinSendAppMessage,
        addContact      :addContact,
        showOptionMenu  :showOptionMenu,
        hideOptionMenu  :hideOptionMenu,
        showToolbar     :showToolbar,
        hideToolbar     :hideToolbar,
        getNetworkType  :getNetworkType,
        imagePreview    :imagePreview,
        closeWindow     :closeWindow
    };
})();
/*!
* @license SoundJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2011-2013 gskinner.com, inc.
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*/

/**!
 * SoundJS FlashPlugin also includes swfobject (http://code.google.com/p/swfobject/)
 */

this.createjs=this.createjs||{},function(){var a=createjs.SoundJS=createjs.SoundJS||{};a.version="0.5.2",a.buildDate="Thu, 12 Dec 2013 23:33:37 GMT"}(),this.createjs=this.createjs||{},function(){"use strict";var a=function(){},b=a.prototype;a.initialize=function(a){a.addEventListener=b.addEventListener,a.on=b.on,a.removeEventListener=a.off=b.removeEventListener,a.removeAllEventListeners=b.removeAllEventListeners,a.hasEventListener=b.hasEventListener,a.dispatchEvent=b.dispatchEvent,a._dispatchEvent=b._dispatchEvent,a.willTrigger=b.willTrigger},b._listeners=null,b._captureListeners=null,b.initialize=function(){},b.addEventListener=function(a,b,c){var d;d=c?this._captureListeners=this._captureListeners||{}:this._listeners=this._listeners||{};var e=d[a];return e&&this.removeEventListener(a,b,c),e=d[a],e?e.push(b):d[a]=[b],b},b.on=function(a,b,c,d,e,f){return b.handleEvent&&(c=c||b,b=b.handleEvent),c=c||this,this.addEventListener(a,function(a){b.call(c,a,e),d&&a.remove()},f)},b.removeEventListener=function(a,b,c){var d=c?this._captureListeners:this._listeners;if(d){var e=d[a];if(e)for(var f=0,g=e.length;g>f;f++)if(e[f]==b){1==g?delete d[a]:e.splice(f,1);break}}},b.off=b.removeEventListener,b.removeAllEventListeners=function(a){a?(this._listeners&&delete this._listeners[a],this._captureListeners&&delete this._captureListeners[a]):this._listeners=this._captureListeners=null},b.dispatchEvent=function(a,b){if("string"==typeof a){var c=this._listeners;if(!c||!c[a])return!1;a=new createjs.Event(a)}if(a.target=b||this,a.bubbles&&this.parent){for(var d=this,e=[d];d.parent;)e.push(d=d.parent);var f,g=e.length;for(f=g-1;f>=0&&!a.propagationStopped;f--)e[f]._dispatchEvent(a,1+(0==f));for(f=1;g>f&&!a.propagationStopped;f++)e[f]._dispatchEvent(a,3)}else this._dispatchEvent(a,2);return a.defaultPrevented},b.hasEventListener=function(a){var b=this._listeners,c=this._captureListeners;return!!(b&&b[a]||c&&c[a])},b.willTrigger=function(a){for(var b=this;b;){if(b.hasEventListener(a))return!0;b=b.parent}return!1},b.toString=function(){return"[EventDispatcher]"},b._dispatchEvent=function(a,b){var c,d=1==b?this._captureListeners:this._listeners;if(a&&d){var e=d[a.type];if(!e||!(c=e.length))return;a.currentTarget=this,a.eventPhase=b,a.removed=!1,e=e.slice();for(var f=0;c>f&&!a.immediatePropagationStopped;f++){var g=e[f];g.handleEvent?g.handleEvent(a):g(a),a.removed&&(this.off(a.type,g,1==b),a.removed=!1)}}},createjs.EventDispatcher=a}(),this.createjs=this.createjs||{},function(){"use strict";var a=function(a,b,c){this.initialize(a,b,c)},b=a.prototype;b.type=null,b.target=null,b.currentTarget=null,b.eventPhase=0,b.bubbles=!1,b.cancelable=!1,b.timeStamp=0,b.defaultPrevented=!1,b.propagationStopped=!1,b.immediatePropagationStopped=!1,b.removed=!1,b.initialize=function(a,b,c){this.type=a,this.bubbles=b,this.cancelable=c,this.timeStamp=(new Date).getTime()},b.preventDefault=function(){this.defaultPrevented=!0},b.stopPropagation=function(){this.propagationStopped=!0},b.stopImmediatePropagation=function(){this.immediatePropagationStopped=this.propagationStopped=!0},b.remove=function(){this.removed=!0},b.clone=function(){return new a(this.type,this.bubbles,this.cancelable)},b.toString=function(){return"[Event (type="+this.type+")]"},createjs.Event=a}(),this.createjs=this.createjs||{},function(){"use strict";createjs.indexOf=function(a,b){for(var c=0,d=a.length;d>c;c++)if(b===a[c])return c;return-1}}(),this.createjs=this.createjs||{},function(){"use strict";createjs.proxy=function(a,b){var c=Array.prototype.slice.call(arguments,2);return function(){return a.apply(b,Array.prototype.slice.call(arguments,0).concat(c))}}}(),this.createjs=this.createjs||{},function(){"use strict";function a(){throw"Sound cannot be instantiated"}function b(a,b){this.init(a,b)}function c(){this.isDefault=!0,this.addEventListener=this.removeEventListener=this.removeAllEventListeners=this.dispatchEvent=this.hasEventListener=this._listeners=this._interrupt=this._playFailed=this.pause=this.resume=this.play=this._beginPlaying=this._cleanUp=this.stop=this.setMasterVolume=this.setVolume=this.mute=this.setMute=this.getMute=this.setPan=this.getPosition=this.setPosition=this.playFailed=function(){return!1},this.getVolume=this.getPan=this.getDuration=function(){return 0},this.playState=a.PLAY_FAILED,this.toString=function(){return"[Sound Default Sound Instance]"}}function d(){}var e=a;e.DELIMITER="|",e.INTERRUPT_ANY="any",e.INTERRUPT_EARLY="early",e.INTERRUPT_LATE="late",e.INTERRUPT_NONE="none",e.PLAY_INITED="playInited",e.PLAY_SUCCEEDED="playSucceeded",e.PLAY_INTERRUPTED="playInterrupted",e.PLAY_FINISHED="playFinished",e.PLAY_FAILED="playFailed",e.SUPPORTED_EXTENSIONS=["mp3","ogg","mpeg","wav","m4a","mp4","aiff","wma","mid"],e.EXTENSION_MAP={m4a:"mp4"},e.FILE_PATTERN=/^(?:(\w+:)\/{2}(\w+(?:\.\w+)*\/?))?([/.]*?(?:[^?]+)?\/)?((?:[^/?]+)\.(\w+))(?:\?(\S+)?)?$/,e.defaultInterruptBehavior=e.INTERRUPT_NONE,e.alternateExtensions=[],e._lastID=0,e.activePlugin=null,e._pluginsRegistered=!1,e._masterVolume=1,e._masterMute=!1,e._instances=[],e._idHash={},e._preloadHash={},e._defaultSoundInstance=null,e.addEventListener=null,e.removeEventListener=null,e.removeAllEventListeners=null,e.dispatchEvent=null,e.hasEventListener=null,e._listeners=null,createjs.EventDispatcher.initialize(e),e._sendFileLoadEvent=function(a){if(e._preloadHash[a])for(var b=0,c=e._preloadHash[a].length;c>b;b++){var d=e._preloadHash[a][b];if(e._preloadHash[a][b]=!0,e.hasEventListener("fileload")){var f=new createjs.Event("fileload");f.src=d.src,f.id=d.id,f.data=d.data,e.dispatchEvent(f)}}},e.getPreloadHandlers=function(){return{callback:createjs.proxy(e.initLoad,e),types:["sound"],extensions:e.SUPPORTED_EXTENSIONS}},e.registerPlugin=function(a){try{console.log("createjs.Sound.registerPlugin has been deprecated. Please use registerPlugins.")}catch(b){}return e._registerPlugin(a)},e._registerPlugin=function(a){return e._pluginsRegistered=!0,null==a?!1:a.isSupported()?(e.activePlugin=new a,!0):!1},e.registerPlugins=function(a){for(var b=0,c=a.length;c>b;b++){var d=a[b];if(e._registerPlugin(d))return!0}return!1},e.initializeDefaultPlugins=function(){return null!=e.activePlugin?!0:e._pluginsRegistered?!1:e.registerPlugins([createjs.WebAudioPlugin,createjs.HTMLAudioPlugin])?!0:!1},e.isReady=function(){return null!=e.activePlugin},e.getCapabilities=function(){return null==e.activePlugin?null:e.activePlugin._capabilities},e.getCapability=function(a){return null==e.activePlugin?null:e.activePlugin._capabilities[a]},e.initLoad=function(a,b,c,d,f){a=a.replace(f,"");var g=e.registerSound(a,c,d,!1,f);return null==g?!1:g},e.registerSound=function(a,c,d,f,g){if(!e.initializeDefaultPlugins())return!1;if(a instanceof Object&&(g=c,c=a.id,d=a.data,a=a.src),e.alternateExtensions.length)var h=e._parsePath2(a,"sound",c,d);else var h=e._parsePath(a,"sound",c,d);if(null==h)return!1;null!=g&&(a=g+a,h.src=g+h.src),null!=c&&(e._idHash[c]=h.src);var i=null;null!=d&&(isNaN(d.channels)?isNaN(d)||(i=parseInt(d)):i=parseInt(d.channels));var j=e.activePlugin.register(h.src,i);if(null!=j&&(null!=j.numChannels&&(i=j.numChannels),b.create(h.src,i),null!=d&&isNaN(d)?d.channels=h.data.channels=i||b.maxPerChannel():d=h.data=i||b.maxPerChannel(),null!=j.tag?h.tag=j.tag:j.src&&(h.src=j.src),null!=j.completeHandler&&(h.completeHandler=j.completeHandler),j.type&&(h.type=j.type)),0!=f)if(e._preloadHash[h.src]||(e._preloadHash[h.src]=[]),e._preloadHash[h.src].push({src:a,id:c,data:d}),1==e._preloadHash[h.src].length)e.activePlugin.preload(h.src,j);else if(1==e._preloadHash[h.src][0])return!0;return h},e.registerManifest=function(a,b){for(var c=[],d=0,e=a.length;e>d;d++)c[d]=createjs.Sound.registerSound(a[d].src,a[d].id,a[d].data,a[d].preload,b);return c},e.removeSound=function(a,c){if(null==e.activePlugin)return!1;if(a instanceof Object&&(a=a.src),a=e._getSrcById(a),e.alternateExtensions.length)var d=e._parsePath2(a);else var d=e._parsePath(a);if(null==d)return!1;null!=c&&(d.src=c+d.src),a=d.src;for(var f in e._idHash)e._idHash[f]==a&&delete e._idHash[f];return b.removeSrc(a),delete e._preloadHash[a],e.activePlugin.removeSound(a),!0},e.removeManifest=function(a,b){for(var c=[],d=0,e=a.length;e>d;d++)c[d]=createjs.Sound.removeSound(a[d].src,b);return c},e.removeAllSounds=function(){e._idHash={},e._preloadHash={},b.removeAll(),e.activePlugin.removeAllSounds()},e.loadComplete=function(a){if(e.alternateExtensions.length)var b=e._parsePath2(a,"sound");else var b=e._parsePath(a,"sound");return a=b?e._getSrcById(b.src):e._getSrcById(a),1==e._preloadHash[a][0]},e._parsePath=function(a,b,c,d){"string"!=typeof a&&(a=a.toString());var f=a.split(e.DELIMITER);if(f.length>1)try{console.log('createjs.Sound.DELIMITER "|" loading approach has been deprecated. Please use the new alternateExtensions property.')}catch(g){}for(var h={type:b||"sound",id:c,data:d},i=e.getCapabilities(),j=0,k=f.length;k>j;j++){var l=f[j],m=l.match(e.FILE_PATTERN);if(null==m)return!1;var n=m[4],o=m[5];if(i[o]&&createjs.indexOf(e.SUPPORTED_EXTENSIONS,o)>-1)return h.name=n,h.src=l,h.extension=o,h}return null},e._parsePath2=function(a,b,c,d){"string"!=typeof a&&(a=a.toString());var f=a.match(e.FILE_PATTERN);if(null==f)return!1;for(var g=f[4],h=f[5],i=e.getCapabilities(),j=0;!i[h];)if(h=e.alternateExtensions[j++],j>e.alternateExtensions.length)return null;a=a.replace("."+f[5],"."+h);var k={type:b||"sound",id:c,data:d};return k.name=g,k.src=a,k.extension=h,k},e.play=function(a,b,c,d,f,g,h){var i=e.createInstance(a),j=e._playInstance(i,b,c,d,f,g,h);return j||i.playFailed(),i},e.createInstance=function(c){if(!e.initializeDefaultPlugins())return e._defaultSoundInstance;if(c=e._getSrcById(c),e.alternateExtensions.length)var d=e._parsePath2(c,"sound");else var d=e._parsePath(c,"sound");var f=null;return null!=d&&null!=d.src?(b.create(d.src),f=e.activePlugin.create(d.src)):f=a._defaultSoundInstance,f.uniqueId=e._lastID++,f},e.setVolume=function(a){if(null==Number(a))return!1;if(a=Math.max(0,Math.min(1,a)),e._masterVolume=a,!this.activePlugin||!this.activePlugin.setVolume||!this.activePlugin.setVolume(a))for(var b=this._instances,c=0,d=b.length;d>c;c++)b[c].setMasterVolume(a)},e.getVolume=function(){return e._masterVolume},e.setMute=function(a){if(null==a||void 0==a)return!1;if(this._masterMute=a,!this.activePlugin||!this.activePlugin.setMute||!this.activePlugin.setMute(a))for(var b=this._instances,c=0,d=b.length;d>c;c++)b[c].setMasterMute(a);return!0},e.getMute=function(){return this._masterMute},e.stop=function(){for(var a=this._instances,b=a.length;b--;)a[b].stop()},e._playInstance=function(a,b,c,d,f,g,h){if(b instanceof Object&&(c=b.delay,d=b.offset,f=b.loop,g=b.volume,h=b.pan,b=b.interrupt),b=b||e.defaultInterruptBehavior,null==c&&(c=0),null==d&&(d=a.getPosition()),null==f&&(f=0),null==g&&(g=a.volume),null==h&&(h=a.pan),0==c){var i=e._beginPlaying(a,b,d,f,g,h);if(!i)return!1}else{var j=setTimeout(function(){e._beginPlaying(a,b,d,f,g,h)},c);a._delayTimeoutId=j}return this._instances.push(a),!0},e._beginPlaying=function(a,c,d,e,f,g){if(!b.add(a,c))return!1;var h=a._beginPlaying(d,e,f,g);if(!h){var i=createjs.indexOf(this._instances,a);return i>-1&&this._instances.splice(i,1),!1}return!0},e._getSrcById=function(a){return null==e._idHash||null==e._idHash[a]?a:e._idHash[a]},e._playFinished=function(a){b.remove(a);var c=createjs.indexOf(this._instances,a);c>-1&&this._instances.splice(c,1)},createjs.Sound=a,b.channels={},b.create=function(a,c){var d=b.get(a);return null==d?(b.channels[a]=new b(a,c),!0):!1},b.removeSrc=function(a){var c=b.get(a);return null==c?!1:(c.removeAll(),delete b.channels[a],!0)},b.removeAll=function(){for(var a in b.channels)b.channels[a].removeAll();b.channels={}},b.add=function(a,c){var d=b.get(a.src);return null==d?!1:d.add(a,c)},b.remove=function(a){var c=b.get(a.src);return null==c?!1:(c.remove(a),!0)},b.maxPerChannel=function(){return f.maxDefault},b.get=function(a){return b.channels[a]};var f=b.prototype;f.src=null,f.max=null,f.maxDefault=100,f.length=0,f.init=function(a,b){this.src=a,this.max=b||this.maxDefault,-1==this.max&&(this.max=this.maxDefault),this._instances=[]},f.get=function(a){return this._instances[a]},f.add=function(a,b){return this.getSlot(b,a)?(this._instances.push(a),this.length++,!0):!1},f.remove=function(a){var b=createjs.indexOf(this._instances,a);return-1==b?!1:(this._instances.splice(b,1),this.length--,!0)},f.removeAll=function(){for(var a=this.length-1;a>=0;a--)this._instances[a].stop()},f.getSlot=function(b){for(var c,d,e=0,f=this.max;f>e;e++){if(c=this.get(e),null==c)return!0;(b!=a.INTERRUPT_NONE||c.playState==a.PLAY_FINISHED)&&(0!=e?c.playState==a.PLAY_FINISHED||c.playState==a.PLAY_INTERRUPTED||c.playState==a.PLAY_FAILED?d=c:(b==a.INTERRUPT_EARLY&&c.getPosition()<d.getPosition()||b==a.INTERRUPT_LATE&&c.getPosition()>d.getPosition())&&(d=c):d=c)}return null!=d?(d._interrupt(),this.remove(d),!0):!1},f.toString=function(){return"[Sound SoundChannel]"},a._defaultSoundInstance=new c,d.init=function(){var a=window.navigator.userAgent;d.isFirefox=a.indexOf("Firefox")>-1,d.isOpera=null!=window.opera,d.isChrome=a.indexOf("Chrome")>-1,d.isIOS=a.indexOf("iPod")>-1||a.indexOf("iPhone")>-1||a.indexOf("iPad")>-1,d.isAndroid=a.indexOf("Android")>-1,d.isBlackberry=a.indexOf("Blackberry")>-1},d.init(),createjs.Sound.BrowserDetect=d}(),this.createjs=this.createjs||{},function(){"use strict";function a(){this._init()}var b=a;b._capabilities=null,b.isSupported=function(){var a=createjs.Sound.BrowserDetect.isIOS||createjs.Sound.BrowserDetect.isAndroid||createjs.Sound.BrowserDetect.isBlackberry;return"file:"!=location.protocol||a||this._isFileXHRSupported()?(b._generateCapabilities(),null==b.context?!1:!0):!1},b._isFileXHRSupported=function(){var a=!0,b=new XMLHttpRequest;try{b.open("GET","fail.fail",!1)}catch(c){return a=!1}b.onerror=function(){a=!1},b.onload=function(){a=404==this.status||200==this.status||0==this.status&&""!=this.response};try{b.send()}catch(c){a=!1}return a},b._generateCapabilities=function(){if(null==b._capabilities){var a=document.createElement("audio");if(null==a.canPlayType)return null;if(window.webkitAudioContext)b.context=new webkitAudioContext;else{if(!window.AudioContext)return null;b.context=new AudioContext}b._compatibilitySetUp(),b.playEmptySound(),b._capabilities={panning:!0,volume:!0,tracks:-1};for(var c=createjs.Sound.SUPPORTED_EXTENSIONS,d=createjs.Sound.EXTENSION_MAP,e=0,f=c.length;f>e;e++){var g=c[e],h=d[g]||g;b._capabilities[g]="no"!=a.canPlayType("audio/"+g)&&""!=a.canPlayType("audio/"+g)||"no"!=a.canPlayType("audio/"+h)&&""!=a.canPlayType("audio/"+h)}b.context.destination.numberOfChannels<2&&(b._capabilities.panning=!1),b.dynamicsCompressorNode=b.context.createDynamicsCompressor(),b.dynamicsCompressorNode.connect(b.context.destination),b.gainNode=b.context.createGain(),b.gainNode.connect(b.dynamicsCompressorNode)}},b._compatibilitySetUp=function(){if(!b.context.createGain){b.context.createGain=b.context.createGainNode;var a=b.context.createBufferSource();a.__proto__.start=a.__proto__.noteGrainOn,a.__proto__.stop=a.__proto__.noteOff,this._panningModel=0}},b.playEmptySound=function(){var a=this.context.createBuffer(1,1,22050),b=this.context.createBufferSource();b.buffer=a,b.connect(this.context.destination),b.start(0,0,0)};var c=a.prototype;c._capabilities=null,c._volume=1,c.context=null,c._panningModel="equalpower",c.dynamicsCompressorNode=null,c.gainNode=null,c._arrayBuffers=null,c._init=function(){this._capabilities=b._capabilities,this._arrayBuffers={},this.context=b.context,this.gainNode=b.gainNode,this.dynamicsCompressorNode=b.dynamicsCompressorNode},c.register=function(a){this._arrayBuffers[a]=!0;var b=new createjs.WebAudioPlugin.Loader(a,this);return{tag:b}},c.isPreloadStarted=function(a){return null!=this._arrayBuffers[a]},c.isPreloadComplete=function(a){return!(null==this._arrayBuffers[a]||1==this._arrayBuffers[a])},c.removeSound=function(a){delete this._arrayBuffers[a]},c.removeAllSounds=function(){this._arrayBuffers={}},c.addPreloadResults=function(a,b){this._arrayBuffers[a]=b},c._handlePreloadComplete=function(){createjs.Sound._sendFileLoadEvent(this.src)},c.preload=function(a){this._arrayBuffers[a]=!0;var b=new createjs.WebAudioPlugin.Loader(a,this);b.onload=this._handlePreloadComplete,b.load()},c.create=function(a){return this.isPreloadStarted(a)||this.preload(a),new createjs.WebAudioPlugin.SoundInstance(a,this)},c.setVolume=function(a){return this._volume=a,this._updateVolume(),!0},c._updateVolume=function(){var a=createjs.Sound._masterMute?0:this._volume;a!=this.gainNode.gain.value&&(this.gainNode.gain.value=a)},c.getVolume=function(){return this._volume},c.setMute=function(){return this._updateVolume(),!0},c.toString=function(){return"[WebAudioPlugin]"},createjs.WebAudioPlugin=a}(),function(){"use strict";function a(a,b){this._init(a,b)}var b=a.prototype=new createjs.EventDispatcher;b.src=null,b.uniqueId=-1,b.playState=null,b._owner=null,b._offset=0,b._delay=0,b._volume=1;try{Object.defineProperty(b,"volume",{get:function(){return this._volume},set:function(a){return null==Number(a)?!1:(a=Math.max(0,Math.min(1,a)),this._volume=a,this._updateVolume(),void 0)}})}catch(c){}b._pan=0;try{Object.defineProperty(b,"pan",{get:function(){return this._pan},set:function(a){return this._owner._capabilities.panning&&null!=Number(a)?(a=Math.max(-1,Math.min(1,a)),this._pan=a,this.panNode.setPosition(a,0,-.5),void 0):!1}})}catch(c){}b._duration=0,b._remainingLoops=0,b._delayTimeoutId=null,b._soundCompleteTimeout=null,b.gainNode=null,b.panNode=null,b.sourceNode=null,b._sourceNodeNext=null,b._muted=!1,b._paused=!1,b._startTime=0,b._endedHandler=null,b._sendEvent=function(a){var b=new createjs.Event(a);this.dispatchEvent(b)},b._init=function(a,b){this._owner=b,this.src=a,this.gainNode=this._owner.context.createGain(),this.panNode=this._owner.context.createPanner(),this.panNode.panningModel=this._owner._panningModel,this.panNode.connect(this.gainNode),this._owner.isPreloadComplete(this.src)&&(this._duration=1e3*this._owner._arrayBuffers[this.src].duration),this._endedHandler=createjs.proxy(this._handleSoundComplete,this)},b._cleanUp=function(){this.sourceNode&&this.playState==createjs.Sound.PLAY_SUCCEEDED&&(this.sourceNode=this._cleanUpAudioNode(this.sourceNode),this._sourceNodeNext=this._cleanUpAudioNode(this._sourceNodeNext)),0!=this.gainNode.numberOfOutputs&&this.gainNode.disconnect(0),clearTimeout(this._delayTimeoutId),clearTimeout(this._soundCompleteTimeout),this._startTime=0,null!=window.createjs&&createjs.Sound._playFinished(this)},b._cleanUpAudioNode=function(a){return a&&(a.stop(0),a.disconnect(this.panNode),a=null),a},b._interrupt=function(){this._cleanUp(),this.playState=createjs.Sound.PLAY_INTERRUPTED,this._paused=!1,this._sendEvent("interrupted")},b._handleSoundReady=function(){if(null!=window.createjs){if(1e3*this._offset>this.getDuration())return this.playFailed(),void 0;this._offset<0&&(this._offset=0),this.playState=createjs.Sound.PLAY_SUCCEEDED,this._paused=!1,this.gainNode.connect(this._owner.gainNode);var a=this._owner._arrayBuffers[this.src].duration;this.sourceNode=this._createAndPlayAudioNode(this._owner.context.currentTime-a,this._offset),this._duration=1e3*a,this._startTime=this.sourceNode.startTime-this._offset,this._soundCompleteTimeout=setTimeout(this._endedHandler,1e3*(a-this._offset)),0!=this._remainingLoops&&(this._sourceNodeNext=this._createAndPlayAudioNode(this._startTime,0))}},b._createAndPlayAudioNode=function(a,b){var c=this._owner.context.createBufferSource();return c.buffer=this._owner._arrayBuffers[this.src],c.connect(this.panNode),this._owner.context.currentTime,c.startTime=a+c.buffer.duration,c.start(c.startTime,b,c.buffer.duration-b),c},b.play=function(a,b,c,d,e,f){this._cleanUp(),createjs.Sound._playInstance(this,a,b,c,d,e,f)},b._beginPlaying=function(a,b,c,d){return null!=window.createjs&&this.src?(this._offset=a/1e3,this._remainingLoops=b,this.volume=c,this.pan=d,this._owner.isPreloadComplete(this.src)?(this._handleSoundReady(null),this._sendEvent("succeeded"),1):(this.playFailed(),void 0)):void 0},b.pause=function(){return this._paused||this.playState!=createjs.Sound.PLAY_SUCCEEDED?!1:(this._paused=!0,this._offset=this._owner.context.currentTime-this._startTime,this._cleanUpAudioNode(this.sourceNode),this._cleanUpAudioNode(this._sourceNodeNext),0!=this.gainNode.numberOfOutputs&&this.gainNode.disconnect(),clearTimeout(this._delayTimeoutId),clearTimeout(this._soundCompleteTimeout),!0)},b.resume=function(){return this._paused?(this._handleSoundReady(null),!0):!1},b.stop=function(){return this._cleanUp(),this.playState=createjs.Sound.PLAY_FINISHED,this._offset=0,!0},b.setVolume=function(a){return this.volume=a,!0},b._updateVolume=function(){var a=this._muted?0:this._volume;return a!=this.gainNode.gain.value?(this.gainNode.gain.value=a,!0):!1},b.getVolume=function(){return this.volume},b.setMute=function(a){return null==a||void 0==a?!1:(this._muted=a,this._updateVolume(),!0)},b.getMute=function(){return this._muted},b.setPan=function(a){return this.pan=a,this.pan!=a?!1:void 0},b.getPan=function(){return this.pan},b.getPosition=function(){if(this._paused||null==this.sourceNode)var a=this._offset;else var a=this._owner.context.currentTime-this._startTime;return 1e3*a},b.setPosition=function(a){return this._offset=a/1e3,this.sourceNode&&this.playState==createjs.Sound.PLAY_SUCCEEDED&&(this._cleanUpAudioNode(this.sourceNode),this._cleanUpAudioNode(this._sourceNodeNext),clearTimeout(this._soundCompleteTimeout)),this._paused||this.playState!=createjs.Sound.PLAY_SUCCEEDED||this._handleSoundReady(null),!0},b.getDuration=function(){return this._duration},b._handleSoundComplete=function(){return this._offset=0,0!=this._remainingLoops?(this._remainingLoops--,this._sourceNodeNext?(this._cleanUpAudioNode(this.sourceNode),this.sourceNode=this._sourceNodeNext,this._startTime=this.sourceNode.startTime,this._sourceNodeNext=this._createAndPlayAudioNode(this._startTime,0),this._soundCompleteTimeout=setTimeout(this._endedHandler,this._duration)):this._handleSoundReady(null),this._sendEvent("loop"),void 0):(null!=window.createjs&&(this._cleanUp(),this.playState=createjs.Sound.PLAY_FINISHED,this._sendEvent("complete")),void 0)},b.playFailed=function(){null!=window.createjs&&(this._cleanUp(),this.playState=createjs.Sound.PLAY_FAILED,this._sendEvent("failed"))},b.toString=function(){return"[WebAudioPlugin SoundInstance]"},createjs.WebAudioPlugin.SoundInstance=a}(),function(){"use strict";function a(a,b){this._init(a,b)}var b=a.prototype;b.request=null,b.owner=null,b.progress=-1,b.src=null,b.originalSrc=null,b.result=null,b.onload=null,b.onprogress=null,b.onError=null,b._init=function(a,b){this.src=a,this.originalSrc=a,this.owner=b},b.load=function(a){null!=a&&(this.src=a),this.request=new XMLHttpRequest,this.request.open("GET",this.src,!0),this.request.responseType="arraybuffer",this.request.onload=createjs.proxy(this.handleLoad,this),this.request.onError=createjs.proxy(this.handleError,this),this.request.onprogress=createjs.proxy(this.handleProgress,this),this.request.send()},b.handleProgress=function(a,b){this.progress=a/b,null!=this.onprogress&&this.onprogress({loaded:a,total:b,progress:this.progress})},b.handleLoad=function(){this.owner.context.decodeAudioData(this.request.response,createjs.proxy(this.handleAudioDecoded,this),createjs.proxy(this.handleError,this))},b.handleAudioDecoded=function(a){this.progress=1,this.result=a,this.src=this.originalSrc,this.owner.addPreloadResults(this.src,this.result),this.onload&&this.onload()},b.handleError=function(a){this.owner.removeSound(this.src),this.onerror&&this.onerror(a)},b.toString=function(){return"[WebAudioPlugin Loader]"},createjs.WebAudioPlugin.Loader=a}(),this.createjs=this.createjs||{},function(){"use strict";function a(){this._init()}var b=a;b.MAX_INSTANCES=30,b._AUDIO_READY="canplaythrough",b._AUDIO_ENDED="ended",b._AUDIO_SEEKED="seeked",b._AUDIO_STALLED="stalled",b._capabilities=null,b.enableIOS=!1,b.isSupported=function(){if(createjs.Sound.BrowserDetect.isIOS&&!b.enableIOS)return!1;b._generateCapabilities();var a=b.tag;return null==a||null==b._capabilities?!1:!0},b._generateCapabilities=function(){if(null==b._capabilities){var a=b.tag=document.createElement("audio");if(null==a.canPlayType)return null;b._capabilities={panning:!0,volume:!0,tracks:-1};for(var c=createjs.Sound.SUPPORTED_EXTENSIONS,d=createjs.Sound.EXTENSION_MAP,e=0,f=c.length;f>e;e++){var g=c[e],h=d[g]||g;b._capabilities[g]="no"!=a.canPlayType("audio/"+g)&&""!=a.canPlayType("audio/"+g)||"no"!=a.canPlayType("audio/"+h)&&""!=a.canPlayType("audio/"+h)}}};var c=a.prototype;c._capabilities=null,c._audioSources=null,c.defaultNumChannels=2,c.loadedHandler=null,c._init=function(){this._capabilities=b._capabilities,this._audioSources={}},c.register=function(a,b){this._audioSources[a]=!0;for(var c=createjs.HTMLAudioPlugin.TagPool.get(a),d=null,e=b||this.defaultNumChannels,f=0;e>f;f++)d=this._createTag(a),c.add(d);if(d.id=a,this.loadedHandler=createjs.proxy(this._handleTagLoad,this),d.addEventListener&&d.addEventListener("canplaythrough",this.loadedHandler),null==d.onreadystatechange)d.onreadystatechange=this.loadedHandler;else{var g=d.onreadystatechange;d.onreadystatechange=function(){g(),this.loadedHandler()}}return{tag:d,numChannels:e}},c._handleTagLoad=function(a){a.target.removeEventListener&&a.target.removeEventListener("canplaythrough",this.loadedHandler),a.target.onreadystatechange=null,a.target.src!=a.target.id&&createjs.HTMLAudioPlugin.TagPool.checkSrc(a.target.id)},c._createTag=function(a){var b=document.createElement("audio");return b.autoplay=!1,b.preload="none",b.src=a,b},c.removeSound=function(a){delete this._audioSources[a],createjs.HTMLAudioPlugin.TagPool.remove(a)},c.removeAllSounds=function(){this._audioSources={},createjs.HTMLAudioPlugin.TagPool.removeAll()},c.create=function(a){if(!this.isPreloadStarted(a)){var b=createjs.HTMLAudioPlugin.TagPool.get(a),c=this._createTag(a);c.id=a,b.add(c),this.preload(a,{tag:c})}return new createjs.HTMLAudioPlugin.SoundInstance(a,this)},c.isPreloadStarted=function(a){return null!=this._audioSources[a]},c.preload=function(a,b){this._audioSources[a]=!0,new createjs.HTMLAudioPlugin.Loader(a,b.tag)},c.toString=function(){return"[HTMLAudioPlugin]"},createjs.HTMLAudioPlugin=a}(),function(){"use strict";function a(a,b){this._init(a,b)}var b=a.prototype=new createjs.EventDispatcher;b.src=null,b.uniqueId=-1,b.playState=null,b._owner=null,b.loaded=!1,b._offset=0,b._delay=0,b._volume=1;try{Object.defineProperty(b,"volume",{get:function(){return this._volume},set:function(a){null!=Number(a)&&(a=Math.max(0,Math.min(1,a)),this._volume=a,this._updateVolume())}})}catch(c){}b.pan=0,b._duration=0,b._remainingLoops=0,b._delayTimeoutId=null,b.tag=null,b._muted=!1,b._paused=!1,b._endedHandler=null,b._readyHandler=null,b._stalledHandler=null,b.loopHandler=null,b._init=function(a,b){this.src=a,this._owner=b,this._endedHandler=createjs.proxy(this._handleSoundComplete,this),this._readyHandler=createjs.proxy(this._handleSoundReady,this),this._stalledHandler=createjs.proxy(this._handleSoundStalled,this),this.loopHandler=createjs.proxy(this.handleSoundLoop,this)},b._sendEvent=function(a){var b=new createjs.Event(a);this.dispatchEvent(b)},b._cleanUp=function(){var a=this.tag;if(null!=a){a.pause(),a.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_ENDED,this._endedHandler,!1),a.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_READY,this._readyHandler,!1),a.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1);try{a.currentTime=0}catch(b){}createjs.HTMLAudioPlugin.TagPool.setInstance(this.src,a),this.tag=null}clearTimeout(this._delayTimeoutId),null!=window.createjs&&createjs.Sound._playFinished(this)},b._interrupt=function(){null!=this.tag&&(this.playState=createjs.Sound.PLAY_INTERRUPTED,this._cleanUp(),this._paused=!1,this._sendEvent("interrupted"))},b.play=function(a,b,c,d,e,f){this._cleanUp(),createjs.Sound._playInstance(this,a,b,c,d,e,f)},b._beginPlaying=function(a,b,c,d){if(null==window.createjs)return-1;var e=this.tag=createjs.HTMLAudioPlugin.TagPool.getInstance(this.src);return null==e?(this.playFailed(),-1):(e.addEventListener(createjs.HTMLAudioPlugin._AUDIO_ENDED,this._endedHandler,!1),this._offset=a,this.volume=c,this.pan=d,this._updateVolume(),this._remainingLoops=b,4!==e.readyState?(e.addEventListener(createjs.HTMLAudioPlugin._AUDIO_READY,this._readyHandler,!1),e.addEventListener(createjs.HTMLAudioPlugin._AUDIO_STALLED,this._stalledHandler,!1),e.preload="auto",e.load()):this._handleSoundReady(null),this._sendEvent("succeeded"),1)},b._handleSoundStalled=function(){this._cleanUp(),this._sendEvent("failed")},b._handleSoundReady=function(){if(null!=window.createjs){if(this._duration=1e3*this.tag.duration,this.playState=createjs.Sound.PLAY_SUCCEEDED,this._paused=!1,this.tag.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_READY,this._readyHandler,!1),this._offset>=this.getDuration())return this.playFailed(),void 0;this._offset>0&&(this.tag.currentTime=.001*this._offset),-1==this._remainingLoops&&(this.tag.loop=!0),0!=this._remainingLoops&&(this.tag.addEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1),this.tag.loop=!0),this.tag.play()}},b.pause=function(){return this._paused||this.playState!=createjs.Sound.PLAY_SUCCEEDED||null==this.tag?!1:(this._paused=!0,this.tag.pause(),clearTimeout(this._delayTimeoutId),!0)},b.resume=function(){return this._paused&&null!=this.tag?(this._paused=!1,this.tag.play(),!0):!1},b.stop=function(){return this._offset=0,this.pause(),this.playState=createjs.Sound.PLAY_FINISHED,this._cleanUp(),!0},b.setMasterVolume=function(){return this._updateVolume(),!0},b.setVolume=function(a){return this.volume=a,!0},b._updateVolume=function(){if(null!=this.tag){var a=this._muted||createjs.Sound._masterMute?0:this._volume*createjs.Sound._masterVolume;return a!=this.tag.volume&&(this.tag.volume=a),!0}return!1},b.getVolume=function(){return this.volume},b.setMasterMute=function(){return this._updateVolume(),!0},b.setMute=function(a){return null==a||void 0==a?!1:(this._muted=a,this._updateVolume(),!0)},b.getMute=function(){return this._muted},b.setPan=function(){return!1},b.getPan=function(){return 0},b.getPosition=function(){return null==this.tag?this._offset:1e3*this.tag.currentTime},b.setPosition=function(a){if(null==this.tag)this._offset=a;else{this.tag.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1);try{this.tag.currentTime=.001*a}catch(b){return!1}this.tag.addEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1)}return!0},b.getDuration=function(){return this._duration},b._handleSoundComplete=function(){this._offset=0,null!=window.createjs&&(this.playState=createjs.Sound.PLAY_FINISHED,this._cleanUp(),this._sendEvent("complete"))},b.handleSoundLoop=function(){this._offset=0,this._remainingLoops--,0==this._remainingLoops&&(this.tag.loop=!1,this.tag.removeEventListener(createjs.HTMLAudioPlugin._AUDIO_SEEKED,this.loopHandler,!1)),this._sendEvent("loop")},b.playFailed=function(){null!=window.createjs&&(this.playState=createjs.Sound.PLAY_FAILED,this._cleanUp(),this._sendEvent("failed"))},b.toString=function(){return"[HTMLAudioPlugin SoundInstance]"},createjs.HTMLAudioPlugin.SoundInstance=a}(),function(){"use strict";function a(a,b){this._init(a,b)}var b=a.prototype;b.src=null,b.tag=null,b.preloadTimer=null,b.loadedHandler=null,b._init=function(a,b){if(this.src=a,this.tag=b,this.preloadTimer=setInterval(createjs.proxy(this.preloadTick,this),200),this.loadedHandler=createjs.proxy(this.sendLoadedEvent,this),this.tag.addEventListener&&this.tag.addEventListener("canplaythrough",this.loadedHandler),null==this.tag.onreadystatechange)this.tag.onreadystatechange=createjs.proxy(this.sendLoadedEvent,this);else{var c=this.tag.onreadystatechange;this.tag.onreadystatechange=function(){c(),this.tag.onreadystatechange=createjs.proxy(this.sendLoadedEvent,this)}
}this.tag.preload="auto",this.tag.load()},b.preloadTick=function(){var a=this.tag.buffered,b=this.tag.duration;a.length>0&&a.end(0)>=b-1&&this.handleTagLoaded()},b.handleTagLoaded=function(){clearInterval(this.preloadTimer)},b.sendLoadedEvent=function(){this.tag.removeEventListener&&this.tag.removeEventListener("canplaythrough",this.loadedHandler),this.tag.onreadystatechange=null,createjs.Sound._sendFileLoadEvent(this.src)},b.toString=function(){return"[HTMLAudioPlugin Loader]"},createjs.HTMLAudioPlugin.Loader=a}(),function(){"use strict";function a(a){this._init(a)}var b=a;b.tags={},b.get=function(c){var d=b.tags[c];return null==d&&(d=b.tags[c]=new a(c)),d},b.remove=function(a){var c=b.tags[a];return null==c?!1:(c.removeAll(),delete b.tags[a],!0)},b.removeAll=function(){for(var a in b.tags)b.tags[a].removeAll();b.tags={}},b.getInstance=function(a){var c=b.tags[a];return null==c?null:c.get()},b.setInstance=function(a,c){var d=b.tags[a];return null==d?null:d.set(c)},b.checkSrc=function(a){var c=b.tags[a];return null==c?null:(c.checkSrcChange(),void 0)};var c=a.prototype;c.src=null,c.length=0,c.available=0,c.tags=null,c._init=function(a){this.src=a,this.tags=[]},c.add=function(a){this.tags.push(a),this.length++,this.available++},c.removeAll=function(){for(;this.length--;)delete this.tags[this.length];this.src=null,this.tags.length=0},c.get=function(){if(0==this.tags.length)return null;this.available=this.tags.length;var a=this.tags.pop();return null==a.parentNode&&document.body.appendChild(a),a},c.set=function(a){var b=createjs.indexOf(this.tags,a);-1==b&&this.tags.push(a),this.available=this.tags.length},c.checkSrcChange=function(){for(var a=this.tags.length-1,b=this.tags[a].src;a--;)this.tags[a].src=b},c.toString=function(){return"[HTMLAudioPlugin TagPool]"},createjs.HTMLAudioPlugin.TagPool=a}();
/**
 * Created by rechie on 14-8-26.
 */
function resizeContainer() {
    var widthScale = $(window).width()/640;
    var heightScale = $(window).height()/960;
    var scale = Math.min(widthScale, heightScale);
    var realWidth = 640 * scale;
    var realHeight = 960 * scale;
    if(heightScale < widthScale) {
        $(document.body).addClass('bg-body');
        $('body').css({
            'margin-left': ($(window).width() - realWidth) / 2
        });
    } else {
        $('body').css({
            'margin-top': ($(window).height() - realHeight) / 2
        });
    }
    window.scale = scale;
    var cssObj = {
        '-webkit-transform': 'scale(' + scale + ', ' + scale + ')',
        '-ms-transform': 'scale(' + scale + ', ' + scale + ')',
        '-o-transform': 'scale(' + scale + ', ' + scale + ')',
        'transform': 'scale(' + scale + ', ' + scale + ')'
    };
    $('body').css(cssObj);
}

/**
 * 预加载资源
 * @param callback
 */
function loadAssets(callback) {
    var loader = new AssetLoad({
        success: callback
    });
    var imgList = [
        'assets/images/pa0.png',
        'assets/images/pa1.png',
        'assets/images/pa2.png',
        'assets/images/pa3.png',
        'assets/images/bianzi/left0.png',
        'assets/images/bianzi/left1.png',
        'assets/images/bianzi/left2.png',
        'assets/images/bianzi/right0.png',
        'assets/images/bianzi/right1.png',
        'assets/images/bianzi/right2.png',
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
// 通过链接参数拼脸
function initFaceFromParams(){
    var defaultSetting = {
        lian: 0,
//        toufahou: 122,
//        toufaqian: 22,
//        bizi: 1,
        meimao: 0,
//        tezheng: 1,
        yanjing: 0,
//        daiyanjing: 1,
        zui: 0,
        shang: 1,
        liancolorr: 255,
        liancolorg: 255,
        liancolorb: 255,
//        toufahoucolorr: 255,
//        toufahoucolorg: 255,
//        toufahoucolorb: 255,
//        toufaqiancolorr: 255,
//        toufaqiancolorg: 255,
//        toufaqiancolorb: 255,
        sex: 'man'
    };
    RC.UTILS.merger(defaultSetting, RC.UTILS.UrlParam);


    var nameNodes = document.querySelectorAll('.name');
    for(var i=0; i<nameNodes.length; i++) {
        nameNodes[i].innerHTML = decodeURIComponent(RC.UTILS.UrlParam.username);
    }
    /**
     * TODO 通过获取数据来显示
     */
    $.ajax({
        url: 'http://sns.ismiler.cn/chouren/' + defaultSetting.uid,
        type: 'get',
        dataType: 'jsonp',
        jsonp: 'jsonp',
        success: function(data){
            if(typeof data === 'string') {
                data = JSON.parse(data);
            }
            showInfo(data);
        },
        error: function(){
            showInfo({});
        }
    });
    // 显示提示信息
    function showInfo(data) {
        var infoHtml = document.querySelector('#gameIntro .title .info').innerHTML;
        infoHtml = infoHtml.replace(/{{[^{{]*}}/ig, function(name,index, str){
            name = name.replace(/{|}/ig, '');
            if(data[name]) {
                return data[name];
            } else {
                return Math.floor(Math.random() * 1000 - 100);
            }
        });
        document.querySelector('#gameIntro .title .info').innerHTML = infoHtml;
    }

    //'被<span>{{hit_num}}</span>人打过，人品榜<span>{{ren_num}}</span>名'
    if(defaultSetting.sex === 'woman') {
        $('#gameIntro .shenti img').attr('src', 'assets/images/renkaishinv.png');
        $('#gameScreen .shenti img').attr('src', 'assets/images/dongzuo/donghuaW1.png');
        $('#result .shenti img').attr('src', 'assets/images/renjieshunv.png');
    } else {
        $('#gameIntro .shenti img').attr('src', 'assets/images/renkaishi.png');
        $('#gameScreen .shenti img').attr('src', 'assets/images/dongzuo/donghuaM1.png');
        $('#result .shenti img').attr('src', 'assets/images/renjieshunan.png');
    }
    var figureHtml = getBaseFace(defaultSetting);
    document.querySelector('#baseFace').innerHTML = figureHtml;
    var pics = [
        {
            elem: document.getElementById('lian'),
            color: [defaultSetting.liancolorr, defaultSetting.liancolorg, defaultSetting.liancolorb]
        },
        {
            elem: document.getElementById('toufahou'),
            color: [defaultSetting.toufahoucolorr, defaultSetting.toufahoucolorg, defaultSetting.toufahoucolorb]
        },
        {
            elem: document.getElementById('toufaqian'),
            color: [defaultSetting.toufaqiancolorr, defaultSetting.toufaqiancolorg, defaultSetting.toufaqiancolorb]
        }
    ];
    var index = 0;
    loadAssets(function(){
        hideLoading('#gameIntro');
    });
    for(var i = 0;i < pics.length;i ++){
        (function(i){
            var color = pics[i].color;
            if(!pics[i].elem) {
                index ++ ;
            } else {
                pics[i].elem.loadOnce(function(){
                    /*
                     防止用onload事件注册后  replace会改变img的src导致onload事件再次触发形成循环
                     */
                    window.color = color;
                    var picTranseObj = psLib(this);//创建一个psLib对象
                    var origin = picTranseObj.clone();//克隆原始对象做为原始副本

                    var grayPic = picTranseObj.act("添加杂色");
                    grayPic.replace(this);
                    index ++ ;
                    if(index === pics.length) {
                        // 加载完成后，复制
                        var baseFaceHtml = document.querySelector('#baseFace').innerHTML;
                        document.querySelector('#gameIntro .figure').innerHTML = getStartFace(defaultSetting, baseFaceHtml, defaultSetting.shang);
                        document.querySelector('#userWrap .user .figure').innerHTML = getGameFace(defaultSetting, baseFaceHtml);
                        document.querySelector('#result .figure').innerHTML = getStartFace(defaultSetting, baseFaceHtml, defaultSetting.shang);
                    }
                });
            }
        })(i);
    }
}

/**
 * 根据伤残等级获取拼脸图片
 * @param defaultSetting
 * @param level
 * @returns {string}
 */
function getStartFace(defaultSetting, baseHtml, level) {
    //头发 鼻子 特征 眼镜 胡子 帽子
    var faceHtml = baseHtml;
    if(typeof level === 'string') {
        level = parseInt(level);
    }
    level = level -1;
    if(level == 0) {
        return getGameFace(defaultSetting, baseHtml);
    }
    switch(level) {
        case 1:
            faceHtml = faceHtml +  '<img src="assets/images/meimao/TYmeimao' + defaultSetting.meimao + '.png" class="meimao zIndex3" />'
                    + '<img src="assets/images/yanjing/TYyanjing' + defaultSetting.yanjing + '.png" class="yanjing zIndex3" />';
            break;
        case 2, 4, 5, 6, 7:
            faceHtml = faceHtml + '<img src="assets/images/meimao/TYmeimao' + defaultSetting.meimao + '.png" class="meimao zIndex3" />';
            break;
        case 3:
            faceHtml = faceHtml + '<img src="assets/images/meimao/TYmeimao' + defaultSetting.meimao + '.png" class="meimao zIndex3" />'
                + '<img src="assets/images/yanjing/TYyanjing' + defaultSetting.yanjing + '.png" class="yanjing zIndex3" />';
            break;
        case 8, 9:
            break;
        default :
            break;

    }
//    faceHtml += '<img src="assets/images/meimao/TYmeimao' + defaultSetting.meimao + '.png" class="meimao zIndex3" />'
//        + '<img src="assets/images/zuiba/TYzui' + defaultSetting.zui + '.png" class="zui zIndex3">'
//        + '<img src="assets/images/yanjing/TYyanjing' + defaultSetting.yanjing + '.png" class="yanjing zIndex3" />';
    faceHtml += '<img src="assets/images/shang/TYzhengmian0' + level + '.png" class="shang' + level +  ' shang" />';
    if(defaultSetting.tezheng) {
        faceHtml += '<img src="assets/images/tezheng/TYtezheng' + defaultSetting.tezheng + '.png" class="tezheng zIndex3" />';
    }
    if(defaultSetting.daiyanjing) {
        faceHtml += '<img src="assets/images/daiyanjing/TYdaiyanjing' + defaultSetting.daiyanjing + '.png" class="daiyanjing zIndex4" />';
    }
    return faceHtml;
}

function getGameFace(defaultSetting, baseHtml) {
    //头发 鼻子 特征 眼镜 胡子 帽子
    var faceHtml = baseHtml;
    faceHtml += '<img src="assets/images/meimao/TYmeimao' + defaultSetting.meimao + '.png" class="meimao zIndex3" />'
        + '<img src="assets/images/zuiba/TYzui' + defaultSetting.zui + '.png" class="zui zIndex3">'
        + '<img src="assets/images/yanjing/TYyanjing' + defaultSetting.yanjing + '.png" class="yanjing zIndex3" />';
    if(defaultSetting.bizi) {
        faceHtml += '<img src="assets/images/bizi/TYbizi' + defaultSetting.bizi + '.png" class="bizi zIndex3" />';
    }
    if(defaultSetting.tezheng) {
        faceHtml += '<img src="assets/images/tezheng/TYtezheng' + defaultSetting.tezheng + '.png" class="tezheng zIndex3" />';
    }
    if(defaultSetting.daiyanjing) {
        faceHtml += '<img src="assets/images/daiyanjing/TYdaiyanjing' + defaultSetting.daiyanjing + '.png" class="daiyanjing zIndex4" />';
    }
    // h5暂时没有帽子
//    if(defaultSetting.maozi) {
//        faceHtml += '<img src="assets/images/daiyanjing/TYdaiyanjing' + defaultSetting.maozi + '.png" class="daiyanjing zIndex4" />';
//    }
    return faceHtml;
}
function getBaseFace(defaultSetting) {
    var faceHtml ='<img src="assets/images/lian/TYlian' + defaultSetting.lian + '.png" class="lian zIndex2" id="lian" />';
    if(defaultSetting.toufahou) {
        faceHtml += '<img src="assets/images/toufahou/TYtoufahou' + defaultSetting.toufahou + '.png" class="toufahou zIndex1" id="toufahou" />';
    }
    if(defaultSetting.toufaqian) {
        faceHtml += '<img src="assets/images/toufaqian/TYtoufaqian' + defaultSetting.toufaqian + '.png" class="toufaqian zIndex5" id="toufaqian" />';
    }
    return faceHtml;
}

function initAudio() {
    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.registerSound("assets/audio/man/0.mp3", "man0");
    createjs.Sound.registerSound("assets/audio/man/1.mp3", "man1");
    createjs.Sound.registerSound("assets/audio/woman/0.mp3", "woman0");
    createjs.Sound.registerSound("assets/audio/woman/1.mp3", "woman1");

    //createjs.Sound.addEventListener("fileload", createjs.proxy(this.loadHandler, this));
}

function showLoading(percentStr){
    $('#loading').show();
    $('#percent').html(percentStr + '%');
}

function hideLoading(selector) {
    $('#loading').hide();
    $('#percent').html('');
    $(selector).show();
}

initAudio();
initFaceFromParams();

$(document).ready(function() {
    resizeContainer();

    var bOver = false;
    var hitCount = 0;
    var gameEnd = true;
    var game = new Game();
    // 初始化计时器
    var timer = new Game.Time({
        add:1,
        minus: 5,
        sum: gameTime,
        countFunc: Game.View.setTimer,
        end: function() {
            $.ajax({
                url: 'http://sns.ismiler.cn/chouren2/' + RC.UTILS.UrlParam.uid + '/' + hitCount,
                type: 'get',
                dataType: 'jsonp',
                jsonp: 'jsonp',
                success: function(data){
                    if(typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                    $('#result .info .title .paiming').html(data.ren_num);
                },
                error: function(){
                    var curRenNum = $('#gameIntro .info span').eq(0).html();
                    $('#result .info .title .paiming').html(parseInt(curRenNum) + 1)
                }
            });
            $('#gameScreen').hide();
            $('#result .info .title .hit-count').html(hitCount);
            $('#result').show();
            gameEnd = true;
        }
    });
    game.setTimer(timer);
    $('#play img').bind('touchstart', function(){
//        loadAssets(prepare)
        prepare();
    });
    $('#replay img').bind('touchstart', function(){
        $('#gameIntro').hide();
        $('#result').hide();
        $('#gameScreen').show();
        $('#score').html('0<span>次</span>');
        $('#timer').html(gameTime + '<span>秒</span>');
        $('#gameScreen .countdown').addClass('countdown-run').show();
        hitCount = 0;
        prepareAnimate(true, 0,  function(){
            $('#gameScreen .countdown').removeClass('countdown-run').hide();
            game.replay();
            gameEnd = false;
            var slide = new RC.Slide({
                elemQuery: 'body',
                slideBegin: resolvePosition,
                slideMove: resolvePosition,
                slideEnd: function(touch){
                    try{
                        bOver = false;
                        return gameEnd;
                    } catch(e) {
                        alert('end error: ' + e.message);
                    }
                }
            });
        });
    });

    function prepare() {
        $('#gameIntro').hide();
        $('#result').hide();
        $('#gameScreen').show();
        $('#gameScreen .countdown').addClass('countdown-run')
        prepareAnimate(true, 0,  startGame);
    }

    function prepareAnimate(bShow, timeDelay, callback) {
        timeDelay = timeDelay || 0;
        var timeOut = 500;
        if(timeDelay > 2500) {
            if(typeof callback === 'function'){
                callback();
            }
            return;
        }
        if(timeDelay%1000 === 0) {
            $('#gameScreen .countdown').html(3 -timeDelay/1000);
        }
        setTimeout(function(){
            prepareAnimate(!bShow, timeDelay + timeOut, callback);
        }, timeOut);
        if(bShow) {
            $('#readyBg').show()
        } else {
            $('#readyBg').hide()
        }
    }


    function initSlide() {
        var slide = new RC.Slide({
            elemQuery: 'body',
            slideBegin: resolvePosition,
            slideMove: resolvePosition,
            slideEnd: function(touch){
                try{
                    bOver = false;
                    return gameEnd;
                } catch(e) {
                    alert('end error: ' + e.message);
                }
            }
        });
    }
    function startGame() {
        gameEnd = false;
        $('#gameScreen .countdown').removeClass('countdown-run').hide();
        game.start(initSlide);
    }
    var lastHtiTime = 0;
    var currHitTime = 0;
    function getHitLevel() {
        var hitLevel = 1;
        if(lastHtiTime !== 0) {
            currHitTime = new Date();
        }
        timeDelay = currHitTime - lastHtiTime;
        if(timeDelay > 499) {
            hitLevel = 1;
        } else if (timeDelay > 300 && timeDelay < 500) {
            hitLevel = 2;
        } else if (timeDelay > 100 && timeDelay < 301) {
            hitLevel = 3;
        } else if (timeDelay < 101) {
            hitLevel = 4;
        }
        lastHtiTime = new Date();
        return hitLevel;
    }
    function resolvePosition(touch) {
        var element = document.elementFromPoint(touch.pageX, touch.pageY);
        if($(element).attr('id') === 'userBody' || $(element).parents('#userBody').length > 0) {
            if(bOver === false) {
                var dir = (touch.pageX < $(window).width()/2) ? 'left' : 'right'
                bOver = true;
                hitCount ++ ;
                Game.View.setScore(hitCount);
                Game.Animate.twitch(getHitLevel(), RC.UTILS.UrlParam.sex, 1, dir);
                resolveBeat(RC.UTILS.UrlParam.sex, dir);
            }
        } else {
            bOver = false;
        }
    }

    /**
     * 播放声音
     * TODO 测试发现播放完后，无法设置currentTime来完成重播的效果，具体参考http://stefan321.iteye.com/blog/1574068
     * TODO 这里采取播放完重新加载的办法来处理该问题，但是会造成性能问题，每次都会重新发请求，耗费流量
     * TODO 使用sound.js来完成该功能
     * @param sex
     */
    function playAudio(sex) {
        createjs.Sound.play(sex + Math.round(Math.random()))
    }

    /**
     * 根据方向显示鞭子动画
     * @param dir
     */
    var isWhipShow = false;
    function showWhip(dir) {
        if(isWhipShow === false) {
            isWhipShow = true;
            $('.bianzi').show();
            animFunc(dir, 0, 3, function(){
                $('.bianzi').hide();
                isWhipShow = false;
            });
        }
    }

    function animFunc(dir, level, maxLevel, callback) {
        if(typeof level !== 'number') {
            console.log('reset')
            level = 0;
        }
        if(level >= maxLevel) {
            callback();
            return;
        }
        $('.bianzi img').attr('src', 'assets/images/bianzi/' + dir + level + '.png');
        var that = this;
        setTimeout(function(){
            animFunc( dir, level + 1, maxLevel, callback);
        }, 100);
    }
    /**
     * 根据性别和抽打方向处理打击事件
     * @param sex
     * @param dir
     */
    function resolveBeat(sex, dir) {
        var paIndex = Math.floor(Math.random()*3);
        $('#gameScreen .pa' + paIndex).css(getPaPostion(dir)).show();
        setTimeout(function() {
            $('#gameScreen .pa' + paIndex).hide();
        },200);
        showWhip(dir);
        playAudio(sex);
    }
    // 啪啪文字出现坐标范围
    var paPosition = {
        left:{
            max:{
                x:120,
                y:700
            },
            min:{
                x:0,
                y: 300
            }
        }, right:{
            max:{
                x: 500,
                y: 700
            },
            min:{
                x: 360,
                y: 300
            }
        }
    };
    function getPaPostion(dir) {
        var dirObj = paPosition[dir];
        var left = Math.random() * (dirObj.max.x - dirObj.min.x) + dirObj.min.x;
        var top = Math.random() * (dirObj.max.y - dirObj.min.y) + dirObj.min.y;
        return {
            left: left,
            top: top
        }
    }
});



// 微信分享代码
// 所有功能必须包含在 WeixinApi.ready 中进行
WeixinApi.ready(function(Api){

    // 微信分享的数据
//    var wxData = {
//        "imgUrl":'http://182.92.186.42/personal/slide/images/tfz.jpg',
//        "link":window.location.href,
//        "desc":'\u5927\u5bb6\u597d\uff0c\u6211\u662frechie\uff0c\u6d4b\u8bd5\u5fae\u4fe1\u5206\u4eab\u529f\u80fd',
//        "title":"\u5927\u5bb6\u597d\uff0c\u6211\u662frechie"
//    };

    // 分享的回调
    var wxCallbacks = {
        // 分享操作开始之前
        ready:function () {
//            $('.weixinState').html('ready');
            // 你可以在这里对分享的数据进行重组
        },
        // 分享被用户自动取消
        cancel:function (resp) {
//            $('.weixinState').html('cancel');
            // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
        },
        // 分享失败了
        fail:function (resp) {
//            $('.weixinState').html('fail');
            // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
        },
        // 分享成功
        confirm:function (resp) {
//            $('.weixinState').html('confirm');
            // 分享成功了，我们是不是可以做一些分享统计呢？
        },
        // 整个分享过程结束
        all:function (resp) {
            // $('.weixinState').html('end');
            // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
        }
    };

    // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
    Api.shareToFriend(wxData, wxCallbacks);

    // 点击分享到朋友圈，会执行下面这个代码
    Api.shareToTimeline(wxData, wxCallbacks);

    // 点击分享到腾讯微博，会执行下面这个代码
    Api.shareToWeibo(wxData, wxCallbacks);
});