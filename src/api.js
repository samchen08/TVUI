/**
 * 中间件通讯模块，适配中间api
 */
(function (TVUI, JSON) {
    var util = TVUI.Util,
        key = TVUI.Key,
        $ = TVUI.$;

    var empty = function () {
        },
        noop = function () {
            util.log(arguments);
        },
        isSTB = !!window.DataAccess && !!window.SysSetting;


    /**
     * DataAccess 适配
     * @type {{info: info, save: save, revert: revert, volume: volume, volumn: volumn}}
     */
    var da = {
        /**
         * 适配中间件的DataAccess.getInfo (ClassName,InfoName) 和  DataAccess.setInfo (ClassName,InfoName,InfoValue)
         * @param className 字符串，分类名
         * @param infoName 字符串，要设置的数据名称
         * @param infoValue 字符串，要设置的数据值
         * @returns {*}
         *
         * ex：
         * 1) TVUI.API.DataAccess.info(className, infoName, infoValue) 设置
         * 2）TVUI.API.DataAccess.info(className, infoName) 读取
         */
        info: function (className, infoName, infoValue) {
            if (!isSTB) {
                util.log('msg:', 'DataAccess undefined. do: da.info');
                return '';
            }
            if (infoValue) {
                DataAccess.setInfo(className, infoName, infoValue);
                this.save(className, infoName);
            } else {
                return  DataAccess.getInfo(className, infoName);
            }
        },
        /**
         * 将内存中的指定数据写入Flash
         * @param className 字符串，分类名
         * @param infoName 字符串，要设置的数据名称
         */
        save: function (className, infoName) {
            if (typeof DataAccess == 'undefined') {
                util.log('msg:', 'DataAccess undefined. do:da.save');
            } else {
                DataAccess.save(className, infoName);
            }
        },
        /**
         * 将Flash中的指定数据读取到内存
         * @param className 字符串，分类名
         * @param infoName 字符串，要设置的数据名称
         */
        revert: function (className, infoName) {
            if (typeof DataAccess == 'undefined') {
                util.log('msg:', 'DataAccess undefined do:da.revert');
            } else {
                DataAccess.revert(className, infoName);
            }
        },
        /**
         * 设置音量
         * @param val
         * @returns {Number} 数值 0~32
         */
        volume: function (val) {
            if ($.type(val) == 'number' || $.type(val) == 'string') {
                val = val > 32 ? 32 : val;
                val = val < 0 ? 0 : val;
                this.info('MediaSetting', 'OutputVolumn', val);
                //clearTimeout(this._volTimeId);
                //var self = this;
                //this._volTimeId = setTimeout(function () {
                //   self.save('MediaSetting', 'OutputVolumn');
                //}, 1000);
                this.info("VodApp", "QAMName4", val);
            } else {
                return parseInt(this.info('MediaSetting', 'OutputVolumn'), 10);
            }
        },
        /**
         * 设置音量，和volume是一样的，为了兼容中间的错别字
         * @param val
         * @returns {Number}
         */
        volumn: function (val) {
            return this.volume(val);
        }
    };

    /**
     * 适配中间件的 SysSetting
     * @type {{env: env, envJSON: envJSON, sendEvent: sendEvent, getEventInfo: getEventInfo, clear: clear}}
     */
    var sysSetting = {
        /**
         * 适配 SysSetting.setEnv(variantName,value)、SysSetting.getEnv(variantName)、SysSetting.deleteEnv(variantName)
         * @param name 全局变量名称
         * @param value 全局变量值
         * @returns {*}
         *
         * ex：
         * 1） TVUI.API.SysSetting.env(name,value) 设置
         * 2)  TVUI.API.SysSetting.env(name) 获取
         * 3)  TVUI.API.SysSetting.env(name,null)  删除
         */
        env: function (name, value) {
            if (typeof SysSetting != 'undefined') {
                if (value) {
                    SysSetting.setEnv(name, String(value));
                } else if (value === null) {
                    SysSetting.deleteEnv(name);
                } else {
                    return  SysSetting.getEnv(name);
                }
            } else {
                if (value) {
                    sessionStorage && sessionStorage.setItem(name, value);
                    // util.setCookie(name, value, 0);
                } else if (value === null) {
                    sessionStorage && sessionStorage.removeItem(name);
                    //util.delCookie(name);
                } else {
                    if (window.sessionStorage) {
                        return sessionStorage.getItem(name);
                    } else {
                        return "";
                    }
                    //return  util.getCookie(name);
                }
            }
        },
        /**
         * 以JSON的格式，适配以上 env 的功能
         * @param name
         * @param value  JSON格式数据或null
         * @returns {*}
         *
         * ex:
         * 用法同上
         */
        envJSON: function (name, value) {
            if (value) {
                if (typeof value === 'object') {
                    this.env(name, JSON.stringify(value));
                } else {
                    throw Error('evnJSON param require JSON');
                }
            } else {
                if (value === null) {
                    this.env(name, null);
                } else {
                    var result = this.env(name);
                    return result ? JSON.parse(result) : null;
                }

            }
        },
        /**
         * 从应用层向中间件发送虚拟消息，中间件仍旧通过type，which，modifiers属性得知其是虚拟消息
         * @param type 虚拟消息分类
         * @param which 虚拟的消息代码值，数值型（16位二进制存储，十进制方式使用）
         * @param modifiers 虚拟消息的扩展属性值
         * @returns {*} 数值型，1为成功发送虚拟消息，0为发送失败
         */
        sendEvent: function (type, which, modifiers) {
            if (typeof SysSetting != 'undefined') {
                return SysSetting.sendEvent(type, which, modifiers);
            }
        },
        /**
         * 根据Id指针，取出内存中保存的消息属性的字符串内容
         * @param id 字符串内容的指针，数值型
         * @returns {*} 字符串内容
         */
        getEventInfo: function (id) {
            if (typeof SysSetting != 'undefined') {
                return SysSetting.getEventInfo(id);
            } else {
                return "";
            }
        },
        /**
         * 清空全局环境变量数据
         */
        clear: function () {
            if (typeof SysSetting != 'undefined') {
                SysSetting.deleteallEnv();
            } else {
                sessionStorage && sessionStorage.clear();
            }

        }

    };

    /**
     *  适配 CA接口
     *  ex:
     *
     *  TVUI.API.CA.icNo
     *  ...
     *  覆盖全部CA的属性，名称和中间件规范一致
     */
    var ca = (function () {
        var _ca = window.CA || {};

        return {
            name: _ca.name || '',
            icNo: _ca.icNo || '',
            pinLocked: _ca.pinLocked || true,
            version: _ca.version || '',
            regionCode: _ca.regionCode || 0,
            changePin: _ca.changePin || noop,
            setRating: _ca.setRating || noop,
            getRating: _ca.getRating || noop,
            setWorkTime: _ca.setWorkTime || noop,
            getWorkTime: _ca.getWorkTime || noop,
            getOperators: _ca.getOperators || noop,
            getWallets: _ca.getWallets || noop,
            getEntitles: _ca.getEntitles || noop,
            getMails: _ca.getMails || noop,
            getViewedIPPs: _ca.getViewedIPPs || noop,
            getInquireIPP: _ca.getInquireIPP || noop,
            cancelInquireIPP: _ca.cancelInquireIPP || noop
        };
    })();

    /**
     * 适配 Network对象
     */
    var network = (function () {
        var _nw = window.Network || {};
        return {
            // host: _nw.host || '',
            //同洲盒子误认host是关键字，解释到host会死机（无解决方案），暂时去掉
            ethernets: _nw.ethernets || {},

            /**
             * 获取设备状态
             */
            getDeviceState: _nw.getDeviceState || noop,
            /**
             * 判断网络是否链接
             * @returns {boolean}
             */
            isEnable: function () {
                if (isSTB) {
                    var eth0 = _nw.getDeviceState('eth0'),
                        cm = _nw.getDeviceState('cm');
                    //状态为101或者201才是网络连接正常，但是创维的盒子拿到的状态是：1196176512
                    if (eth0 > 300 || cm > 300) {
                        return true;
                    } else {
                        return eth0 == 101 || cm == 201;
                    }
                }
                return true;
            }
        };
    })();

    /**
     * 适配 FileSystem对象
     * @type {{download: download, getFile: getFile, createFile: createFile, removeDir: removeDir}}
     */
    var fileSystem = {
        /**
         * 下载远程文件
         * @param options
         * ex:
         *
         * TVUI.API.FileSystem.download({
         *    path : 'http://192.168.1.1/file.js', //文件路径
         *    timeout : 5,  //超时时间,单位秒
         *    dataType: 'text', //返回的数据类型，支持 text 和 json
         *    success : function(data){
         *         //data 根据 dataType 返回
         *    },
         *    error : function(msg){
         *      //msg 错误信息
         *    }
         * });
         *
         */
        download: function (options) {
            if (!isSTB) {
                options.error && options.error();
                return;
            }
            var opt = {
                path: '', //文件路径
                timeout: 5,//超时时间
                dataType: 'text', //返回文件类型
                success: empty, //成功回调
                error: empty  //失败回调
            };
            $.extend(opt, options);
            var maskId, timerId;
            TVUI.Event.on('systemevent', function (e) {
                var msg;
                switch (parseInt(e.which)) {
                    //下载成功
                    case 10151:
                        clearTimeout(timerId);
                        var fileObj = FileSystem.getRemoteFile(maskId);
                        //以文本形式打开
                        if (fileObj.open(1) == 1) {
                            msg = fileObj.readAllfile();
                            if (opt.dataType == 'json') {
                                try {
                                    msg = JSON.parse(msg);
                                } catch (err) {
                                    opt.error(err);
                                }
                            }
                            fileObj.close();
                            opt.success(msg, fileObj);
                            FileSystem.killObject(fileObj);
                        } else {
                            opt.error("文件打开失败");
                        }
                        break;
                    //文件不存在
                    case 10152:
                        clearTimeout(timerId);
                        msg = '前端不存在要下载的文件';
                        opt.error(msg);
                        break;
                    case 10153:
                        clearTimeout(timerId);
                        msg = '文件下载失败';
                        opt.error(msg);
                        break;
                    case 10154:
                        clearTimeout(timerId);
                        msg = '下载超时';
                        opt.error(msg);
                        break;
                }
            });
            maskId = FileSystem.downloadRemoteFile(opt.path, opt.timeout);
            if (opt.timeout > 0) {
                timerId = setTimeout(function () {
                    opt.error('下载超时');
                }, opt.timeout * 1000);
            }
        },
        /**
         * 读取一个文件内容
         * @param path 文件路径
         * @param callback 成功回调，参数是文件的文本信息
         * @param error  错误回调
         * @returns {*} 如果获取成功，返回获取文件的File对象；如果文件不存在，返回-1；如果因为其它原因导致获取文件失败，返回0
         */
        getFile: function (path, callback, error) {
            if (!isSTB) {
                error && error('不支持');
                return;
            }
            var file = FileSystem.getFile(path);
            if (file == -1) {
                error && error('文件不存在');

            } else if (file === 0) {
                error && error('获取文件失败');
            } else {
                if (file.open(1) == 1) {
                    var msg = file.readAllfile();
                    file.close();
                    callback && callback(msg, file);
                    FileSystem.killObject(file);
                } else {
                    error && error('文件打开失败');
                }
            }
            return file;
        },
        /**
         * 创建一个文件，如果文件名称存在，即覆盖
         * @param content 文件文本内容
         * @param savePath 保存路径
         * @returns {*} 如果创建File对象成功，返回该File对象；如果创建失败，返回0。
         */
        createFile: function (content, savePath) {
            if (!isSTB) return;
            var fileObj = FileSystem.createFile();
            if (fileObj !== 0 && fileObj.open(1) == 1) {
                fileObj.writeFile(content);
                fileObj.close();
                var ret = fileObj.saveAs(savePath);
                FileSystem.killObject(fileObj);
                return ret;
            }
            return 0;
        },
        /**
         * 删除一个目录及其所有内容
         * @param path 字符串，要删除的目录的路径
         * @param callback 成功回调
         */
        removeDir: function (path, callback) {
            if (!isSTB) return;
            var arr = path.split('/');
            if (arr[arr.length - 1] === '') {
                arr.pop();
            }
            path = arr.join('/');
            TVUI.Event.on('systemevent', function (e) {
                if (parseInt(e.which) == 10160 && parseInt(e.modifiers) == 1) {
                    callback && callback();
                }
            });
            if (FileSystem.existDirectory(path) == 1) {
                FileSystem.deleteDirectory(path);
            }

        }
    };

    /**
     * 适配 user.channels
     * @type {{getChannelByServiceId: getChannelByServiceId, getDVBServiceByServiceId: getDVBServiceByServiceId, isSupportPlayback: isSupportPlayback}}
     * @private
     */
    var _user = {
        /**
         * 根据业务ID来获取对应的频道对象
         * @param ServiceId 数值型，频道所对应的业务的ID，取值范围0-65535
         * @returns {*} user.channel对象
         */
        getChannelByServiceId: function (ServiceId) {
            if (isSTB) {
                return user.channels.getChannelByServiceId(ServiceId);
            } else {
                return null;
            }
        },
        /**
         *  根据业务ID来获取对应的DVBService对象
         * @param ServiceId
         * @returns {*}  DVBService对象
         */
        getDVBServiceByServiceId: function (ServiceId) {
            var channel = this.getChannelByServiceId(ServiceId);
            if (channel) {
                return channel.getService();
            } else {
                return null;
            }
        },
        /**
         * 判断是否支持回看， 集团不是用这种方式判断，因为channelId不同
         * @param ServiceId
         * @returns {boolean}
         */
        isSupportPlayback: function (ServiceId) {
            var DVBService = this.getDVBServiceByServiceId(ServiceId);
            if (DVBService) {
                return !!DVBService.supportPlayback;
            }
            return false;
        }
    };

//节目指南搜索只能是单线程，这里要做列队处理
    var epgCache = {}, //结果缓存
        epgTaskList = [],//列队数组
        epgTaskRunning = false;//运行标识

    /**
     * 适配 EPG对象
     * @type {{search: search, searchProgramsByServiceId: searchProgramsByServiceId}}
     */
    var epg = {
        /**
         * 搜索节目指南
         * @param options
         * ex:
         * TVUI.API.EPG.search({
         *      serviceId : 102, 业务ID，数值型
         *      mask : 1, 由0x01(actual PF)、0x02(actual schedule)、0x04(other PF)、0x08(other schedule)中的一个或多个相加组成，如0x03(0x01+0x02)就代表要搜索actual PF和actual schedule的数据
         *      timeout: 10, 搜索EPG信息的超时时间，数值型，单位为秒
         *      startDate: 0, 搜索开始日志，当前日志的相对值，如：0 是今天，1 是明天
         *      days : 1 , 搜索天数
         *      complete : function(data){
         *           //data 节目单数据
         *      }
         * });
         */
        search: function (options) {
            epgTaskList.push(options);
            if (!epgTaskRunning) {
                epgTaskRunning = true;
                this.searchProgramsByServiceId(epgTaskList.shift());
            }
        },
        /**
         * 底层搜索方法，不建议用，用search 就可以
         * @param options
         */
        searchProgramsByServiceId: function (options) {
            if (!isSTB) return;
            var opt = {
                serviceId: '',
                mask: 1,
                timeout: 10,
                //数值型，取值范围0-30
                startDate: 0,
                //数值型，取值范围1-10，默认为7
                days: 1,
                complete: noop
            };

            $.extend(opt, options);

            var maskId, obj,
                timerId = null,
                self = arguments.callee,
                cacheKey = [opt.serviceId, opt.mask, opt.startDate, opt.days].join('_'),
                cache = epgCache[cacheKey],
                complete = function (msg) {
                    opt.complete(msg);
                    //列队还有内容，执行下一个
                    if (epgTaskList.length > 0) {
                        self(epgTaskList.shift());
                    } else {
                        epgTaskRunning = false;
                    }
                };

            if (cache) {
                complete(cache);
            } else {
                TVUI.Event.onSystem(function (e) {
                    if (e.modifiers == maskId) {
                        switch (parseInt(e.which)) {
                            //成功完成EPG搜索
                            case key.EPG_SEARCH_SUCC:
                            //索结果达到255个事件信息时，系统自动停止搜索
                            case key.EPG_SEARCH_STOP_WHEN_RST_TO_MAX:
                            //搜索超时
                            case key.EPG_SEARCH_TIMEOUT:
                                clearTimeout(timerId);
                                obj = EPG.getSearchResult(maskId);
                                epgCache[cacheKey] = obj;
                                complete(obj);
                                break;
                        }
                    }
                });
                da.info('DVBSetting', 'EPGStartDate', String(opt.startDate));
                da.info('DVBSetting', 'EPGNumdays', String(opt.days));
                maskId = EPG.searchProgramsByServiceId(opt.serviceId, opt.mask, opt.timeout);
                timerId = setTimeout(function () {
                    complete([]);
                }, (opt.timeout + 1) * 1000);
            }
        }
    };


    TVUI.API = {
        DataAccess: da,
        SysSetting: sysSetting,
        CA: ca,
        Network: network,
        FileSystem: fileSystem,
        user: _user,
        EPG: epg
    };

})(TVUI, JSON);