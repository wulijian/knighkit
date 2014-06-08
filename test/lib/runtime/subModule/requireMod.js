if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    var path = require('../path');
    var isWindows = true;
    if (typeof process !== 'undefined') {
        isWindows = process.platform === 'win32';
    } else {
        isWindows = (window.navigator.platform === 'Win32');
    }
    /**
     * 获取 amods 中的模块名称
     * @param curModuleId 当前运行模块
     * @param subModuleDir 子模块
     * @param main 模块主入口
     * @returns {*|XML|string|void}
     */
    var getSubModId = function (curModuleId, subModuleDir, main) {
        if (!!define.amd) { //requirejs的module
            if (isWindows) {
                return path.normalize(path.dirname(curModuleId) + '\\' + subModuleDir).replace(/\\/g, '/') + '/' + main;
            } else {
                return path.normalize(path.dirname(curModuleId) + '/' + subModuleDir).replace(/\\/g, '/') + '/' + main;
            }
        } else {
            var subPath = path.resolve(path.dirname(curModuleId), subModuleDir) + '/' + main;
            if (window !== undefined) { //seajs中，需要截掉config中的base， 来自 curModuleId 奇怪的玩意儿
                var baseurl = require('configs').base;
                return subPath.replace(baseurl, '').replace(/^\//, '');
            } else {
                return subPath; //in nodejs
            }
        }
    };

    /**
     * 获取当前要解析的子模块
     * 方法中获取子模块的方式可以是异步的
     * @param curId 当前模块
     * @param subId 子模块相对路径
     * @param callback 获取后的操作
     */
    return function (curId, subDir, callback) {
        var subModuleId = getSubModId(curId, subDir, 'index');
        try {
            var subModule = require(subModuleId);
            if (subModule !== undefined && subModule !== null) {
                callback(subModule, subModuleId);
            } else {
                console.error("%cModule 【" + subModuleId + "】 is not implemented yet!", "color: blue; font-size:14px");//for seajs
            }
        } catch (err) {
            if (!!define.amd) {
                require([subModuleId], function (_subModule) {
                    if (_subModule !== undefined && _subModule !== null) {
                        callback(_subModule, subModuleId);
                    } else {
                        console.error("%cModule 【" + subModuleId + "】 is not implemented yet!", "color: blue; font-size:14px");//for seajs
                    }
                });
            } else if (err.message.indexOf(subDir.replace(/^./, '')) !== -1 && //找不到的是本模块，如果查找其他模块错误，直接抛出异常
                ((!!err.requireType && err.requireType === "notloaded") || // for  requirejs
                    (!!err.code && err.code === 'MODULE_NOT_FOUND'))) {//for  nodejs
                console.error("%cModule 【" + subModuleId + "】 is not implemented yet!", "color: blue; font-size:14px");
            } else {
                throw new Error(err);
            }
        }
    };
});