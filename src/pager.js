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
