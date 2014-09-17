var imgObj = {
	bizi: {
		'prefix': 'TYbizi',
		index: 1,
		length: 6
	},
	lian: {
		'prefix': 'TYlian',
		index: 1,
		length: 2
	},
	maozi: {
		'prefix': 'TYmaozi',
		index: 1,
		length: 3
	},
	tezheng: {
		'prefix': 'TYtezheng',
		index: 1,
		length: 4
	},
	toufahou: {
		'prefix': 'TYtoufahou',
		index: 1501,
		length: 2
	},
	toufaqian: {
		'prefix': 'TYtoufaqian',
		index: 2,
		length: 2
	},
	yanjing: {
		'prefix': 'TYyanjing',
		index: 0,
		length: 5
	},
	zui: {
		'prefix': 'TYzui',
		index: 0,
		length: 4
	}
};

var baseUrl = 'assets/images';
function loadImage() {
	
}
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

Game.prototype.assetLoadStatus = false;
Game.prototype.loadImg = function(callback) {
	var loader = new AssetLoad({
		success: callback
	});
    loader.preLoadImg('images/3.jpg');
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
		$('#score').html(score + '<span>次</span>');
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
    timeDelay : 300,
    timeBegin : 0,
    timeNow : 0,
//    frameObj : {
//        'man_1_0': 'assets/images/dongzuo/donghuaM1.png',
//        'man_1_1': 'assets/images/dongzuo/donghuaM2.png',
//        'man_1_2': 'assets/images/dongzuo/donghuaM3.png',
//        'man_2_0': 'assets/images/dongzuo/donghuaM1.png',
//        'man_2_1': 'assets/images/dongzuo/donghuaM4.png',
//        'man_2_2': 'assets/images/dongzuo/donghuaM5.png',
//        'man_3_0': 'assets/images/dongzuo/donghuaM1.png',
//        'man_3_1': 'assets/images/dongzuo/donghuaM6.png',
//        'man_3_2': 'assets/images/dongzuo/donghuaM7.png',
//        'man_4_0': 'assets/images/dongzuo/donghuaM1.png',
//        'man_4_1': 'assets/images/dongzuo/donghuaM8.png',
//        'man_4_2': 'assets/images/dongzuo/donghuaM9.png',
//        'woman_1_0': 'assets/images/dongzuo/donghuaW1.png',
//        'woman_1_1': 'assets/images/dongzuo/donghuaW2.png',
//        'woman_1_2': 'assets/images/dongzuo/donghuaW3.png',
//        'woman_2_0': 'assets/images/dongzuo/donghuaW1.png',
//        'woman_2_1': 'assets/images/dongzuo/donghuaW4.png',
//        'woman_2_2': 'assets/images/dongzuo/donghuaW5.png',
//        'woman_3_0': 'assets/images/dongzuo/donghuaW1.png',
//        'woman_3_1': 'assets/images/dongzuo/donghuaW6.png',
//        'woman_3_2': 'assets/images/dongzuo/donghuaW7.png',
//        'woman_4_0': 'assets/images/dongzuo/donghuaW1.png',
//        'woman_4_1': 'assets/images/dongzuo/donghuaW8.png',
//        'woman_4_2': 'assets/images/dongzuo/donghuaW9.png'
//    },
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
    twitch : function(level, sex, frame){
        var that = this;
        if(Game.Animate.bAnimate === false) {
            this.timeBegin = new Date();
            this.bAnimate = true;
            innerAnimate(level, sex, frame);
        }
        var paIndex = Math.floor(Math.random()*4);
        $('#gameScreen .pa' + paIndex).addClass('shake');
        setTimeout(function(){
            $('#gameScreen .pa' + paIndex).removeClass('shake');
        }, 500);
        function innerAnimate(level, sex, frame){
            that.timeNow = new Date();
            //var key = sex + '_' +  level + '_' + frame%3;
            var key = sex + '_' + Math.ceil(Math.random() * 8);
            if(that.timeNow - that.timeBegin < that.timeDelay) {
                Game.Animate.bAnimate = true;
                $('#gameScreen .shenti img').attr('src', Game.Animate.frameObj[key]);
                $('#userWrap').animate({
                    top: 10 * (frame%3-1)
                }, 10);
                that.timeId = setTimeout(function(){
                    innerAnimate(level, sex, frame+1);
                }, 100);
            } else {
                that.bAnimate = false;
                key = sex + '_' + 0;
                $('#gameScreen .shenti img').attr('src', Game.Animate.frameObj[key]);
                $('#userWrap').css({'top': 0});
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
//	prograssElem.innerHTML = (prograss|0) + '%';
	// prograssElem.innerHTML = prograss; 
	console.log('prograss: ' + (prograss|0));

	if(this.current == this.urlList.length) {
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
        'transform': 'scale(' + scale + ', ' + scale + ')',
    };
    $('body').css(cssObj);
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
    // TODO 通过获取数据来显示
    document.querySelector('#gameIntro .title .info').innerHTML = '被<span>111</span>人打过，人品榜<span>222</span>名'
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

initFaceFromParams();
$(document).ready(function() {
    resizeContainer();

    var bOver = false;
    var index = 0;
    var game = new Game();
    // 初始化计时器
    var timer = new Game.Time({
        add:1,
        minus: 5,
        countFunc: Game.View.setTimer,
        end: function() {
            $('#gameScreen').hide();
            $('#result .info .title .hit-count').html(index);
            $('#result').show();
        }
    });
    game.setTimer(timer);
    $('#play img').bind('touchstart', function(){
        prepare();
    });
    $('#replay img').bind('touchstart', function(){
        $('#gameIntro').hide();
        $('#result').hide();
        $('#gameScreen').show();
        $('#score').html('0<span>次</span>');
        $('#timer').html('60<span>秒</span>');
        prepareAnimate(true, 0,  function(){
            game.replay();
        });
    });

    function prepare() {
        $('#gameIntro').hide();
        $('#result').hide();
        $('#gameScreen').show();
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
        setTimeout(function(){
            prepareAnimate(!bShow, timeDelay + timeOut, callback);
        }, timeOut);
        if(bShow) {
            $('#readyBg').show()
        } else {
            $('#readyBg').hide()
        }
    }

    function startGame() {
        game.start();
        var slide = new RC.Slide({
            elemQuery: 'body',
            slideBegin: resolvePosition,
            slideMove: resolvePosition,
            slideEnd: function(touch){
                try{
                    bOver = false;
                } catch(e) {
                    alert('end error: ' + e.message);
                }
            }
        });
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
                bOver = true;
                index ++ ;
                Game.View.setScore(index);
                Game.Animate.twitch(getHitLevel(), RC.UTILS.UrlParam.sex, 1);
            }
        } else {
            bOver = false;
        }
    }
});



// 微信分享代码
// 所有功能必须包含在 WeixinApi.ready 中进行
WeixinApi.ready(function(Api){

    // 微信分享的数据
    var wxData = {
        "imgUrl":'http://182.92.186.42/personal/slide/images/tfz.jpg',
        "link":window.location.href,
        "desc":'\u5927\u5bb6\u597d\uff0c\u6211\u662frechie\uff0c\u6d4b\u8bd5\u5fae\u4fe1\u5206\u4eab\u529f\u80fd',
        "title":"\u5927\u5bb6\u597d\uff0c\u6211\u662frechie"
    };

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