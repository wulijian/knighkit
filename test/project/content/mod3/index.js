if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function (require, exports, module) {

    module.exports = {
        init: function () {
            return "It's mod3!!";
        },
        render: function (data) {
            return ___template___(data); //___template___应该是一个promise对象
        }
    };
});