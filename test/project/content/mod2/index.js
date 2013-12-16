if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    var subfill = require("../../../../lib/runtime/subModule");

    module.exports = {
        init: function () {
            return "It's mod2!!";
        },
        render: function (data) {
            return ___template___(data);
        }
    };
});