if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function(require, exports, module) {
    module.exports = {
        "init": function() {
            return "It's great!!";
        },
        "render":         function anonymous(_data) {
            var htmlCode = "";
            with (_data || {}) {
                htmlCode += '<link rel="stylesheet" href="content.css"/>\r\n<div id="content">\r\n    <puzzle data-module="./mod1"></puzzle>\r\n    <puzzle data-module="./mod1"></puzzle>\r\n</div>';
            }
            return htmlCode;
        }
    };
});