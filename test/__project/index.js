if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function(require, exports, module) {
    var subfill = require("../../lib/runtime/subModule/index");
    module.exports = {
        "init": function() {},
        "render": function(data) {
            return subfill.parse(function anonymous(_data) {
                var htmlCode = "";
                with (_data || {}) {
                    htmlCode += '<!DOCTYPE html>\r\n<html>\r\n<head>\r\n    <title></title>\r\n    <link rel="stylesheet" href="E:/works/GitHub/knighkit/test/project/index.css"/>\r\n</head>\r\n<body>\r\n<a href="./run.html"></a>\r\n<a href="http://github.com/wulijian"></a>\r\n<div class="left">\r\n    <puzzle data-module="./nav" data-new="true"></puzzle>\r\n</div>\r\n<div class="right">\r\n    <img src="E:/works/GitHub/knighkit/test/project/logo.jpg"/>\r\n    <puzzle data-module="./content" data-priority="2"></puzzle>\r\n</div>\r\n<div class="foot">\r\n    <puzzle data-module="./foot" data-priority="1" data-new="false" data-async="true"></puzzle>\r\n</div>\r\n<puzzle data-module="./bottom" data-priority="1" data-new="false" data-async="true"></puzzle>\r\n</body>\r\n</html>';
                }
                return htmlCode;
            }, module.id)(data);
        }
    };
});