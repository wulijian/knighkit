if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function(require, exports, module) {
    var subfill = require("../../../lib/runtime/subModule/index");
    module.exports = {
        "init": function(user) {
            console.log(user, "is loaded foot....");
        },
        "render": function(data) {
            return subfill.parse(function anonymous(_data) {
                var htmlCode = "";
                with (_data || {}) {
                    htmlCode += '<link rel="stylesheet" href="E:/works/GitHub/knighkit/test/project/foot/index.css"/>';
                    for (var i = 1; i < 4; i++) {
                        htmlCode += '\r\n    <puzzle data-module="./mod1" data-async="false"></puzzle>';
                    }
                    htmlCode += "\r\nfoot...";
                }
                return htmlCode;
            }, module.id)(data);
        }
    };
});