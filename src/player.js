/**
 * 播放器模块
 * v1.2.0
 *
 */
(function (TVUI) {
    var Player,
        Key = TVUI.Key,
        Lang = TVUI.Lang,
        Api = TVUI.API,
        $ = TVUI.$,
        Event = TVUI.Event,
        Log = TVUI.Log,
        Util = TVUI.Util;

    Player = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //播放内容类型 Video 或 Audio
                type: 'video',

                //是否全屏
                fullScreen: false,

                //视频宽度
                width: 400,

                //视频高度
                height: 300,

                //位置左
                left: 0,

                //位置右
                top: 0,

                //页面实例
                page: null,

                //是否设置body透明
                transparent: true,

                //数值型，取1表示将画面保持在暂停前最后一帧，取0表示将画面设为黑场
                pauseMode: 1,
                //是否在页面unload时自动销毁播放器
                autoDestroy: true
            }, options || {});


            /**
             * 播放速度倍数
             * @type {number}
             */
            this.pace = 1;
            /**
             * 播放内容类型
             */
            this.type = o.type;
            /**
             * 页面实例
             */
            this.page = o.page;
            /**
             * 音量缓存key
             * @type {string}
             * @private
             */
                //已经不再使用
                // this._volumnCacheKey = 'sw_volumn';
                //计数器，用来判断服务是否可用
            this._disableCount = 0;
            /**
             * 蛋清播放文件的索引，只对http方式有效
             * @type {number}
             */
            this.playingIndex = 0;
            /**
             * 播放状态，是否正在播放中
             * @type {boolean}
             */
            this.isPlaying = false;
            /**
             * 播放文件列表
             * @type {Array}
             */
            this.fileList = [];
            /**
             * 暂停方式 取1表示将画面保持在暂停前最后一帧，取0表示将画面设为黑场
             * @type {number|player.pauseMode|b.options.pauseMode|Player.options.pauseMode|b.pauseMode|Player.pauseMode}
             */
            this.pauseMode = o.pauseMode;
            /**
             * 当前的音量值
             */
            this._volumn = this._initVolumn();

            //适配页面效果，在机顶盒上是无效
            this._createDom(o.fullScreen, o.left, o.top, o.width, o.height);
            this.createPlayer();
            this._event();
        },
        _initVolumn: function () {
            var cache = Api.DataAccess.info("VodApp", "QAMName4");
            //var cache = Api.SysSetting.env(this._volumnCacheKey);
            if (cache) {
                Api.DataAccess.volume(cache);
            } else {
                cache = Api.DataAccess.volume(16);
                Api.DataAccess.info("VodApp", "QAMName4", cache);
                //Api.SysSetting.env(this._volumnCacheKey, cache);
            }
            this.fire('initVolume', cache);
            return parseInt(cache, 10);
        },
        _createDom: function (fullScreen, x, y, w, h) {
            var div = $('<div>');
            if (fullScreen) {
                w = document.documentElement.clientWidth || document.body.clientWidth;
                h = document.documentElement.clientHeight || document.body.clientHeight;
                x = y = 0;
            }
            div.css({
                'position': 'absolute',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'color': '#fff'
            });
            this.el = div;
            if (this.options.transparent) {
                $(document.body).append(div).css({'background': 'transparent'});
            } else {
                $(document.body).append(div);
            }
        },
        _event: function () {
            var self = this;
            //销毁
            if (this.page) {
                if (this.options.autoDestroy) {
                    this.page.on('unload', this.proxy(this.destroy));
                }

                this.page.on('active unActive', function () {
                    self._active = this._active;
                });
            }

            this.registerEvent(Event.onPress(function (evt) {
                if (!self._active) return;
                switch (parseInt(evt.which)) {
                    case Key.STOP: //停止
                        self.stop();
                        break;
                    case Key.PAUSE: //暂停
                        self.pause();
                        break;
                    case Key.PLAY:  //播放
                        self.play();
                        break;
                    case Key.VOLUME_MUTE:  //静音
                        self.mute();
                        break;
                    case Key.FUN9:  //快退
                        self.fastBackward();
                        break;
                    case Key.FUN10: //快进
                        self.fastForward();
                        break;
                    case Key.FUN20:    //视频画面格式切换
                        var aspect = self.aspect();
                        //6 是自动;
                        if (aspect == 6) {
                            aspect = 0;
                        }
                        aspect = aspect > 6 ? 0 : ++aspect;
                        self.aspect(aspect);
                        break;
                }
            }));
            //音量+
            this.registerEvent(Event.onKey(Key.VOLUME_UP, function () {
                if (!self._active) return;
                self.volume(1);
            }));
            //音量-
            this.registerEvent(Event.onKey(Key.VOLUME_DOWN, function () {
                if (!self._active) return;
                self.volume(-1);
            }));
            //系统事件
            this.registerEvent(Event.onSystem(function (e) {
                if (!self._active) return;

                var which = parseInt(e.which, 10),
                    ext = e.modifiers,
                    page = self.page,
                //根据Id指针，取出内存中保存的消息属性的字符串内容
                    eventExtArr = Api.SysSetting.getEventInfo(ext).split(","),
                    code = Math.floor(eventExtArr[1]);
                //log(which, ext, eventExtArr);
                switch (which) {
                    case 10031: //成功锁定频点
                        var ts = DVB.currentTS; //获取当前频点的传输流对象
                        self.fire('locked', ts);
                        break;
                    case 10032: //锁频失败
                        self.fire('error', Lang[page.lang].T_7, which);
                        break;
                    case 10901: //当前媒体已播放到末尾（仅用于本地媒体播放）
                        self.fire('playEnd');
                        self.playNext();
                        break;
                    case 10905: //收到Session Manager的NGOD-S1 Announce请求
                        break;
                    case 10921: //根据NGOD-S1 Session Setup响应的destination字段信息，在对应频点的PAT表中无法找到对应节目的PMT描述
                        self.fire('error', Lang[page.lang].T_8, which);
                        break;
                    case 10903: //收到Session Manager返回的NGOD-S1 Session Set up响应
                        switch (code) {
                            case 754:
                                //不可用媒资
                                self.fire('error', Lang[page.lang].T_9, which, code);
                                break;
                            default:
                                //网络繁忙
                                if(code != 200){
                                    self.fire('error', Lang[page.lang].T_10, which, code);
                                }
                                break;
                        }
                        break;
                    case 10913: //发出NGOD-S1 Session Teardown请求后已过10秒，尚未收到session manager的响应
                        self._disableCount++;
                        break;
                    case 10906: //收到Session Manager返回的NGOD-S1 Ping响应
                        self._disableCount = 0;
                        break;
                    case 10907: //收到推流服务器返回的NGOD-C1 Play响应
                    case 10908: //收到推流服务器返回的NGOD-C1 Pause响应
                        switch (code) {
                            case 200:
                                if (which == 10907) {
                                    //设置播放点,等待setPoint状态
                                    //todo:这里可能要做处理
                                }
                                break;
                            case 403:
                                //无权限操作
                                self.fire('error', Lang[page.lang].T_11, which, code);
                                break;
                            case 754:
                                //不可用媒资
                                self.fire('error', Lang[page.lang].T_9, which, code);
                                break;
                            default:
                                if (code >= 400 && code <= 778 && code != 455) {
                                    //网络繁忙
                                    self.fire('error', Lang[page.lang].T_10, which, code);
                                }
                                break;
                        }
                        break;
                    case 10910: //收到推流服务器返回的NGOD-C1 Get Parameter响应
                        self._disableCount = 0;
                        break;
                    case 10909: //收到推流服务器的NGOD- C1 Announce请求
                        switch (code) {
                            case 403:
                                //无权限操作
                                self.fire('error', Lang[page.lang].T_11, which, code);
                                break;
                            case 2101: //rtsp 流结束
                                self.fire('rtspEnd', which, code);
                                break;
                            case 2104: //rtsp 流开始
                                self.fire('rtspStart', which, code);
                                break;
                            case 5402:
                                //推流会话中断
                                self.fire('error', Lang[page.lang].T_12, which, code);
                                break;
                        }
                        break;
                    case 10915: //发出NGOD-C1 Play请求后已过10秒，尚未收到推流服务器的响应
                        self._disableCount++;
                        break;
                    case 10912: //发出NGOD-S1 Session Setup请求后已过10秒，尚未收到session manager的响应
                        //点播失败,是否重新点播
                        self.fire('error', Lang[page.lang].T_13, which);
                        break;
                    case 10904: //收到Session Manager返回的NGOD-S1 Session Teardown响应
                        if (code != 200) {
                            //点播会话中断
                            self.fire('error', Lang[page.lang].T_14, which, code);
                        }
                        break;
                    case 10914: //发出NGOD-S1 Ping请求后已过10秒，尚未收到session manager的响应
                        self._disableCount++;
                        if (self._disableCount > 20) {
                            self.fire('error', Lang[page.lang].T_14, which);
                        }
                        break;
                    case 10917: //发出NGOD-C1 Get Parameter请求后已过10秒，尚未收到推流服务器的响应
                        self._disableCount++;
                        if (self._disableCount > 20) {
                            self.fire('error', Lang[page.lang].T_14, which);
                        }
                        break;
                    case 11702:
                        //隐藏不能播放节目的提示
                        // self.trigger('error', '不能播放节目', which);
                        break;
                    default:
                        //永新世博CA
                        if (which >= 11301 && which <= 11328) {
                            self.fire('error', eventExtArr[0], which);
                        }
                        //数码视讯CA
                        if (which >= 11501 && which <= 11585) {
                            self.fire('error', eventExtArr[0], which);
                        }
                        break;

                }

            }));

        },
        setPosition: function (fullScreen, x, y, w, h) {
            if (this.type == 'video') {
                var position = [];
                position.push(Number(fullScreen));
                position.push(x);
                position.push(y);
                position.push(w);
                position.push(h);
                this.player.position = position.join(',');
            } else {
                this.player.position = '0,0,0,1,1';
            }
        },
        /**
         * 创建播放器
         */
        createPlayer: function () {
            var o = this.options;
            if (window.MediaPlayer) {
                this.player = new MediaPlayer();
                this.instanceId = Api.SysSetting.env('sw_player_id');
                if (this.instanceId) {
                    this.player.bindPlayerInstance(parseInt(this.instanceId));
                } else {
                    this.instanceId = this.player.createPlayerInstance(o.type, o.type == 'video' ? 2 : 0);
                    Api.SysSetting.env('sw_player_id', String(this.instanceId));
                }
                this.setPosition(o.fullScreen, o.left, o.top, o.width, o.height);
            } else {
                //这里做浏览器提示，方便调试
                var fn = 'isDVBVideo|setPace|setPosition|DVBSrc|VODSrc|UDPSrc|src|play|pause|refresh|destroy|stop|mute|getLength|point|aspect|mode|fastForward|slowForward|fastBackward|slowBackward|volumnUp|volumnDown|active|multiSrc|next'.split('|');
                var self = this;
                $.each(fn, function (i, n) {
                    self[n] = function () {
                        var arr = Util.makeArray(arguments);
                        arr.unshift('player.' + n + '(');
                        arr.push(')');
                        Util.log.apply(Util, arr);
                        self.el.html(arr.join(''));
                        return true;
                    };
                });
                this.el.css({'background': '#000'});
            }
        },
        /**
         * 销毁播放器
         * @returns {*}
         */
        destroy: function (mode) {
            this.parent.prototype.destroy.apply(this, arguments);
            //this.player.pause($.type(mode) == 'number' ? mode : this.pauseMode);
            Api.SysSetting.env('sw_player_id', null);
            //销毁播放器默认设置为黑场模式
            Api.DataAccess.info("MediaSetting", "PauseMode", $.type(mode) == 'number' ? mode : this.pauseMode);
            //销毁播放器
            return this.player.releasePlayerInstance();
        },
        /**
         * 设置播放资源，支持 file http delivery rtsp udp 方式
         * @param file
         */
        src: function (file) {
            var re = /(file:\/\/|http:\/\/|delivery:\/\/|rtsp:\/\/|udp:\/\/)/i;
            if (re.test(file)) {
                this.fileList = [];
                this.fileList.push(file);
                //由于this.palyer.source是不能读的，会导致死机，play方法已经注释了读取，这里需要标识播放状态才能更换直播频道
                this.isPlaying = false;
            } else {
                throw new Error('文件地址不正确');
            }
        },
        /**
         * 设置多个播放资源，只对http方式
         * @param files
         */
        multiSrc: function (files) {
            this.fileList = files;
        },
        /**
         * 设置DVB播放资源
         * @param options
         * @constructor
         */
        DVBSrc: function (options) {
            // delivery://Frequency.SymbolRate.Modulation.ProgramNumber.VideoPID.AudioPID
            var defaultValue = {
                //频点频率，单位KHz
                Frequency: '',
                //符号率，单位KSymbol/s，可填0，系统取默认值为6875
                SymbolRate: 0,
                //Modulation为调制方式，可填0，系统取默认值64QAM
                Modulation: 0,
                //业务ID号
                ProgramNumber: '',
                //视频PID，可填0，系统默认取该业务下PID值最小的视频流，如果该业务为纯音频业务，该值为0
                VideoPID: 0,
                //音频PID，可填0，系统默认取该业务下PID值最小的音频流
                AudioPID: 0
            };
            var o = $.extend(defaultValue, options),
                src = [];
            if (!o.Frequency || !o.ProgramNumber) {
                throw new Error('缺少参数');
            }
            src.push(o.Frequency);
            src.push(o.SymbolRate);
            src.push(o.Modulation);
            src.push(o.ProgramNumber);
            src.push(o.VideoPID);
            src.push(o.AudioPID);
            var source = 'delivery://' + src.join('.');
            this.src(source);
        },
        /**
         * 设置VOD播放资源
         * @param options
         * @constructor
         */
        VODSrc: function (options) {
            // rtsp://<session-manager-path>:<session-manager-port>/;purchaseToken=<purchase-token>;serverId=<server-id>
            var defaultValue = {
                //前端session manager服务器的IP地址或者域名
                path: '',
                //前端session manager服务器的通讯端口
                port: '',
                //购买令牌，由鉴权结果返回
                token: '',
                //前端Navigation Server服务器的IP地址
                serverId: ''
            };
            var o = $.extend(defaultValue, options);
            if (!o.path || !o.port || !o.token || !o.serverId) {
                throw new Error('缺少参数');
            }
            var source = 'rtsp://' + o.path + ':' + o.port + '/;purchaseToken=' + o.token + ';serverId=' + o.serverId;
            this.src(source);
        },
        /**
         * 设置UDP播放资源
         * @param options
         * @constructor
         */
        UDPSrc: function (options) {
            //udp://MulticastAddress:UDPPort:ProgramNumber:VideoPID:AudioPID
            var defaultValue = {
                //MulticastAddress为发送组播地址,当前端使用UDP单播时，MulticastAddress为“0.0.0.0”，当前端使用UDP组播时，MulticastAddress为发送组播地址
                address: '0.0.0.0',
                //UDP端口号
                port: '',
                //业务ID号
                ProgramNumber: '',
                //视频PID，可填0，系统默认取该业务下PID值最小的视频流，如果该业务为纯音频业务，该值为0
                VideoPID: 0,
                //音频PID，可填0，系统默认取该业务下PID值最小的音频流
                AudioPID: 0
            };
            var o = $.extend(defaultValue, options),
                src = [];
            if (!o.ProgramNumber) {
                throw new Error('缺少参数');
            }
            src.push(o.address);
            src.push(o.port);
            src.push(o.ProgramNumber);
            src.push(o.VideoPID);
            src.push(o.AudioPID);
            var source = 'udp://' + src.join(':');
            this.src(source);
        },
        /**
         * 开始播放资源
         */
        play: function () {
            //已经在播放，即刷新,
            if (this.isPlaying) {
                this.pace = 1;
                this.player.pace = this.pace;

                var src = this.fileList[this.playingIndex];
                //避免相同的资源刷新后重头开始播放
                //if (this.player.source != src) {
                //    this.player.source = src;
                //}
                this.player.refresh();
                this.fire('play', 1/*, this.player.source*/);//同洲机顶盒1.0版本中间件，读取player.source値，会造成机顶盒死机
            } else {
                this.player.source = this.fileList[this.playingIndex];
                this.isPlaying = true;
                this.pace = 1;
                this.player.pace = this.pace;//快进快退状态重新播放一个视频，默认恢复为1
                var ret = this.player.play();
                //播放时设置的position没有更新，不知道是不是播放器的bug， 暂时用刷新来解决(只有http方式才有这个问题)
                // setTimeout(this.proxy(function () {
                //this.player.pause();
                //this.player.play();
                //  }), 10);
                this.fire('play', ret/*, this.player.source*/);
            }
        },
        /**
         * 播放下一个资源
         */
        playNext: function () {
            var count = this.fileList.length,
                index = this.playingIndex;
            // log('playNext', count, count);
            //如果还有未播放文件，继续播放下一个
            if (index < count - 1) {
                ++this.playingIndex;
                this.stop();
                this.play();
            } else {
                //没有播放文件
                this.fire('allEnd', this.player);
            }
        },
        /**
         * 暂停
         * @returns {*}
         */
        pause: function (mode) {
            this.fire('pause');
            return this.player.pause(typeof mode === 'undefined' ? this.pauseMode : mode);
        },
        /**
         * 停止
         * @returns {*}
         */
        stop: function (mode) {
            this.isPlaying = false;
            this.fire('stop');
            return this.player.pause(typeof mode === 'undefined' ? this.pauseMode : mode);
        },
        /**
         * 设置音量
         * @param val 0 - 32
         */
        volume: function (val) {
            switch (val) {
                case 1:
                    this._volumn = this._volumn >= 32 ? 32 : ++this._volumn;
                    break;
                case -1:
                    this._volumn = this._volumn <= 0 ? 0 : --this._volumn;
                    break;
                default :
                    this._volumn = val;
                    break;
            }
            Api.DataAccess.volumn(this._volumn);
            //Api.SysSetting.env(this._volumnCacheKey, this._volumn);
            this.fire('volume', this._volumn);
        },

        /**
         * 静音设置
         */
        mute: function () {
            var isMute = !!this.player.getMute();
            if (!isMute) {
                this.player.audioMute();
            } else {
                this.player.audioUnmute();
            }
            this.fire('mute', !isMute);
        },
        /**
         * 获取影片的长度
         * @param flag 是否转换成秒
         * @returns {*}
         */
        getLength: function (flag) {
            var timeStr = this.player.getMediaDuration(),
                timeArray = timeStr.split(':');
            //当Source属性为本地媒体文件时，该方法返回正播放媒体的总时长；当Source属性为DVB广播频道、NGOD-VOD、IP-UDP码流时，该方法返回“0”。
            //是否转换成秒
            if (flag) {
                if (timeArray.length == 3) {
                    //时间换算成秒
                    return parseInt(timeArray[0]) * 3600 + parseInt(timeArray[1]) * 60 + parseInt(timeArray[2]);
                } else {
                    return 0;
                }
            } else {
                //数字不够两位补零
                var newArray = $.map(timeArray, function (n) {
                    return Util.pad(n, 2);
                });
                return newArray.join(':');
            }
        },
        /**
         * 获取播放的时间，返回时间格式
         * @returns {string|*}
         */
        getPlayTime: function () {
            var total = this.point(),
                hours = parseInt(total / 3600),
                minute = parseInt((total - hours * 3600) / 60),
                second = total - hours * 3600 - minute * 60,
                array = [hours, minute, second];
            var newArray = $.map(array, function (n) {
                return Util.pad(n, 2);
            });
            return newArray.join(':');
        },
        /**
         * 获取或设置影片播放事件，单位是秒
         * @param second
         * @returns {*}
         */
        point: function (second) {
            if (second !== undefined && $.type(parseInt(second)) == 'number') {
                //设置媒体的播放点,数值型，只读，单位为秒
                this.player.point = second;
            } else {
                return this.player.currentPoint;
            }
        },
        /**
         * 刷新
         */
        refresh: function () {
            this.player.refresh();
        },
        /**
         *  切换视频画面格式，1为16:9，2为4:3 combined播放模式，3为4:3 Pan-Scan 播放模式，4为4:3 Letter-Box 播放模式，5为全屏模式，6为Auto，默认值为Auto。
         * @param mode
         * @returns {*|MediaPlayer.videoAspect|number|Player.player.videoAspect}
         */
        aspect: function (mode) {
            //功能：视频画面格式，1为16:9，2为4:3 combined播放模式，3为4:3 Pan-Scan 播放模式，4为4:3 Letter-Box 播放模式，5为全屏模式，6为Auto，默认值为Auto。
            if (mode) {
                this.player.videoAspect = mode;
                this.fire('aspect', mode);
            } else {
                return this.player.videoAspect;
            }
        },
        /**
         * 切换视频制式，只接受以下的输入值：1为PAL，2为NTSC，3为SECAM，4为Auto，默认值为4
         * @param mode
         * @returns {*|Player.player.videoMode}
         */
        mode: function (mode) {
            //视频制式，只接受以下的输入值：1为PAL，2为NTSC，3为SECAM，4为Auto，默认值为4
            if (mode) {
                this.player.videoMode = mode;
            } else {
                return this.player.videoMode;
            }
        },
        /**
         * 设置播放速度
         * @param pace 倍数，1、2、4、8、16、32、-1、-2、-4、-8、-16、-32
         */
        setPace: function (pace) {
            this.player.pace = this.pace = pace;
            this.refresh();
            if (pace > 1) {
                this.fire('fastForward', this.pace);
            } else if (pace < -1) {
                this.fire('fastBackward', this.pace);
            }
            this.fire('pace', this.pace);
        },
        /**
         * 快进
         */
        fastForward: function () {
            if (this.pace == 1) {
                this.pace = 12;
            } else if (this.pace == 12) {
                this.pace = 32;
            } else if (this.pace == 32) {
                this.pace = 1;
            }else{
                this.pace = 12;
            }
            /*
             if (this.pace < 1) {
             this.pace = 1;
             } else {
             this.pace *= 2;
             if (this.pace > 32) {
             this.pace = 1;
             }
             }
             */
            this.player.pace = this.pace;
            this.refresh();
            this.fire('fastForward', this.pace);
        },
        /**
         * 快退
         */
        fastBackward: function () {
            if (this.pace == 1) {
                this.pace = -12;
            } else if (this.pace == -12) {
                this.pace = -32;
            } else if (this.pace == -32) {
                this.pace = 1;
            }else{
                this.pace = -12;
            }
            /*
             if (this.pace >= 0) {
             this.pace = -1;
             } else if (this.pace < 0) {
             this.pace *= 2;
             if (this.pace < -32) {
             this.pace = 1;
             }
             }
             */
            this.player.pace = this.pace;
            this.refresh();
            this.fire('fastBackward', this.pace);
        },
        /**
         * 判断当前播放的视频是否 视频流
         * @returns {boolean}
         */
        isDVBVideo: function () {
            // 视频信号：[2,4]、[4,27]; 音频：[4]
            var eleStreams = this.player.eleStreams || [];
            if (eleStreams.length == 1 && eleStreams[0].eleStreamType == 4) {
                return false;
            } else {
                for (var i = 0, len = eleStreams.length; i < len; i++) {
                    if (eleStreams[i].eleStreamType == 2 || eleStreams[i].eleStreamType == 4) {
                        return true;
                    }
                }
            }
            return false;
        }
    }, TVUI.Base);

    TVUI.Player = Player;

})(TVUI);
