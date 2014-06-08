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
});