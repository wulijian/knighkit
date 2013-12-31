if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function (require, exports, module) {
        module.exports = {
        init: function (user) {
            console.log(user,'is loaded nav....');
        },
        render: function (data) {
            return ___template___(data);
        }
    };
});