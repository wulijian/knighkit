/**
 * 开发阶段运行时辅助对象
 * 客户端（）browser端更新服务
 */
if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    require('lib/runtime/subModule/index');//需要预先加载这个模块，否则无法解析加载模块
    var socketIOPort = 9529;
    /**
     * 接受服务端发送的更新请求，更新相应的模块
     * @param base
     */
    var startWatch = function (base) {
        if (typeof io !== 'undefined') {
            var socket = io('http://localhost:' + socketIOPort);
            socket.on('updateTemplate', function (data) {
                var mid = !!define.amd ? data.fn : (base + '/' + data.fn);
                switch (data.type) {
                    case 'template':
                        var mods = $('ac[mid^="' + mid + '"]');
                        mods.each(function (idx, elem) {
                            require('../../runtime/subModule/index').update(elem, {});
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
    };

    /**
     * 根据hash值加载相应的子模块
     * #content 加载content子模块
     */
    var loadmod = (function () {
        var renderthe = function (mod, data) {
            mod.render(data).then(function (ad) {
                $('#test').html(ad.html);
                ad.done();
            });
        };
        var loadjson = !!define.amd ? function (moduledir, runset) {
            require(['text!' + moduledir + '/' + runset[1] + '.json'], function (data) {
                renderthe(mod, data);
            })
        } : function (moduledir,runset) {
            seajs.use([moduledir + '/' + runset[1] + '.json'], function (data) {
                renderthe(mod, data);
            });
        };

        return function (rootname) {
            var hash = window.location.hash.replace('#', '');
            var runset = hash.split('.');
            var moduledir = rootname + '/' + runset[0];
            (!!define.amd ? require : seajs.use)([moduledir + '/index'], function (mod) {
                if (runset[1] === undefined) {
                    renderthe(mod, {b: 3, a: 7});
                } else {
                    loadjson();
                }
            });
        };
    })();

    /**
     * 开始
     * @param rootname
     */
    exports.run = function(rootname){
        loadmod(rootname);
        startWatch();
        window.onhashchange = function () {
            loadmod(rootname);
        };
    };
});