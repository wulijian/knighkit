if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function(require, exports, module) {
    var subfill = require("../../../../../lib/runtime/subModule/index");
    module.exports = {
        "init": function() {
            return "It's mod21 !!";
        },
        "render": function(data) {
            return subfill.parse(function anonymous(_data) {
                var htmlCode = "";
                with (_data || {}) {
                    htmlCode += '<link rel="stylesheet" href="E:/works/GitHub/knighkit/test/project/content/mod2/mod21/mod21.css"/>\r\n<div id="do"></div>\r\nmod21....';
                }
                return htmlCode;
            }, module.id)(data);
        }
    };
});