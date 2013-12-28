if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function(require, exports, module) {
    var subfill = require("../../../../lib/runtime/subModule/index");
    module.exports = {
        "init": function(user) {
            console.log(user, "is loaded mod1....");
        },
        "render": function(data) {
            return subfill.parse(function anonymous(_data) {
                var htmlCode = "";
                with (_data || {}) {
                    htmlCode += '<link rel="stylesheet" href="E:/works/GitHub/knighkit/test/project/foot/mod1/index.css"/>\r\nmod1 in /foot...';
                }
                return htmlCode;
            }, module.id)(data);
        }
    };
});