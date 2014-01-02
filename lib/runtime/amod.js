if (typeof define !== "function") {
    var define = require("amdefine")(module);
}
define(function (require, exports, module) {
    var $ = require('jquery'),
        $s = require('./jsonselect'),
        ke = require('../kEvent'),
        db = require('./dataCache');

    /**
     * 处理子模块
     * @param sub  当前要处理的子模块 puzzle 配置
     * @param curModule 调用子模块的模块（当前渲染的模块） id 号
     * @param mod 当前要处理的子模块对象
     * @param subModuleId 当前要处理的子模块对象的id号
     * @returns {*|___template___应该是一个promise对象|str|String}
     */
    var handleSub = function (sub, curModule, mod, subModuleId) {
        var data = (sub.filter === undefined) ?
            db.get(curModule) :
            $s.match(
                sub.filter,
                db.get(curModule)
            );

        return mod.render(data || {}).then(function (subModule) {
            ke('parse').fire('after', subModuleId, curModule, sub, mod, subModule);
            return subModule;
        });
    };

    /**
     * 处理同步的子模块
     * @param sub  当前要处理的子模块 puzzle 配置
     * @param curModule 调用子模块的模块（当前渲染的模块） id 号
     * @param mod 当前要处理的子模块对象
     * @param subModuleId 当前要处理的子模块对象的id号
     * @returns {*|___template___应该是一个promise对象|str|String}
     */
    exports.handleSyncSub = function (sub, curModule, mod, subModuleId) {
        return handleSub(sub, curModule, mod, subModuleId)
            .then(function (subModule) {
                return subModule;
            });
    };

    /**
     * 处理异步的子模块
     * @param sub  当前要处理的子模块 puzzle 配置
     * @param curModule 调用子模块的模块（当前渲染的模块） id 号
     * @param mod 当前要处理的子模块对象
     * @param subModuleId 当前要处理的子模块对象的id号
     * @returns {*|___template___应该是一个promise对象|str|String}
     */
    exports.handleASyncSub = function (sub, curModule, mod, subModuleId) {
        return handleSub(sub, curModule, mod, subModuleId)
            .then(function (asubModule) {
                if ($('#' + sub.id).size() > 0) {
                    $('#' + sub.id).replaceWith(asubModule.html);
                    setImmediate(function () {//不阻塞渲染进程
                        if ($.isFunction(mod.init)) {
                            mod.init(curModule);
                        }
                    });
                }
                return asubModule;
            });
    };
});