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

})(Zepto, TVUI);