if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
        module.exports = {
        init: function () {
            return "It's mod21 !!";
        },
        render: function (data) {
            return ___template___(data);
        }
    };
});