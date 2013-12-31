if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function (require, exports, module) {
        module.exports = {
        init: function () {

        },
        render: function (data) {
            return ___template___(data);
        }
    };
});