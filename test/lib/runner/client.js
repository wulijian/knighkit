/**
 * 开发阶段运行时辅助对象
 * 客户端（）browser端更新服务
 */
if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    var socketIOPort = 9529;
    exports.startWatch = function (base) {
        if (typeof io !== 'undefined') {
            var socket = io('http://localhost:' + socketIOPort);
            socket.on('updateTemplate', function (data) {
                var mid=(!!define.amd)?data.fn:(base + '/' + data.fn);
                switch (data.type) {
                    case 'template':
                        var mods = $('ac[mid^="' + mid + '"]');
                        mods.each(function (idx, elem) {
                            require('../runtime/subModule/index').update(elem, {});
                        });
                        break;
                    case 'css':
                        var styles = $('link[href="' + data.fn + '"]');
                        styles.replaceWith(styles);
                        break;
                    case 'js':
                    default :
                        window.location.reload();
                }
            });
        }
    }
});