if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    var path = require('../path');
    var utils = require('../../utils');
    /**
     * 获取 amods 中的模块名称
     * @param curModuleId 当前运行模块
     * @param subModuleDir 子模块
     * @param main 模块主入口
     * @returns {*|XML|string|void}
     */
    var getSubModId = function (curModuleId, subModuleDir, main) {
        if (!!define.amd) { //requirejs的module
            if (utils.isWindows()) {
                return path.normalize(path.dirname(curModuleId) + '\\' + subModuleDir).replace(/\\/g, '/') + '/' + main;
            } else {
                return path.normalize(path.dirname(curModuleId) + '/' + subModuleDir).replace(/\\/g, '/') + '/' + main;
            }
        } else {
            return path.resolve(path.dirname(curModuleId), subModuleDir) + '/' + main;
        }
    };
    /**
     * 检查并应用此模块，如果模块不存在，使用null值调用回调
     * @param mod  模块对象
     * @param id  模块的id
     * @param cb callback
     */
    var checkAndUse = function (mod, id, cb) {
        if (mod !== undefined && mod !== null) {
            cb(mod, id);
        } else {
            cb(null, id);
            console.error("%cModule 【" + id + "】 is not implemented yet!", "color: blue; font-size:14px");
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
        var subModuleId = '';
        if ($.isFunction(subDir)) {
            callback = subDir;
            subModuleId = curId;
        } else {
            subModuleId = getSubModId(curId, subDir, 'index');
        }
        try {
            if (utils.isBrowser() && utils.isDebugMode()) {
                (!!define.amd ? require : seajs.use)([subModuleId], function (_subModule) {
                    checkAndUse(_subModule, subModuleId, callback);
                });
            } else {
                checkAndUse(require(subModuleId), subModuleId, callback);
            }
        } catch (err) {
            if (err.message.indexOf(subDir.replace(/^./, '')) !== -1 && //找不到的是本模块，如果查找其他模块错误，直接抛出异常
                ((!!err.requireType && err.requireType === "notloaded") || // for  requirejs
                    (!!err.code && err.code === 'MODULE_NOT_FOUND'))) {//for  nodejs
                console.error("%cModule 【" + subModuleId + "】 is not implemented yet!", "color: blue; font-size:14px");
            } else {
                throw new Error(err);
            }
        }
    };
});