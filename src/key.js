/**
 * 按键常量
 * @type {{}}
 */
TVUI.Key = {

    //遥控器按键
    NUM0: 48, //0x0030,  数字键0
    NUM1: 49, //0x0031,  数字键1
    NUM2: 50, //0x0032,  数字键2
    NUM3: 51, //0x0033,  数字键3
    NUM4: 52, //0x0034,  数字键4
    NUM5: 53, //0x0035,  数字键5
    NUM6: 54, //0x0036,  数字键6
    NUM7: 55, //0x0037,  数字键7
    NUM8: 56, //0x0038,  数字键8
    NUM9: 57, //0x0039,  数字键9
    EXIT: 27, //0x0003,  取消/退出键,即CANCEL
    CHANNEL_DOWN: 91, //0x01AC,  遥控器上的频道减少键
    CHANNEL_UP: 93, //0x01AB,  遥控器上的频道增加键
    RED: 320, //0x0193,  遥控器上的功能键COLORED_KEY_0,RocME中代表红色按键
    YELLOW: 322, //0x0194,  遥控器上的功能键COLORED_KEY_1,RocME中代表黄色按键
    BLUE: 323,  //0x0195,  遥控器上的功能键COLORED_KEY_2,RocME中代表蓝色按键
    GREEN: 321,  //0x0196,  遥控器上的功能键COLORED_KEY_3,RocME中代表绿色按键
    EPG: 69, //458   //0x01CA,  遥控器上的节目指南键,预告键,即GUIDE
    INFO: 73,  //0x01C9,  遥控器上的信息键
    MENU: 72,  //0x01D4,  遥控器上的菜单键
    VOLUME_MUTE: 67,   //0x01C1,  遥控器上的静音键
    SELECT: 13,  //0x000D,  遥控器上的确定键,即OK
    VOLUME_DOWN: 45, //0x01C0,  遥控器上音量减小键
    VOLUME_UP: 61, //0x01BF,  遥控器上的音量增大键
    DOWN: 83,  //0x0028,  遥控器上的向下键
    UP: 87,  //0x0026,  遥控器上的向上键
    LEFT: 65,  //0x0025,  遥控器上的向左键
    RIGHT: 68, //0x0027,  遥控器上的向右键
    POWER: 19,  //0xFFFF,  遥控器上的指示关机与开机键
    PAGE_UP: 306, //0x0021,  遥控器上的向上翻页键
    PAGE_DOWN: 307,  //0x0022,  遥控器上的向下翻页键
    TRACK: 86, //0x0197,  遥控器上的声道键,即AUDIO
    LIKE: 76, //0x01CB,  遥控器上的字幕键/频道喜爱键,即TELETEXT
    BACK: 8, //0x0280,  遥控器上的返回键,即TOGGLE
    PROGRAM_LIST: 641, //0x0281,  遥控器上的频道列表键或咨询键,即PROG_LIST
    TV_RADIO: 642, //0x0282,  遥控器上的指示"电视/音频广播"键
    NVOD: 315, //0x0283,  遥控器上的卡信息或点播键,交互键, 即CARD_INFO
    MAIL: 77, //0x0284,  遥控器上的邮件键
    STAR: 318, //星号键
    POUND: 319,  //#键
    INVALID: 90513,  //0x0201,  未知按键码，SMSX自定义
    STATE: 514,   //0x0202,  遥控器上的状态键，SMSX自定义
    DC: 515, //0x0203,  遥控器上的数据广播键，SMSX自定义
    SORT: 516,  //0x0204,  遥控器上的节目分类键，SMSX自定义
    GAME: 517,  //0x0205,  遥控器上的游戏键，SMSX自定义
    LAST_CHANNEL: 314, //0x0208,  遥控器上的电视回看键，SMSX自定义
    PAUSE: 59, //0x0211,  遥控器上的暂停按键，SMSX自定义
    HOMEPAGE: 72, //0x0213,  遥控器上的主页面键，SMSX自定义
    MOSAIC: 532,  //0x0214,  遥控器上的马赛克键，SMSX自定义
    STOCK: 533, //0x0215,  遥控器上的股票键，SMSX自定义
    VIDEO: 313,  //0x0216,  遥控器上的电视键，SMSX自定义
    AUDIO: 535, //0x0217,  遥控器上的广播键，SMSX自定义
    PLAY: 39, //0x0309,  天津项目中代表 :  [播放] 键
    STOP: 47, //0x0306,  天津项目中代表 :  [停止] 键
    FUN1: 518, //0x0206,  天津项目中代表 :  [视讯] 键
    FUN2: 519,  //0x0207,  天津项目中代表 :  [点播] 键
    FUN3: 769, //20769   //0x0301,  天津项目中代表 :  [股票] 键
    FUN4: 770, //20770   //0x0302,  天津项目中代表 :  [信箱] 键
    FUN5: 771, //0x0303,  天津项目中代表 :  [步进] 键
    FUN6: 772,  //0x0304,  天津项目中代表 :  [上一单元] 键
    FUN7: 773,  //0x0305,  天津项目中代表 :  [下一单元] 键
    FUN9: 44, //0x0307,  天津项目中代表 :  [快退] 键
    FUN10: 46, //0x0308,  天津项目中代表 :  [快进] 键
    FUN12: 59,  //0x030A,  天津项目中代表 :  [暂停/时移] 键
    FUN13: 82, //0x030B,  天津项目中代表 :  [录制] 键
    FUN14: 780, //0x030C,  天津项目中代表 :  [ V+/PIP移动 ] 键
    FUN15: 781, //0x030D,  天津项目中代表 :  [ V-/PIP互换 ] 键
    FUN16: 782,  //0x030E,  天津项目中代表 :  [PIP ] 键
    FUN17: 783, //0x030F,  天津项目中代表 :  [预定] 键
    FUN18: 784, //0x0310,  天津项目中代表 :  [全部] 键
    FUN19: 785,  //0x0311,  天津项目中代表 :  [] 键
    FUN20: 319,  //0x0312,  天津项目中代表 :  # 键


    //系统事件
    DVB_SEARCH_FINISH: 10001, // 自动、手动或全频段搜索已完毕
    DVB_SEARCH_FAILED: 10002, // 自动、手动或全频段搜索失败
    DVB_SEARCH_START: 10003, // 开始搜索某个频点
    DVB_SEARCH_SERVICE_READY: 10004, // 在当前频点下,已经搜索到service
    DVB_SEARCH_STOP: 10005,  // 成功终止频道搜索
    DVB_TUNE_SUCCESS: 10031, // 成功锁定频点
    DVB_TUNE_FAILED: 10032, // 锁频失败
    DVB_NIT_CHANGED: 10041, // NIT版本变化
    DVB_NIT_NETWORK_DESCRIPTOR_READY: 10042,  // 已获取到NIT表的某个Network_Descriptor值
    DVB_NIT_TS_DESCRIPTOR_READY: 10043, // 已获取到NIT表的某个Transport_Descriptor值
    DVB_NIT_TABLE_READY: 10044,  // 已获取到整个NIT表内容
    DVB_BAT_BOUQUET_DESCRIPTOR_READY: 10081,  // 已获取到BAT表的某个Bouquet_Descriptor值
    DVB_BAT_TS_DESCRIPTOR_READY: 10082,   // 已获取到BAT表的某个Transport_Descriptor值
    DVB_SDT_SERVICE_DESCRIPTOR_READY: 10091, // 已获取到SDT表的某个Service_Descriptor的值
    DATA_DEL_ALL_SUCC: 10101, // 成功清除A、B、D区中PSI/SI数据
    DATA_DEL_ALL_FAILED: 10102,  // 无法清除A、B、D区中PSI/SI数据
    DATA_DEL_TMP_SUCC: 10103, // 成功清除D区PSI/SI数据
    DATA_DEL_TMP_FAILED: 10104,  // 无法清除D区PSI/SI数据
    DATA_UPDATE_SUCC: 10105,  // 成功用D区更新A区数据
    DATA_UPDATE_FAILED: 10106,  // 无法用D区更新A区数据
    DATA_REVERT_SUCC: 10107,   // 成功用B区更换A区数据
    DATA_REVERT_FAILED: 10108,  // 无法用B区更换A区数据
    DATA_SAVE_SUCC: 10109, // 成功将A区数据写入B区
    DATA_SAVE_FAILED: 10110, // 无法将A区数据写入B区
    DATA_BACKUP_SUCC: 10111,  // 成功将B区数据备份到C区
    DATA_BACKUP_FAILED: 10112,  // 无法将B区数据备份到C区
    DATA_RESTORE_SUCC: 10113, // 成功恢复A、B区数据
    DATA_RESTORE_FAILED: 10114, // 无法恢复A、B区数据
    EPG_SEARCH_SUCC: 10201, // 成功完成EPG搜索
    EPG_SEARCH_STOP_WHEN_RST_TO_MAX: 10202, // 搜索结果达到255个,搜索自动停止
    EPG_SEARCH_TIMEOUT: 10203, // 搜索EPG超时
    EPG_ACTUAL_PF_READY: 10204,  // 当前频点actual PF信息收取完毕.如果当前频道PF信息更新,则会再次发送此消息.
    EPG_OTHER_PF_READY: 10205,  // 当前频点other PF信息收取完毕.
    EPG_ACTUAL_SCHEDULE_READY: 10206,  // 当前频点actual schedule信息收取完毕.
    EPG_OTHER_SCHEDULE_READY: 10207,  // 当前频点other schedule信息收取完毕.
    DVB_EIT_EVENT_DESCRIPTOR_READY: 10208,  // 已获取到EIT表的某个Event_Descriptor的值
    NVOD_REFEVENT_READY: 10221,   // 接收NVOD参考事件成功,如果当前NVOD参考业务PF信息更新,则会再次发送此消息.
    NVOD_REFEVENT_TIMEOUT: 10222, // NVOD参考事件接收超时
    NVOD_TISHIEVENT_READY: 10223,  // 接收NVOD时移事件成功.
    NVOD_TISHIEVENT_TIMEOUT: 10224,  // NVOD时移事件接收超时
    NVOD_TISHIEVENT_END: 10225,   // NVOD时移事件结束
    CA_SMARTCARD_INSERT: 10401,  // 智能卡已插入
    CA_SMARTCARD_EVULSION: 10402, // 智能卡已拔出
    CA_MSG_INFO: 10403,    // CA 的提示信息,为CA指定(CA_INFO)
    CA_MSG_ALARM: 10404, // CA 的警告信息,为CA指定(CA_ALARM)
    CA_MSG_COMMAND: 10405,  // CA 的命令信息,为CA指定(CA_COMMAND)
    CA_MSG_STATUS: 10406,   // CA的状态信息,为CA指定(CA_STATUS)
    NETWORK_CONNECTED: 10501,  // 网线已插上
    NETWORK_DISCONNECTED: 10502,  // 网线已断开
    LAN_NETWORK_CONNECTED: 10503, // LAN模式网络已连接.
    LAN_NETWORK_DISCONNECTED: 10504,  // LAN模式网络已断开.
    LAN_NETWORK_DHCP_ENABLE_SUCCESS: 10508, // DHCP功能启用成功
    LAN_NETWORK_DHCP_ENABLE_TIMEOUT: 10509, // DHCP功能启用超时
    NTPTIME_SYNC_SUCC: 10521, // 网络NTP时间同步成功.
    NTPTIME_SYNC_TIMEOUT: 10522,  // 网络 NTP时间同步超时.
    PING_RESPONSE: 10523,  // PING命令响应.
    IP_UPDATED: 10524,    // IP地址有更新
    WRITE_FLASH_SUCC: 10601, // Flash写入成功
    OTA_FORCE_UPGRADE: 10701,   // OTA强制升级信息
    OTA_MANUAL_UPGRADE: 10702,  // OTA手动升级信息
    OTA_ANALY_UPGRADE_DATA: 10703,  // OTA 获取并分析升级数据
    OTA_ANALY_NIT_SUCCESS: 10704,  // OTA 获取并分析NIT成功
    OTA_ANALY_NIT_FAILED: 10705,  // OTA 获取并分析NIT失败
    OTA_ANALY_PAT_SUCCESS: 10706,  // OTA 获取并分析PAT成功
    OTA_ANALY_PAT_FAILED: 10707,  // OTA 获取并分析PAT失败
    OTA_ANALY_PMT_SUCCESS: 10708,  // OTA 获取并分析PMT成功
    OTA_ANALY_PMT_FAILED: 10709,   // OTA 获取并分析PMT失败
    OTA_BURNING: 10710, // OTA 烧录升级参数到flash
    OTA_BURNING_SUCCESS: 10711,  // OTA 烧录升级参数到flash成功
    OTA_BURNING_FAILED: 10712,  // OTA 烧录升级参数到flash失败
    OTA_UPDATE_SUCCESS: 10713,  // OTA 升级参数获取成功,重启升级
    OTA_NO_UPDGRADE_INFO: 10714,  // 未检测到OTA升级信息
    ORDERD_EVENT_WILL_START: 10801,  // 用户预定的节目将要开始  （该消息在预订节目开始前N分钟触发，N由数据访问接口中的bookedInformTime字段值指定）
    ORDERD_EVENT_START: 10802, // 用户预定的节目开始
    VOD_END_OF_STREAM: 10901,
    VOD_BEGIN_OF_STREAM: 10902,
    VOD_S1_ANNOUNCE_TERMINATE: 10903,
    VOD_C1_ANNOUNCE_TERMINATE: 10904,
    VOD_EXCEPTION: 11000,
    CAEXT_INQUIRE_IPP: 11701, // IPP即时购买提示框
    CAEXT_HIDDEN_PROGRAM: 11702,   // 隐藏节目不能观看的提示框
    VOD_EXTINIT_OVER: 20004,
    EMAIL: 11536,


    //************ 主应用自定义消息 *************
    SEARCH_DEL_TEMP_FAILED: 80001, //删除缓存失败
    SEARCH_FAILED: 80002,  //搜索失败
    SEARCH_STOP: 80012, //成功停止
    SEARCH_SAVE_FAILED: 80006,  //保存失败
    SEARCH_SAVE_SUCC: 80007,  //保存成功
    SEARCH_TUNE_FAILED: 80008, //锁频失败
    SEARCH_TUNE_SUCC: 80009, //锁频成功
    SEARCH_READY: 80010 //搜索到节目
};

//兼容浏览器和机顶盒
if (!window.DataAccess) {
    TVUI.Key.DOWN = 40;
    TVUI.Key.UP = 38;
    TVUI.Key.LEFT = 37;
    TVUI.Key.RIGHT = 39;
    TVUI.Key.BACK = 32;
    TVUI.Key.PAGE_UP = 33;
    TVUI.Key.PAGE_DOWN = 34;
}