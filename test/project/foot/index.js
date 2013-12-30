if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function (require, exports, module) {
    var subModule = require("../../../lib/runtime/subModule/index");

    module.exports = {
        init: function (user) {
            console.log(user,'is loaded foot....');
        },
        render: function (data) {
            return ___template___(data);
        }
    };
});