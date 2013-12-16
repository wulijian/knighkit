if (typeof define !== "function") {
    var define = require("amdefine")(module);
}
define(function (require, exports, module) {
    var q = require('q');
    var path = require('path');
    var fileWalker = require('../fileWalker/index');
    var $ = require('jquery');

    /**
     * 解析静态依赖的子模块，将子模块的渲染结果放到htmlcode中的相应位置，然后渲染数据
     * @param htmlCode 通过 jstm 和数据获取的包含子模板的 html 代码
     * @param subModules 模块依赖的子模块
     * @param defer promise的defer对象
     * @param curModule 当前render模块的路径
     * @returns {Promise<U>} promise，以此解析子模块，将子模块的htmlcode替换到相应位置后，填充到promise
     */
    var fillSyncSub = function (htmlCode, subModules, defer, curModule) {
        var syncSubs = subModules.filter(function (sub) {
            return sub.async === false;
        });
        var syncRender = []; //todo: 不存在同步加载的模块怎么办
        syncSubs.forEach(function (sub) {
            var data = sub.selector;//使用选择器选择的数据
            syncRender.push(
                require(path.resolve(path.dirname(curModule), sub.module) + '/index')//todo:path 需要实现简单的浏览器版本,另外，如果不是相对路径，这里会出错
                    .render(data)
                    .then(function (code) {
                        htmlCode = htmlCode.replace(sub.puz, code);
                        return htmlCode;
                    })
            );
        });
        return q.all(syncRender)
            .then(function () {
                return htmlCode;
            });
    };

    /**
     * 处理异步模块：使用 jquery 替换异步加载模块 todo:循环依赖问题
     * @param htmlCode
     * @param htmlCode 通过 jstm 和数据获取的包含子模板的 html 代码
     * @param subModules 模块依赖的子模块
     * @param defer promise的defer对象
     * @param curModule 当前render模块的路径
     * @returns {Promise<U>} promise，直接返回htmlcode，然后逐步解析子模块，todo:使用jquery选择器替换到dom中的相应位置
     */
    var fillAsyncSub = function (htmlCode, subModules, defer, curModule) {
        defer.resolve(htmlCode);
        var asyncSubs = subModules.filter(function (sub) {
            return sub.async === true;
        });
        asyncSubs.forEach(function (sub) {
            console.log('\r\n\r\ndeal with async modules, use jquery replace the puzzle with render()=>htmlcode as dom elements');
            console.log(sub); //todo: 算一个curModule和subModule组合的字符串当做puzzle的id号，方便jquery查找替换，或者随机算一个id号
//            console.log($(htmlCode).find('[data-module="' + sub.module + '"]'));
        });
        return defer.promise;
    };

    /**
     * 解析此模块依赖的子模块
     * @param htmlCodeFn jstm 产生的纯净的js模板方法
     * @param curModule 当前模块路径，此参数是为了加载模块依赖的子模块（子模块可能会使用相对路径）
     * @returns {Function}
     */
    exports.parse = function (htmlCodeFn, curModule) {
        return function (data) {
            var defer = q.defer();
            var htmlCode = htmlCodeFn(data);
            var subModules = fileWalker.getSubModules(htmlCode);
            return fillSyncSub(htmlCode, subModules, defer, curModule)//同步模块，直接替换原字符串中的匹配部分
                .then(function (htmlcode) {
                    return fillAsyncSub(htmlcode, subModules, defer, curModule); //异步模块，直接展示现在的模块，然后按照优先级渲染模块
                })
        }
    };
});