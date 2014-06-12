/**
 * 公用函数
 */
if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
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
    exports.isBrowser = function () {
        return (typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document);
    };

    exports.isWindows = function () {
        if (typeof process !== 'undefined') {
            return process.platform === 'win32';
        } else {
            return (window.navigator.platform === 'Win32');
        }
    };
    /**
     * 如果是server debug 模式，所有模块都使用 require(id, cb)或者seajs.use(id, cb)的形式，不直接require
     * 如果不是server debug 模式，默认认为所有模块已经加载，直接require获取模块对象
     * @type {boolean}
     */
    exports.isDebugMode = function () {
        var isOnServerDebugMode = false;
        if (exports.isBrowser) {
            isOnServerDebugMode = (window.location.port === '9528'); // todo: 9528 从配置中读取
        }
        return isOnServerDebugMode;
    };
});