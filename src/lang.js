TVUI.Lang = {
    zh: {
        T_1 : '确定',
        T_2 : '取消',
        T_3 : '关闭',
        T_4 : '退出',
        T_5 : '播放',
        T_6 : '续播',
        T_7:'锁频失败',
        T_8:'无法在当前频点找到节目描述信息,请联系客服96956.',
        T_9:'不可用媒资',
        T_10:'网络繁忙，请稍候!',
        T_11:'无权限操作',
        T_12:'推流会话中断,请联系客服电话96956,错误码:C1-10909-',
        T_13:'点播失败,是否重新点播?',
        T_14:'点播会话中断,请联系客服电话96956,错误码:S1-10904-',
        T_15:'提示'
    },
    en: {
        T_1 : 'OK',
        T_2 : 'Cancel',
        T_3 : 'Close',
        T_4 : 'Exit',
        T_5 : 'Play',
        T_6 : 'Resume',
        T_7:'Locking frequency failed',
        T_8:'Program information in not found , pls call 96956.',
        T_9:'Not available media resources!',
        T_10:'The network is busy, pls wait!',
        T_11:'No permission to operate.',
        T_12:'Flow session is interrupted,pls call 96956, error code:C1-10909-',
        T_13:'On demand failed, whether to replay or not?',
        T_14:'On demand session is interrupted,pls call 96956,error code:S1-10904-',
        T_15:'Prompt'
    }
};

//提供方法给外部继承
TVUI.Lang.extend = function (lang) {
    Zepto.extend(TVUI.Lang, lang || {});
};
