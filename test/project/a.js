if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function (require, exports, module) {
    require("./index").init();
    module.exports = {
        testindex:function(){
        }
    };
});