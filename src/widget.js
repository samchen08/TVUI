/**
 * 页面组件模块，该组件是封装GCMS的widget.action 接口功能
 * v1.2.0
 * 增加 media参数，标识是否播放媒体文件
 */
(function (TVUI) {
    var util = TVUI.Util,
        Class = TVUI.Class,
        $ = TVUI.$,
        Player = TVUI.Player,
        Base = TVUI.Base,
        api = TVUI.API,
        cacheData = {};

    var Widget = Class.create({
        init: function (options) {
            var opt = {
                //接口url地址
                url: '',

                //用户卡号
                cardNumber: '',

                //GCMS的页面标识
                pageCode: '',

                //GCMS文字组件的标识和页面html元素id的键值对，如：{code:'#id1,#id2'} 多个id用英文逗号分隔
                textMap: {},

                //GCMS图片组件的标识和页面html元素id的键值对，如：{code:'#id1,#id2'} 多个id用英文逗号分隔
                imageMap: {},

                //页面Page实例，如果有中英文切换或者有视频、音乐播放就必须要传入page
                page: null,

                //静态图片路径
                baseUrl: 'http://172.16.1.102:80/gcms/',

                //请求缓存数据，如果为true, 请求数据保存到机顶盒环境变量，需要重启机顶盒才会清空缓存
                cache: true,

                //是否创建媒体播放器（视频，音乐）
                media: true
            };
            var o = this.options = $.extend(opt, options || {});
            if (!o.page) {
                throw new Error('缺少page参数');
            }
            var param = {cardNumber: o.cardNumber, pageCode: o.pageCode};
            /**
             * GCMS文字组件的标识和页面html元素id的键值对
             */
            this.textMap = o.textMap;
            /**
             * GCMS图片组件的标识和页面html元素id的键值对
             */
            this.imageMap = o.imageMap;
            /**
             * 页面实例
             */
            this.page = o.page;
            this.textData = this.imageData = this.musicData = this.videoData = {};
            this.slideCache = [];

            //todo: 这里根据需求确定是否要缓存数据
            if (o.url) {
                this.cacheKey = o.url + '_' + o.cardNumber + '_' + o.pageCode;
                var cache = cacheData[this.cacheKey],
                    self = this,
                    localCache = o.cache ? api.SysSetting.envJSON(this.cacheKey) : cache;
                if (localCache) {
                    setTimeout(function () {
                        self._initData(localCache);
                    }, 20);
                } else {
                    $.getJSON(o.url, param, this.proxy(this._initData));
                }
            }
            this._event();

        },
        _event: function () {
            this.page.on('setLang', this.proxy(this.renderText));
        },
        /**
         * 初始化数据，根据GCMS请求返回的数据转换成适合页面处理的格式
         * @param res
         * @private
         */
        _initData: function (res) {
            cacheData[this.cacheKey] = res;
            api.SysSetting.envJSON(this.cacheKey, res);
            if (res && res[0]) {
                this.data = res[0];
                this.textData = this.arrayToObject(this.data.text);
                this.imageData = this.arrayToObject(this.data.image);
                if (this.options.media) {
                    this.musicData = this.arrayToObject(this.data.music);
                    this.videoData = this.arrayToObject(this.data.video);
                } else {
                    this.musicData = {};
                    this.videoData = {};
                }
                //todo: 还有音乐和视频处理
                //标识已经获得了数据
                this.loaded = true;
                this.render();
                //触发 dataLoaded 事件
                this.fire('dataLoaded', this.data);
            } else {
                this.textData = {};
                this.imageData = {};
                this.musicData = {};
                this.videoData = {};
                util.log('widget无数据');
            }
        },

        setData: function (type, data) {
            this[type + 'Data'] = data;
        },
        getData: function () {
            return this.data;
        },
        render: function () {
            this.renderText();
            this.renderImage();
            if (this.options.media) {
                this.renderMusic();
                this.renderVideo();
            }
        },
        renderText: function () {
            var data = this.textData,
                map = this.textMap,
                page = this.page;
            for (var code in data) {
                var selectorArr = (map[code] || '').split(','),
                    item = data[code];
                for (var i = 0; i < selectorArr.length; i++) {
                    var el = $(selectorArr[i]);
                    el.html(page.lang == 'zh' ? item.content : item.englishContent);
                }

            }
        },
        Slide: function (imgs, interval) {
            var $img = imgs,
                index = 0,
                self = this,
                len = $img.length;
            this.change = function (i) {
                $img.hide();
                $img.eq(i).show();
            };
            if (len > 0) {
                if (len > 1 && interval && interval > 0) {
                    this.__timerId = setInterval(function () {
                        index++;
                        if (index > len - 1) {
                            index = 0;
                        }
                        self.change(index);
                    }, interval);
                }
                self.change(0);
            }
        },
        renderImage: function () {

            var data = this.imageData,
                baseUrl = this.options.baseUrl,
                map = this.imageMap,
                getHtml = function (arr) {
                    var html = '';
                    $.each(arr || [], function (i, n) {
                        html += '<img src="' + baseUrl + n + '" style="display:none"/>';
                    });
                    return html;
                };

            for (var code in data) {
                var selectorArr = (map[code] || '').split(','),
                    item = data[code],
                    interval = (item.interval || 5) * 1000,
                    html = getHtml(item.contents || []);
                for (var i = 0; i < selectorArr.length; i++) {
                    var el = $(selectorArr[i]).eq(0);
                    if (el.length > 0) {
                        el.html(html);
                        var s = new this.Slide(el.find('img'), interval);
                        this.slideCache.push(s);
                    }
                }
            }
        },
        renderMusic: function () {
            var data = this.musicData,
                baseUrl = this.options.baseUrl,
                page = this.page;
            var files = [];
            $.each(data, function (key, value) {
                $.each(value.contents, function (i, item) {
                    files.push(baseUrl + item);
                });
            });

            if (files.length > 0) {
                this.musicPlayer = new Player({
                    type: 'Video',
                    fullScreen: false,
                    width: 1,
                    height: 1,
                    left: 0,
                    top: 0,
                    page: page,
                    transparent: false
                });
                this.musicPlayer.on('play', function (ret) {
                    if (ret === 0) {
                        self.fire('playError');
                    }
                });
                this.musicPlayer.on('allEnd', function (player) {
                    player.destroy();
                    this.fire('playEnd');
                });
                this.musicPlayer.multiSrc(files);
                this.musicPlayer.play();
                this.musicPlayer.active();
            }

        },
        renderVideo: function () {
            var data = this.videoData,
                baseUrl = this.options.baseUrl,
                page = this.page,
                self = this;
            var files = [];
            $.each(data, function (key, value) {
                $.each(value.contents, function (i, item) {
                    files.push(baseUrl + item);
                });
            });
            if (files.length > 0) {
                this.videoPlayer = new Player({
                    type: 'Video',
                    fullScreen: true,
                    width: 0,
                    height: 0,
                    left: 0,
                    top: 0,
                    page: page
                });
                this.videoPlayer.on('play', function (ret) {
                    if (ret === 0) {
                        self.fire('playError');
                    }
                });
                this.videoPlayer.on('allEnd', function (player) {
                    player.destroy();
                    this.fire('playEnd');
                });
                this.videoPlayer.multiSrc(files);
                this.videoPlayer.play();
                this.videoPlayer.active();
            }
        },
        arrayToObject: function (array) {
            var obj = {};
            $.each(array, function (i, n) {
                obj[n.code] = n;
            });
            return obj;
        },
        text: function (code, selector) {
            this.textMap[code] = $(selector);
            //如果数据已经加载完成，立即触发渲染页面
            if (this.loaded) {
                this.renderText();
            }
            return this;
        },
        image: function (code, selector) {
            this.imageMap[code] = $(selector);
            if (this.loaded) {
                this.renderImage();
            }
            return this;
        },
        destroy: function () {
            this.parent.prototype.destroy.apply(this, arguments);
            for (var i = 0; i < this.slideCache.length; i++) {
                clearInterval(this.slideCache[i].__timerId);
            }
            if (this.videoPlayer) this.videoPlayer.destroy();
            if (this.musicPlayer) this.musicPlayer.destroy();
        }
    }, Base);


    TVUI.Widget = Widget;

})(TVUI);
