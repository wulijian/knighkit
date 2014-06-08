/**
 * 根据模板返回结果，深度查找子模块，并加载到页面上,
 * puzzle标签会保留，用来标记位置，方便每个模块单独 update
 */

if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    var glo = require('./utils').isBrowser() ? window : global;
    if (typeof glo.___kkit___ === 'undefined') {
        glo.___kkit___ = {};
    }

    exports.exp = function (name, value) {
        glo.___kkit___[name] = value;
    };
    exports.get = function (name) {
        return glo.___kkit___[name];
    };

});