(function (TVUI) {
    var util = TVUI.Util,
        Event = TVUI.Event,
        $ = TVUI.$,
        isShow = false,
        box,
        log = function () {
            var args = util.makeArray(arguments);
            var msg = [];
            $.each(args, function (i, n) {
                if (typeof n == 'object') {
                    try {
                        msg.push(JSON.stringify(n));
                    } catch (e) {
                        msg.push(n);
                    }
                } else {
                    msg.push(n);
                }
            });
            var div = $('<div>').css({
                "border-bottom": "1px dashed #666",
                "padding": "10px"
            });
            isShow = true;
            div.html(msg.join(" | "));
            if(box) {
                box.show();
                box.append(div);
            }
            util.log.apply(util, arguments);
        };

    //星号键
    Event.onKey(318, function () {
        if(TVUI.debug) {
            isShow = !isShow;
            if (isShow) {
                box.show();
            } else {
                box.hide();
            }
        }
    });

    //信息键，清空log
    Event.onKey(73, function () {
        TVUI.debug && box.empty();
    });

    window.onerror = function () {
        //log.apply(log, arguments);
        // return true;
    };
    TVUI.Log = log;

    $(function(){
        if(TVUI.debug) {
            box = $('#debugbox');
            if (box.length === 0) {
                box = $('<div>').attr('id', 'debugbox');
                box.css({
                    "position": "absolute",
                    "z-index": "9999",
                    "width": "90%",
                    "height": "90%",
                    "background": "#fff",
                    "color": "#000",
                    "left": "50px",
                    "top": "20px",
                    "border": "5px solid red",
                    "font-size": "18px",
                    "word-break": "break-all",
                    "display": "none"
                });
                $('body').append(box);
            }
        }
    });

})(TVUI);



