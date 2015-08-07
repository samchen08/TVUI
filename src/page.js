/**
 * 页面模块
 */
(function (TVUI, $) {

    var setting = TVUI.API.SysSetting,
        Event = TVUI.Event,
        Key = TVUI.Key,
        util = TVUI.Util;

    /**
     * 页面类, 继承Base
     * @type {*}
     * ex:
     *  所有参数都是可选的
     *
     */
    var Page = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //语言
                lang: 'zh',

                //页面名称，必须，而且要唯一
                name: 'page_' + this.id,

                //页面url，默认当前访问的页面
                url: location.href,

                //是否记录浏览页面历史
                history: true,

                //是否阻止页面默认事件
                preventDefault: true,

                //是否首页
                home: false,

                //页面层级，如果大于0，即启用按层级别记录浏览历史
                level: 0,

                backUrl: null,

                //页面返回、退出时，return  false 时不执行返回、退出
                unload: function (obj, type) {
                    return true;
                }


            }, options || {});

            /**
             * 属性：页面名称
             */
            this.name = o.name;

            //页面缓存key
            this.cacheKey = Page.cacheKey + this.name;

            /**
             * 属性：页面缓存
             * @type {{}}
             */
            this.cache = {};

            /**
             * 属性：页面url参数对象
             * @type {*|String|{}}
             */
            this.params = util.queryToJson(o.url) || {};

            /**
             * 属性：页面语言
             */
            this.lang = this.params.lang || setting.env(Page.langKey) || o.lang;

            this.url = o.url;

            /**
             * 页面包含的面板集合
             * @type {{}}
             */
            this.panels = {};

            /**
             * 当前激活的面板
             * @type {null}
             */
            this.activePanel = null;

            this.level = o.level;

            if (o.preventDefault) {
                //阻止按键默认行为
                document.onkeyup = document.onkeydown = document.onkeypress = function () {
                    return false;
                };
            }

            //记录backUrl
            if (o.backUrl) {
                setting.env(Page.backUrlKey, o.backUrl);
            }

            //如果来源是页面是不存在，本地文件系统页面跳进来的referrer可能为空
            if (!document.referrer) {
                Page.clearHistory();
            }

            this.addHistory();
            this.loadCache();
            this.events();
        },
        addHistory: function () {
            var o = this.options;
            o.history && Page.addHistory({
                name: this.name,
                url: this.url,
                home: o.home,
                level: this.level
            });
        },
        /**
         * 跳转
         * @param url 跳转页面地址
         * @param param 参数对象，可选
         *
         */
        go: function (url, param) {
            if (!url) return;

            if (param) {
                var str = util.param(param);
                url += url.indexOf('?') > -1 ? '&' + str : '?' + str;
            }
            this.fire('unload', this, url);
            this.isUnload = true;
            this.fire('go', url);
            location.href = url;


        },
        back: function () {
            var history = Page.backHistory();
            //有历史记录，按历史记录返回
            if (history) {
                this.fire('back', history.url);
                this.go(history.url);
            } else {
                var backUrl = setting.env(Page.backUrlKey);
                //有backUrl，按backUrl返回
                if (backUrl) {
                    setting.env(Page.backUrlKey, null);
                    this.fire('back', Page.backUrlKey);
                    this.go(backUrl);
                } else {
                    //都没有，触发默认事件
                    this.fire('defaultBack');
                }
            }
        },
        exit: function () {
            var history = Page.homeHistory();
            //如果首页标识记录，调转到首页
            if (history) {
                this.fire('exit', history.url);
                this.go(history.url);
            } else {
                //没有首页标识，即返回
                this.back();
            }
        },
        refresh: function () {
            this.fire('unload', this, this.url);
            this.isUnload = true;
            this.fire('refresh');
            location.reload();
        },
        /**
         * 读取页面缓存
         */
        loadCache: function () {
            var name = this.cacheKey,
                record = setting.envJSON(name);
            $.extend(this.cache, record || {});
            //读出附加参数后，清除缓存
            setting.envJSON(name, null);
        },
        /**
         * 设置缓存
         * @param obj
         */
        setCache: function (obj) {
            $.extend(this.cache, obj || {});
        },
        /**
         * 获取缓存
         * @returns {{}|Page.cache|*}
         */
        getCache: function () {
            return this.cache;
        },
        /**
         * 清空缓存
         */
        clearCache: function () {
            this.cache = {};
        },
        /**
         * 保存缓存，在页面unload时自动执行
         */
        saveCache: function () {
            var name = this.cacheKey;
            if (!$.isEmptyObject(this.cache)) {
                setting.envJSON(name, this.cache);
            } else {
                setting.envJSON(name, null);
            }
        },
        /**
         * 设置语言
         * @param lang  zh 或 en
         */
        setLang: function (lang) {
            this.lang = lang || 'zh';
            setting.env(Page.langKey, this.lang);
            this.fire('setLang', lang);
        },
        /**
         * 增加 panel
         *
         * ex:
         *
         * page.addPanel(panel1,panel2,.......);
         */
        addPanel: function () {
            var panels = arguments, self = this;
            for (var i = 0, len = panels.length; i < len; i++) {
                (function (panel) {
                    //判断要增加的panel是否已经添加，未增加过即执行增加
                    if (panel && panel.id && !self.panels[panel.id]) {
                        panel.on('active', function (obj) {
                            //当panel激活时，其他panel设置为非活动状态
                            for (var key in self.panels) {
                                if (self.panels.hasOwnProperty(key) && panel.id != key) {
                                    self.panels[key].unActive();
                                }
                            }
                            //记录当前活动的panel是哪个
                            self.activePanel = obj;
                        });
                        self.panels[panel.id] = panel;
                    }
                })(panels[i]);
            }
        },
        events: function () {
            var o = this.options;
            this.registerEvent(Event.onPress(function (evt) {
                if (!this._active) return;
                switch (evt.which) {
                    case Key.BLUE:
                        TVUI.debug && this.refresh();
                        break;
                    case Key.EXIT:
                        o.unload(this, 'exit') && this.exit();
                        break;
                    case Key.BACK:
                        o.unload(this, 'back') && this.back();
                        break;
                }

            }, this));

            //96956按键
            this.registerEvent(Event.onComKey([Key.NUM9, Key.NUM6, Key.NUM9, Key.NUM5, Key.NUM6], function () {
                if (!this._active) return;
                this.go("ui://factory/index.html");
            }, this));

            //5个1键清空缓存并刷新页面
            this.registerEvent(Event.onComKey([Key.NUM1, Key.NUM1, Key.NUM1, Key.NUM1, Key.NUM1], function () {
                if (TVUI.debug) {
                    setting.clear();
                    alert('成功清空缓存');
                    this.refresh();
                }
            }, this));


            /**
             * 兼容浏览器和机顶盒原生unload， 浏览器unload事件是屏蔽的，但机顶盒是允许的，如果已经触发了unload，不再触发
             */
            TVUI.Event.on('unload', function () {
                if (!this.isUnload) {
                    this.fire('unload');
                    this.isUnload = true;
                }
            }, this);

            this.on('unload', this.saveCache, this);

            //当页面被激活时，恢复当前活动的panel
            this.on('active', function () {
                if (this.activePanel) {
                    this.activePanel._active = true;
                    if (this.activePanel.pager) {
                        this.activePanel.pager._active = true;
                    }
                }
            });

            this.on('unActive', function () {
                for (var key in this.panels) {
                    if (this.panels.hasOwnProperty(key)) {
                        var panel = this.panels[key];
                        //先找出页面中哪个panel是活动的，并记录下来起来
                        if (!this.activePanel && panel._active) {
                            this.activePanel = panel;
                        }
                        //把页面全部panel都设置为非活动
                        panel._active = false;
                        if (panel.pager) {
                            panel.pager._active = false;
                        }
                    }
                }
            });


        }

    }, TVUI.Base);

    Page.extend({
        //历史记录缓存Key
        historyCacheKey: 'sw_history',
        //页面缓存Key
        cacheKey: 'sw_cache_',
        //语言版本缓存key
        langKey: 'sw_lang',
        //后退url缓存key
        backUrlKey: 'backUrl',
        //浏览历史数据
        history: [],
        /**
         * 添加历史记录
         * @param item
         */
        addHistory: function (item) {
            //向从机顶盒缓存获取当前的历史记录
            var history = setting.envJSON(this.historyCacheKey) || [],
                length = history.length,
                lastItem;
            if (length > 0) {
                lastItem = history[length - 1];
                //如果最后一项记录和当前页面url不相同，即记录并更新机顶盒缓存
                if (lastItem.url != item.url) {

                    history = $.grep(history, function (n) {
                        //如果和当前页面是同一个页面，删除它
                        if (n.name == item.name && n.url == item.url) {
                            return false;
                        } else {
                            //如果没开启层级，记录历史，如果开启层级，删除比当前层级高的记录
                            return n.level === 0 || (n.level > 0 && n.level < item.level);
                        }
                    });

                    history.push(item);

                    //按等级从小到大排序
                    history.sort(function (a, b) {
                        return a.level - b.level;
                    });

                    //todo：去重


                }
            } else {
                history.push(item);
            }
            this.history = history;
            setting.envJSON(this.historyCacheKey, history);
        },
        /**
         * 清空历史记录
         */
        clearHistory: function () {
            this.history = [];
            setting.envJSON(this.historyCacheKey, null);
        },
        /**
         * 获取前一个历史记录
         * @returns {*}
         */
        backHistory: function () {
            var history = this.history;
            if (history.length > 1) {
                history.pop();
                setting.envJSON(this.historyCacheKey, history);
                return history[history.length - 1];
            }
            return null;
        },
        /**
         * 获取首页历史记录
         * @returns {*}
         */
        homeHistory: function () {
            var history = this.history.slice(0),
                homePages;
            history.pop();
            homePages = $.grep(history, function (n) {
                return n.home;
            });
            if (homePages.length > 0) {
                var i = history.length - 1,
                    item;
                while (i >= 0) {
                    item = history.pop();
                    if (item.home) {
                        setting.envJSON(this.historyCacheKey, history);
                        return item;
                    } else {
                        --i;
                    }
                }
            }
            return null;
        }

    });


    TVUI.Page = Page;

})(TVUI, Zepto);