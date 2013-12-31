if (typeof define !== "function") {
    var define = require("amdefine")(module);
}
define(function (require, exports, module) {
    var glo = {};
    if (typeof window !== 'undefined') {
        glo = window;
    } else {
        glo = global;
    }
    if (glo.___runtimeCache === undefined) {
        glo.___runtimeCache = {};
    }
    exports.add = function (index, val) {
        glo.___runtimeCache[index] = val;
    };
    exports.del = function (index) {
        delete glo.___runtimeCache[index];
    };
    exports.get = function (index) {
        return glo.___runtimeCache[index];
    };
    glo.___db___ = exports;
});