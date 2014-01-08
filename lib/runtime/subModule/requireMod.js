if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    var path = require('../path');
    /**
     * 获取 amods 中的模块名称
     * @param curModuleId 当前运行模块
     * @param subModuleDir 子模块
     * @param main 模块主入口
     * @returns {*|XML|string|void}
     */
    var getSubModId = function (curModuleId, subModuleDir, main) {
        if (!!define.amd) { //requirejs的module
            return path.normalize(path.dirname(curModuleId) + '\\' + subModuleDir).replace(/\\/g, '/') + '/' + main;
        }
        return path.resolve(path.dirname(curModuleId), subModuleDir) + '/' + main;
    };

    /**
     * 获取当前要解析的子模块
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
                console.warn("%cModule 【" + subModuleId + "】 is not implemented yet!", "color: blue; font-size:14px");
            }
        } catch (err) {
            console.warn("%cModule 【" + subModuleId + "】 is not implemented yet!", "color: blue; font-size:14px");
        }
    };
});