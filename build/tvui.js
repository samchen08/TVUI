
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

//阻止按键默认行为
document.onkeyup = document.onkeydown = document.onkeypress = function(){
    return false;
};

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
        Date.prototype.toJSON = function (key) {
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
            hasPlaceholder = /\?.+=\?/.test(settings.url),
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
    root.Mustache = mustache;
    /*
     if (typeof exports === "object" && exports) {
     factory(exports); // CommonJS
     } else {
     var mustache = {};
     factory(mustache);
     if (typeof define === "function" && define.amd) {
     define(mustache); // AMD
     } else {
     root.Mustache = mustache; // <script>
     }
     }
     */
}(this, function (mustache) {

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
        this.view = view === null ? {} : view;
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
                    while (value !== null && i < names.length) {
                        value = value[names[i++]];
                    }
                } else {
                    value = context.view[name];
                }

                if (value !== null) break;

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

        if (tokens === null) {
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

                        if (value !== null) buffer += value;
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
                    if (value !== null) buffer += this.renderTokens(this.parse(value), context, partials, value);
                    break;
                case '&':
                    value = context.lookup(token[1]);
                    if (value !== null) buffer += value;
                    break;
                case 'name':
                    value = context.lookup(token[1]);
                    if (value !== null) buffer += mustache.escape(value);
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
    DOWN: 40,  //0x0028,  遥控器上的向下键
    UP: 38,  //0x0026,  遥控器上的向上键
    LEFT: 37,  //0x0025,  遥控器上的向左键
    RIGHT: 39, //0x0027,  遥控器上的向右键
    POWER: 19,  //0xFFFF,  遥控器上的指示关机与开机键
    PAGE_UP: 33, //0x0021,  遥控器上的向上翻页键
    PAGE_DOWN: 34,  //0x0022,  遥控器上的向下翻页键
    TRACK: 86, //0x0197,  遥控器上的声道键,即AUDIO
    LIKE: 76, //0x01CB,  遥控器上的字幕键/频道喜爱键,即TELETEXT
    BACK: 32, //0x0280,  遥控器上的返回键,即TOGGLE
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
        T_6 : '续播'
    },
    en: {}
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

        /**
         * dom事件绑定函数
         * @param type 事件名称，如：keyup、keydown
         * @param handler 事件句柄函数
         * @param scope 作用域，就是handler中的 this 指向的对象
         * @returns {TVUI.uuid|*} 返回唯一的标识id
         */
        addEvent = function (type, handler, scope) {
            _handlers[++TVUI.uuid] = {type: type, handler: handler, scope: scope};
            _doc.addEventListener(type, handler, false);
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
            return this.on('keydown', callback, scope);
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
            return this.on('keydown', function (e) {
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
        $ = TVUI.$,
        Event = TVUI.Event;

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

})(TVUI, JSON);