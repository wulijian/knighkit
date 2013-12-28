if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function(require, exports, module) {
    var subfill = require("../../../../../lib/runtime/subModule/index");
    module.exports = {
        "init": function() {
            return "It's nav/mod1/mod11 !!";
        },
        "render": function(data) {
            return subfill.parse(function anonymous(_data) {
                var htmlCode = "";
                with (_data || {}) {
                    htmlCode += '<link rel="stylesheet" href="E:/works/GitHub/knighkit/test/project/nav/mod1/mod11/index.css"/>\r\nmod11 in /nav/mod1...';
                }
                return htmlCode;
            }, module.id)(data);
        }
    };
});