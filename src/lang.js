TVUI.Lang = {
    zh: {
        T_1 : '确定',
        T_2 : '取消',
        T_3 : '关闭',
        T_4 : '退出',
        T_5 : '播放',
        T_6 : '续播'
    },
    en: {}
};

//提供方法给外部继承
TVUI.Lang.extend = function (lang) {
    Zepto.extend(TVUI.Lang, lang || {});
};
