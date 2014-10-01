/**
 * 自动update时的 data需要从缓存中获取 __kkit__.db
 * 存储每个渲染模块的db可以以生成的唯一id为标准，可以尝试将id放到ac标签上
 */
if (typeof define !== "function") {
    var define = require("amdefine")(module);
}
define(function (require, exports, module) {
    var kkit = require('../kkit');
    if (kkit.get('runtimeCache') === undefined) {
        kkit.exp('runtimeCache', {});
    }
    var db = kkit.get('runtimeCache');
    exports.add = function (index, val) {
        db[index] = val;
    };
    exports.del = function (index) {
        delete db[index];
    };
    exports.get = function (index) {
        return db[index];
    };
    kkit.exp('db', exports);
});