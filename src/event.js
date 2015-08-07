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

})(Zepto, TVUI, window);