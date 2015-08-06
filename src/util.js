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
