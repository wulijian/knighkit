if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function (require, exports, module) {
    var dc = require('../../../../lib/runtime/dataCache');
    var subfill = require("../../../../lib/runtime/subModule");

    module.exports = {
        init: function () {
            return "It's mod3!!";
        },
        id: module.id,
        render: function (data) {
            dc.add(module.id, data);
            return ___template___(data); //___template___应该是一个promise对象
        }
    };
});