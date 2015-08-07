/**
 * ajax 模块，扩展Zepto，暂时不支持jsonp
 *ex：
 * 1) $.ajax(options);
 *
 *    options:{
 *          type: 'GET',
 *          url: '',
 *          data: null,
 *          success: empty,
 *          error: empty,
 *          complete: empty,
 *          timeout: 0,
 *          cache: true,
 *          dataType: 'text',
 *          headers: null,
 *          async: true
 *    }
 *
 *
 * 2) $.get(url [,data] [,callback] [,dataType]);
 * 3) $.post(url [,data] [,callback] [,dataType]);
 * 4) $.getJSON(url [,data] [,callback]);
 * 5) $.getScript(url [,callback]);
 */
(function (TVUI) {
    var util = TVUI.Util,
        $ = TVUI.$,
        name,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/;

    function empty() {
    }


    var accepts = {
        script: 'text/javascript, application/javascript, application/x-javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
    };

    function xmlHttp() {
        return new window.XMLHttpRequest();
    }

    function mimeToDataType(mime) {
        if (mime) mime = mime.split(';', 2)[0];
        return mime && ( mime == htmlType ? 'html' :
                mime == jsonType ? 'json' :
            scriptTypeRE.test(mime) ? 'script' :
                xmlTypeRE.test(mime) && 'xml' ) || 'text';
    }

    function appendQuery(url, query) {
        if (query === '') return url;
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }


    function ajax(options) {

        var settings = $.extend({
            type: 'GET',
            url: '',
            data: null,
            success: empty,
            error: empty,
            complete: empty,
            timeout: 0,
            cache: true,
            dataType: 'text',
            headers: null,
            async: true
        }, options || {});

        var abortTimeout,
            dataType = settings.dataType,
          //  hasPlaceholder = /\?.+=\?/.test(settings.url),
            mime = accepts[dataType],
            headers = { },
            setHeader = function (name, value) {
                headers[name.toLowerCase()] = [name, value];
            },
            xhr = xmlHttp(),
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            nativeSetHeader = xhr.setRequestHeader;

        if ((mime = settings.mimeType || mime)) {
            if (mime.indexOf(',') > -1) {
                mime = mime.split(',', 2)[0];
            }
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }

        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')) {
            setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
        }

        if (settings.headers) {
            for (name in settings.headers) {
                setHeader(name, settings.headers[name]);
            }
        }


        if (typeof settings.data === 'object') {
            settings.data = util.param(settings.data);
        }

        if (settings.data && settings.type.toUpperCase() == 'GET') {
            settings.url = appendQuery(settings.url, settings.data);
            //delete settings.data;
        }

        if (settings.cache === false) {
            settings.url = appendQuery(settings.url, '_=' + (new Date()).getTime());
        }


        xhr.setRequestHeader = setHeader;

        xhr.onreadystatechange = function () {

            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty;
                clearTimeout(abortTimeout);
                var result, error = false;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status === 0 && protocol == 'file:')) {

                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;
                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType == 'script') {
                            eval(result + '');
                        }
                        else if (dataType == 'xml') {
                            result = xhr.responseXML;
                        }
                        else if (dataType == 'json') {
                            result = blankRE.test(result) ? null : JSON.parse(result);
                        }
                    } catch (err) {
                        error = err;
                    }

                    if (error) {
                        settings.error(error, 'parsererror', xhr, settings);
                    }
                    else {
                        settings.success(result, xhr, settings);
                    }
                    settings.complete(xhr.status, xhr, settings);

                } else {
                    settings.error(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings);
                    settings.complete(xhr.status, xhr, settings);
                }
            }

        };

        if (settings.timeout > 0) {
            abortTimeout = setTimeout(function () {
                alert('timeout');
                xhr.onreadystatechange = empty;
                xhr.abort();
                settings.error(null, 'timeout', xhr, settings);
            }, settings.timeout);
        }

        xhr.open(settings.type, settings.url, settings.async, '', '');
        for (name in headers) {
            nativeSetHeader.apply(xhr, headers[name]);
        }


        try {
            xhr.send(settings.data ? settings.data : null);
        } catch (err) {
        }


        return xhr;

    }

    function parseArguments(url, data, success, dataType) {
        if ($.isFunction(data)) {
            dataType = success;
            success = data;
            data = undefined;
        }
        if (!$.isFunction(success)) {
            dataType = success;
            success = undefined;
        }
        return {
            url: url,
            data: data,
            success: success,
            dataType: dataType
        };
    }

    $.extend(TVUI.$,{
        ajax: ajax,
        // url, data, success, dataType
        get: function () {
            return ajax(parseArguments.apply(null, arguments));
        },
        // url, data, success, dataType
        post: function () {
            var options = parseArguments.apply(null, arguments);
            options.type = 'POST';
            return ajax(options);
        },
        // url, data, success
        getJSON: function () {
            var options = parseArguments.apply(null, arguments);
            options.dataType = 'json';
            return ajax(options);
        },
        getScript: function () {
            var options = parseArguments.apply(null, arguments);
            options.dataType = 'script';
            options.cache = false;
            return ajax(options);
        }
    });


})(TVUI);