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
