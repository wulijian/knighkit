if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function (require, exports, module) {
    var dc = require('../../../../lib/runtime/dataCache');
    var subfill = require("../../../../lib/runtime/subModuleFill");

    module.exports = {
        init: function () {
            return "It's mod1!!";
        },
        id: module.id,
        render: function (data) {
            dc.add(module.id, data);
            return ___template___(data);
        }
    };
});