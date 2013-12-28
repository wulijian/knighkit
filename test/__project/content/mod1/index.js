if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function(require, exports, module) {
    var subfill = require("../../../../lib/runtime/subModule/index");
    module.exports = {
        "init": function() {
            return "It's mod1!!";
        },
        "render": function(data) {
            return subfill.parse(function anonymous(_data) {
                var htmlCode = "";
                with (_data || {}) {
                    htmlCode += '<link rel="stylesheet" href="E:/works/GitHub/knighkit/test/project/content/mod1/mod1.css"/>\r\nmod1...\r\n<puzzle data-module="../mod3"></puzzle>\r\nmod1...';
                }
                return htmlCode;
            }, module.id)(data);
        }
    };
});