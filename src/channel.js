/**
 * 频道处理模块
 */
(function (TVUI) {
    var util = TVUI.Util,
        $ = TVUI.$,
        api = TVUI.API;

    var channel = {
        /**
         * 获取频道数据
         * @param filePath 本地缓存数据文件路径
         * @param url 接口api
         * @param network 网络是否正常，如果网络不正常，即读取本地文件
         * @param zone  区域
         * @returns {*}
         */
        get: function (filePath, url, network, zone) {
            var data = this.getChannel(filePath, url, network);
            if (data) {
                return this.parseChannel(data, zone);
            }
            return null;
        },
        /**
         *  私有方法，获取频道原始数据
         * @param filePath
         * @param url
         * @param network
         * @returns {*}
         */
        getChannel: function (filePath, url, network) {
            var chanelData = null;
            var ret = api.FileSystem.getFile(filePath, function (data) {
                try {
                    chanelData = eval('(' + data + ')');
                } catch (e) {
                    alert('读取频道文件失败:' + e);
                }
            });
            //文件不存在或读取失败
            if (network && (!chanelData || ret == -1 || ret === 0)) {
                $.ajax({
                    url: url,
                    dataType: 'text',
                    async: false,
                    success: function (res) {
                        //假设数据长度少于10，可以当作无数据
                        if (res && res.length > 10) {
                            try {
                                chanelData = eval('(' + res + ')');
                                api.FileSystem.createFile(res, filePath);

                                //以下是为了兼容旧版(1.0)的频道数据
                                var channelJs = 'var DBVJsonInfo=' + res,
                                    savePath = '/storage/storage0/hotel/channel.js';
                                api.FileSystem.createFile(channelJs, savePath);

                            } catch (e) {
                                util.log('读取频道文件失败');
                            }
                        }
                    }
                });
                //如果本地文件存在，异步读数据更新本地文件
            } else if (network && chanelData) {
                $.get(url, function (res) {
                    if (res && res.length > 10) {
                        api.FileSystem.createFile(res, filePath);

                        //以下是为了兼容旧版(1.0)的频道数据
                        var channelJs = 'var DBVJsonInfo=' + res,
                            savePath = '/storage/storage0/hotel/channel.js';
                        api.FileSystem.createFile(channelJs, savePath);
                    }
                });
            }
            return chanelData;
        },
        /**
         * 把原始数据转换成适合页面排版的格式, 私有
         * @param data
         * @param zone
         * @returns {*}
         */
        parseChannel: function (data, zone) {
            var result = [], self = this;
            if (data && !data.ServiceInfo) {
                return result;
            }
            //没有分组信息
            if ($.isEmptyObject(data.ServiceGroupInfo)) {
                var groupItem, tsInfo = {}, item = {};
                groupItem = {
                    GroupName: '电视频道',
                    GroupEnglishName: 'Channel',
                    GroupServices: []
                };

                result.GroupServices = [];
                $.each(data.ServiceInfo.ServiceArray || [], function (i, n) {
                    tsInfo = self.getTsInfoByTsId(data.ServiceInfo.TsInfoArray, n.TsId || {});
                    n.ProgramNumber = n.ServiceId;
                    n.VideoPID = n.VideoPid;
                    n.AudioPID = n.AudioArray[0].AudioPid;
                    item = $.extend(n, tsInfo);
                    groupItem.GroupServices.push(item);
                });
                groupItem.GroupServices.sort(function (a, b) {
                    return a.ServiceHandle - b.ServiceHandle;
                });
                result.push(groupItem);

            } else { //有分组
                var groupData = [];
                if (zone) {
                    if (data.ServiceGroupInfo[zone]) {
                        groupData = data.ServiceGroupInfo[zone].DVBGroupArray || [];
                    } else {
                        groupData = data.DefaultServiceGroupInfo ? (data.DefaultServiceGroupInfo.DVBGroupArray || []) : [];
                    }
                } else {
                    groupData = data.DefaultServiceGroupInfo ? (data.DefaultServiceGroupInfo.DVBGroupArray || []) : [];
                }

                $.each(groupData, function (i, n) {
                    var groupItem = {
                        GroupName: n.GroupName,
                        GroupEnglishName: n.GroupEnglishName,
                        GroupServices: []
                    };
                    $.each(n.GroupServices, function (j, m) {
                        var serviceInfo = self.getServiceInfoByHandle(data.ServiceInfo.ServiceArray, m.ServiceHandle);
                        serviceInfo.ProgramNumber = serviceInfo.ServiceId;
                        serviceInfo.VideoPID = serviceInfo.VideoPid;
                        serviceInfo.AudioPID = serviceInfo.AudioArray[0].AudioPid;
                        var TsInfo = self.getTsInfoByTsId(data.ServiceInfo.TsInfoArray, serviceInfo.TsId);
                        var serviceItem = $.extend(serviceInfo, TsInfo);
                        groupItem.GroupServices.push(serviceItem);
                    });
                    groupItem.GroupServices.sort(function (a, b) {
                        return a.ServiceHandle - b.ServiceHandle;
                    });
                    result.push(groupItem);
                });
            }
            return result;
        },
        /**
         * 生成频道数据字典，方便换台时查找
         * @param channelData
         * @returns {*}
         */
        getMap: function (channelData) {
            var map = {};
            if (!channelData) {
                return null;
            }
            channelData.sort(function (a, b) {
                return a.ServiceHandle - b.ServiceHandle;
            });
            $.each(channelData, function (i, n) {
                if (n && n.GroupServices) {
                    $.each(n.GroupServices, function (j, m) {
                        //增加位置标识
                        m.path = [i, j];
                        map[m.ServiceHandle] = m;
                    });
                }
            });
            return map;
        },
        /**
         * 获取频道号数组
         * @param dataMap
         * @returns {*}
         */
        getNumberArray: function (dataMap) {
            var array = $.map(dataMap, function (n, i) {
                return i;
            });

            array.sort(function (a, b) {
                return a - b;
            });

            return array;
        },
        //内部方法
        getTsInfoByTsId: function (data, tsId) {
            var tsInfo = null;
            $.each(data || [], function (i, n) {
                if (n.TsId == tsId) {
                    tsInfo = n;
                    return false;
                }
            });
            return tsInfo;
        },
        //内部方法
        getServiceInfoByHandle: function (data, handle) {
            var info = {};
            $.each(data || [], function (i, n) {
                if (n.ServiceHandle == handle) {
                    info = n;
                    return false;
                }
            });
            return info;
        },
        /**
         * 查找节目指南， ex。 search(sid,callback)  或 search(sid, dateIndex, callback)
         * @param sid
         * @param dateIndex
         * @param callback
         */
        search: function (sid, dateIndex, callback) {
            if (typeof dateIndex == 'function') {
                callback = dateIndex;
                dateIndex = 0;
            }
            api.EPG.search({
                serviceId: sid,
                mask: 2,
                startDate: dateIndex,
                complete: function (msg) {
                    callback && callback(msg);
                }
            });
        },
        /**
         * 查找当前频道正在播放和将要播放的节目
         * @param sid
         * @param callback
         */
        pf: function (sid, callback) {
            api.EPG.search({
                serviceId: sid,
                mask: 1,
                startDate: 0,
                complete: function (msg) {
                    callback && callback(msg);
                }
            });
        },

        /**
         * 保存关机频道
         * @param content 内容，支持json数据
         * @param path 保存文件路径
         */
        saveOffChannel: function (content, path) {
            if (typeof content != 'string') {
                content = JSON.stringify(content);
            }
            api.FileSystem.createFile(content, path);
        },
        /**
         * 获取关机频道
         * @param path
         * @returns {*}
         */
        getOffChannel: function (path) {
            var channel = null;
            api.FileSystem.getFile(path, function (data) {
                if (data) {
                    try {
                        channel = eval('(' + data + ')');
                    } catch (e) {
                        //alert('读取频道文件失败:' + e);
                    }
                }
            });
            return channel;
        },
        /**
         * 获取时移回看频道列表
         * @param model  model模块
         * @param channelMap 经过处理后的GCMS频道列表
         * @param callback
         */
        getPlayBackChannel: function (model, channelMap, callback) {

            model.getChannels({}, {localCache: true}).done(function (data) {
                var channels = data.channel || [], len = channels.length, playBackChannelMap = {};
                $.each(channelMap, function (i, n) {
                    for (var j = 0; j < len; j++) {
                        //优先根据channelId匹配，再到三要素匹配
                        if (channels[j].channelID == n.ChannelId || channels[j].serviceId == n.ServiceId) {
                            n.channelId = channels[j].channelID;
                            n.isStartOver = !!channels[j].isStartOver;
                            n.isTVAnyTime = !!channels[j].isTVAnyTime;
                            playBackChannelMap[i] = n;
                            break;
                        }
                    }
                });
                callback && callback(playBackChannelMap);
            });
        }

    };

    TVUI.Channel = channel;

})(TVUI);
