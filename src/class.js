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

