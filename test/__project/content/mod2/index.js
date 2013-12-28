if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function(require, exports, module) {
    var subfill = require("../../../../lib/runtime/subModule/index");
    module.exports = {
        "init": function() {
            return "It's mod2!!";
        },
        "render": function(data) {
            return subfill.parse(function anonymous(_data) {
                var htmlCode = "";
                with (_data || {}) {
                    htmlCode += '<link rel="stylesheet" href="E:/works/GitHub/knighkit/test/project/content/mod2/mod2.css"/>\r\nmod2....\r\n<div>\r\n    <puzzle data-module="./mod21" data-name="content"></puzzle>\r\n</div>\r\n<puzzle data-module="./mod22" data-async="true"></puzzle>\r\n<puzzle data-module="../mod3" data-name="bottom"></puzzle>\r\nmod2....';
                }
                return htmlCode;
            }, module.id)(data);
        }
    };
});