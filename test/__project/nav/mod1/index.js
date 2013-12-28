if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function(require, exports, module) {
    var subfill = require("../../../../lib/runtime/subModule/index");
    module.exports = {
        "init": function() {
            return "It's nav/mod1 !!";
        },
        "render": function(data) {
            return subfill.parse(function anonymous(_data) {
                var htmlCode = "";
                with (_data || {}) {
                    htmlCode += '<link rel="stylesheet" href="E:/works/GitHub/knighkit/test/project/nav/mod1/index.css"/>\r\n<puzzle data-module="./mod11" data-async="true" data-priority="1"></puzzle>\r\nmod1 in /nav...\r\n<puzzle data-module="./mod12" data-async="true" data-priority="3"></puzzle>';
                }
                return htmlCode;
            }, module.id)(data);
        }
    };
});