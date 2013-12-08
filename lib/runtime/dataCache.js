if (typeof define !== "function") {
    var define = require("amdefine")(module);
}
define(function (require, exports, module) {
    if (global.___runtimeCache === undefined) {
        ___runtimeCache = {};
    }
    exports.add = function (index, val) {
        ___runtimeCache[index] = val;
    };
    exports.del = function (index) {
        delete ___runtimeCache[index];
    };
    exports.get = function (index) {
        return ___runtimeCache[index];
    };
});