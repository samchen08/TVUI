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
