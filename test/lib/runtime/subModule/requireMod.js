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
    var isInBowser = typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document;
    /**
     * 如果是server debug 模式，所有模块都使用 require(id, cb)或者seajs.use(id, cb)的形式，不直接require
     * 如果不是server debug 模式，默认认为所有模块已经加载，直接require获取模块对象
     * @type {boolean}
     */
    var isOnServerDebugMode = false;
    if (isInBowser) {
        isOnServerDebugMode = (window.location.port === '9528'); // todo: 9528 从配置中读取
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
            return path.resolve(path.dirname(curModuleId), subModuleDir) + '/' + main;
        }
    };
    /**
     * 检查并应用此模块
     * @param mod  模块对象
     * @param id  模块的id
     * @param cb callback
     */
    var checkAndUse = function (mod, id, cb) {
        if (mod !== undefined && mod !== null) {
            cb(mod, id);
        } else {
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
        var subModuleId = getSubModId(curId, subDir, 'index');
        try {
            if (isInBowser && isOnServerDebugMode) {
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