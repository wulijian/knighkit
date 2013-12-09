if (typeof define !== "function") {
    var define = require("amdefine")(module);
}
define(function (require, exports, module) {
    if (global.___runtimeCache === undefined) {
        global.___runtimeCache = {};
    }
    exports.add = function (index, val) {
        global.___runtimeCache[index] = val;
    };
    exports.del = function (index) {
        delete global.___runtimeCache[index];
    };
    exports.get = function (index) {
        return global.___runtimeCache[index];
    };
});