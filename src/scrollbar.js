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

})(TVUI);