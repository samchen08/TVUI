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
})(Zepto, TVUI);