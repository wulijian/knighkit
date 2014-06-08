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