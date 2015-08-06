
//TVUI命名空间
var TVUI = (function () {
    return {
        version : '1.2.0',
        //版本号

        uuid : 0,
        //全局唯一id标识，递增

        debug : true
        //debug开关，如果打开，页面支持按键清理缓存，蓝色键刷新，支持 TVUI.Log模版
    };
})();

//阻止按键默认行为
document.onkeyup = document.onkeydown = document.onkeypress = function(){
    return false;
};

//支持CMD方式加载
if (typeof define !== 'undefined') {
    define(function (require, exports, module) {
        module.exports = TVUI;
    });
}
