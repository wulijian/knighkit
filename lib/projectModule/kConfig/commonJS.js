/**
 * commonJS 和 nodejs 都可以加载此模块
 */
(function (window, undefined) {
    var moduleConfigs = {
        "alias": {
            "jquery": "lib/jquery",
            "jsonselect": "lib/jsonselect",
            "underscore": "lib/underscore",
            "tpHelper": "lib/tpHelper"
        },
        "paths": {
            "render": "src/scripts/render",
            "utils": "src/scripts/utils"
        },
        "base": "http://localhost:9527",
        "debug": true
    };

    if (typeof module !== 'undefined' && module.exports !== 'undefined') {
        module.exports = moduleConfigs;
    } else if (typeof define === 'function') {
        define(function () {
            return  moduleConfigs;
        });
    }
})(this);
