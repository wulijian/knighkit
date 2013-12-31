if (typeof define !== "function") {
    var define = require("amdefine")(module);
}
define(function (require, exports, module) {
    var glo = (typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document) ? window : global;
    if (glo.___runtimeCache___ === undefined) {
        glo.___runtimeCache___ = {};
    }
    var db = glo.___runtimeCache___;
    exports.add = function (index, val) {
        db[index] = val;
    };
    exports.del = function (index) {
        delete db[index];
    };
    exports.get = function (index) {
        return db[index];
    };
    glo.___db___ = exports;
});