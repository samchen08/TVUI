
//TVUI命名空间
var TVUI = (function () {
    return {
        version : '1.2.0',
        //版本号

        uuid : 0,
        //全局唯一id标识，递增

        debug : true
        //debug开关，如果打开，页面支持按键清理缓存，蓝色键刷新，支持 TVUI.Log模版
    };
})();



//支持CMD方式加载
if (typeof define !== 'undefined') {
    define(function (require, exports, module) {
        module.exports = TVUI;
    });
}
;
/**
 *  JSON对象兼容模块
 */
if (!this.JSON) {
    this.JSON = {};
}
(function () {
    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function () {
            return this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z';
        };
        String.prototype.toJSON =
            Number.prototype.toJSON =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' :
            '"' + string + '"';
    }

    function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                            mind + ']' :
                            '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', { '': value });
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/.
                test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
                    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ?
                    walk({ '': j }, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
})();;
//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = (function (undefined) {
    var key, $, classList, emptyArray = [], filter = emptyArray.filter,
        document = window.document,
        elementDisplay = {}, classCache = {},
        cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rootNodeRE = /^(?:body|html)$/i,
        capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

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
        simpleSelectorRE = /^[\w-]*$/,
        class2type = {},
        toString = class2type.toString,
        zepto = {},
        camelize, uniq,
        tempParent = document.createElement('div'),
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },
        isArray = Array.isArray ||
            function (object) {
                return object instanceof Array;
            };


    function type(obj) {
        return obj === null ? String(obj) :
            class2type[toString.call(obj)] || "object";
    }

    function isFunction(value) {
        return type(value) === "function";
    }

    function isWindow(obj) {
        return obj && obj !== null && obj === obj.window;
    }

    function isDocument(obj) {
        return obj && obj.nodeType === obj.DOCUMENT_NODE;
    }

    function isObject(obj) {
        return type(obj) === "object";
    }

    function isPlainObject(obj) {
        return obj && isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
    }

    function likeArray(obj) {
        return obj && typeof obj.length === 'number';
    }

    function compact(array) {
        return filter.call(array, function (item) {
            return item !== null;
        });
    }

    function flatten(array) {
        return array.length > 0 ? $.fn.concat.apply([], array) : array;
    }


    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }


    function classRE(name) {
        return name in classCache ?
            classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value;
    }

    function defaultDisplay(nodeName) {
        var element, display;
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName);
            document.body.appendChild(element);
            display = getComputedStyle(element, '').getPropertyValue("display");
            element.parentNode.removeChild(element);
            display == "none" && (display = "block");
            elementDisplay[nodeName] = display;
        }
        return elementDisplay[nodeName];
    }

    function children(element) {
        return 'children' in element ?
            emptyArray.slice.call(element.children) :
            $.map(element.childNodes, function (node) {
                if (node.nodeType == 1) return node;
            });
    }

    function Z(dom, selector) {
        var i, len = dom ? dom.length : 0;
        for (i = 0; i < len; i++) this[i] = dom[i];
        this.length = len;
        this.selector = selector || '';
    }


    camelize = function (str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
    };
    uniq = function (array) {
        return filter.call(array, function (item, idx) {
            return array.indexOf(item) == idx;
        });
    };

    zepto.matches = function (element, selector) {
        if (!selector || !element || element.nodeType !== 1) return false;
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
            element.oMatchesSelector || element.matchesSelector;
        if (matchesSelector) return matchesSelector.call(element, selector);
        // fall back to performing a selector:
        var match, parent = element.parentNode, temp = !parent;
        if (temp) (parent = tempParent).appendChild(element);
        match = ~zepto.qsa(parent, selector).indexOf(element);
        temp && tempParent.removeChild(element);
        return match;
    };

    // `$.zepto.fragment` takes a html string and an optional tag name
    // to generate DOM nodes nodes from the given html string.
    // The generated DOM nodes are returned as an array.
    // This function can be overriden in plugins for example to make
    // it compatible with browsers that don't support the DOM fully.
    zepto.fragment = function (html, name, properties) {
        var dom, nodes, container;

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1));

        if (!dom) {
            if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
            if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
            if (!(name in containers)) name = '*';

            container = containers[name];
            container.innerHTML = '' + html;
            dom = $.each(emptyArray.slice.call(container.childNodes), function () {
                container.removeChild(this);
            });
        }

        if (isPlainObject(properties)) {
            nodes = $(dom);
            $.each(properties, function (key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value);
                else nodes.attr(key, value);
            });
        }

        return dom;
    };

    // `$.zepto.Z` swaps out the prototype of the given `dom` array
    // of nodes with `$.fn` and thus supplying all the Zepto functions
    // to the array. This method can be overriden in plugins.
    zepto.Z = function (dom, selector) {
        return new Z(dom, selector);
    };

    // `$.zepto.isZ` should return `true` if the given object is a Zepto
    // collection. This method can be overriden in plugins.
    zepto.isZ = function (object) {
        return object instanceof zepto.Z;
    };

    // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
    // takes a CSS selector and an optional context (and handles various
    // special cases).
    // This method can be overriden in plugins.
    zepto.init = function (selector, context) {
        var dom;
        // If nothing given, return an empty Zepto collection
        if (!selector) return zepto.Z();
        // Optimize for string selectors
        else if (typeof selector == 'string') {
            selector = selector.trim();
            // If it's a html fragment, create nodes from it
            // Note: In both Chrome 21 and Firefox 15, DOM error 12
            // is thrown if the fragment doesn't begin with <
            if (selector[0] == '<' && fragmentRE.test(selector))
                dom = zepto.fragment(selector, RegExp.$1, context), selector = null;
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) return $(context).find(selector);
            // If it's a CSS selector, use it to select nodes.
            else dom = zepto.qsa(document, selector);
        }
        // If a function is given, call it when the DOM is ready
        else if (isFunction(selector)) return $(document).ready(selector);
        // If a Zepto collection is given, just return it
        else if (zepto.isZ(selector)) return selector;
        else {
            // normalize array if an array of nodes is given
            if (isArray(selector)) dom = compact(selector);
            // Wrap DOM nodes.
            else if (isObject(selector))
                dom = [selector], selector = null;
            // If it's a html fragment, create nodes from it
            else if (fragmentRE.test(selector))
                dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null;
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) return $(context).find(selector);
            // And last but no least, if it's a CSS selector, use it to select nodes.
            else dom = zepto.qsa(document, selector);
        }
        // create a new Zepto collection from the nodes found
        return zepto.Z(dom, selector);
    };

    // `$` will be the base `Zepto` object. When calling this
    // function just call `$.zepto.init, which makes the implementation
    // details of selecting nodes and creating Zepto collections
    // patchable in plugins.
    $ = function (selector, context) {
        return zepto.init(selector, context);
    };

    function extend(target, source, deep) {
        for (key in source) {
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                    target[key] = {};
                if (isArray(source[key]) && !isArray(target[key]))
                    target[key] = [];
                extend(target[key], source[key], deep);
            }
            else if (source[key] !== undefined) target[key] = source[key];
        }
    }

    // Copy all but undefined properties from one or more
    // objects to the `target` object.
    $.extend = function (target) {
        var deep, args = emptyArray.slice.call(arguments, 1);
        if (typeof target == 'boolean') {
            deep = target;
            target = args.shift();
        }
        args.forEach(function (arg) {
            extend(target, arg, deep);
        });
        return target;
    };

    // `$.zepto.qsa` is Zepto's CSS selector implementation which
    // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
    // This method can be overriden in plugins.
    zepto.qsa = function (element, selector) {
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
            isSimple = simpleSelectorRE.test(nameOnly);
        return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
            ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
            (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
                emptyArray.slice.call(
                        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
                        maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
                            element.getElementsByTagName(selector) : // Or a tag
                        element.querySelectorAll(selector) // Or it's not simple, and we need to query all
                );
    };

    function filtered(nodes, selector) {
        return selector === null ? $(nodes) : $(nodes).filter(selector);
    }

    $.contains = document.documentElement.contains ?
        function (parent, node) {
            return parent !== node && parent.contains(node);
        } :
        function (parent, node) {
            while (node && (node = node.parentNode))
                if (node === parent) return true;
            return false;
        };

    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }

    function setAttribute(node, name, value) {
        value === null ? node.removeAttribute(name) : node.setAttribute(name, value);
    }

    // access className property while respecting SVGAnimatedString
    function className(node, value) {
        var klass = node.className || '',
            svg = klass && klass.baseVal !== undefined;

        if (value === undefined) return svg ? klass.baseVal : klass;
        svg ? (klass.baseVal = value) : (node.className = value);
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    function deserializeValue(value) {
        try {
            return value ?
                value == "true" ||
                ( value == "false" ? false :
                        value == "null" ? null :
                        +value + "" == value ? +value :
                    /^[\[\{]/.test(value) ? $.parseJSON(value) :
                        value )
                : value;
        } catch (e) {
            return value;
        }
    }

    $.type = type;
    $.isFunction = isFunction;
    $.isWindow = isWindow;
    $.isArray = isArray;
    $.isPlainObject = isPlainObject;

    $.isEmptyObject = function (obj) {
        var name;
        for (name in obj) return false;
        return true;
    };

    $.inArray = function (elem, array, i) {
        return emptyArray.indexOf.call(array, elem, i);
    };

    $.camelCase = camelize;
    $.trim = function (str) {
        if (typeof str == 'string') {
            return  String.prototype.trim.call(str);
        } else {
            return "";
        }
    };

    // plugin compatibility
    $.uuid = 0;
    $.support = { };
    $.expr = { };
    $.noop = function () {
    };

    $.map = function (elements, callback) {
        var value, values = [], i, key;
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i);
                if (value !== null) values.push(value);
            }
        else
            for (key in elements) {
                value = callback(elements[key], key);
                if (value !== null) values.push(value);
            }
        return flatten(values);
    };

    $.each = function (elements, callback) {
        var i, key;
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements;
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements;
        }

        return elements;
    };

    $.grep = function (elements, callback) {
        return filter.call(elements, callback);
    };

    if (window.JSON) $.parseJSON = JSON.parse;

    // Populate the class2type map
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });

    // Define methods that will be available on all
    // Zepto collections
    $.fn = {
        constructor: zepto.Z,
        length: 0,

        // Because a collection acts like an array
        // copy over these useful array functions.
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        splice: emptyArray.splice,
        indexOf: emptyArray.indexOf,
        concat: function () {
            var i, value, args = [];
            for (i = 0; i < arguments.length; i++) {
                value = arguments[i];
                args[i] = zepto.isZ(value) ? value.toArray() : value;
            }
            return emptyArray.concat.apply(zepto.isZ(this) ? this.toArray() : this, args);
        },

        // `map` and `slice` in the jQuery API work differently
        // from their array counterparts
        map: function (fn) {
            return $($.map(this, function (el, i) {
                return fn.call(el, i, el);
            }));
        },
        slice: function () {
            return $(emptyArray.slice.apply(this, arguments));
        },

        ready: function (callback) {
            // need to check if document.body exists for IE as that browser reports
            // document ready when it hasn't yet created the body element
            if (readyRE.test(document.readyState) && document.body) callback($);
            else document.addEventListener('DOMContentLoaded', function () {
                callback($);
            }, false);
            return this;
        },
        get: function (idx) {
            return idx === undefined ? emptyArray.slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
        },
        toArray: function () {
            return this.get();
        },
        size: function () {
            return this.length;
        },
        remove: function () {
            return this.each(function () {
                if (this.parentNode !== null)
                    this.parentNode.removeChild(this);
            });
        },
        each: function (callback) {
            emptyArray.every.call(this, function (el, idx) {
                return callback.call(el, idx, el) !== false;
            });
            return this;
        },
        filter: function (selector) {
            if (isFunction(selector)) return this.not(this.not(selector));
            return $(filter.call(this, function (element) {
                return zepto.matches(element, selector);
            }));
        },
        add: function (selector, context) {
            return $(uniq(this.concat($(selector, context))));
        },
        is: function (selector) {
            return this.length > 0 && zepto.matches(this[0], selector);
        },
        not: function (selector) {
            var nodes = [];
            if (isFunction(selector) && selector.call !== undefined)
                this.each(function (idx) {
                    if (!selector.call(this, idx)) nodes.push(this);
                });
            else {
                var excludes = typeof selector == 'string' ? this.filter(selector) :
                    (likeArray(selector) && isFunction(selector.item)) ? emptyArray.slice.call(selector) : $(selector);
                this.forEach(function (el) {
                    if (excludes.indexOf(el) < 0) nodes.push(el);
                });
            }
            return $(nodes);
        },
        has: function (selector) {
            return this.filter(function () {
                return isObject(selector) ?
                    $.contains(this, selector) :
                    $(this).find(selector).size();
            });
        },
        eq: function (idx) {
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
        },
        first: function () {
            var el = this[0];
            return el && !isObject(el) ? el : $(el);
        },
        last: function () {
            var el = this[this.length - 1];
            return el && !isObject(el) ? el : $(el);
        },
        find: function (selector) {
            var result, $this = this;
            if (!selector) result = $();
            else if (typeof selector == 'object')
                result = $(selector).filter(function () {
                    var node = this;
                    return emptyArray.some.call($this, function (parent) {
                        return $.contains(parent, node);
                    });
                });
            else if (this.length == 1) result = $(zepto.qsa(this[0], selector));
            else result = this.map(function () {
                    return zepto.qsa(this, selector);
                });
            return result;
        },
        closest: function (selector, context) {
            var node = this[0], collection = false;
            if (typeof selector == 'object') collection = $(selector);
            while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
                node = node !== context && !isDocument(node) && node.parentNode;
            return $(node);
        },
        parents: function (selector) {
            var ancestors = [], nodes = this;
            while (nodes.length > 0)
                nodes = $.map(nodes, function (node) {
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node);
                        return node;
                    }
                });
            return filtered(ancestors, selector);
        },
        parent: function (selector) {
            return filtered(uniq(this.pluck('parentNode')), selector);
        },
        children: function (selector) {
            return filtered(this.map(function () {
                return children(this);
            }), selector);
        },
        contents: function () {
            return this.map(function () {
                return this.contentDocument || emptyArray.slice.call(this.childNodes);
            });
        },
        siblings: function (selector) {
            return filtered(this.map(function (i, el) {
                return filter.call(children(el.parentNode), function (child) {
                    return child !== el;
                });
            }), selector);
        },
        empty: function () {
            return this.each(function () {
                this.innerHTML = '';
            });
        },
        // `pluck` is borrowed from Prototype.js
        pluck: function (property) {
            return $.map(this, function (el) {
                return el[property];
            });
        },
        show: function () {
            return this.each(function () {
                this.style.display == "none" && (this.style.display = '');
                if (getComputedStyle(this, '').getPropertyValue("display") == "none")
                    this.style.display = defaultDisplay(this.nodeName);
            });
        },
        replaceWith: function (newContent) {
            return this.before(newContent).remove();
        },
        wrap: function (structure) {
            var func = isFunction(structure);
            if (this[0] && !func)
                var dom = $(structure).get(0),
                    clone = dom.parentNode || this.length > 1;

            return this.each(function (index) {
                $(this).wrapAll(
                    func ? structure.call(this, index) :
                        clone ? dom.cloneNode(true) : dom
                );
            });
        },
        wrapAll: function (structure) {
            if (this[0]) {
                $(this[0]).before(structure = $(structure));
                var children;
                // drill down to the inmost element
                while ((children = structure.children()).length) structure = children.first();
                $(structure).append(this);
            }
            return this;
        },
        wrapInner: function (structure) {
            var func = isFunction(structure);
            return this.each(function (index) {
                var self = $(this), contents = self.contents(),
                    dom = func ? structure.call(this, index) : structure;
                contents.length ? contents.wrapAll(dom) : self.append(dom);
            });
        },
        unwrap: function () {
            this.parent().each(function () {
                $(this).replaceWith($(this).children());
            });
            return this;
        },
        clone: function () {
            return this.map(function () {
                return this.cloneNode(true);
            });
        },
        hide: function () {
            return this.css("display", "none");
        },
        toggle: function (setting) {
            return this.each(function () {
                var el = $(this);
                (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide();
            });
        },
        prev: function (selector) {
            return $(this.pluck('previousElementSibling')).filter(selector || '*');
        },
        next: function (selector) {
            return $(this.pluck('nextElementSibling')).filter(selector || '*');
        },
        html: function (html) {
            return 0 in arguments ?
                this.each(function () {
                    this.innerHTML = html;
                }) :
                (0 in this ? this[0].innerHTML : null);
        },
        text: function (text) {
            return 0 in arguments ?
                this.each(function (idx) {
                    var newText = funcArg(this, text, idx, this.textContent);
                    this.textContent = newText === null ? '' : '' + newText;
                }) :
                (0 in this ? this[0].textContent : null);
        },
        attr: function (name, value) {
            var result;
            return (typeof name == 'string' && !(1 in arguments)) ?
                (!this.length || this[0].nodeType !== 1 ? undefined :
                    (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
                    ) :
                this.each(function (idx) {
                    if (this.nodeType !== 1) return;
                    if (isObject(name)) for (key in name) setAttribute(this, key, name[key]);
                    else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
                });
        },
        removeAttr: function (name) {
            return this.each(function () {
                this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
                    setAttribute(this, attribute);
                }, this);
            });
        },
        prop: function (name, value) {
            name = propMap[name] || name;
            return (1 in arguments) ?
                this.each(function (idx) {
                    this[name] = funcArg(this, value, idx, this[name]);
                }) :
                (this[0] && this[0][name]);
        },
        data: function (name, value) {
            var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase();

            var data = (1 in arguments) ?
                this.attr(attrName, value) :
                this.attr(attrName);

            return data !== null ? deserializeValue(data) : undefined;
        },
        val: function (value) {
            return 0 in arguments ?
                this.each(function (idx) {
                    this.value = funcArg(this, value, idx, this.value);
                }) :
                (this[0] && (this[0].multiple ?
                    $(this[0]).find('option').filter(function () {
                        return this.selected;
                    }).pluck('value') :
                    this[0].value)
                    );
        },
        offset: function (coordinates) {
            if (coordinates) {
                return this.each(function (index) {
                    var $this = $(this),
                        coords = funcArg(this, coordinates, index, $this.offset()),
                        parentOffset = $this.offsetParent().offset(),
                        props = {
                            top: coords.top - parentOffset.top,
                            left: coords.left - parentOffset.left
                        };

                    if ($this.css('position') == 'static') props.position = 'relative';
                    $this.css(props);
                });
            }

            if (!this.length) return null;
            if (!$.contains(document.documentElement, this[0]))
                return {top: 0, left: 0};
            var obj = this[0].getBoundingClientRect();
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            };
        },
        css: function (property, value) {
            if (arguments.length < 2) {
                var computedStyle, element = this[0];
                if (!element) return;
                computedStyle = getComputedStyle(element, '');
                if (typeof property == 'string')
                    return element.style[camelize(property)] || computedStyle.getPropertyValue(property);
                else if (isArray(property)) {
                    var props = {};
                    $.each(property, function (_, prop) {
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop));
                    });
                    return props;
                }
            }

            var css = '';
            if (type(property) == 'string') {
                if (!value && value !== 0)
                    this.each(function () {
                        this.style.removeProperty(dasherize(property));
                    });
                else
                    css = dasherize(property) + ":" + maybeAddPx(property, value);
            } else {
                for (key in property)
                    if (!property[key] && property[key] !== 0)
                        this.each(function () {
                            this.style.removeProperty(dasherize(key));
                        });
                    else
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
            }

            return this.each(function () {
                this.style.cssText += ';' + css;
            });
        },
        index: function (element) {
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
        },
        hasClass: function (name) {
            if (!name) return false;
            return emptyArray.some.call(this, function (el) {
                return this.test(className(el));
            }, classRE(name));
        },
        addClass: function (name) {
            if (!name) return this;
            return this.each(function (idx) {
                if (!('className' in this)) return;
                classList = [];
                var cls = className(this), newName = funcArg(this, name, idx, cls);
                newName.split(/\s+/g).forEach(function (klass) {
                    if (!$(this).hasClass(klass)) classList.push(klass);
                }, this);
                classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "));
            });
        },
        removeClass: function (name) {
            return this.each(function (idx) {
                if (!('className' in this)) return;
                if (name === undefined) return className(this, '');
                classList = className(this);
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                    classList = classList.replace(classRE(klass), " ");
                });
                className(this, classList.trim());
            });
        },
        toggleClass: function (name, when) {
            if (!name) return this;
            return this.each(function (idx) {
                var $this = $(this), names = funcArg(this, name, idx, className(this));
                names.split(/\s+/g).forEach(function (klass) {
                    (when === undefined ? !$this.hasClass(klass) : when) ?
                        $this.addClass(klass) : $this.removeClass(klass);
                });
            });
        },
        scrollTop: function (value) {
            if (!this.length) return;
            var hasScrollTop = 'scrollTop' in this[0];
            if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
            return this.each(hasScrollTop ?
                function () {
                    this.scrollTop = value;
                } :
                function () {
                    this.scrollTo(this.scrollX, value);
                });
        },
        scrollLeft: function (value) {
            if (!this.length) return;
            var hasScrollLeft = 'scrollLeft' in this[0];
            if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;
            return this.each(hasScrollLeft ?
                function () {
                    this.scrollLeft = value;
                } :
                function () {
                    this.scrollTo(value, this.scrollY);
                });
        },
        position: function () {
            if (!this.length) return;

            var elem = this[0],
            // Get *real* offsetParent
                offsetParent = this.offsetParent(),
            // Get correct offsets
                offset = this.offset(),
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= parseFloat($(elem).css('margin-top')) || 0;
            offset.left -= parseFloat($(elem).css('margin-left')) || 0;

            // Add offsetParent borders
            parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
            parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;

            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },
        offsetParent: function () {
            return this.map(function () {
                var parent = this.offsetParent || document.body;
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
                    parent = parent.offsetParent;
                return parent;
            });
        }
    };

    // for now
    $.fn.detach = $.fn.remove;

    // Generate the `width` and `height` functions

    ['width', 'height'].forEach(function (dimension) {
        var dimensionProperty =
            dimension.replace(/./, function (m) {
                return m[0].toUpperCase();
            });

        $.fn[dimension] = function (value) {
            var offset, el = this[0];
            if (value === undefined) {
                if (isWindow(el)) {
                    return  el['inner' + dimensionProperty];
                } else if (isDocument(el)) {
                    return el.documentElement['scroll' + dimensionProperty];
                } else {
                    //支持隐藏元素获取获取宽度高度
                    if (el.style && el.style.display == 'none') {
                        var clone = $(el).clone().insertAfter($(el)).show();
                        var val = clone.offset()[dimension];
                        clone.remove();
                        return val;
                    } else {
                        offset = this.offset();
                        return  offset[dimension];
                    }
                }

//                return isWindow(el) ? el['inner' + dimensionProperty] :
//                    isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
//                        (offset = this.offset()) && offset[dimension];
            }
            else {
                return this.each(function (idx) {
                    el = $(this);
                    el.css(dimension, funcArg(this, value, idx, el[dimension]()));
                });
            }
        };
    });

    function traverseNode(node, fun) {
        fun(node);
        for (var i = 0, len = node.childNodes.length; i < len; i++)
            traverseNode(node.childNodes[i], fun);
    }

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function (operator, operatorIndex) {
        var inside = operatorIndex % 2; //=> prepend, append

        $.fn[operator] = function () {
            // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
            var argType, nodes = $.map(arguments, function (arg) {
                    argType = type(arg);
                    return argType == "object" || argType == "array" || arg === null ?
                        arg : zepto.fragment(arg);
                }),
                parent, copyByClone = this.length > 1;
            if (nodes.length < 1) return this;

            return this.each(function (_, target) {
                parent = inside ? target : target.parentNode;

                // convert all methods to a "before" operation
                target = operatorIndex === 0 ? target.nextSibling :
                        operatorIndex == 1 ? target.firstChild :
                        operatorIndex == 2 ? target :
                    null;

                var parentInDocument = $.contains(document.documentElement, parent);

                nodes.forEach(function (node) {
                    if (copyByClone) node = node.cloneNode(true);
                    else if (!parent) return $(node).remove();

                    parent.insertBefore(node, target);
                    if (parentInDocument) traverseNode(node, function (el) {
                        if (el.nodeName !== null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                            (!el.type || el.type === 'text/javascript') && !el.src)
                            window['eval'].call(window, el.innerHTML);
                    });
                });
            });
        };

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
            $(html)[operator](this);
            return this;
        };
    });

    zepto.Z.prototype = Z.prototype = $.fn;

    // Export internal API functions in the `$.zepto` namespace
    zepto.uniq = uniq;
    zepto.deserializeValue = deserializeValue;
    $.zepto = zepto;

    return $;
})();

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto;
window.$ === undefined && (window.$ = Zepto);
window.TVUI && (window.TVUI.$ = Zepto);


;
/**
 * ajax 模块，扩展Zepto，暂时不支持jsonp
 *ex：
 * 1) $.ajax(options);
 *
 *    options:{
 *          type: 'GET',
 *          url: '',
 *          data: null,
 *          success: empty,
 *          error: empty,
 *          complete: empty,
 *          timeout: 0,
 *          cache: true,
 *          dataType: 'text',
 *          headers: null,
 *          async: true
 *    }
 *
 *
 * 2) $.get(url [,data] [,callback] [,dataType]);
 * 3) $.post(url [,data] [,callback] [,dataType]);
 * 4) $.getJSON(url [,data] [,callback]);
 * 5) $.getScript(url [,callback]);
 */
(function (TVUI) {
    var util = TVUI.Util,
        $ = TVUI.$,
        name,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/;

    function empty() {
    }


    var accepts = {
        script: 'text/javascript, application/javascript, application/x-javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
    };

    function xmlHttp() {
        return new window.XMLHttpRequest();
    }

    function mimeToDataType(mime) {
        if (mime) mime = mime.split(';', 2)[0];
        return mime && ( mime == htmlType ? 'html' :
                mime == jsonType ? 'json' :
            scriptTypeRE.test(mime) ? 'script' :
                xmlTypeRE.test(mime) && 'xml' ) || 'text';
    }

    function appendQuery(url, query) {
        if (query === '') return url;
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }


    function ajax(options) {

        var settings = $.extend({
            type: 'GET',
            url: '',
            data: null,
            success: empty,
            error: empty,
            complete: empty,
            timeout: 0,
            cache: true,
            dataType: 'text',
            headers: null,
            async: true
        }, options || {});

        var abortTimeout,
            dataType = settings.dataType,
          //  hasPlaceholder = /\?.+=\?/.test(settings.url),
            mime = accepts[dataType],
            headers = { },
            setHeader = function (name, value) {
                headers[name.toLowerCase()] = [name, value];
            },
            xhr = xmlHttp(),
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            nativeSetHeader = xhr.setRequestHeader;

        if ((mime = settings.mimeType || mime)) {
            if (mime.indexOf(',') > -1) {
                mime = mime.split(',', 2)[0];
            }
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }

        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')) {
            setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
        }

        if (settings.headers) {
            for (name in settings.headers) {
                setHeader(name, settings.headers[name]);
            }
        }


        if (typeof settings.data === 'object') {
            settings.data = util.param(settings.data);
        }

        if (settings.data && settings.type.toUpperCase() == 'GET') {
            settings.url = appendQuery(settings.url, settings.data);
            //delete settings.data;
        }

        if (settings.cache === false) {
            settings.url = appendQuery(settings.url, '_=' + (new Date()).getTime());
        }


        xhr.setRequestHeader = setHeader;

        xhr.onreadystatechange = function () {

            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty;
                clearTimeout(abortTimeout);
                var result, error = false;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status === 0 && protocol == 'file:')) {

                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;
                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType == 'script') {
                            eval(result + '');
                        }
                        else if (dataType == 'xml') {
                            result = xhr.responseXML;
                        }
                        else if (dataType == 'json') {
                            result = blankRE.test(result) ? null : JSON.parse(result);
                        }
                    } catch (err) {
                        error = err;
                    }

                    if (error) {
                        settings.error(error, 'parsererror', xhr, settings);
                    }
                    else {
                        settings.success(result, xhr, settings);
                    }
                    settings.complete(xhr.status, xhr, settings);

                } else {
                    settings.error(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings);
                    settings.complete(xhr.status, xhr, settings);
                }
            }

        };

        if (settings.timeout > 0) {
            abortTimeout = setTimeout(function () {
                alert('timeout');
                xhr.onreadystatechange = empty;
                xhr.abort();
                settings.error(null, 'timeout', xhr, settings);
            }, settings.timeout);
        }

        xhr.open(settings.type, settings.url, settings.async, '', '');
        for (name in headers) {
            nativeSetHeader.apply(xhr, headers[name]);
        }


        try {
            xhr.send(settings.data ? settings.data : null);
        } catch (err) {
        }


        return xhr;

    }

    function parseArguments(url, data, success, dataType) {
        if ($.isFunction(data)) {
            dataType = success;
            success = data;
            data = undefined;
        }
        if (!$.isFunction(success)) {
            dataType = success;
            success = undefined;
        }
        return {
            url: url,
            data: data,
            success: success,
            dataType: dataType
        };
    }

    $.extend(TVUI.$,{
        ajax: ajax,
        // url, data, success, dataType
        get: function () {
            return ajax(parseArguments.apply(null, arguments));
        },
        // url, data, success, dataType
        post: function () {
            var options = parseArguments.apply(null, arguments);
            options.type = 'POST';
            return ajax(options);
        },
        // url, data, success
        getJSON: function () {
            var options = parseArguments.apply(null, arguments);
            options.dataType = 'json';
            return ajax(options);
        },
        getScript: function () {
            var options = parseArguments.apply(null, arguments);
            options.dataType = 'script';
            options.cache = false;
            return ajax(options);
        }
    });


})(TVUI);;
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (root, factory) {
    var mustache = {};
    factory(mustache);
    root.View = mustache;
    /*    if (typeof exports === "object" && exports) {
     factory(exports); // CommonJS
     } else {
     var mustache = {};
     factory(mustache);
     if (typeof define === "function" && define.amd) {
     define(mustache); // AMD
     } else {
     root.Mustache = mustache; // <script>
     }
     }*/
}(TVUI, function (mustache) {

    var whiteRe = /\s*/;
    var spaceRe = /\s+/;
    var nonSpaceRe = /\S/;
    var eqRe = /\s*=/;
    var curlyRe = /\s*\}/;
    var tagRe = /#|\^|\/|>|\{|&|=|!/;

    // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
    // See https://github.com/janl/mustache.js/issues/189
    var RegExp_test = RegExp.prototype.test;

    function testRegExp(re, string) {
        return RegExp_test.call(re, string);
    }

    function isWhitespace(string) {
        return !testRegExp(nonSpaceRe, string);
    }

    var Object_toString = Object.prototype.toString;
    var isArray = Array.isArray || function (object) {
        return Object_toString.call(object) === '[object Array]';
    };

    function isFunction(object) {
        return typeof object === 'function';
    }

    function escapeRegExp(string) {
        return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    }

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    function escapeTags(tags) {
        if (!isArray(tags) || tags.length !== 2) {
            throw new Error('Invalid tags: ' + tags);
        }

        return [
            new RegExp(escapeRegExp(tags[0]) + "\\s*"),
            new RegExp("\\s*" + escapeRegExp(tags[1]))
        ];
    }

    /**
     * Breaks up the given `template` string into a tree of tokens. If the `tags`
     * argument is given here it must be an array with two string values: the
     * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
     * course, the default is to use mustaches (i.e. mustache.tags).
     *
     * A token is an array with at least 4 elements. The first element is the
     * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
     * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
     * all template text that appears outside a symbol this element is "text".
     *
     * The second element of a token is its "value". For mustache tags this is
     * whatever else was inside the tag besides the opening symbol. For text tokens
     * this is the text itself.
     *
     * The third and fourth elements of the token are the start and end indices
     * in the original template of the token, respectively.
     *
     * Tokens that are the root node of a subtree contain two more elements: an
     * array of tokens in the subtree and the index in the original template at which
     * the closing tag for that section begins.
     */
    function parseTemplate(template, tags) {
        tags = tags || mustache.tags;
        template = template || '';

        if (typeof tags === 'string') {
            tags = tags.split(spaceRe);
        }

        var tagRes = escapeTags(tags);
        var scanner = new Scanner(template);

        var sections = [];     // Stack to hold section tokens
        var tokens = [];       // Buffer to hold the tokens
        var spaces = [];       // Indices of whitespace tokens on the current line
        var hasTag = false;    // Is there a {{tag}} on the current line?
        var nonSpace = false;  // Is there a non-space char on the current line?

        // Strips all whitespace tokens array for the current line
        // if there was a {{#tag}} on it and otherwise only space.
        function stripSpace() {
            if (hasTag && !nonSpace) {
                while (spaces.length) {
                    delete tokens[spaces.pop()];
                }
            } else {
                spaces = [];
            }

            hasTag = false;
            nonSpace = false;
        }

        var start, type, value, chr, token, openSection;
        while (!scanner.eos()) {
            start = scanner.pos;

            // Match any text between tags.
            value = scanner.scanUntil(tagRes[0]);
            if (value) {
                for (var i = 0, len = value.length; i < len; ++i) {
                    chr = value.charAt(i);

                    if (isWhitespace(chr)) {
                        spaces.push(tokens.length);
                    } else {
                        nonSpace = true;
                    }

                    tokens.push(['text', chr, start, start + 1]);
                    start += 1;

                    // Check for whitespace on the current line.
                    if (chr === '\n') {
                        stripSpace();
                    }
                }
            }

            // Match the opening tag.
            if (!scanner.scan(tagRes[0])) break;
            hasTag = true;

            // Get the tag type.
            type = scanner.scan(tagRe) || 'name';
            scanner.scan(whiteRe);

            // Get the tag value.
            if (type === '=') {
                value = scanner.scanUntil(eqRe);
                scanner.scan(eqRe);
                scanner.scanUntil(tagRes[1]);
            } else if (type === '{') {
                value = scanner.scanUntil(new RegExp('\\s*' + escapeRegExp('}' + tags[1])));
                scanner.scan(curlyRe);
                scanner.scanUntil(tagRes[1]);
                type = '&';
            } else {
                value = scanner.scanUntil(tagRes[1]);
            }

            // Match the closing tag.
            if (!scanner.scan(tagRes[1])) {
                throw new Error('Unclosed tag at ' + scanner.pos);
            }

            token = [ type, value, start, scanner.pos ];
            tokens.push(token);

            if (type === '#' || type === '^') {
                sections.push(token);
            } else if (type === '/') {
                // Check section nesting.
                openSection = sections.pop();

                if (!openSection) {
                    throw new Error('Unopened section "' + value + '" at ' + start);
                }
                if (openSection[1] !== value) {
                    throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
                }
            } else if (type === 'name' || type === '{' || type === '&') {
                nonSpace = true;
            } else if (type === '=') {
                // Set the tags for the next time around.
                tagRes = escapeTags(tags = value.split(spaceRe));
            }
        }

        // Make sure there are no open sections when we're done.
        openSection = sections.pop();
        if (openSection) {
            throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
        }

        return nestTokens(squashTokens(tokens));
    }

    /**
     * Combines the values of consecutive text tokens in the given `tokens` array
     * to a single token.
     */
    function squashTokens(tokens) {
        var squashedTokens = [];

        var token, lastToken;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];

            if (token) {
                if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
                    lastToken[1] += token[1];
                    lastToken[3] = token[3];
                } else {
                    squashedTokens.push(token);
                    lastToken = token;
                }
            }
        }

        return squashedTokens;
    }

    /**
     * Forms the given array of `tokens` into a nested tree structure where
     * tokens that represent a section have two additional items: 1) an array of
     * all tokens that appear in that section and 2) the index in the original
     * template that represents the end of that section.
     */
    function nestTokens(tokens) {
        var nestedTokens = [];
        var collector = nestedTokens;
        var sections = [];

        var token, section;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];

            switch (token[0]) {
                case '#':
                case '^':
                    collector.push(token);
                    sections.push(token);
                    collector = token[4] = [];
                    break;
                case '/':
                    section = sections.pop();
                    section[5] = token[2];
                    collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
                    break;
                default:
                    collector.push(token);
            }
        }

        return nestedTokens;
    }

    /**
     * A simple string scanner that is used by the template parser to find
     * tokens in template strings.
     */
    function Scanner(string) {
        this.string = string;
        this.tail = string;
        this.pos = 0;
    }

    /**
     * Returns `true` if the tail is empty (end of string).
     */
    Scanner.prototype.eos = function () {
        return this.tail === "";
    };

    /**
     * Tries to match the given regular expression at the current position.
     * Returns the matched text if it can match, the empty string otherwise.
     */
    Scanner.prototype.scan = function (re) {
        var match = this.tail.match(re);

        if (match && match.index === 0) {
            var string = match[0];
            this.tail = this.tail.substring(string.length);
            this.pos += string.length;
            return string;
        }

        return "";
    };

    /**
     * Skips all text until the given regular expression can be matched. Returns
     * the skipped string, which is the entire tail if no match can be made.
     */
    Scanner.prototype.scanUntil = function (re) {
        var index = this.tail.search(re), match;

        switch (index) {
            case -1:
                match = this.tail;
                this.tail = "";
                break;
            case 0:
                match = "";
                break;
            default:
                match = this.tail.substring(0, index);
                this.tail = this.tail.substring(index);
        }

        this.pos += match.length;

        return match;
    };

    /**
     * Represents a rendering context by wrapping a view object and
     * maintaining a reference to the parent context.
     */
    function Context(view, parentContext) {
        this.view = view == null ? {} : view;
        this.cache = { '.': this.view };
        this.parent = parentContext;
    }

    /**
     * Creates a new context using the given view with this context
     * as the parent.
     */
    Context.prototype.push = function (view) {
        return new Context(view, this);
    };

    /**
     * Returns the value of the given name in this context, traversing
     * up the context hierarchy if the value is absent in this context's view.
     */
    Context.prototype.lookup = function (name) {
        var value;
        if (name in this.cache) {
            value = this.cache[name];
        } else {
            var context = this;

            while (context) {
                if (name.indexOf('.') > 0) {
                    value = context.view;

                    var names = name.split('.'), i = 0;
                    while (value != null && i < names.length) {
                        value = value[names[i++]];
                    }
                } else {
                    value = context.view[name];
                }

                if (value != null) break;

                context = context.parent;
            }

            this.cache[name] = value;
        }

        if (isFunction(value)) {
            value = value.call(this.view);
        }

        return value;
    };

    /**
     * A Writer knows how to take a stream of tokens and render them to a
     * string, given a context. It also maintains a cache of templates to
     * avoid the need to parse the same template twice.
     */
    function Writer() {
        this.cache = {};
    }

    /**
     * Clears all cached templates in this writer.
     */
    Writer.prototype.clearCache = function () {
        this.cache = {};
    };

    /**
     * Parses and caches the given `template` and returns the array of tokens
     * that is generated from the parse.
     */
    Writer.prototype.parse = function (template, tags) {
        var cache = this.cache;
        var tokens = cache[template];

        if (tokens == null) {
            tokens = cache[template] = parseTemplate(template, tags);
        }

        return tokens;
    };

    /**
     * High-level method that is used to render the given `template` with
     * the given `view`.
     *
     * The optional `partials` argument may be an object that contains the
     * names and templates of partials that are used in the template. It may
     * also be a function that is used to load partial templates on the fly
     * that takes a single argument: the name of the partial.
     */
    Writer.prototype.render = function (template, view, partials) {
        var tokens = this.parse(template);
        var context = (view instanceof Context) ? view : new Context(view);
        return this.renderTokens(tokens, context, partials, template);
    };

    /**
     * Low-level method that renders the given array of `tokens` using
     * the given `context` and `partials`.
     *
     * Note: The `originalTemplate` is only ever used to extract the portion
     * of the original template that was contained in a higher-order section.
     * If the template doesn't use higher-order sections, this argument may
     * be omitted.
     */
    Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
        var buffer = '';

        // This function is used to render an arbitrary template
        // in the current context by higher-order sections.
        var self = this;

        function subRender(template) {
            return self.render(template, context, partials);
        }

        var token, value;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];

            switch (token[0]) {
                case '#':
                    value = context.lookup(token[1]);
                    if (!value) continue;

                    if (isArray(value)) {
                        for (var j = 0, jlen = value.length; j < jlen; ++j) {
                            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
                        }
                    } else if (typeof value === 'object' || typeof value === 'string') {
                        buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
                    } else if (isFunction(value)) {
                        if (typeof originalTemplate !== 'string') {
                            throw new Error('Cannot use higher-order sections without the original template');
                        }

                        // Extract the portion of the original template that the section contains.
                        value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

                        if (value != null) buffer += value;
                    } else {
                        buffer += this.renderTokens(token[4], context, partials, originalTemplate);
                    }

                    break;
                case '^':
                    value = context.lookup(token[1]);

                    // Use JavaScript's definition of falsy. Include empty arrays.
                    // See https://github.com/janl/mustache.js/issues/186
                    if (!value || (isArray(value) && value.length === 0)) {
                        buffer += this.renderTokens(token[4], context, partials, originalTemplate);
                    }

                    break;
                case '>':
                    if (!partials) continue;
                    value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
                    if (value != null) buffer += this.renderTokens(this.parse(value), context, partials, value);
                    break;
                case '&':
                    value = context.lookup(token[1]);
                    if (value != null) buffer += value;
                    break;
                case 'name':
                    value = context.lookup(token[1]);
                    if (value != null) buffer += mustache.escape(value);
                    break;
                case 'text':
                    buffer += token[1];
                    break;
            }
        }

        return buffer;
    };

    mustache.name = "mustache.js";
    mustache.version = "0.8.1";
    mustache.tags = [ "{{", "}}" ];

    // All high-level mustache.* functions use this writer.
    var defaultWriter = new Writer();

    /**
     * Clears all cached templates in the default writer.
     */
    mustache.clearCache = function () {
        return defaultWriter.clearCache();
    };

    /**
     * Parses and caches the given template in the default writer and returns the
     * array of tokens it contains. Doing this ahead of time avoids the need to
     * parse templates on the fly as they are rendered.
     */
    mustache.parse = function (template, tags) {
        return defaultWriter.parse(template, tags);
    };

    /**
     * Renders the `template` with the given `view` and `partials` using the
     * default writer.
     */
    mustache.render = function (template, view, partials) {
        return defaultWriter.render(template, view, partials);
    };

    // This is here for backwards compatibility with 0.4.x.
    mustache.to_html = function (template, view, partials, send) {
        var result = mustache.render(template, view, partials);

        if (isFunction(send)) {
            send(result);
        } else {
            return result;
        }
    };

    // Export the escaping function so that the user may override it.
    // See https://github.com/janl/mustache.js/issues/244
    mustache.escape = escapeHtml;

    // Export these mainly for testing, but also for advanced usage.
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;

}));
;
(function ($, TVUI) {
    var emptyArray = [],
        slice = emptyArray.slice;

    var Util = {
        slice: slice,
        encode: encodeURIComponent,
        // 以便用户重写默认全局解码函数
        decode: decodeURIComponent,
        /**
         * 作用域代理函数
         * @param func
         * @param obj
         * @returns {Function}
         */
        proxy: function (func, obj) {
            var args = slice.call(arguments, 2); //截取附加参数
            return function () {
                var innerArgs = slice.call(arguments); //获取全部fn参数
                var fianlArgs = innerArgs.concat(args); //合并参数
                return func.apply(obj, fianlArgs);
            };
        },
        /**
         * 判断是否一个类数组
         * @param obj
         * @returns {boolean}
         */
        likeArray: function (obj) {
            if (typeof obj === 'undefined') {
                return false;
            }

            var length = obj.length,
                type = $.type(obj);

            if ($.isWindow(obj)) {
                return false;
            }

            if (obj.nodeType === 1 && length) {
                return true;
            }

            return type === "array" || type !== "function" &&
                ( length === 0 || typeof length === "number" && type === 'object' && length > 0 && ( length - 1 ) in obj );

        },
        /**
         * 把伪数组转换成真数组，常用来转换元素集合和arguments
         * @param args
         * @returns {Array}
         */
        makeArray: function (args) {
            return Array.prototype.slice.call(args);
        },
        queryToJson: function (str, sep, eq) {
            //兼容最常用的 parse(location.search);
            var obj = {};
            str = str.replace(/^[^\?]*\?/, "");
            sep = sep || "&";
            eq = eq || "=";
            var arr, self = this, reg = new RegExp("(?:^|\\" + sep + ")([^\\" + eq + "\\" + sep + "]+)(?:\\" + eq + "([^\\" + sep + "]*))?", "g");
            while ((arr = reg.exec(str)) !== null) {
                if (arr[1] !== str) {
                    obj[self.decode(arr[1])] = self.decode(arr[2] || "");
                }
            }

            return obj;
        },
        getParam: function (name, url) {
            if (url) {
                return this.queryToJson(url)[name];
            } else {
                if (!this.__queryCache) {
                    this.__queryCache = this.queryToJson(location.search);
                }
                return this.__queryCache[name];
            }
        },
        param: function (obj, sep, eq) {
            var i, arr = [], self = this;
            sep = sep || "&";
            eq = eq || "=";
            for (i in obj) {
                if (obj.hasOwnProperty(i) && obj[i] !== null) {
                    arr.push(self.encode(i) + (obj[i] === "" ? "" : eq + self.encode(obj[i])));
                }
            }
            return arr.join(sep);
        },
        getFileName: function (pathName) {
            var path = pathName || location.pathname,
                start = path.lastIndexOf('/') + 1,
                end = path.lastIndexOf('.');
            return path.substring(start, end);
        },
        log: function (a, b, c, d, e) {
            if (typeof console !== 'undefined' && console.log) {
                try {
                    console.log.apply(console, slice.call(arguments));
                } catch (err) {
                    switch (arguments.length) {
                        case 0:
                            console.log();
                            break;
                        case 1:
                            console.log(a);
                            break;
                        case 2:
                            console.log(a, b);
                            break;
                        case 3:
                            console.log(a, b, c);
                            break;
                        case 4:
                            console.log(a, b, c, d);
                            break;
                        case 5:
                            console.log(a, b, c, d, e);
                            break;
                    }
                }
            }
        },
        guid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }).toUpperCase();
        },
        /**
         * 数字前面补零
         * @param num  原始数字
         * @param n  几位数
         * @returns {*}
         */
        pad: function (num, n) {
            var len = num.toString().length;
            while (len < n) {
                num = '0' + num;
                len++;
            }
            return num;
        },
        /**
         * 循环从数组中取出指定数量项
         * @param data
         * @param num 取几项
         * @param index 在中间的是第几项，从0开始
         * @returns {Array}
         */
        range: function (data, num, index) {
            var len = data.length,
                count = parseInt((num - 1) / 2),
                result = [],
                left = count,
                right = num - left - 1,
                i,
                j;

            i = j = index;
            result.push(data[index]);

            while (left > 0) {
                i--;
                i = i < 0 ? len - 1 : i;
                result.unshift(data[i]);
                left--;
            }

            while (right > 0) {
                j++;
                j = j > len - 1 ? 0 : j;
                result.push(data[j]);
                right--;

            }
            return result;
        },
        /**
         * 循环从数组中取出指定数量项
         * @param data
         * @param num 取几项
         * @param index 左边第一项是第几个
         * @returns {Array}
         */
        rangeLeft: function (data, num, index) {
            var len = data.length,
                result = [],
                right = data.length >= num ? num - 1 : data.length - 1,
                i = index;

            result.push(data[index]);

            while (right > 0) {
                i++;
                i = i > len - 1 ? 0 : i;
                result.push(data[i]);
                right--;
            }

            return result;
        },
        /**
         * 从数组中取出指定数量项
         * @param data
         * @param num 取几项
         * @param index 当前是第几个
         * @returns {Array}
         */
        rangeFixed: function (data, num, index) {
            var left = ((num - 1) / 2) | 0;
            left = index - left < 0 ? 0 : index - left;
            var right = left + num - 1, total = data.length, result = [];
            if (total > num) {
                while (left > total - num) {
                    if (left > 0) {
                        left--;
                    }
                    right--;
                }
            } else {
                left = 0;
                right = total - 1;
            }
            for (var i = left; i <= right; i++) {
                result.push(data[i]);
            }
            return result;
        },
        timeout: function (func, time, obj) {
            return setTimeout(this.proxy(func, obj), time);
        },
        date: function (dateStr, format, options) {
            if (!dateStr) {
                return (new Date());
            }
            var obj = null;
            if (/Date/.test(dateStr)) {
                var d = dateStr.replace(/\//g, '');
                obj = eval('(new ' + d + ')');
            } else {
                obj = typeof dateStr === 'string' ? new Date(dateStr.replace(/-/g, '/')) : dateStr;
            }

            var setting = {
                y: 0, //年
                M: 0, // 月
                d: 0, //日
                h: 0, //时
                m: 0, //分
                s: 0 //秒
            };

            $.extend(setting, options || {});

            obj = new Date(setting.y + obj.getFullYear(),
                    setting.M + obj.getMonth(),
                    setting.d + obj.getDate(),
                    setting.h + obj.getHours(),
                    setting.m + obj.getMinutes(),
                    setting.s + obj.getSeconds());
            var o = {
                "M+": obj.getMonth() + 1,
                "d+": obj.getDate(),
                "h+": obj.getHours(),
                "m+": obj.getMinutes(),
                "s+": obj.getSeconds(),
                "q+": Math.floor((obj.getMonth() + 3) / 3),
                "S": obj.getMilliseconds()
            };
            if (format) {
                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1,
                            RegExp.$1.length == 4 ?
                            obj.getFullYear() :
                            (obj.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                            o[k] :
                            ("00" + o[k]).substr(("" + o[k]).length));
                    }
                }
                return format;
            }
            else {
                return obj;
            }
        },
        tpl: function (template, data) {
            if (!template) {
                return;
            }
            template = template.replace(/%7B/gi, '{').replace(/%7D/gi, '}');

            var regex = /\{\$(\w+)\}/g,
                html = [];
            var replace = function (obj) {
                return template.replace(regex, function (str, match) {
                    if (match in obj) {
                        return obj[match];
                    }
                    else {
                        return str;
                    }
                });
            };

            if ($.isArray(data)) {
                for (var i = 0, len = data.length; i < len; i++) {
                    var item = data[i];
                    item._index = i;
                    html.push(replace(item));
                }
            } else {
                html.push(replace(data));
            }
            return html.join('');

        },
        getCharCount: function (str) {
            if (str) {
                return str.replace(/[^\x00-\xff]/g, "xx").length;
            } else {
                return -1;
            }
        },
        subStr: function (str, len) {
            var newLength = 0,
                newStr = "",
                chineseRegex = /[^\x00-\xff]/g,
                singleChar = "",
                strLength = str.replace(chineseRegex, "**").length;
            for (var i = 0; i < strLength; i++) {
                singleChar = str.charAt(i).toString();
                if (singleChar.match(chineseRegex) !== null) {
                    newLength += 2;
                }
                else {
                    newLength++;
                }
                if (newLength > len) {
                    break;
                }
                newStr += singleChar;
            }

            if (strLength > len) {
                newStr += "..";
            }
            return newStr;
        },
        /**
         * 获取机顶盒类型，个人不建议使用这个方法做适配，推荐用能力检测
         * @returns {string}
         */
        getSTBType: function () {
            var ua = navigator.userAgent;
            if (/RocME/gi.test(ua) || /MMCP_EW/gi.test(ua)) {
                return 'gdSTB';
            } else if (/Firefox/gi.test(ua) || /Chrome/gi.test(ua)) {
                return 'browser';
            } else if (/AppleWebKit/gi.test(ua)) {
                return 'scSTB';
            }
            return '';
        }

    };

    TVUI.Util = Util;

})(Zepto, TVUI);
;
/**
 * 按键常量
 * @type {{}}
 */
TVUI.Key = {

    //遥控器按键
    NUM0: 48, //0x0030,  数字键0
    NUM1: 49, //0x0031,  数字键1
    NUM2: 50, //0x0032,  数字键2
    NUM3: 51, //0x0033,  数字键3
    NUM4: 52, //0x0034,  数字键4
    NUM5: 53, //0x0035,  数字键5
    NUM6: 54, //0x0036,  数字键6
    NUM7: 55, //0x0037,  数字键7
    NUM8: 56, //0x0038,  数字键8
    NUM9: 57, //0x0039,  数字键9
    EXIT: 27, //0x0003,  取消/退出键,即CANCEL
    CHANNEL_DOWN: 91, //0x01AC,  遥控器上的频道减少键
    CHANNEL_UP: 93, //0x01AB,  遥控器上的频道增加键
    RED: 320, //0x0193,  遥控器上的功能键COLORED_KEY_0,RocME中代表红色按键
    YELLOW: 322, //0x0194,  遥控器上的功能键COLORED_KEY_1,RocME中代表黄色按键
    BLUE: 323,  //0x0195,  遥控器上的功能键COLORED_KEY_2,RocME中代表蓝色按键
    GREEN: 321,  //0x0196,  遥控器上的功能键COLORED_KEY_3,RocME中代表绿色按键
    EPG: 69, //458   //0x01CA,  遥控器上的节目指南键,预告键,即GUIDE
    INFO: 73,  //0x01C9,  遥控器上的信息键
    MENU: 72,  //0x01D4,  遥控器上的菜单键
    VOLUME_MUTE: 67,   //0x01C1,  遥控器上的静音键
    SELECT: 13,  //0x000D,  遥控器上的确定键,即OK
    VOLUME_DOWN: 45, //0x01C0,  遥控器上音量减小键
    VOLUME_UP: 61, //0x01BF,  遥控器上的音量增大键
    DOWN: 83,  //0x0028,  遥控器上的向下键
    UP: 87,  //0x0026,  遥控器上的向上键
    LEFT: 65,  //0x0025,  遥控器上的向左键
    RIGHT: 68, //0x0027,  遥控器上的向右键
    POWER: 19,  //0xFFFF,  遥控器上的指示关机与开机键
    PAGE_UP: 306, //0x0021,  遥控器上的向上翻页键
    PAGE_DOWN: 307,  //0x0022,  遥控器上的向下翻页键
    TRACK: 86, //0x0197,  遥控器上的声道键,即AUDIO
    LIKE: 76, //0x01CB,  遥控器上的字幕键/频道喜爱键,即TELETEXT
    BACK: 8, //0x0280,  遥控器上的返回键,即TOGGLE
    PROGRAM_LIST: 641, //0x0281,  遥控器上的频道列表键或咨询键,即PROG_LIST
    TV_RADIO: 642, //0x0282,  遥控器上的指示"电视/音频广播"键
    NVOD: 315, //0x0283,  遥控器上的卡信息或点播键,交互键, 即CARD_INFO
    MAIL: 77, //0x0284,  遥控器上的邮件键
    STAR: 318, //星号键
    POUND: 319,  //#键
    INVALID: 90513,  //0x0201,  未知按键码，SMSX自定义
    STATE: 514,   //0x0202,  遥控器上的状态键，SMSX自定义
    DC: 515, //0x0203,  遥控器上的数据广播键，SMSX自定义
    SORT: 516,  //0x0204,  遥控器上的节目分类键，SMSX自定义
    GAME: 517,  //0x0205,  遥控器上的游戏键，SMSX自定义
    LAST_CHANNEL: 314, //0x0208,  遥控器上的电视回看键，SMSX自定义
    PAUSE: 59, //0x0211,  遥控器上的暂停按键，SMSX自定义
    HOMEPAGE: 72, //0x0213,  遥控器上的主页面键，SMSX自定义
    MOSAIC: 532,  //0x0214,  遥控器上的马赛克键，SMSX自定义
    STOCK: 533, //0x0215,  遥控器上的股票键，SMSX自定义
    VIDEO: 313,  //0x0216,  遥控器上的电视键，SMSX自定义
    AUDIO: 535, //0x0217,  遥控器上的广播键，SMSX自定义
    PLAY: 39, //0x0309,  天津项目中代表 :  [播放] 键
    STOP: 47, //0x0306,  天津项目中代表 :  [停止] 键
    FUN1: 518, //0x0206,  天津项目中代表 :  [视讯] 键
    FUN2: 519,  //0x0207,  天津项目中代表 :  [点播] 键
    FUN3: 769, //20769   //0x0301,  天津项目中代表 :  [股票] 键
    FUN4: 770, //20770   //0x0302,  天津项目中代表 :  [信箱] 键
    FUN5: 771, //0x0303,  天津项目中代表 :  [步进] 键
    FUN6: 772,  //0x0304,  天津项目中代表 :  [上一单元] 键
    FUN7: 773,  //0x0305,  天津项目中代表 :  [下一单元] 键
    FUN9: 44, //0x0307,  天津项目中代表 :  [快退] 键
    FUN10: 46, //0x0308,  天津项目中代表 :  [快进] 键
    FUN12: 59,  //0x030A,  天津项目中代表 :  [暂停/时移] 键
    FUN13: 82, //0x030B,  天津项目中代表 :  [录制] 键
    FUN14: 780, //0x030C,  天津项目中代表 :  [ V+/PIP移动 ] 键
    FUN15: 781, //0x030D,  天津项目中代表 :  [ V-/PIP互换 ] 键
    FUN16: 782,  //0x030E,  天津项目中代表 :  [PIP ] 键
    FUN17: 783, //0x030F,  天津项目中代表 :  [预定] 键
    FUN18: 784, //0x0310,  天津项目中代表 :  [全部] 键
    FUN19: 785,  //0x0311,  天津项目中代表 :  [] 键
    FUN20: 319,  //0x0312,  天津项目中代表 :  # 键


    //系统事件
    DVB_SEARCH_FINISH: 10001, // 自动、手动或全频段搜索已完毕
    DVB_SEARCH_FAILED: 10002, // 自动、手动或全频段搜索失败
    DVB_SEARCH_START: 10003, // 开始搜索某个频点
    DVB_SEARCH_SERVICE_READY: 10004, // 在当前频点下,已经搜索到service
    DVB_SEARCH_STOP: 10005,  // 成功终止频道搜索
    DVB_TUNE_SUCCESS: 10031, // 成功锁定频点
    DVB_TUNE_FAILED: 10032, // 锁频失败
    DVB_NIT_CHANGED: 10041, // NIT版本变化
    DVB_NIT_NETWORK_DESCRIPTOR_READY: 10042,  // 已获取到NIT表的某个Network_Descriptor值
    DVB_NIT_TS_DESCRIPTOR_READY: 10043, // 已获取到NIT表的某个Transport_Descriptor值
    DVB_NIT_TABLE_READY: 10044,  // 已获取到整个NIT表内容
    DVB_BAT_BOUQUET_DESCRIPTOR_READY: 10081,  // 已获取到BAT表的某个Bouquet_Descriptor值
    DVB_BAT_TS_DESCRIPTOR_READY: 10082,   // 已获取到BAT表的某个Transport_Descriptor值
    DVB_SDT_SERVICE_DESCRIPTOR_READY: 10091, // 已获取到SDT表的某个Service_Descriptor的值
    DATA_DEL_ALL_SUCC: 10101, // 成功清除A、B、D区中PSI/SI数据
    DATA_DEL_ALL_FAILED: 10102,  // 无法清除A、B、D区中PSI/SI数据
    DATA_DEL_TMP_SUCC: 10103, // 成功清除D区PSI/SI数据
    DATA_DEL_TMP_FAILED: 10104,  // 无法清除D区PSI/SI数据
    DATA_UPDATE_SUCC: 10105,  // 成功用D区更新A区数据
    DATA_UPDATE_FAILED: 10106,  // 无法用D区更新A区数据
    DATA_REVERT_SUCC: 10107,   // 成功用B区更换A区数据
    DATA_REVERT_FAILED: 10108,  // 无法用B区更换A区数据
    DATA_SAVE_SUCC: 10109, // 成功将A区数据写入B区
    DATA_SAVE_FAILED: 10110, // 无法将A区数据写入B区
    DATA_BACKUP_SUCC: 10111,  // 成功将B区数据备份到C区
    DATA_BACKUP_FAILED: 10112,  // 无法将B区数据备份到C区
    DATA_RESTORE_SUCC: 10113, // 成功恢复A、B区数据
    DATA_RESTORE_FAILED: 10114, // 无法恢复A、B区数据
    EPG_SEARCH_SUCC: 10201, // 成功完成EPG搜索
    EPG_SEARCH_STOP_WHEN_RST_TO_MAX: 10202, // 搜索结果达到255个,搜索自动停止
    EPG_SEARCH_TIMEOUT: 10203, // 搜索EPG超时
    EPG_ACTUAL_PF_READY: 10204,  // 当前频点actual PF信息收取完毕.如果当前频道PF信息更新,则会再次发送此消息.
    EPG_OTHER_PF_READY: 10205,  // 当前频点other PF信息收取完毕.
    EPG_ACTUAL_SCHEDULE_READY: 10206,  // 当前频点actual schedule信息收取完毕.
    EPG_OTHER_SCHEDULE_READY: 10207,  // 当前频点other schedule信息收取完毕.
    DVB_EIT_EVENT_DESCRIPTOR_READY: 10208,  // 已获取到EIT表的某个Event_Descriptor的值
    NVOD_REFEVENT_READY: 10221,   // 接收NVOD参考事件成功,如果当前NVOD参考业务PF信息更新,则会再次发送此消息.
    NVOD_REFEVENT_TIMEOUT: 10222, // NVOD参考事件接收超时
    NVOD_TISHIEVENT_READY: 10223,  // 接收NVOD时移事件成功.
    NVOD_TISHIEVENT_TIMEOUT: 10224,  // NVOD时移事件接收超时
    NVOD_TISHIEVENT_END: 10225,   // NVOD时移事件结束
    CA_SMARTCARD_INSERT: 10401,  // 智能卡已插入
    CA_SMARTCARD_EVULSION: 10402, // 智能卡已拔出
    CA_MSG_INFO: 10403,    // CA 的提示信息,为CA指定(CA_INFO)
    CA_MSG_ALARM: 10404, // CA 的警告信息,为CA指定(CA_ALARM)
    CA_MSG_COMMAND: 10405,  // CA 的命令信息,为CA指定(CA_COMMAND)
    CA_MSG_STATUS: 10406,   // CA的状态信息,为CA指定(CA_STATUS)
    NETWORK_CONNECTED: 10501,  // 网线已插上
    NETWORK_DISCONNECTED: 10502,  // 网线已断开
    LAN_NETWORK_CONNECTED: 10503, // LAN模式网络已连接.
    LAN_NETWORK_DISCONNECTED: 10504,  // LAN模式网络已断开.
    LAN_NETWORK_DHCP_ENABLE_SUCCESS: 10508, // DHCP功能启用成功
    LAN_NETWORK_DHCP_ENABLE_TIMEOUT: 10509, // DHCP功能启用超时
    NTPTIME_SYNC_SUCC: 10521, // 网络NTP时间同步成功.
    NTPTIME_SYNC_TIMEOUT: 10522,  // 网络 NTP时间同步超时.
    PING_RESPONSE: 10523,  // PING命令响应.
    IP_UPDATED: 10524,    // IP地址有更新
    WRITE_FLASH_SUCC: 10601, // Flash写入成功
    OTA_FORCE_UPGRADE: 10701,   // OTA强制升级信息
    OTA_MANUAL_UPGRADE: 10702,  // OTA手动升级信息
    OTA_ANALY_UPGRADE_DATA: 10703,  // OTA 获取并分析升级数据
    OTA_ANALY_NIT_SUCCESS: 10704,  // OTA 获取并分析NIT成功
    OTA_ANALY_NIT_FAILED: 10705,  // OTA 获取并分析NIT失败
    OTA_ANALY_PAT_SUCCESS: 10706,  // OTA 获取并分析PAT成功
    OTA_ANALY_PAT_FAILED: 10707,  // OTA 获取并分析PAT失败
    OTA_ANALY_PMT_SUCCESS: 10708,  // OTA 获取并分析PMT成功
    OTA_ANALY_PMT_FAILED: 10709,   // OTA 获取并分析PMT失败
    OTA_BURNING: 10710, // OTA 烧录升级参数到flash
    OTA_BURNING_SUCCESS: 10711,  // OTA 烧录升级参数到flash成功
    OTA_BURNING_FAILED: 10712,  // OTA 烧录升级参数到flash失败
    OTA_UPDATE_SUCCESS: 10713,  // OTA 升级参数获取成功,重启升级
    OTA_NO_UPDGRADE_INFO: 10714,  // 未检测到OTA升级信息
    ORDERD_EVENT_WILL_START: 10801,  // 用户预定的节目将要开始  （该消息在预订节目开始前N分钟触发，N由数据访问接口中的bookedInformTime字段值指定）
    ORDERD_EVENT_START: 10802, // 用户预定的节目开始
    VOD_END_OF_STREAM: 10901,
    VOD_BEGIN_OF_STREAM: 10902,
    VOD_S1_ANNOUNCE_TERMINATE: 10903,
    VOD_C1_ANNOUNCE_TERMINATE: 10904,
    VOD_EXCEPTION: 11000,
    CAEXT_INQUIRE_IPP: 11701, // IPP即时购买提示框
    CAEXT_HIDDEN_PROGRAM: 11702,   // 隐藏节目不能观看的提示框
    VOD_EXTINIT_OVER: 20004,
    EMAIL: 11536,


    //************ 主应用自定义消息 *************
    SEARCH_DEL_TEMP_FAILED: 80001, //删除缓存失败
    SEARCH_FAILED: 80002,  //搜索失败
    SEARCH_STOP: 80012, //成功停止
    SEARCH_SAVE_FAILED: 80006,  //保存失败
    SEARCH_SAVE_SUCC: 80007,  //保存成功
    SEARCH_TUNE_FAILED: 80008, //锁频失败
    SEARCH_TUNE_SUCC: 80009, //锁频成功
    SEARCH_READY: 80010 //搜索到节目
};

//兼容浏览器和机顶盒
if (!window.DataAccess) {
    TVUI.Key.DOWN = 40;
    TVUI.Key.UP = 38;
    TVUI.Key.LEFT = 37;
    TVUI.Key.RIGHT = 39;
    TVUI.Key.BACK = 32;
    TVUI.Key.PAGE_UP = 33;
    TVUI.Key.PAGE_DOWN = 34;
};
TVUI.Lang = {
    zh: {
        T_1 : '确定',
        T_2 : '取消',
        T_3 : '关闭',
        T_4 : '退出',
        T_5 : '播放',
        T_6 : '续播',
        T_7:'锁频失败',
        T_8:'无法在当前频点找到节目描述信息,请联系客服96956.',
        T_9:'不可用媒资',
        T_10:'网络繁忙，请稍候!',
        T_11:'无权限操作',
        T_12:'推流会话中断,请联系客服电话96956,错误码:C1-10909-',
        T_13:'点播失败,是否重新点播?',
        T_14:'点播会话中断,请联系客服电话96956,错误码:S1-10904-',
        T_15:'提示'
    },
    en: {
        T_1 : 'OK',
        T_2 : 'Cancel',
        T_3 : 'Close',
        T_4 : 'Exit',
        T_5 : 'Play',
        T_6 : 'Resume',
        T_7:'Locking frequency failed',
        T_8:'Program information in not found , pls call 96956.',
        T_9:'Not available media resources!',
        T_10:'The network is busy, pls wait!',
        T_11:'No permission to operate.',
        T_12:'Flow session is interrupted,pls call 96956, error code:C1-10909-',
        T_13:'On demand failed, whether to replay or not?',
        T_14:'On demand session is interrupted,pls call 96956,error code:S1-10904-',
        T_15:'Prompt'
    }
};

//提供方法给外部继承
TVUI.Lang.extend = function (lang) {
    Zepto.extend(TVUI.Lang, lang || {});
};
;
/**
 * 事件模块，提供dom事件绑定和删除功能
 */
(function ($, TVUI, window) {
    var Event,

    //长按键时间, 按住键超过这个时间连续触发，常用音量和换台
        _longKeyTime = 500,

    //连续触发时间间隔
        _interval = 200,

    //组合键计算时间
        _comKeyTime = 2000,

    //document对象
        _doc = window.document,

    //事件句柄缓存对象,所有绑定的事件都保存在这里，格式：[{type: type, handler: handler, scope: scope}]
        _handlers = {},

    //键值字典
        _key = TVUI.Key,

        _eventMap = {
            'load': window,
            'unload': window,
            'beforeunload': window,
            'keyup': _doc,
            'keydown': _doc,
            'keypress': _doc
        },

        /**
         * dom事件绑定函数
         * @param type 事件名称，如：keyup、keydown
         * @param handler 事件句柄函数
         * @param scope 作用域，就是handler中的 this 指向的对象
         * @returns {TVUI.uuid|*} 返回唯一的标识id
         */
        addEvent = function (type, handler, scope) {
            _handlers[++TVUI.uuid] = {type: type, handler: handler, scope: scope};
            (_eventMap[type] || _doc).addEventListener(type, handler, false);
            return TVUI.uuid;
        },

        /**
         * 删除dom事件
         * @param type  事件名称
         * @param handler 事件句柄
         *
         * ex：
         * 1）、removeEvent(type, handler) 删除具体一个事件
         * 2）、removeEvent(type) 删除指定一类事件，例如要删除keyup的全部事件 removeEvent('keyup')
         * 3) 、removeEvent()  删除所有事件
         */
        removeEvent = function (type, handler) {
            var key, evt;
            if (type) {
                //有传递删除事件类型
                if (handler) {
                    //有传递删除事件回调函数
                    _doc.removeEventListener(type, handler, false);
                    for (key in _handlers) {
                        evt = _handlers[key];
                        if (evt.type == type && evt.handler == handler) {
                            delete _handlers[key];
                            break;
                        }
                    }
                } else {
                    //没有传递事件回调函数，即删除该事件类型的全部事件
                    for (key in _handlers) {
                        evt = _handlers[key];
                        if (evt.type == type) {
                            _doc.removeEventListener(evt.type, evt.handler, false);
                            delete _handlers[evt];
                        }
                    }

                }
            } else {
                //删除所有事件
                for (key in _handlers) {
                    evt = _handlers[key];
                    _doc.removeEventListener(evt.type, evt.handler, false);
                }
                _handlers = {};
            }

        },
        /**
         * 根据事件唯一标识id删除事件
         * @param id
         */
        removeEventById = function (id) {
            var evt = _handlers[id] || {};
            _doc.removeEventListener(evt.type, evt.handler, false);
            delete _handlers[id];
        },
        /**
         * 阻止事件默认行为
         * @param evt
         * @returns {boolean}
         */
        preventDefault = function (evt) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            }
            else {
                window.event.returnValue = false;
            }
            return false;
        },
        /**
         * 根据keyCode模拟一个dom事件对象
         * @param keyCode
         * @returns {{preventDefault: preventDefault, keyCode: *, which: *}}
         */
        createEvent = function (keyCode) {
            var evt = {
                preventDefault: function () {
                },
                keyCode: keyCode,
                which: keyCode
            };
            return evt;
        },
        /**
         * 修复事件对象，　由于浏览器，中间件对原生事件对象的不同，在这里做适配处理
         * @param evt
         * @returns {*|Event}
         */
        fixEvent = function (evt) {
            //对浏览器的事件兼容
            var e = evt || window.event;

            //对中间件事件对象的支持
            e.type = e.type || null;
            e.which = e.keyCode = e.which || e.keyCode || null;
            e.modifiers = e.modifiers || null;
            return e;
        };

    Event = {
        preventDefault: preventDefault,
        /**
         * dom事件绑定函数
         * @param type 事件名称，如：keyup、keydown
         * @param handler 事件句柄函数
         * @param scope 作用域，就是handler中的 this 指向的对象
         * @returns {TVUI.uuid|*} 返回唯一的标识id
         */
        on: function (type, handler, scope) {
            return addEvent(type, function (evt) {
                handler && handler.call(scope || handler, fixEvent(evt));
            });
        },
        /**
         * 删除dom事件
         * @param type  事件名称
         * @param handler 事件句柄
         *
         * ex：
         * 1）、off(type, handler) 删除具体一个事件
         * 2）、off(type) 删除指定一类事件，例如要删除keyup的全部事件 off('keyup')
         * 3) 、off()  删除所有事件
         * 4）、off(id) 删除指定id标识的事件
         * 5）、off(ids) 删除指定id标识数组的事件
         */
        off: function (type, handler) {
            var t = $.type(type);
            if (t === 'number') {
                removeEventById(type);
            } else if (t === 'array') {
                for (var i = 0, len = type.length; i < len; i++) {
                    arguments.callee(type[i]);
                }
            } else {
                removeEvent.apply(removeEvent, arguments);
            }
        },
        /**
         * 触发事件
         * @param type 事件名称
         * @param keyCode 模拟事件keyCode
         *
         */
        fire: function (type, keyCode) {
            for (var key in _handlers) {
                var e = _handlers[key];
                if (e.type == type) {
                    e.handler.call(e.scope, createEvent(keyCode));
                }
            }
        },
        /**
         * 按键事件，不需要长按连续触发的，建议使用这个绑定方式，提高性能
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {TVUI.uuid|*} 事件唯一标识
         */
        onPress: function (callback, scope) {
            return this.on('keyup', callback, scope);
        },
        /**
         * 按键事件，这种绑定方式支持长按连续触发
         * @param code 按键的keyCode
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onKey: function (code, callback, scope) {
            var tick1, tick2, diff, timer1 = null, timer2 = null, downId, upId;
            downId = this.on('keydown', function (e) {
                if (e.which == code) {
                    tick1 = (new Date()).getTime();
                    if (!timer1) {
                        timer1 = setTimeout(function () {
                            timer2 = setInterval(function () {
                                callback && callback.call(scope, e);
                            }, _interval);

                        }, _longKeyTime);
                    }
                }
            }, scope);

            upId = this.on('keyup', function (e) {
                clearTimeout(timer1);
                clearInterval(timer2);
                timer1 = timer2 = null;
                tick2 = (new Date()).getTime();
                diff = tick2 - tick1;
                //如果按住键的时间没达到长键值，即触发常规按键
                if (diff < _longKeyTime) {
                    if (e.which == code) {
                        callback && callback.call(scope, e);
                    }
                }
            }, scope);
            return [downId, upId];
        },
        /**
         * 绑定多个按键事件
         * @param codes 按键keyCode数组
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {Array} 事件唯一标识数组
         */
        onKeys: function (codes, callback, scope) {
            var self = this, ids = [];
            $.each(codes, function (i, n) {
                ids = ids.concat(self.onKey(n, callback, scope));
            });
            return ids;
        },
        /**
         * 确定键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onOk: function (callback, scope) {
            return this.onKey(_key.SELECT, callback, scope);
        },
        /**
         * 方向左键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onLeft: function (callback, scope) {
            return this.onKey(_key.LEFT, callback, scope);
        },
        /**
         * 方向右键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onRight: function (callback, scope) {
            return this.onKey(_key.RIGHT, callback, scope);
        },
        /**
         * 方向上键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onUp: function (callback, scope) {
            return this.onKey(_key.UP, callback, scope);
        },
        /**
         * 方向下键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onDown: function (callback, scope) {
            return this.onKey(_key.DOWN, callback, scope);
        },
        /**
         * 同时绑定 上下左右 键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象，并且有direction属性标识按键的方向
         * @param scope 作用域
         * @returns {Array} 事件唯一标识数组
         */
        onMove: function (callback, scope) {
            var keys = [_key.UP, _key.RIGHT, _key.DOWN, _key.LEFT];
            return this.onKeys(keys, function (e) {
                switch (e.which) {
                    case _key.UP:
                        e.direction = 'up';
                        callback && callback.call(scope, e.direction, e);
                        break;
                    case _key.RIGHT:
                        e.direction = 'right';
                        callback && callback.call(scope, e.direction, e);
                        break;
                    case _key.DOWN:
                        e.direction = 'down';
                        callback && callback.call(scope, e.direction, e);
                        break;
                    case _key.LEFT:
                        e.direction = 'left';
                        callback && callback.call(scope, e.direction, e);
                        break;
                }
            }, scope);
        },
        /**
         * 绑定数字键 0~9 事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象，并且有number属性标识按键的数字
         * @param scope 作用域
         * @returns {TVUI.uuid|*} 事件唯一标识
         */
        onNumber: function (callback, scope) {
            return this.on('keyup', function (e) {
                if (e.which >= _key.NUM0 && e.which <= _key.NUM9) {
                    e.number = parseInt(e.which - _key.NUM0, 10);
                    callback && callback.call(scope, e);
                }
            }, scope);
        },
        /**
         * 组合按键事件，例如 96956 这类的事件
         * @param codes 组合的keyCode数组
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {TVUI.uuid|*} 事件唯一标识
         */
        onComKey: function (codes, callback, scope) {
            var _event = {};
            _event.timerId = null;
            _event.keyTime = null;
            _event._lastKeys = [];
            return this.on('keyup', function (e) {
                clearTimeout(_event.timerId);
                var now = (new Date()).getTime();
                if (!_event.keyTime || now - _event.keyTime < _comKeyTime) {
                    _event._lastKeys.push(e.which);
                    _event.keyTime = now;
                }
                if (codes.join(',') == _event._lastKeys.join(',')) {
                    e.comKeys = codes;
                    _event._lastKeys = [];
                    _event.keyTime = null;
                    callback && callback.call(scope, e);
                }
                _event.timerId = setTimeout(function () {
                    _event._lastKeys = [];
                    _event.keyTime = null;
                }, _comKeyTime);

            }, scope);
        },
        /**
         * 数字组合键，例如输入频道号
         * @param change 数字改变时回调，参数 num 数值
         * @param callback 完成时回调，参数 num 数值
         * @param scope 作用域
         * @returns {Array} 事件唯一标识数组
         */
        onComNumber: function (change, callback, scope) {
            var _event = {}, evt1, evt2, evtArray = [];
            _event.timerId = null;
            _event.keyTime = null;
            _event._lastKeys = [];
            evt1 = this.onNumber(function (e) {
                clearTimeout(_event.timerId);
                var now = (new Date()).getTime();
                if (!_event.keyTime || now - _event.keyTime < _comKeyTime) {
                    _event._lastKeys.push(e.number);
                    _event.keyTime = now;
                    change && change.call(scope, _event._lastKeys.join(''), e);
                }
                _event.timerId = setTimeout(function () {
                    callback && callback.call(scope, _event._lastKeys.join(''), e);
                    _event._lastKeys = [];
                    _event.keyTime = null;
                }, _comKeyTime);
            }, scope);

            evt2 = this.onOk(function (e) {
                if (_event._lastKeys.length > 0) {
                    clearTimeout(_event.timerId);
                    callback && callback.call(scope, _event._lastKeys.join(''), e);
                    _event._lastKeys = [];
                    _event.keyTime = null;
                }
            }, scope);
            return evtArray.concat(evt1).concat(evt2);
        },
        /**
         * 绑定系统事件
         * @param callback 事件回调函数，回调函数参数是事件对象
         * @param scope 作用域
         * @returns {TVUI.uuid|*} 事件唯一标识
         */
        onSystem: function (callback, scope) {
            return this.on('systemevent', function (e) {
                callback && callback.call(scope, e);
            }, scope);
        }
    };


    TVUI.Event = Event;

})(Zepto, TVUI, window);;
/**
 * 类构建模块
 */

(function ($, TVUI) {

    var util = TVUI.Util;

    /**
     * 类构建工厂函数
     * @param parent  父类，可选
     * @returns {_class}
     * @constructor
     *
     * ex：
     * 1） Class() 创建一个类
     * 2） Class(parent) 创建一个类，并继承parent类
     * 3） Class.create() 创建一个类
     * 4)  Class.create(includeObj) 创建一类，并添加实例方法
     * 5） Class.create(includeObj, parent) 创建一个类，继承parent，并添加实例方法
     */
    function Class(parent) {
        function _class() {
            //实例化时执行初始化
            this._init.apply(this, arguments);
            this.init.apply(this, arguments);
        }

        /**
         * 底层初始化函数，自动运行
         * @private
         */
        _class.prototype._init = function () {
        };
        /**
         * 初始化函数，自动在_init执行后执行
         */
        _class.prototype.init = function () {
        };

        if (parent) {
            var F = function () {
            };
            $.extend(true, F.prototype, parent.prototype);
            _class.prototype = new F();
            _class.prototype.parent = parent;
        }
        /**
         * 添加实例方法函数
         * @param obj 方法集合对象
         * @returns {_class}
         *
         * ex：
         *  var Person = Class();
         *  Person.include({
         *      say : function(){
         *          //to do something
         *      }
         *  })
         *
         *  var person = new Person();
         *  person.say(); // 这样person就有了say的方法
         */
        _class.include = function (obj) {
            var included = obj.included;
            delete obj.included;
            $.extend(_class.prototype, obj, true);
            included && included(_class);
            return this;
        };

        /**
         * 添加静态方法
         * @param obj 静态方法集合对象
         * @returns {_class}
         *
         * ex:
         * var Person = Class();
         * Person.extend({
         *    say : function(){
         *      //to do something
         *    }
         * });
         * Person.say(); // Person拥有了say的方法
         */
        _class.extend = function (obj) {
            var extended = obj.extended;
            delete obj.extended;
            $.extend(true, _class, obj);
            extended && extended(_class);
            return this;
        };

        /**
         * 代理函数，用做替换函数的作用域
         * @param func 要提供作用域的函数，在func函数内部的this指向实例
         * @param args 可选，附加参数
         * @returns {*}
         */
        _class.proxy = function (func, args) {
            return util.proxy(func, this, args);
        };

        /**
         * 代理多个函数
         * ex:
         *  this.proxyAll('func1', 'func2', .......);
         */
        _class.proxyAll = function () {
            var arr = util.slice.call(arguments);
            for (var i = 0, len = arr.length; i < len; i++) {
                this[arr[i]] = this.proxy(this[arr[i]]);
            }
        };
        //给实例也添加代理方法
        _class.prototype.proxy = _class.proxy;
        _class.prototype.proxyAll = _class.proxyAll;

        return _class;
    }

    /**
     * 类构建快捷方式
     * @param include 可选，实例方法集合
     * @param parent 可选，父类
     * @returns {*}
     */
    Class.create = function (include, parent) {
        return Class(parent).include(include || {});
    };

    TVUI.Class = Class;

})(Zepto, TVUI);

;
/**
 * 基类模块，提供基础功能的对象
 */
(function ($, TVUI) {
    var util = TVUI.Util,
        Class = TVUI.Class,
        Event = TVUI.Event;

    //自定义事件
    var customEvent = {
        /**
         *绑定自定义事件
         * @param ev  事件名称
         * @param callback 回调函数
         * @returns {_event} 对象
         * ex：
         * 1） on('event1', callback)
         * 2) on('event1 event2', callback) 绑定多个事件，空格隔开
         */
        on: function (ev, callback) {
            //可以侦听多个事件，用空格隔开
            var evs = ev.split(" ");
            //创建_callbacks对象，除非它已经存在了
            var calls = this._callbacks || (this._callbacks = {});
            for (var i = 0; i < evs.length; i++) {
                //针对给定的事件key创建一个数组，除非这个数组已经存在
                //然后将回调函数追加到这个数组中
                (this._callbacks[evs[i]] || (this._callbacks[evs[i]] = [])).push(callback);
            }
            return this;
        },
        /**
         * 触发事件, 第一个参数是事件名称
         * 调用举例 fire(eventName, param1, param2.....)
         * @returns {boolean} 是否已经触发
         */
        fire: function () {
            //将arguments对象转换成真正的数组
            var args = util.makeArray(arguments);
            //拿出第一个参数，即事件名称
            var ev = args.shift();
            var list, calls, i, l;
            //如果不存在_callbacks对象，则返回
            if (!(calls = this._callbacks)) {
                return false;
            }
            //如果不包含给定事件对应的数组，也返回
            if (!(list = this._callbacks[ev])) {
                return false;
            }
            //触发数组中的回调
            for (i = 0, l = list.length; i < l; i++) {
                if (list[i].apply(this, args) === false) {
                    break;
                }
            }
            return true;
        },
        /**
         * 销毁事件
         * @param ev  事件名称，可选，为空即销毁对象的所有事件
         * @param callback  句柄，可选
         * @returns {_event}
         *
         * ex:
         * 1) off('event1', callback) 删除对象指定一个事件
         * 2) off('event1') 删除对象指定一类事件
         * 3) off() 删除改对象的全部事件
         */
        off: function (ev, callback) {
            //如果不传入事件名称，即把所有事件都清除
            if (!ev) {
                this._callbacks = {};
                return this;
            }
            var list, calls, i, l;
            //如果不存在_callbacks对象，则返回
            if (!(calls = this._callbacks)) {
                return this;
            }
            //如果不包含给定事件对应的数组，也返回
            if (!(list = this._callbacks[ev])) {
                return this;
            }
            //如果不存入回调函数，即把该事件对应的数组全部清空
            if (!callback) {
                delete this._callbacks[ev];
                return this;
            }
            //删除指定事件名称和回调的事件
            for (i = 0, l = list.length; i < l; i++) {
                if (callback === list[i]) {
                    list.splice(i, 1);
                    break;
                }
            }
            return this;
        }
    };

    /**
     * 基类
     * @type {*}
     */
    var Base = Class.create({
        /**
         * 底层初始化函数
         * @private
         */
        _init: function () {
            /**
             * 对象唯一id标识
             * @type {number}
             */
            this.id = ++TVUI.uuid;

            /**
             * 事件标识id数组，绑定的事件id将记录在这里，用作销毁
             * @type {Array}
             * @private
             */
            this.__eventIdArray = [];

            /**
             * 状态，是否激活的，如果非激活的，不接收dom事件
             * @type {boolean}
             * @private
             */
            this._active = true;
        },
        /**
         * 注册事件，缓存事件的id
         * @param id  事件id标识
         */
        registerEvent: function (id) {
            this.__eventIdArray = this.__eventIdArray.concat(id);
        },
        /**
         * 销毁对象
         */
        destroy: function () {
            //触发销毁事件
            this.fire('destroy', this);
            Event.off(this.__eventIdArray);
            this.off();
        },
        /**
         * 激活对象
         * @param index 可选，第几个菜单项获得焦点
         */
        active: function (index) {
            this._active = true;

            //触发激活事件
            this.fire('active', this, index);
        },
        /**
         * 取消激活
         */
        unActive: function () {
            this._active = false;

            //触发取消激活事件
            this.fire('unActive', this);
        }
    });

    //类实例添加自定义事件支持
    Base.include(customEvent);

    //类对象添加自定义事件支持
    Base.extend(customEvent);

    TVUI.Base = Base;

})(Zepto, TVUI);;
/**
 * 中间件通讯模块，适配中间api
 */
(function (TVUI, JSON) {
    var util = TVUI.Util,
        key = TVUI.Key,
        $ = TVUI.$;

    var empty = function () {
        },
        noop = function () {
            util.log(arguments);
        },
        isSTB = !!window.DataAccess && !!window.SysSetting;


    /**
     * DataAccess 适配
     * @type {{info: info, save: save, revert: revert, volume: volume, volumn: volumn}}
     */
    var da = {
        /**
         * 适配中间件的DataAccess.getInfo (ClassName,InfoName) 和  DataAccess.setInfo (ClassName,InfoName,InfoValue)
         * @param className 字符串，分类名
         * @param infoName 字符串，要设置的数据名称
         * @param infoValue 字符串，要设置的数据值
         * @returns {*}
         *
         * ex：
         * 1) TVUI.API.DataAccess.info(className, infoName, infoValue) 设置
         * 2）TVUI.API.DataAccess.info(className, infoName) 读取
         */
        info: function (className, infoName, infoValue) {
            if (!isSTB) {
                util.log('msg:', 'DataAccess undefined. do: da.info');
                return '';
            }
            if (infoValue) {
                DataAccess.setInfo(className, infoName, infoValue);
                this.save(className, infoName);
            } else {
                return  DataAccess.getInfo(className, infoName);
            }
        },
        /**
         * 将内存中的指定数据写入Flash
         * @param className 字符串，分类名
         * @param infoName 字符串，要设置的数据名称
         */
        save: function (className, infoName) {
            if (typeof DataAccess == 'undefined') {
                util.log('msg:', 'DataAccess undefined. do:da.save');
            } else {
                DataAccess.save(className, infoName);
            }
        },
        /**
         * 将Flash中的指定数据读取到内存
         * @param className 字符串，分类名
         * @param infoName 字符串，要设置的数据名称
         */
        revert: function (className, infoName) {
            if (typeof DataAccess == 'undefined') {
                util.log('msg:', 'DataAccess undefined do:da.revert');
            } else {
                DataAccess.revert(className, infoName);
            }
        },
        /**
         * 设置音量
         * @param val
         * @returns {Number} 数值 0~32
         */
        volume: function (val) {
            if ($.type(val) == 'number' || $.type(val) == 'string') {
                val = val > 32 ? 32 : val;
                val = val < 0 ? 0 : val;
                this.info('MediaSetting', 'OutputVolumn', val);
                //clearTimeout(this._volTimeId);
                //var self = this;
                //this._volTimeId = setTimeout(function () {
                //   self.save('MediaSetting', 'OutputVolumn');
                //}, 1000);
                this.info("VodApp", "QAMName4", val);
            } else {
                return parseInt(this.info('MediaSetting', 'OutputVolumn'), 10);
            }
        },
        /**
         * 设置音量，和volume是一样的，为了兼容中间的错别字
         * @param val
         * @returns {Number}
         */
        volumn: function (val) {
            return this.volume(val);
        }
    };

    /**
     * 适配中间件的 SysSetting
     * @type {{env: env, envJSON: envJSON, sendEvent: sendEvent, getEventInfo: getEventInfo, clear: clear}}
     */
    var sysSetting = {
        /**
         * 适配 SysSetting.setEnv(variantName,value)、SysSetting.getEnv(variantName)、SysSetting.deleteEnv(variantName)
         * @param name 全局变量名称
         * @param value 全局变量值
         * @returns {*}
         *
         * ex：
         * 1） TVUI.API.SysSetting.env(name,value) 设置
         * 2)  TVUI.API.SysSetting.env(name) 获取
         * 3)  TVUI.API.SysSetting.env(name,null)  删除
         */
        env: function (name, value) {
            if (typeof SysSetting != 'undefined') {
                if (value) {
                    SysSetting.setEnv(name, String(value));
                } else if (value === null) {
                    SysSetting.deleteEnv(name);
                } else {
                    return  SysSetting.getEnv(name);
                }
            } else {
                if (value) {
                    sessionStorage && sessionStorage.setItem(name, value);
                    // util.setCookie(name, value, 0);
                } else if (value === null) {
                    sessionStorage && sessionStorage.removeItem(name);
                    //util.delCookie(name);
                } else {
                    if (window.sessionStorage) {
                        return sessionStorage.getItem(name);
                    } else {
                        return "";
                    }
                    //return  util.getCookie(name);
                }
            }
        },
        /**
         * 以JSON的格式，适配以上 env 的功能
         * @param name
         * @param value  JSON格式数据或null
         * @returns {*}
         *
         * ex:
         * 用法同上
         */
        envJSON: function (name, value) {
            if (value) {
                if (typeof value === 'object') {
                    this.env(name, JSON.stringify(value));
                } else {
                    throw Error('evnJSON param require JSON');
                }
            } else {
                if (value === null) {
                    this.env(name, null);
                } else {
                    var result = this.env(name);
                    return result ? JSON.parse(result) : null;
                }

            }
        },
        /**
         * 从应用层向中间件发送虚拟消息，中间件仍旧通过type，which，modifiers属性得知其是虚拟消息
         * @param type 虚拟消息分类
         * @param which 虚拟的消息代码值，数值型（16位二进制存储，十进制方式使用）
         * @param modifiers 虚拟消息的扩展属性值
         * @returns {*} 数值型，1为成功发送虚拟消息，0为发送失败
         */
        sendEvent: function (type, which, modifiers) {
            if (typeof SysSetting != 'undefined') {
                return SysSetting.sendEvent(type, which, modifiers);
            }
        },
        /**
         * 根据Id指针，取出内存中保存的消息属性的字符串内容
         * @param id 字符串内容的指针，数值型
         * @returns {*} 字符串内容
         */
        getEventInfo: function (id) {
            if (typeof SysSetting != 'undefined') {
                return SysSetting.getEventInfo(id);
            } else {
                return "";
            }
        },
        /**
         * 清空全局环境变量数据
         */
        clear: function () {
            if (typeof SysSetting != 'undefined') {
                SysSetting.deleteallEnv();
            } else {
                sessionStorage && sessionStorage.clear();
            }

        }

    };

    /**
     *  适配 CA接口
     *  ex:
     *
     *  TVUI.API.CA.icNo
     *  ...
     *  覆盖全部CA的属性，名称和中间件规范一致
     */
    var ca = (function () {
        var _ca = window.CA || {};

        return {
            name: _ca.name || '',
            icNo: _ca.icNo || '',
            pinLocked: _ca.pinLocked || true,
            version: _ca.version || '',
            regionCode: _ca.regionCode || 0,
            changePin: _ca.changePin || noop,
            setRating: _ca.setRating || noop,
            getRating: _ca.getRating || noop,
            setWorkTime: _ca.setWorkTime || noop,
            getWorkTime: _ca.getWorkTime || noop,
            getOperators: _ca.getOperators || noop,
            getWallets: _ca.getWallets || noop,
            getEntitles: _ca.getEntitles || noop,
            getMails: _ca.getMails || noop,
            getViewedIPPs: _ca.getViewedIPPs || noop,
            getInquireIPP: _ca.getInquireIPP || noop,
            cancelInquireIPP: _ca.cancelInquireIPP || noop
        };
    })();

    /**
     * 适配 Network对象
     */
    var network = (function () {
        var _nw = window.Network || {};
        return {
            // host: _nw.host || '',
            //同洲盒子误认host是关键字，解释到host会死机（无解决方案），暂时去掉
            ethernets: _nw.ethernets || {},

            /**
             * 获取设备状态
             */
            getDeviceState: _nw.getDeviceState || noop,
            /**
             * 判断网络是否链接
             * @returns {boolean}
             */
            isEnable: function () {
                if (isSTB) {
                    var eth0 = _nw.getDeviceState('eth0'),
                        cm = _nw.getDeviceState('cm');
                    //状态为101或者201才是网络连接正常，但是创维的盒子拿到的状态是：1196176512
                    if (eth0 > 300 || cm > 300) {
                        return true;
                    } else {
                        return eth0 == 101 || cm == 201;
                    }
                }
                return true;
            }
        };
    })();

    /**
     * 适配 FileSystem对象
     * @type {{download: download, getFile: getFile, createFile: createFile, removeDir: removeDir}}
     */
    var fileSystem = {
        /**
         * 下载远程文件
         * @param options
         * ex:
         *
         * TVUI.API.FileSystem.download({
         *    path : 'http://192.168.1.1/file.js', //文件路径
         *    timeout : 5,  //超时时间,单位秒
         *    dataType: 'text', //返回的数据类型，支持 text 和 json
         *    success : function(data){
         *         //data 根据 dataType 返回
         *    },
         *    error : function(msg){
         *      //msg 错误信息
         *    }
         * });
         *
         */
        download: function (options) {
            if (!isSTB) {
                options.error && options.error();
                return;
            }
            var opt = {
                path: '', //文件路径
                timeout: 5,//超时时间
                dataType: 'text', //返回文件类型
                success: empty, //成功回调
                error: empty  //失败回调
            };
            $.extend(opt, options);
            var maskId, timerId;
            TVUI.Event.on('systemevent', function (e) {
                var msg;
                switch (parseInt(e.which)) {
                    //下载成功
                    case 10151:
                        clearTimeout(timerId);
                        var fileObj = FileSystem.getRemoteFile(maskId);
                        //以文本形式打开
                        if (fileObj.open(1) == 1) {
                            msg = fileObj.readAllfile();
                            if (opt.dataType == 'json') {
                                try {
                                    msg = JSON.parse(msg);
                                } catch (err) {
                                    opt.error(err);
                                }
                            }
                            fileObj.close();
                            opt.success(msg, fileObj);
                            FileSystem.killObject(fileObj);
                        } else {
                            opt.error("文件打开失败");
                        }
                        break;
                    //文件不存在
                    case 10152:
                        clearTimeout(timerId);
                        msg = '前端不存在要下载的文件';
                        opt.error(msg);
                        break;
                    case 10153:
                        clearTimeout(timerId);
                        msg = '文件下载失败';
                        opt.error(msg);
                        break;
                    case 10154:
                        clearTimeout(timerId);
                        msg = '下载超时';
                        opt.error(msg);
                        break;
                }
            });
            maskId = FileSystem.downloadRemoteFile(opt.path, opt.timeout);
            if (opt.timeout > 0) {
                timerId = setTimeout(function () {
                    opt.error('下载超时');
                }, opt.timeout * 1000);
            }
        },
        /**
         * 读取一个文件内容
         * @param path 文件路径
         * @param callback 成功回调，参数是文件的文本信息
         * @param error  错误回调
         * @returns {*} 如果获取成功，返回获取文件的File对象；如果文件不存在，返回-1；如果因为其它原因导致获取文件失败，返回0
         */
        getFile: function (path, callback, error) {
            if (!isSTB) {
                error && error('不支持');
                return;
            }
            var file = FileSystem.getFile(path);
            if (file == -1) {
                error && error('文件不存在');

            } else if (file === 0) {
                error && error('获取文件失败');
            } else {
                if (file.open(1) == 1) {
                    var msg = file.readAllfile();
                    file.close();
                    callback && callback(msg, file);
                    FileSystem.killObject(file);
                } else {
                    error && error('文件打开失败');
                }
            }
            return file;
        },
        /**
         * 创建一个文件，如果文件名称存在，即覆盖
         * @param content 文件文本内容
         * @param savePath 保存路径
         * @returns {*} 如果创建File对象成功，返回该File对象；如果创建失败，返回0。
         */
        createFile: function (content, savePath) {
            if (!isSTB) return;
            var fileObj = FileSystem.createFile();
            if (fileObj !== 0 && fileObj.open(1) == 1) {
                fileObj.writeFile(content);
                fileObj.close();
                var ret = fileObj.saveAs(savePath);
                FileSystem.killObject(fileObj);
                return ret;
            }
            return 0;
        },
        /**
         * 删除一个目录及其所有内容
         * @param path 字符串，要删除的目录的路径
         * @param callback 成功回调
         */
        removeDir: function (path, callback) {
            if (!isSTB) return;
            var arr = path.split('/');
            if (arr[arr.length - 1] === '') {
                arr.pop();
            }
            path = arr.join('/');
            TVUI.Event.on('systemevent', function (e) {
                if (parseInt(e.which) == 10160 && parseInt(e.modifiers) == 1) {
                    callback && callback();
                }
            });
            if (FileSystem.existDirectory(path) == 1) {
                FileSystem.deleteDirectory(path);
            }

        }
    };

    /**
     * 适配 user.channels
     * @type {{getChannelByServiceId: getChannelByServiceId, getDVBServiceByServiceId: getDVBServiceByServiceId, isSupportPlayback: isSupportPlayback}}
     * @private
     */
    var _user = {
        /**
         * 根据业务ID来获取对应的频道对象
         * @param ServiceId 数值型，频道所对应的业务的ID，取值范围0-65535
         * @returns {*} user.channel对象
         */
        getChannelByServiceId: function (ServiceId) {
            if (isSTB) {
                return user.channels.getChannelByServiceId(ServiceId);
            } else {
                return null;
            }
        },
        /**
         *  根据业务ID来获取对应的DVBService对象
         * @param ServiceId
         * @returns {*}  DVBService对象
         */
        getDVBServiceByServiceId: function (ServiceId) {
            var channel = this.getChannelByServiceId(ServiceId);
            if (channel) {
                return channel.getService();
            } else {
                return null;
            }
        },
        /**
         * 判断是否支持回看， 集团不是用这种方式判断，因为channelId不同
         * @param ServiceId
         * @returns {boolean}
         */
        isSupportPlayback: function (ServiceId) {
            var DVBService = this.getDVBServiceByServiceId(ServiceId);
            if (DVBService) {
                return !!DVBService.supportPlayback;
            }
            return false;
        }
    };

//节目指南搜索只能是单线程，这里要做列队处理
    var epgCache = {}, //结果缓存
        epgTaskList = [],//列队数组
        epgTaskRunning = false;//运行标识

    /**
     * 适配 EPG对象
     * @type {{search: search, searchProgramsByServiceId: searchProgramsByServiceId}}
     */
    var epg = {
        /**
         * 搜索节目指南
         * @param options
         * ex:
         * TVUI.API.EPG.search({
         *      serviceId : 102, 业务ID，数值型
         *      mask : 1, 由0x01(actual PF)、0x02(actual schedule)、0x04(other PF)、0x08(other schedule)中的一个或多个相加组成，如0x03(0x01+0x02)就代表要搜索actual PF和actual schedule的数据
         *      timeout: 10, 搜索EPG信息的超时时间，数值型，单位为秒
         *      startDate: 0, 搜索开始日志，当前日志的相对值，如：0 是今天，1 是明天
         *      days : 1 , 搜索天数
         *      complete : function(data){
         *           //data 节目单数据
         *      }
         * });
         */
        search: function (options) {
            epgTaskList.push(options);
            if (!epgTaskRunning) {
                epgTaskRunning = true;
                this.searchProgramsByServiceId(epgTaskList.shift());
            }
        },
        /**
         * 底层搜索方法，不建议用，用search 就可以
         * @param options
         */
        searchProgramsByServiceId: function (options) {
            if (!isSTB) return;
            var opt = {
                serviceId: '',
                mask: 1,
                timeout: 10,
                //数值型，取值范围0-30
                startDate: 0,
                //数值型，取值范围1-10，默认为7
                days: 1,
                complete: noop
            };

            $.extend(opt, options);

            var maskId, obj,
                timerId = null,
                self = arguments.callee,
                cacheKey = [opt.serviceId, opt.mask, opt.startDate, opt.days].join('_'),
                cache = epgCache[cacheKey],
                complete = function (msg) {
                    opt.complete(msg);
                    //列队还有内容，执行下一个
                    if (epgTaskList.length > 0) {
                        self(epgTaskList.shift());
                    } else {
                        epgTaskRunning = false;
                    }
                };

            if (cache) {
                complete(cache);
            } else {
                TVUI.Event.onSystem(function (e) {
                    if (e.modifiers == maskId) {
                        switch (parseInt(e.which)) {
                            //成功完成EPG搜索
                            case key.EPG_SEARCH_SUCC:
                            //索结果达到255个事件信息时，系统自动停止搜索
                            case key.EPG_SEARCH_STOP_WHEN_RST_TO_MAX:
                            //搜索超时
                            case key.EPG_SEARCH_TIMEOUT:
                                clearTimeout(timerId);
                                obj = EPG.getSearchResult(maskId);
                                epgCache[cacheKey] = obj;
                                complete(obj);
                                break;
                        }
                    }
                });
                da.info('DVBSetting', 'EPGStartDate', String(opt.startDate));
                da.info('DVBSetting', 'EPGNumdays', String(opt.days));
                maskId = EPG.searchProgramsByServiceId(opt.serviceId, opt.mask, opt.timeout);
                timerId = setTimeout(function () {
                    complete([]);
                }, (opt.timeout + 1) * 1000);
            }
        }
    };


    TVUI.API = {
        DataAccess: da,
        SysSetting: sysSetting,
        CA: ca,
        Network: network,
        FileSystem: fileSystem,
        user: _user,
        EPG: epg
    };

})(TVUI, JSON);;
/**
 * 页面模块
 *  v1.2.0 更新
 *  1、删除enableBack参数，代替功能使用 unload回调处理
 *  2。增加历史记录操作几个静态方法
 */
(function (TVUI, $) {

    var setting = TVUI.API.SysSetting,
        Event = TVUI.Event,
        Key = TVUI.Key,
        util = TVUI.Util;

    /**
     * 页面类, 继承Base
     * @type {*}
     * ex:
     *  所有参数都是可选的
     *
     */
    var Page = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //语言
                lang: 'zh',

                //页面名称，必须，而且要唯一
                name: 'page_' + this.id,

                //页面url，默认当前访问的页面
                url: location.href,

                //是否记录浏览页面历史
                history: true,

                //是否阻止页面默认事件
                preventDefault: true,

                //是否首页
                home: false,

                //页面层级，如果大于0，即启用按层级别记录浏览历史
                level: 0,

                //在无历史记录时的后退地址
                backUrl: null,

                //页面返回、退出时，return  false 时不执行返回、退出
                unload: function (obj, type) {
                    return true;
                }


            }, options || {});

            /**
             * 属性：页面名称
             */
            this.name = o.name;

            //页面缓存key
            this.cacheKey = Page.cacheKey + this.name;

            /**
             * 属性：页面缓存
             * @type {{}}
             */
            this.cache = {};

            /**
             * 属性：页面url参数对象
             * @type {*|String|{}}
             */
            this.params = util.queryToJson(o.url) || {};

            /**
             * 属性：页面语言
             */
            this.lang = this.params.lang || setting.env(Page.langKey) || o.lang;

            this.url = o.url;

            /**
             * 页面包含的面板集合
             * @type {{}}
             */
            this.panels = {};

            /**
             * 当前激活的面板
             * @type {null}
             */
            this.activePanel = null;

            this.level = o.level;

            if (o.preventDefault) {
                //阻止按键默认行为
                document.onkeyup = document.onkeydown = document.onkeypress = function () {
                    return false;
                };
            }

            //记录backUrl
            if (o.backUrl) {
                setting.env(Page.backUrlKey, o.backUrl);
            }

            //如果来源是页面是不存在，本地文件系统页面跳进来的referrer可能为空
            if (!document.referrer) {
                Page.clearHistory();
            }

            this.addHistory();
            this.loadCache();
            this.events();
        },
        addHistory: function () {
            var o = this.options;
            o.history && Page.addHistory({
                name: this.name,
                url: this.url,
                home: o.home,
                level: this.level
            });
        },
        /**
         * 跳转
         * @param url 跳转页面地址
         * @param param 参数对象，可选
         *
         */
        go: function (url, param) {
            if (!url) return;

            if (param) {
                var str = util.param(param);
                url += url.indexOf('?') > -1 ? '&' + str : '?' + str;
            }
            this.fire('unload', this, url);
            this.isUnload = true;
            this.fire('go', url);
            location.href = url;


        },
        back: function () {
            var history = Page.backHistory();
            //有历史记录，按历史记录返回
            if (history) {
                this.fire('back', history.url);
                this.go(history.url);
            } else {
                var backUrl = setting.env(Page.backUrlKey);
                //有backUrl，按backUrl返回
                if (backUrl) {
                    setting.env(Page.backUrlKey, null);
                    this.fire('back', Page.backUrlKey);
                    this.go(backUrl);
                } else {
                    //都没有，触发默认事件
                    this.fire('defaultBack');
                }
            }
        },
        exit: function () {
            var history = Page.homeHistory();
            //如果首页标识记录，调转到首页
            if (history) {
                this.fire('exit', history.url);
                this.go(history.url);
            } else {
                //没有首页标识，即返回
                this.back();
            }
        },
        refresh: function () {
            this.fire('unload', this, this.url);
            this.isUnload = true;
            this.fire('refresh');
            location.reload();
        },
        /**
         * 读取页面缓存
         */
        loadCache: function () {
            var name = this.cacheKey,
                record = setting.envJSON(name);
            $.extend(this.cache, record || {});
            //读出附加参数后，清除缓存
            setting.envJSON(name, null);
        },
        /**
         * 设置缓存
         * @param obj
         */
        setCache: function (obj) {
            $.extend(this.cache, obj || {});
        },
        /**
         * 获取缓存
         * @returns {{}|Page.cache|*}
         */
        getCache: function () {
            return this.cache;
        },
        /**
         * 清空缓存
         */
        clearCache: function () {
            this.cache = {};
        },
        /**
         * 保存缓存，在页面unload时自动执行
         */
        saveCache: function () {
            var name = this.cacheKey;
            if (!$.isEmptyObject(this.cache)) {
                setting.envJSON(name, this.cache);
            } else {
                setting.envJSON(name, null);
            }
        },
        /**
         * 设置语言
         * @param lang  zh 或 en
         */
        setLang: function (lang) {
            this.lang = lang || 'zh';
            setting.env(Page.langKey, this.lang);
            this.fire('setLang', lang);
        },
        /**
         * 增加 panel
         *
         * ex:
         *
         * page.addPanel(panel1,panel2,.......);
         */
        addPanel: function () {
            var panels = arguments, self = this;
            for (var i = 0, len = panels.length; i < len; i++) {
                (function (panel) {
                    //判断要增加的panel是否已经添加，未增加过即执行增加
                    if (panel && panel.id && !self.panels[panel.id]) {
                        panel.on('active', function (obj) {
                            //当panel激活时，其他panel设置为非活动状态
                            for (var key in self.panels) {
                                if (self.panels.hasOwnProperty(key) && panel.id != key) {
                                    self.panels[key].unActive();
                                }
                            }
                            //记录当前活动的panel是哪个
                            self.activePanel = obj;
                        });
                        self.panels[panel.id] = panel;
                    }
                })(panels[i]);
            }
        },
        events: function () {
            var o = this.options;
            this.registerEvent(Event.onPress(function (evt) {
                if (!this._active) return;
                switch (evt.which) {
                    case Key.BLUE:
                        TVUI.debug && this.refresh();
                        break;
                    case Key.EXIT:
                        o.unload(this, 'exit') && this.exit();
                        break;
                    case Key.BACK:
                        o.unload(this, 'back') && this.back();
                        break;
                }

            }, this));

            //96956按键
            this.registerEvent(Event.onComKey([Key.NUM9, Key.NUM6, Key.NUM9, Key.NUM5, Key.NUM6], function () {
                if (!this._active) return;
                this.go("ui://factory/index.html");
            }, this));

            //5个1键清空缓存并刷新页面
            this.registerEvent(Event.onComKey([Key.NUM1, Key.NUM1, Key.NUM1, Key.NUM1, Key.NUM1], function () {
                if (TVUI.debug) {
                    setting.clear();
                    alert('成功清空缓存');
                    this.refresh();
                }
            }, this));


            /**
             * 兼容浏览器和机顶盒原生unload， 浏览器unload事件是屏蔽的，但机顶盒是允许的，如果已经触发了unload，不再触发
             */
            TVUI.Event.on('unload', function () {
                if (!this.isUnload) {
                    this.fire('unload');
                    this.isUnload = true;
                }
            }, this);

            this.on('unload', this.saveCache, this);

            //当页面被激活时，恢复当前活动的panel
            this.on('active', function () {
                if (this.activePanel) {
                    this.activePanel._active = true;
                    if (this.activePanel.pager) {
                        this.activePanel.pager._active = true;
                    }
                }
            });

            this.on('unActive', function () {
                for (var key in this.panels) {
                    if (this.panels.hasOwnProperty(key)) {
                        var panel = this.panels[key];
                        //先找出页面中哪个panel是活动的，并记录下来起来
                        if (!this.activePanel && panel._active) {
                            this.activePanel = panel;
                        }
                        //把页面全部panel都设置为非活动
                        panel._active = false;
                        if (panel.pager) {
                            panel.pager._active = false;
                        }
                    }
                }
            });


        }

    }, TVUI.Base);

    Page.extend({
        //历史记录缓存Key
        historyCacheKey: 'sw_history',
        //页面缓存Key
        cacheKey: 'sw_cache_',
        //语言版本缓存key
        langKey: 'sw_lang',
        //后退url缓存key
        backUrlKey: 'backUrl',
        //浏览历史数据
        history: [],
        /**
         * 添加历史记录
         * @param item
         */
        addHistory: function (item) {
            //向从机顶盒缓存获取当前的历史记录
            var history = setting.envJSON(this.historyCacheKey) || [],
                length = history.length,
                lastItem;
            if (length > 0) {
                lastItem = history[length - 1];
                //如果最后一项记录和当前页面url不相同，即记录并更新机顶盒缓存
                if (lastItem.url != item.url) {

                    history = $.grep(history, function (n) {
                        //如果和当前页面是同一个页面，删除它
                        if (n.name == item.name && n.url == item.url) {
                            return false;
                        } else {
                            //如果没开启层级，记录历史，如果开启层级，删除比当前层级高的记录
                            return n.level === 0 || (n.level > 0 && n.level < item.level);
                        }
                    });

                    history.push(item);

                    //按等级从小到大排序
                    history.sort(function (a, b) {
                        return a.level - b.level;
                    });

                    //todo：去重


                }
            } else {
                history.push(item);
            }
            this.history = history;
            setting.envJSON(this.historyCacheKey, history);
        },
        /**
         * 清空历史记录
         */
        clearHistory: function () {
            this.history = [];
            setting.envJSON(this.historyCacheKey, null);
        },
        /**
         * 获取前一个历史记录
         * @returns {*}
         */
        backHistory: function () {
            var history = this.history;
            if (history.length > 1) {
                history.pop();
                setting.envJSON(this.historyCacheKey, history);
                return history[history.length - 1];
            }
            return null;
        },
        /**
         * 获取首页历史记录
         * @returns {*}
         */
        homeHistory: function () {
            var history = this.history.slice(0),
                homePages;
            history.pop();
            homePages = $.grep(history, function (n) {
                return n.home;
            });
            if (homePages.length > 0) {
                var i = history.length - 1,
                    item;
                while (i >= 0) {
                    item = history.pop();
                    if (item.home) {
                        setting.envJSON(this.historyCacheKey, history);
                        return item;
                    } else {
                        --i;
                    }
                }
            }
            return null;
        }

    });


    TVUI.Page = Page;

})(TVUI, Zepto);;
/**
 *  面板模块，提供菜单功能
 *  v1.2.0 更新
 *  1、增加 leaveLeft, leaveRight, leaveUp, leaveDown 4个事件
 *
 */
(function (TVUI) {
    var Panel,
        $ = TVUI.$,
        Class = TVUI.Class,
        Event = TVUI.Event,
        Util = TVUI.Util,
        Base = TVUI.Base;

    /**
     * 面板类，继承Base
     * @type {*}
     */
    Panel = Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                active: true,
                //初始激活状态

                cols: 0,
                //列数

                data: [],
                //菜单数组或dom集合

                disabled: [],
                //禁用单元格索引，从0开始计算，例如要禁用第一个和第三个，设置 disabled :[0,2]

                focusIndex: 0,
                //初始焦点位置索引，从0开始计算

                focusClass: 'focus',
                //焦点样式className

                selectClass: 'select',
                //确定后的菜单样式className

                leaveClass: 'leave',
                //离开panel的菜单className

                loop: false,
                //是否循环

                pager: null,
                //Pager实例

                textSelector: null,
                //截取文字所在位置的选择器

                textChar: -1,
                //截取多少个字符，一个中文按2个字符计算，-1表示不截取

                textAttrName: 'data-text'
                //截取文字属性名称

            }, options || {});
            /**
             * 激活状态
             */
            this._active = o.active;
            /**
             * 数据
             */
            this.data = o.data;
            /**
             * 禁用单元格
             */
            this.disabled = o.disabled;
            /**
             * 当前焦点所在索引
             */
            this.focusIndex = o.focusIndex;
            /**
             * 列数
             */
            this.cols = o.cols;
            /**
             * 行数
             * @type {number}
             */
            this.rows = Math.ceil(this.data.length / this.cols);
            /**
             * 是否循环
             */
            this.loop = o.loop;
            /**
             * Pager实例
             */
            this.pager = o.pager;
            this.setEmptyCell();
            this.events();
            if (this.pager) {
                this.pager._active = this._active;
            }
            setTimeout(this.proxy(function () {
                this._active && this.focus(this.focusIndex);
            }), 0);

        },
        /**
         * 重置Panel
         * @param data 数据
         * @param focusIndex 焦点索引,可选
         * @param cols 列数，可选
         */
        reset: function (data, focusIndex, cols) {
            this.data = data;
            this.cols = cols || this.cols;
            this.focusIndex = focusIndex || 0;
            this.rows = Math.ceil(this.data.length / this.cols);
            this.disabled = [];
            this.setEmptyCell();
            this.fire('reset', data, focusIndex, cols);
        },
        /**
         * 设置没数据的单元格
         */
        setEmptyCell: function () {
            var cellCount = this.rows * this.cols;
            for (var i = this.data.length; i < cellCount; i++) {
                this.disable(i);
            }
        },
        /**
         * 索引转换成单元格
         * @param index
         * @returns {*[]}
         */
        indexToCell: function (index) {
            var r = parseInt(index / this.cols),
                c = index % this.cols;
            return [r, c];
        },
        /**
         * 单元格转换成索引
         * @param cell
         * @returns {*}
         */
        cellToIndex: function (cell) {
            return cell[0] * this.cols + cell[1];
        },
        /**
         * 禁用单元格
         * @param idx 单元格索引
         */
        disable: function (idx) {
            this.disabled.push(idx);
            //这里setTimeout 是为了实例化立刻返回实例，使事件能在初始化时就能侦听
            setTimeout(this.proxy(function () {
                this.fire('disable', idx, this);
            }), 0);
        },
        /**
         * 取消禁用单元格
         * @param idx 单元格索引
         */
        enable: function (idx) {
            this.disabled = $.grep(this.disabled, function (n) {
                return n != idx;
            });
            this.fire('enable', idx, this);
        },
        /**
         * 验证单元格是否可用
         * @param cell
         * @returns {boolean}
         */
        validate: function (cell) {
            var disabled = this.disabled,
                result = false,
                index = this.cellToIndex(cell);
            for (var i = 0, len = disabled.length; i < len; i++) {
                if (disabled[i] == index) {
                    result = true;
                    break;
                }
            }
            return result;
        },
        /**
         * 演示触发离开事件，私有方法
         * @param pos 离开方向
         * @param cell 单元格
         */
        delayLeave: function (pos, cell) {
            //解决多个panel切换事件bug
            setTimeout(this.proxy(function () {
                this.fire('leave', pos, cell, this._active, this);
            }), 20);
        },
        leave: function (pos, index) {
            var map = {
                    'left': 'Left',
                    'right': 'Right',
                    'up': 'Up',
                    'down': 'Down'
                },
                cell = this.indexToCell(index);
            this.fire('leave', pos, cell, this._active, this);
            this.fire('leave' + map[pos], cell, index, this._active, this);
        },

        _nextRight: function (cell) {
            var r = cell[0], c = cell[1] + 1;
            if (c > this.cols - 1) { // 超出边界
                this.delayLeave('right', cell);
                if (this.loop) {
                    c = 0;
                } else {
                    return cell;
                }
            }
            return  this.validate([r, c]) ? this._nextRight([r, c]) : [r, c];
        },
        _nextLeft: function (cell) {
            var r = cell[0], c = cell[1] - 1;
            if (c < 0) {
                this.delayLeave('left', cell);
                if (this.loop) {
                    c = this.cols - 1;
                } else {
                    return cell;
                }
            }
            return  this.validate([r, c]) ? this._nextLeft([r, c]) : [r, c];
        },
        _nextUp: function (cell) {
            var r = cell[0] - 1, c = cell[1];
            if (r < 0) {
                this.delayLeave('up', cell);
                if (this.loop) {
                    r = this.rows - 1;
                } else {
                    return cell;
                }
            }
            return  this.validate([r, c]) ? this._nextUp([r, c]) : [r, c];
        },
        _nextDown: function (cell) {
            var r = cell[0] + 1, c = cell[1];
            if (r > this.rows - 1) {
                this.delayLeave('down', cell);
                if (this.loop) {
                    r = 0;
                } else {
                    return cell;
                }
            }
            return  this.validate([r, c]) ? this._nextDown([r, c]) : [r, c];
        },
        /**
         * 移动到下一个单元格
         * @param cell 当前单元格
         * @param direction 移动方向
         */
        next: function (cell, direction) {
            if (!this.validate(cell)) {
                var next, oldIndex, newIndex;
                switch (direction) {
                    case "left":
                        next = this._nextLeft(cell);
                        break;
                    case "down":
                        next = this._nextDown(cell);
                        break;
                    case "right":
                        next = this._nextRight(cell);
                        break;
                    case "up":
                        next = this._nextUp(cell);
                        break;
                }
                newIndex = this.cellToIndex(next);

                if ((this.focusIndex != newIndex) && !this.validate(next)) {
                    oldIndex = this.cellToIndex(cell);
                    this.blur(oldIndex, direction);
                    this.focus(newIndex, direction);
                }
            }
        },
        /**
         * 选择单元格
         * @param index 单元格索引
         */
        select: function (index) {
            var data = this.data,
                dataItem = data[index];
            if (dataItem) {
                this.fire('select', index, dataItem, this);
            }
        },
        /**
         * 获取焦点
         * @param idx 单元格索引
         */
        focus: function (idx) {
            var data = this.data,
                dataItem = data[idx];
            this.focusIndex = idx;
            if (dataItem) {
                this.fire('focus', idx, dataItem, this);
            }
        },
        /**
         *  自动获取焦点
         * @param type 可选，0：初始化时，1：向下翻页时，2：向上翻页时
         *
         */
        autoFocus: function (type) {
            this.blur();
            switch (type) {
                case 0:
                    this.focus(this.options.focusIndex);
                    break;
                case 1:
                    this.focus(0);
                    break;
                case 2:
                    this.focus(this.data.length - 1);
                    break;
                default :
                    this.focus(this.focusIndex);
                    break;
            }
        },
        /**
         * 失去焦点
         */
        blur: function () {
            var data = this.data,
                idx = this.focusIndex,
                dataItem = data[idx];
            if (dataItem) {
                this.blurIndex = idx;
                this.fire('blur', this.blurIndex, dataItem, this);
            }
        },
        events: function () {
            //处理移动事件
            this.registerEvent(Event.onMove(function (position) {
                if (!this._active) return;
                var cell = this.indexToCell(this.focusIndex);
                this.next(cell, position);
            }, this));

            //处理确定键事件
            this.registerEvent(Event.onOk(function () {
                if (!this._active) return;
                this.select(this.focusIndex);
            }, this));

            this.on('focus', function (index, obj) {
                if (obj && obj.nodeType) {
                    $(obj).addClass(this.options.focusClass);
                    this.marquee(obj);
                }
            });

            this.on('blur', function (index, obj) {
                if (obj && obj.nodeType) {
                    $(obj).removeClass(this.options.focusClass);
                    this.unMarquee(obj);
                }
            });

            this.on('select', function (index, obj) {
                if (obj && obj.nodeType) {
                    $(obj).addClass(this.options.selectClass);
                }
            });

            this.on('leave', function (d, cell) {
                this.blurIndex = this.leaveIndex = this.cellToIndex(cell);
            });

            this.on('active', function (panel, index) {
                var obj = this.data[this.leaveIndex];
                if (obj && obj.nodeType) {
                    $(obj).removeClass(this.options.leaveClass);
                }
                this.blur();
                index = index === undefined ? this.focusIndex : index;
                this.focus(index);
                this.leaveIndex = null;
                this.pager && this.pager.active();
            });

            this.on('unActive', function () {
                var obj = this.data[this.leaveIndex];
                if (obj && obj.nodeType) {
                    $(obj).addClass(this.options.leaveClass);
                }
                this.blur();
                this.pager && this.pager.unActive();
            });


            if (this.pager) {
                var self = this;
                this.pager.on('change', function () {
                    var _this = this;
                    setTimeout(function () {
                        _this.itemIndex = _this.pageSize * _this.pageIndex + self.focusIndex;
                    }, 20);
                });

                this.pager.on('reset', function () {
                    var _this = this;
                    setTimeout(function () {
                        _this.itemIndex = _this.pageSize * _this.pageIndex + self.focusIndex;
                    }, 20);

                });
                if (this.pager.async) {

                } else {
                    var pager = this.pager;
                    this.on('focus', function (i) {
                        var pageIndex = Math.floor(i / pager.pageSize);
                        if (pager.pageIndex != pageIndex) {
                            pager.change(pageIndex);
                        }
                    });

                    this.pager.on('next prev', function (pageIndex) {
                        self.blur();
                        self.focus(pageIndex * this.pageSize);
                    });
                }
            }
        },
        marquee: function (el) {
            var o = this.options,
                selector = o.textSelector,
                name = o.textAttrName,
                chars = o.textChar;
            if (chars > -1) {
                var $el = selector ? $(el).find(selector) : $(el),
                    text = $el.attr(name);
                if (Util.getCharCount(text) > chars) {
                    $el.html('<marquee>' + text + '</marquee>');
                }
            }
        },
        unMarquee: function (el) {
            var o = this.options,
                selector = o.textSelector,
                name = o.textAttrName,
                chars = o.textChar;

            if (chars > -1) {
                var $el = selector ? $(el).find(selector) : $(el),
                    text = $el.attr(name);
                if (Util.getCharCount(text) > chars) {
                    $el.html(Util.subStr(text, chars));
                }
            }
        }

    }, Base);

    TVUI.Panel = Panel;

})(TVUI);
;
/**
 * 分页模块
 * v1.2.0
 */
(function (TVUI) {
    var Pager,
        $ = TVUI.$,
        Class = TVUI.Class,
        Event = TVUI.Event,
        Key = TVUI.Key,
        Base = TVUI.Base;
    /**
     * 分页类
     * @type {*}
     */
    Pager = Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                total: 1,
                //数据记录数

                pageSize: 10,
                //每页多少条

                pageIndex: 0,
                //初始显示第几页，从0开始计算

                type: 0,
                //分页方式，0：不自动分页，1：垂直方向自动分页，2：水平方向自动分页

                async: false
                //是否异步分页，同步分页是只通过设置html位移来试下分页，异步是动态创建html

            }, options || {});
            this.total = o.total;
            this.pageSize = o.pageSize;
            this.pageCount = Math.ceil(this.total / this.pageSize);
            this.pageIndex = o.pageIndex;
            this.type = o.type;
            this.async = o.async;
            this.itemIndex = this.pageSize * this.pageIndex;
            this.events();
            this.change(this.pageIndex, 0);
        },
        events: function () {
            this.registerEvent(Event.onMove(function (d) {
                if (!this._active) return;
                if ((this.type === 1 && d == 'up') || (this.type === 2 && d == 'left')) {
                    this.itemIndex = this.itemIndex > 0 ? --this.itemIndex : 0;
                    this.move(this.itemIndex, 2);
                } else if ((this.type === 1 && d == 'down') || (this.type === 2 && d == 'right')) {
                    this.itemIndex = this.itemIndex < this.total - 1 ? ++this.itemIndex : this.total - 1;
                    this.move(this.itemIndex, 1);
                }
            }, this));

            this.registerEvent(Event.onPress(function (evt) {
                if (!this._active) return;
                switch (evt.which) {
                    case Key.PAGE_DOWN:
                        this.next();
                        break;
                    case Key.PAGE_UP:
                        this.prev();
                        break;
                }
            }, this));

        },
        /**
         * 内部方法，不建议调用
         * @param index
         * @param type
         */
        move: function (index, type) {
            var pageIndex = Math.floor(this.itemIndex / this.pageSize);
            if (pageIndex != this.pageIndex) {
                this.change(pageIndex, type);
            }
            this.itemIndex = index;
            this.fire('move', this.itemIndex, this);
        },
        /**
         * 重置分页，在记录数改变的时候，需要执行重置
         * @param total 记录数
         * @param pageSize  页面大小，可选
         * @param pageIndex 现在第几页，可选
         */
        reset: function (total, pageSize, pageIndex) {
            this.total = total;
            this.pageSize = pageSize || this.pageSize;
            this.pageCount = Math.ceil(this.total / this.pageSize);
            this.pageIndex = pageIndex || this.pageIndex;
            this.itemIndex = this.pageSize * this.pageIndex;
            this.fire('reset', total, pageSize, pageIndex);
        },

        /**
         * 翻页
         * @param pageIndex 切换到第几页
         * @param type 分页方式，可选， 0:初始化，1：向下翻，2：向上翻
         */
        change: function (pageIndex, type) {
            if (pageIndex >= 0 && pageIndex < this.pageCount) {
                this.pageIndex = pageIndex;
            }
            setTimeout(this.proxy(this.delayChange, type), 20);
        },
        /**
         * 内部方法，不建议调用
         * @param type
         */
        delayChange: function (type) {
            this.fire('change', this.pageIndex, type, this);
        },
        /**
         * 下一页
         */
        next: function () {
            if (this.pageIndex < this.pageCount - 1) {
                this.change(++this.pageIndex, 1);
                this.fire('next', this.pageIndex, this);
            }
        },
        /**
         * 上一页
         */
        prev: function () {
            if (this.pageIndex > 0) {
                this.change(--this.pageIndex, 2);
                this.fire('prev', this.pageIndex, this);
            }
        },
        /**
         * 第一页
         */
        first: function () {
            this.change(0, 2);
        },
        /**
         * 最后一页
         */
        last: function () {
            this.change(this.pageCount - 1, 1);
        }
    }, Base);

    TVUI.Pager = Pager;

})(TVUI);
;
(function (TVUI) {
    var ScrollBar,
        $ = TVUI.$,
        Key = TVUI.Key,
        Class = TVUI.Class,
        Base = TVUI.Base,
        Event = TVUI.Event;


    ScrollBar = Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //可视区选择器或元素对象
                view: null,

                //滚动内容选择器或元素对象
                content: null,

                //滚动条轨道选择器或元素对象
                track: null,

                //滚动条柄选择器或元素对象
                handle: 'span',

                //Panel 实例
                panel: null,

                //内容每次滚动的距离，单位像素，没有panel时才有效
                scrollLength: 100,

                //自动按比例计算句柄高度
                handleHeight: null

            }, options || {});

            /**
             * panel实例
             */
            this.panel = o.panel;
            /**
             * 可视区对象
             * @type {*|HTMLElement}
             */
            this.$view = $(o.view);
            /**
             * 内容对象
             * @type {*|HTMLElement}
             */
            this.$content = $(o.content);
            /**
             * 滚动条轨道对象
             * @type {*|HTMLElement}
             */
            this.$track = $(o.track);
            /**
             * 滚动条句柄对象
             * @type {*|HTMLElement}
             */
            this.$handle = $(o.handle);
            /**
             * 当前滚动到第几步
             * @type {number}
             */
            this.currentStep = 0;
            this.reset();
            this.events();
        },
        reset: function (contentHeight) {
            /**
             * 可视区高度
             */
            this.viewHeight = this.$view.height();

            if (this.panel && this.panel.pager && this.panel.pager.async === true) {
                /**
                 * 内容区高度
                 * @type {*|number}
                 */
                this.contentHeight = contentHeight || this.panel.pager.pageCount * this.viewHeight;
            } else {
                this.contentHeight = contentHeight || this.$content.height();
            }
            /**
             * 内容需要滚动的长度
             * @type {number}
             */
            this.scrollHeight = this.contentHeight - this.viewHeight;
            this.scrollHeight > 0 ? this.show() : this.hide();

            /**
             * 滚动轨道的高度
             */

            this.trackHeight = this.trackHeight || this.$track.height();
            /**
             * 滚动句柄的高度
             */
            this.handleHeight = this.getHandleHeight(this.contentHeight);

            this.$handle.height(this.handleHeight);
            /**
             * 总共需要滚动多少步
             */
            this.scrollSteps = this.getScrollSteps();
            /**
             * 内容区每一步滚动的距离
             * @type {number}
             */
            this.perContent = this.scrollHeight / this.scrollSteps;
            /**
             * 滚动条需要滚动的距离
             * @type {number}
             */
            this.scrollTrackHeight = this.trackHeight - this.handleHeight;
            /**
             * 滚动条每一步要滚滚东的距离
             * @type {number}
             */
            this.perScroller = this.scrollTrackHeight / this.scrollSteps;

            this.pageCount = Math.ceil(this.contentHeight / this.viewHeight);
        },
        /**
         * 计算得到滚动句柄的高度
         * @param contentHeight
         * @returns {number}
         */
        getHandleHeight: function (contentHeight) {
            return this.options.handleHeight || Math.max(this.trackHeight * (this.viewHeight / contentHeight), 10);
        },
        /**
         * 计算需要滚动多少步
         * @returns {*}
         */
        getScrollSteps: function () {
            if (this.panel) {
                if (this.panel.pager && this.panel.pager.async === true) {
                    return this.panel.indexToCell(this.panel.pager.total - 1)[0];
                } else {
                    return this.panel.rows - 1;
                }
            } else {
                return Math.ceil(this.scrollHeight / this.options.scrollLength);
            }
        },
        /**
         * 隐藏滚动条
         */
        hide: function () {
            this.$track.hide();
            this.fire('hide', this);
        },
        /**
         * 显示滚动条
         */
        show: function () {
            this.$track.show();
            this.fire('show', this);
        },
        /**
         * 执行滚动
         * @param step
         */
        scroll: function (step) {
            var content = this.perContent * step,
                bar = this.perScroller * step;
            bar = bar > this.scrollTrackHeight ? this.scrollTrackHeight : bar;
            content = content > this.scrollHeight ? this.scrollHeight : content;
            this.$handle.css('top', bar + 'px');
            if (!this.panel) {
                this.$content.css('top', -content + 'px');
            }
            this.currentStep = step;

            this.fire('scroll', bar, content, step);
        },
        /**
         * 向下滚
         */
        next: function () {
            if (this.currentStep < this.scrollSteps) {
                this.scroll(++this.currentStep);
            }
        },
        /**
         * 向上滚
         */
        prev: function () {
            if (this.currentStep > 0) {
                this.scroll(--this.currentStep);
            }
        },
        events: function () {
            if (this.panel) {
                var self = this,
                    pageRows = self.panel.indexToCell(this.panel.pager.pageSize - 1)[0] + 1;
                this.panel.on('focus', function (i) {
                    if (self.panel.pager && self.panel.pager.async === true) {
                        var index = self.panel.pager.pageIndex * pageRows + self.panel.indexToCell(i)[0];
                        self.scroll(index);
                    } else {
                        self.scroll(self.panel.indexToCell(i)[0]);
                    }

                });

                this.panel.on('reset', function () {
                    self.reset();
                    if (self.panel.pager && self.panel.pager.async === false) {
                        self.$content.css('top', -(self.viewHeight * self.panel.pager.pageIndex) + 'px');
                    }
                });

                if (this.panel.pager && this.panel.pager.async === false) {
                    this.panel.pager.on('change', function (pageIndex) {
                        self.$content.css('top', -(self.viewHeight * pageIndex) + 'px');
                    });
                }

            } else {
                this.pageCount = Math.ceil(this.contentHeight / this.viewHeight);
                this.pageSize = Math.ceil(this.viewHeight / this.options.scrollLength);
                this.pageIndex = 0;
                this.registerEvent(Event.onMove(function (d) {
                    switch (d) {
                        case 'up':
                            this.prev();
                            break;
                        case 'down':
                            this.next();
                            break;
                    }
                }, this));
                this.registerEvent(Event.onPress(function (evt) {
                    switch (evt.which) {
                        case Key.PAGE_DOWN:
                            this.pageIndex < this.pageCount - 1 ? ++this.pageIndex : this.pageCount - 1;
                            this.scroll(this.pageIndex * this.pageSize);
                            break;
                        case Key.PAGE_UP:
                            this.pageIndex > 0 ? --this.pageIndex : 0;
                            this.scroll(this.pageIndex * this.pageSize);
                            break;
                    }
                }, this));

            }

        }


    }, Base);

    TVUI.ScrollBar = ScrollBar;

})(TVUI);;
/**
 * 对话框组件
 */
(function (TVUI) {

    var Dialog,
        Class = TVUI.Class,
        Base = TVUI.Base,
        Util = TVUI.Util,
        Panel = TVUI.Panel,
        Lang = TVUI.Lang,
        $ = TVUI.$;

    Dialog = Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //标题
                title: '',
                //对话框内容
                content: '',
                //宽度,
                width: 300,
                //高度，如不设置，即自动
                height: null,
                //自定义css className
                theme: '',
                // 格式 [{text:'确定',handler:function(){},theme:'ok'}]
                btns: {},
                //多少毫秒后自动关闭
                timeout: null,
                //页面实例
                page: null,
                //按钮获得焦点时的className
                btnFocusClass: 'focus',
                mask: true,
                auto: true
            }, options || {});
            this.clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
            this.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
            this.btns = o.btns;
            this.page = o.page;
            this.render();
            this.setPanel();
            o.auto ? this.show() : this.hide();
            if (o.timeout) {
                Util.timeout(function () {
                    this.destroy();
                }, o.timeout, this);
            }
        },
        render: function () {
            var o = this.options,
                html,
                btnHtml = [],
                template = '<div class="dialog-inner"><div class="dialog-title">{$title}</div>' +
                    '<div class="dialog-content">{$content}</div>' +
                    '<div class="dialog-btns">{$btns}</div></div>';

            //按钮html模版
            var btnTpl = '<div class="dialog-btn {$theme}"><span>{$name}</span></div>';
            //生成按钮html
            $.each(o.btns, function (i, n) {
                btnHtml.push(Util.tpl(btnTpl, {
                    name: n.text,
                    theme: n.theme || ''
                }));
            });
            //生成对话框html
            html = Util.tpl(template, {
                title: o.title,
                content: o.content,
                btns: btnHtml.join('')
            });

            if (o.mask) {
                this.mask = $('<div>');
                this.mask.attr('class', 'dialog-mask');
                $(document.body).append(this.mask);
            }

            this.el = $('<div>').html(html).attr('class', ' dialog ' + o.theme);
            //如果有传入高度
            if (o.height) {
                this.el.height(parseInt(o.height) + 'px');
            }
            $(document.body).append(this.el);

            //计算left、top 自动居中
            var left = (this.clientWidth - o.width) / 2,
                top = (this.clientHeight - (o.height || this.el.height())) / 2;
            this.el.css({
                'left': left + 'px',
                'top': top + 'px',
                'position': 'absolute',
                'width': parseInt(o.width) + 'px',
                'z-index': ++Dialog.zIndex
            });
        },
        setPanel: function () {
            var $btns = this.el.find('.dialog-btn'),
                self = this;
            this.panel = new Panel({
                cols: $btns.length,
                data: $btns
            });
            this.panel.on('select', function (i) {
                self.btns[i].handler && self.btns[i].handler(self);
            });
        },
        show: function () {
            this.page && this.page.unActive();
            this.mask && this.mask.show();
            this.el.show();
            this.fire('show', this);
        },
        hide: function () {
            this.page && this.page.active();
            this.mask && this.mask.hide();
            this.el.hide();
            this.fire('hide', this);
        },
        destroy: function () {
            this.parent.prototype.destroy.apply(this, arguments);
            this.panel.destroy();
            this.el.remove();
            this.mask && this.mask.remove();
            this.page && this.page.active();
        }
    }, Base);

    Dialog.alert = function (page, content, callback, timeout) {
        var d = new Dialog({
            content: content,
            title: Lang[page.lang].T_15,
            width: 400,
            btns: [
                {text: Lang[page.lang].T_1, handler: function (obj) {
                    callback && callback(obj);
                    callback = null;
                    obj.destroy();
                }}
            ],
            theme: 'dialog-alert',
            page: page,
            timeout: timeout || null
        });
        d.on('destroy', function () {
            callback && callback(d);
        });
        return d;
    };

    Dialog.confirm = function (page, content, okCallback, cancelCallback) {
        return  new Dialog({
            content: content,
            title: '',
            width: 400,
            btns: [
                {text: Lang[page.lang].T_1, handler: function (obj) {
                    okCallback && okCallback(obj);
                    obj.destroy();
                }, theme: 'dialog-btn-ok'},
                {text: Lang[page.lang].T_2, handler: function (obj) {
                    cancelCallback && cancelCallback(obj);
                    obj.destroy();
                }, theme: 'dialog-btn-cancel'}
            ],
            theme: 'dialog-confirm',
            page: page
        });
    };

    Dialog.tip = function (content, timeout) {
        return  new Dialog({
            content: content,
            title: '',
            theme: 'dialog-tip',
            timeout: timeout || 5000
        });
    };

    Dialog.zIndex = 100;
    TVUI.Dialog = Dialog;
})(TVUI);
;
/**
 * 播放器模块
 * v1.2.0
 *
 */
(function (TVUI) {
    var Player,
        Key = TVUI.Key,
        Lang = TVUI.Lang,
        Api = TVUI.API,
        $ = TVUI.$,
        Event = TVUI.Event,
        Log = TVUI.Log,
        Util = TVUI.Util;

    Player = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //播放内容类型 Video 或 Audio
                type: 'video',

                //是否全屏
                fullScreen: false,

                //视频宽度
                width: 400,

                //视频高度
                height: 300,

                //位置左
                left: 0,

                //位置右
                top: 0,

                //页面实例
                page: null,

                //是否设置body透明
                transparent: true,

                //数值型，取1表示将画面保持在暂停前最后一帧，取0表示将画面设为黑场
                pauseMode: 1,
                //是否在页面unload时自动销毁播放器
                autoDestroy: true
            }, options || {});


            /**
             * 播放速度倍数
             * @type {number}
             */
            this.pace = 1;
            /**
             * 播放内容类型
             */
            this.type = o.type;
            /**
             * 页面实例
             */
            this.page = o.page;
            /**
             * 音量缓存key
             * @type {string}
             * @private
             */
                //已经不再使用
                // this._volumnCacheKey = 'sw_volumn';
                //计数器，用来判断服务是否可用
            this._disableCount = 0;
            /**
             * 蛋清播放文件的索引，只对http方式有效
             * @type {number}
             */
            this.playingIndex = 0;
            /**
             * 播放状态，是否正在播放中
             * @type {boolean}
             */
            this.isPlaying = false;
            /**
             * 播放文件列表
             * @type {Array}
             */
            this.fileList = [];
            /**
             * 暂停方式 取1表示将画面保持在暂停前最后一帧，取0表示将画面设为黑场
             * @type {number|player.pauseMode|b.options.pauseMode|Player.options.pauseMode|b.pauseMode|Player.pauseMode}
             */
            this.pauseMode = o.pauseMode;
            /**
             * 当前的音量值
             */
            this._volumn = this._initVolumn();

            //适配页面效果，在机顶盒上是无效
            this._createDom(o.fullScreen, o.left, o.top, o.width, o.height);
            this.createPlayer();
            this._event();
        },
        _initVolumn: function () {
            var cache = Api.DataAccess.info("VodApp", "QAMName4");
            //var cache = Api.SysSetting.env(this._volumnCacheKey);
            if (cache) {
                Api.DataAccess.volume(cache);
            } else {
                cache = Api.DataAccess.volume(16);
                Api.DataAccess.info("VodApp", "QAMName4", cache);
                //Api.SysSetting.env(this._volumnCacheKey, cache);
            }
            this.fire('initVolume', cache);
            return parseInt(cache, 10);
        },
        _createDom: function (fullScreen, x, y, w, h) {
            var div = $('<div>');
            if (fullScreen) {
                w = document.documentElement.clientWidth || document.body.clientWidth;
                h = document.documentElement.clientHeight || document.body.clientHeight;
                x = y = 0;
            }
            div.css({
                'position': 'absolute',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'color': '#fff'
            });
            this.el = div;
            if (this.options.transparent) {
                $(document.body).append(div).css({'background': 'transparent'});
            } else {
                $(document.body).append(div);
            }
        },
        _event: function () {
            var self = this;
            //销毁
            if (this.page) {
                if (this.options.autoDestroy) {
                    this.page.on('unload', this.proxy(this.destroy));
                }

                this.page.on('active unActive', function () {
                    self._active = this._active;
                });
            }

            this.registerEvent(Event.onPress(function (evt) {
                if (!self._active) return;
                switch (parseInt(evt.which)) {
                    case Key.STOP: //停止
                        self.stop();
                        break;
                    case Key.PAUSE: //暂停
                        self.pause();
                        break;
                    case Key.PLAY:  //播放
                        self.play();
                        break;
                    case Key.VOLUME_MUTE:  //静音
                        self.mute();
                        break;
                    case Key.FUN9:  //快退
                        self.fastBackward();
                        break;
                    case Key.FUN10: //快进
                        self.fastForward();
                        break;
                    case Key.FUN20:    //视频画面格式切换
                        var aspect = self.aspect();
                        //6 是自动;
                        if (aspect == 6) {
                            aspect = 0;
                        }
                        aspect = aspect > 6 ? 0 : ++aspect;
                        self.aspect(aspect);
                        break;
                }
            }));
            //音量+
            this.registerEvent(Event.onKey(Key.VOLUME_UP, function () {
                if (!self._active) return;
                self.volume(1);
            }));
            //音量-
            this.registerEvent(Event.onKey(Key.VOLUME_DOWN, function () {
                if (!self._active) return;
                self.volume(-1);
            }));
            //系统事件
            this.registerEvent(Event.onSystem(function (e) {
                if (!self._active) return;

                var which = parseInt(e.which, 10),
                    ext = e.modifiers,
                    page = self.page,
                //根据Id指针，取出内存中保存的消息属性的字符串内容
                    eventExtArr = Api.SysSetting.getEventInfo(ext).split(","),
                    code = Math.floor(eventExtArr[1]);
                //log(which, ext, eventExtArr);
                switch (which) {
                    case 10031: //成功锁定频点
                        var ts = DVB.currentTS; //获取当前频点的传输流对象
                        self.fire('locked', ts);
                        break;
                    case 10032: //锁频失败
                        self.fire('error', Lang[page.lang].T_7, which);
                        break;
                    case 10901: //当前媒体已播放到末尾（仅用于本地媒体播放）
                        self.fire('playEnd');
                        self.playNext();
                        break;
                    case 10905: //收到Session Manager的NGOD-S1 Announce请求
                        break;
                    case 10921: //根据NGOD-S1 Session Setup响应的destination字段信息，在对应频点的PAT表中无法找到对应节目的PMT描述
                        self.fire('error', Lang[page.lang].T_8, which);
                        break;
                    case 10903: //收到Session Manager返回的NGOD-S1 Session Set up响应
                        switch (code) {
                            case 754:
                                //不可用媒资
                                self.fire('error', Lang[page.lang].T_9, which, code);
                                break;
                            default:
                                //网络繁忙
                                if(code != 200){
                                    self.fire('error', Lang[page.lang].T_10, which, code);
                                }
                                break;
                        }
                        break;
                    case 10913: //发出NGOD-S1 Session Teardown请求后已过10秒，尚未收到session manager的响应
                        self._disableCount++;
                        break;
                    case 10906: //收到Session Manager返回的NGOD-S1 Ping响应
                        self._disableCount = 0;
                        break;
                    case 10907: //收到推流服务器返回的NGOD-C1 Play响应
                    case 10908: //收到推流服务器返回的NGOD-C1 Pause响应
                        switch (code) {
                            case 200:
                                if (which == 10907) {
                                    //设置播放点,等待setPoint状态
                                    //todo:这里可能要做处理
                                }
                                break;
                            case 403:
                                //无权限操作
                                self.fire('error', Lang[page.lang].T_11, which, code);
                                break;
                            case 754:
                                //不可用媒资
                                self.fire('error', Lang[page.lang].T_9, which, code);
                                break;
                            default:
                                if (code >= 400 && code <= 778 && code != 455) {
                                    //网络繁忙
                                    self.fire('error', Lang[page.lang].T_10, which, code);
                                }
                                break;
                        }
                        break;
                    case 10910: //收到推流服务器返回的NGOD-C1 Get Parameter响应
                        self._disableCount = 0;
                        break;
                    case 10909: //收到推流服务器的NGOD- C1 Announce请求
                        switch (code) {
                            case 403:
                                //无权限操作
                                self.fire('error', Lang[page.lang].T_11, which, code);
                                break;
                            case 2101: //rtsp 流结束
                                self.fire('rtspEnd', which, code);
                                break;
                            case 2104: //rtsp 流开始
                                self.fire('rtspStart', which, code);
                                break;
                            case 5402:
                                //推流会话中断
                                self.fire('error', Lang[page.lang].T_12, which, code);
                                break;
                        }
                        break;
                    case 10915: //发出NGOD-C1 Play请求后已过10秒，尚未收到推流服务器的响应
                        self._disableCount++;
                        break;
                    case 10912: //发出NGOD-S1 Session Setup请求后已过10秒，尚未收到session manager的响应
                        //点播失败,是否重新点播
                        self.fire('error', Lang[page.lang].T_13, which);
                        break;
                    case 10904: //收到Session Manager返回的NGOD-S1 Session Teardown响应
                        if (code != 200) {
                            //点播会话中断
                            self.fire('error', Lang[page.lang].T_14, which, code);
                        }
                        break;
                    case 10914: //发出NGOD-S1 Ping请求后已过10秒，尚未收到session manager的响应
                        self._disableCount++;
                        if (self._disableCount > 20) {
                            self.fire('error', Lang[page.lang].T_14, which);
                        }
                        break;
                    case 10917: //发出NGOD-C1 Get Parameter请求后已过10秒，尚未收到推流服务器的响应
                        self._disableCount++;
                        if (self._disableCount > 20) {
                            self.fire('error', Lang[page.lang].T_14, which);
                        }
                        break;
                    case 11702:
                        //隐藏不能播放节目的提示
                        // self.trigger('error', '不能播放节目', which);
                        break;
                    default:
                        //永新世博CA
                        if (which >= 11301 && which <= 11328) {
                            self.fire('error', eventExtArr[0], which);
                        }
                        //数码视讯CA
                        if (which >= 11501 && which <= 11585) {
                            self.fire('error', eventExtArr[0], which);
                        }
                        break;

                }

            }));

        },
        setPosition: function (fullScreen, x, y, w, h) {
            if (this.type == 'video') {
                var position = [];
                position.push(Number(fullScreen));
                position.push(x);
                position.push(y);
                position.push(w);
                position.push(h);
                this.player.position = position.join(',');
            } else {
                this.player.position = '0,0,0,1,1';
            }
        },
        /**
         * 创建播放器
         */
        createPlayer: function () {
            var o = this.options;
            if (window.MediaPlayer) {
                this.player = new MediaPlayer();
                this.instanceId = Api.SysSetting.env('sw_player_id');
                if (this.instanceId) {
                    this.player.bindPlayerInstance(parseInt(this.instanceId));
                } else {
                    this.instanceId = this.player.createPlayerInstance(o.type, o.type == 'video' ? 2 : 0);
                    Api.SysSetting.env('sw_player_id', String(this.instanceId));
                }
                this.setPosition(o.fullScreen, o.left, o.top, o.width, o.height);
            } else {
                //这里做浏览器提示，方便调试
                var fn = 'isDVBVideo|setPace|setPosition|DVBSrc|VODSrc|UDPSrc|src|play|pause|refresh|destroy|stop|mute|getLength|point|aspect|mode|fastForward|slowForward|fastBackward|slowBackward|volumnUp|volumnDown|active|multiSrc|next'.split('|');
                var self = this;
                $.each(fn, function (i, n) {
                    self[n] = function () {
                        var arr = Util.makeArray(arguments);
                        arr.unshift('player.' + n + '(');
                        arr.push(')');
                        Util.log.apply(Util, arr);
                        self.el.html(arr.join(''));
                        return true;
                    };
                });
                this.el.css({'background': '#000'});
            }
        },
        /**
         * 销毁播放器
         * @returns {*}
         */
        destroy: function (mode) {
            this.parent.prototype.destroy.apply(this, arguments);
            //this.player.pause($.type(mode) == 'number' ? mode : this.pauseMode);
            Api.SysSetting.env('sw_player_id', null);
            //销毁播放器默认设置为黑场模式
            Api.DataAccess.info("MediaSetting", "PauseMode", $.type(mode) == 'number' ? mode : this.pauseMode);
            //销毁播放器
            return this.player.releasePlayerInstance();
        },
        /**
         * 设置播放资源，支持 file http delivery rtsp udp 方式
         * @param file
         */
        src: function (file) {
            var re = /(file:\/\/|http:\/\/|delivery:\/\/|rtsp:\/\/|udp:\/\/)/i;
            if (re.test(file)) {
                this.fileList = [];
                this.fileList.push(file);
                //由于this.palyer.source是不能读的，会导致死机，play方法已经注释了读取，这里需要标识播放状态才能更换直播频道
                this.isPlaying = false;
            } else {
                throw new Error('文件地址不正确');
            }
        },
        /**
         * 设置多个播放资源，只对http方式
         * @param files
         */
        multiSrc: function (files) {
            this.fileList = files;
        },
        /**
         * 设置DVB播放资源
         * @param options
         * @constructor
         */
        DVBSrc: function (options) {
            // delivery://Frequency.SymbolRate.Modulation.ProgramNumber.VideoPID.AudioPID
            var defaultValue = {
                //频点频率，单位KHz
                Frequency: '',
                //符号率，单位KSymbol/s，可填0，系统取默认值为6875
                SymbolRate: 0,
                //Modulation为调制方式，可填0，系统取默认值64QAM
                Modulation: 0,
                //业务ID号
                ProgramNumber: '',
                //视频PID，可填0，系统默认取该业务下PID值最小的视频流，如果该业务为纯音频业务，该值为0
                VideoPID: 0,
                //音频PID，可填0，系统默认取该业务下PID值最小的音频流
                AudioPID: 0
            };
            var o = $.extend(defaultValue, options),
                src = [];
            if (!o.Frequency || !o.ProgramNumber) {
                throw new Error('缺少参数');
            }
            src.push(o.Frequency);
            src.push(o.SymbolRate);
            src.push(o.Modulation);
            src.push(o.ProgramNumber);
            src.push(o.VideoPID);
            src.push(o.AudioPID);
            var source = 'delivery://' + src.join('.');
            this.src(source);
        },
        /**
         * 设置VOD播放资源
         * @param options
         * @constructor
         */
        VODSrc: function (options) {
            // rtsp://<session-manager-path>:<session-manager-port>/;purchaseToken=<purchase-token>;serverId=<server-id>
            var defaultValue = {
                //前端session manager服务器的IP地址或者域名
                path: '',
                //前端session manager服务器的通讯端口
                port: '',
                //购买令牌，由鉴权结果返回
                token: '',
                //前端Navigation Server服务器的IP地址
                serverId: ''
            };
            var o = $.extend(defaultValue, options);
            if (!o.path || !o.port || !o.token || !o.serverId) {
                throw new Error('缺少参数');
            }
            var source = 'rtsp://' + o.path + ':' + o.port + '/;purchaseToken=' + o.token + ';serverId=' + o.serverId;
            this.src(source);
        },
        /**
         * 设置UDP播放资源
         * @param options
         * @constructor
         */
        UDPSrc: function (options) {
            //udp://MulticastAddress:UDPPort:ProgramNumber:VideoPID:AudioPID
            var defaultValue = {
                //MulticastAddress为发送组播地址,当前端使用UDP单播时，MulticastAddress为“0.0.0.0”，当前端使用UDP组播时，MulticastAddress为发送组播地址
                address: '0.0.0.0',
                //UDP端口号
                port: '',
                //业务ID号
                ProgramNumber: '',
                //视频PID，可填0，系统默认取该业务下PID值最小的视频流，如果该业务为纯音频业务，该值为0
                VideoPID: 0,
                //音频PID，可填0，系统默认取该业务下PID值最小的音频流
                AudioPID: 0
            };
            var o = $.extend(defaultValue, options),
                src = [];
            if (!o.ProgramNumber) {
                throw new Error('缺少参数');
            }
            src.push(o.address);
            src.push(o.port);
            src.push(o.ProgramNumber);
            src.push(o.VideoPID);
            src.push(o.AudioPID);
            var source = 'udp://' + src.join(':');
            this.src(source);
        },
        /**
         * 开始播放资源
         */
        play: function () {
            //已经在播放，即刷新,
            if (this.isPlaying) {
                this.pace = 1;
                this.player.pace = this.pace;

                var src = this.fileList[this.playingIndex];
                //避免相同的资源刷新后重头开始播放
                //if (this.player.source != src) {
                //    this.player.source = src;
                //}
                this.player.refresh();
                this.fire('play', 1/*, this.player.source*/);//同洲机顶盒1.0版本中间件，读取player.source値，会造成机顶盒死机
            } else {
                this.player.source = this.fileList[this.playingIndex];
                this.isPlaying = true;
                this.pace = 1;
                this.player.pace = this.pace;//快进快退状态重新播放一个视频，默认恢复为1
                var ret = this.player.play();
                //播放时设置的position没有更新，不知道是不是播放器的bug， 暂时用刷新来解决(只有http方式才有这个问题)
                // setTimeout(this.proxy(function () {
                //this.player.pause();
                //this.player.play();
                //  }), 10);
                this.fire('play', ret/*, this.player.source*/);
            }
        },
        /**
         * 播放下一个资源
         */
        playNext: function () {
            var count = this.fileList.length,
                index = this.playingIndex;
            // log('playNext', count, count);
            //如果还有未播放文件，继续播放下一个
            if (index < count - 1) {
                ++this.playingIndex;
                this.stop();
                this.play();
            } else {
                //没有播放文件
                this.fire('allEnd', this.player);
            }
        },
        /**
         * 暂停
         * @returns {*}
         */
        pause: function (mode) {
            this.fire('pause');
            return this.player.pause(typeof mode === 'undefined' ? this.pauseMode : mode);
        },
        /**
         * 停止
         * @returns {*}
         */
        stop: function (mode) {
            this.isPlaying = false;
            this.fire('stop');
            return this.player.pause(typeof mode === 'undefined' ? this.pauseMode : mode);
        },
        /**
         * 设置音量
         * @param val 0 - 32
         */
        volume: function (val) {
            switch (val) {
                case 1:
                    this._volumn = this._volumn >= 32 ? 32 : ++this._volumn;
                    break;
                case -1:
                    this._volumn = this._volumn <= 0 ? 0 : --this._volumn;
                    break;
                default :
                    this._volumn = val;
                    break;
            }
            Api.DataAccess.volumn(this._volumn);
            //Api.SysSetting.env(this._volumnCacheKey, this._volumn);
            this.fire('volume', this._volumn);
        },

        /**
         * 静音设置
         */
        mute: function () {
            var isMute = !!this.player.getMute();
            if (!isMute) {
                this.player.audioMute();
            } else {
                this.player.audioUnmute();
            }
            this.fire('mute', !isMute);
        },
        /**
         * 获取影片的长度
         * @param flag 是否转换成秒
         * @returns {*}
         */
        getLength: function (flag) {
            var timeStr = this.player.getMediaDuration(),
                timeArray = timeStr.split(':');
            //当Source属性为本地媒体文件时，该方法返回正播放媒体的总时长；当Source属性为DVB广播频道、NGOD-VOD、IP-UDP码流时，该方法返回“0”。
            //是否转换成秒
            if (flag) {
                if (timeArray.length == 3) {
                    //时间换算成秒
                    return parseInt(timeArray[0]) * 3600 + parseInt(timeArray[1]) * 60 + parseInt(timeArray[2]);
                } else {
                    return 0;
                }
            } else {
                //数字不够两位补零
                var newArray = $.map(timeArray, function (n) {
                    return Util.pad(n, 2);
                });
                return newArray.join(':');
            }
        },
        /**
         * 获取播放的时间，返回时间格式
         * @returns {string|*}
         */
        getPlayTime: function () {
            var total = this.point(),
                hours = parseInt(total / 3600),
                minute = parseInt((total - hours * 3600) / 60),
                second = total - hours * 3600 - minute * 60,
                array = [hours, minute, second];
            var newArray = $.map(array, function (n) {
                return Util.pad(n, 2);
            });
            return newArray.join(':');
        },
        /**
         * 获取或设置影片播放事件，单位是秒
         * @param second
         * @returns {*}
         */
        point: function (second) {
            if (second !== undefined && $.type(parseInt(second)) == 'number') {
                //设置媒体的播放点,数值型，只读，单位为秒
                this.player.point = second;
            } else {
                return this.player.currentPoint;
            }
        },
        /**
         * 刷新
         */
        refresh: function () {
            this.player.refresh();
        },
        /**
         *  切换视频画面格式，1为16:9，2为4:3 combined播放模式，3为4:3 Pan-Scan 播放模式，4为4:3 Letter-Box 播放模式，5为全屏模式，6为Auto，默认值为Auto。
         * @param mode
         * @returns {*|MediaPlayer.videoAspect|number|Player.player.videoAspect}
         */
        aspect: function (mode) {
            //功能：视频画面格式，1为16:9，2为4:3 combined播放模式，3为4:3 Pan-Scan 播放模式，4为4:3 Letter-Box 播放模式，5为全屏模式，6为Auto，默认值为Auto。
            if (mode) {
                this.player.videoAspect = mode;
                this.fire('aspect', mode);
            } else {
                return this.player.videoAspect;
            }
        },
        /**
         * 切换视频制式，只接受以下的输入值：1为PAL，2为NTSC，3为SECAM，4为Auto，默认值为4
         * @param mode
         * @returns {*|Player.player.videoMode}
         */
        mode: function (mode) {
            //视频制式，只接受以下的输入值：1为PAL，2为NTSC，3为SECAM，4为Auto，默认值为4
            if (mode) {
                this.player.videoMode = mode;
            } else {
                return this.player.videoMode;
            }
        },
        /**
         * 设置播放速度
         * @param pace 倍数，1、2、4、8、16、32、-1、-2、-4、-8、-16、-32
         */
        setPace: function (pace) {
            this.player.pace = this.pace = pace;
            this.refresh();
            if (pace > 1) {
                this.fire('fastForward', this.pace);
            } else if (pace < -1) {
                this.fire('fastBackward', this.pace);
            }
            this.fire('pace', this.pace);
        },
        /**
         * 快进
         */
        fastForward: function () {
            if (this.pace == 1) {
                this.pace = 12;
            } else if (this.pace == 12) {
                this.pace = 32;
            } else if (this.pace == 32) {
                this.pace = 1;
            }else{
                this.pace = 12;
            }
            /*
             if (this.pace < 1) {
             this.pace = 1;
             } else {
             this.pace *= 2;
             if (this.pace > 32) {
             this.pace = 1;
             }
             }
             */
            this.player.pace = this.pace;
            this.refresh();
            this.fire('fastForward', this.pace);
        },
        /**
         * 快退
         */
        fastBackward: function () {
            if (this.pace == 1) {
                this.pace = -12;
            } else if (this.pace == -12) {
                this.pace = -32;
            } else if (this.pace == -32) {
                this.pace = 1;
            }else{
                this.pace = -12;
            }
            /*
             if (this.pace >= 0) {
             this.pace = -1;
             } else if (this.pace < 0) {
             this.pace *= 2;
             if (this.pace < -32) {
             this.pace = 1;
             }
             }
             */
            this.player.pace = this.pace;
            this.refresh();
            this.fire('fastBackward', this.pace);
        },
        /**
         * 判断当前播放的视频是否 视频流
         * @returns {boolean}
         */
        isDVBVideo: function () {
            // 视频信号：[2,4]、[4,27]; 音频：[4]
            var eleStreams = this.player.eleStreams || [];
            if (eleStreams.length == 1 && eleStreams[0].eleStreamType == 4) {
                return false;
            } else {
                for (var i = 0, len = eleStreams.length; i < len; i++) {
                    if (eleStreams[i].eleStreamType == 2 || eleStreams[i].eleStreamType == 4) {
                        return true;
                    }
                }
            }
            return false;
        }
    }, TVUI.Base);

    TVUI.Player = Player;

})(TVUI);
;
/**
 * 延时加载图片组件
 */
(function ($, TVUI) {

    var LazyLoad = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //可视区选择器
                view: document.body,

                //内容区选择器
                el: document.body,

                //占位图片
                placeholder: 'theme/common/img/space.gif',

                //加载图片阀值，即图片在距离可视区多少像素时开始加载
                threshold: 100,

                //是否替换content中的图片src值
                replaceSrc: false,

                //是否异步加载content
                async: false,

                //内容html
                content: '',

                //滚动条实例
                scrollBar: null
            }, options || {});

            /**
             * 内容区对象
             * @type {*|HTMLElement}
             */
            this.el = $(o.el);
            /**
             * 可视区对象
             * @type {*|HTMLElement}
             */
            this.view = $(o.view);
            /**
             * 占位图片
             */
            this.placeholder = o.placeholder;
            /**
             * 阀值
             * @type {number|lazyload.threshold|jt.threshold|touch.threshold}
             */
            this.threshold = o.threshold;
            /**
             * 内容
             */
            this.content = o.content;
            this.async = o.async;
            this.replaceSrc = o.replaceSrc;
            this.scrollBar = o.scrollBar;

            /**
             * 可视区的位置
             */
            this.parentOffset = this.view.offset();
            this.render();
            this.imgs = this.el.find('img');
            this.events();
            this.load();
        },
        render: function () {
            //如果是异步加载内容
            if (this.content && this.async) {

                //需要替换src的原始值
                if (this.replaceSrc) {
                    var r1 = /<img [^>]*src=['"]([^'"]+)[^>]*>/gi,
                        r2 = /src=['"]([^'"]+)['"]/gi,
                        placeholder = this.placeholder;

                    this.content = this.content.replace(r1, function (img) {
                        return img.replace(r2, function (src) {
                            return 'data-' + src + ' src="' + placeholder + '"';
                        });
                    });
                }
                this.el.html(this.content);
            }
        },
        events: function () {
            var self = this;
            if (this.scrollBar) {
                this.scrollBar.on('scroll', function () {
                    self.load();
                });

                this.imgs.each(function (i, img) {
                    //图片加载完成时要重置滚动条
                    img.onload = function () {
                        self.scrollBar.reset();
                    };
                });
            }
        },
        load: function () {
            var self = this,
                parent = this.parentOffset,
                view = parent.top + parent.height;

            this.imgs.each(function (i, img) {
                //已经加载完成的图片不需要再加载
                if (img.className.indexOf('J_load') === -1) {
                    var $img = $(img),
                        offset = $img.offset(),
                        src = $img.attr('data-src');
                    if (offset.top - self.threshold < view) {
                        $img.attr('src', src).addClass('J_load');
                    }
                }
            });
        }


    }, TVUI.Base);


    TVUI.LazyLoad = LazyLoad;
})(Zepto, TVUI);;
(function (TVUI) {
    var util = TVUI.Util,
        Event = TVUI.Event,
        $ = TVUI.$,
        isShow = false,
        box,
        log = function () {
            var args = util.makeArray(arguments);
            var msg = [];
            $.each(args, function (i, n) {
                if (typeof n == 'object') {
                    try {
                        msg.push(JSON.stringify(n));
                    } catch (e) {
                        msg.push(n);
                    }
                } else {
                    msg.push(n);
                }
            });
            var div = $('<div>').css({
                "border-bottom": "1px dashed #666",
                "padding": "10px"
            });
            isShow = true;
            div.html(msg.join(" | "));
            if(box) {
                box.show();
                box.append(div);
            }
            util.log.apply(util, arguments);
        };

    //星号键
    Event.onKey(318, function () {
        if(TVUI.debug) {
            isShow = !isShow;
            if (isShow) {
                box.show();
            } else {
                box.hide();
            }
        }
    });

    //信息键，清空log
    Event.onKey(73, function () {
        TVUI.debug && box.empty();
    });

    window.onerror = function () {
        //log.apply(log, arguments);
        // return true;
    };
    TVUI.Log = log;

    $(function(){
        if(TVUI.debug) {
            box = $('#debugbox');
            if (box.length === 0) {
                box = $('<div>').attr('id', 'debugbox');
                box.css({
                    "position": "absolute",
                    "z-index": "9999",
                    "width": "90%",
                    "height": "90%",
                    "background": "#fff",
                    "color": "#000",
                    "left": "50px",
                    "top": "20px",
                    "border": "5px solid red",
                    "font-size": "18px",
                    "word-break": "break-all",
                    "display": "none"
                });
                $('body').append(box);
            }
        }
    });

})(TVUI);



