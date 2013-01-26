/**
 * 模板公共方法
 * @author: Knight
 * @version: 1.0.0
 */
define(function (require, exports, module) {
    var rAmp = /&/g,
        rLt = /</g,
        rGt = />/g,
        rApos = /\'/g,
        rQuot = /\"/g,
        hChars = /[&<>\"\']/;

    var coerceToString = function (val) {
        return String((val === null || val === undefined) ? '' : val);
    };
    /**
     * 编码 html , KTemplate中用到
     * @param str
     * @return {String|XML}
     */
    exports.escape = function (str) {
        str = coerceToString(str);
        return hChars.test(str) ?
            str
                .replace(rAmp, '&amp;')
                .replace(rLt, '&lt;')
                .replace(rGt, '&gt;')
                .replace(rApos, '&#39;')
                .replace(rQuot, '&quot;') :
            str;
    };

    var utils = {};
    ['forEach', 'some', 'every', 'filter', 'map'].forEach(function (fnName) {
        utils[fnName] = function (arr, fn, context) {
            if (!arr || typeof arr == 'string') return arr;
            context = context || this;
            if (arr[fnName]) {
                return arr[fnName](fn, context);
            } else {
                var keys = Object.keys(arr);
                return keys[fnName](function (key) {
                    return fn.call(context, arr[key], key, arr);
                }, context);
            }
        };
    });

    exports.mixin = function mixin(to, from) {
        utils.forEach(from, function (val, key) {
            var toString = {}.toString.call(val);
            if (toString == '[object Array]' || toString == '[object Object]') {
                to[key] = mixin(val, to[key] || {});
            } else {
                to[key] = val;
            }
        });
        return to;
    };
});