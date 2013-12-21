/**
 * 运行时深度查找子模块，根据子模块设置顺序加载
 */

if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

//todo：模块区分 compile 和 render

define(function (require, exports, module) {
    var q = require('q');
    var path = require('path');
    var find = require('./find');
    var $ = require('jquery');
    var asyncSubCount = 0;
    const MAIN = "/index";

    /**
     * todo:render函数数据来源问题
     * 解析静态依赖的子模块，将子模块的渲染结果放到htmlcode中的相应位置，然后渲染数据
     * @param htmlCode 通过 jstm 和数据获取的包含子模板的 html 代码
     * @param subModules 模块依赖的子模块
     * @param defer promise的defer对象
     * @param curModule 当前render模块的路径
     * @returns {Promise<U>} promise，以此解析子模块，将子模块的htmlcode替换到相应位置后，填充到promise
     */
    var parseSync = function (htmlCode, subModules, defer, curModule) {
        var syncSubs = subModules.filter(function (sub) {
            return sub.async !== "true";
        });
        var syncRender = []; //todo: 不存在同步加载的模块怎么办
        syncSubs.forEach(function (sub) {
            var data = sub.selector;//使用选择器选择的数据
            syncRender.push(require(path.resolve(path.dirname(curModule), sub.module) + MAIN)//todo:path 需要实现简单的浏览器版本,另外，如果不是相对路径，这里会出错
                .render(data)
                .then(function (subModule) {
                    htmlCode = htmlCode.replace(sub.puz, subModule.html);
                    return htmlCode;
                }));
        });
        return q.all(syncRender)
            .then(function () {
                return htmlCode;
            });
    };

    /**
     * 解析异步模块，将异步模块加载到页面中
     * @param asyncSubs 异步模块
     * @param curModule 当前运行的模块
     * @returns {*|Q.Deferred<T>} defer被resolve后，异步模块的加载才会执行
     */
    var resolveAsync = function (asyncSubs, curModule) {
        var asyncReplaceBegin = q.defer();
        asyncReplaceBegin.promise.then(function (errhandler) {
            //被加到dom中，元素已经存在，执行该方法
            asyncSubs.forEach(function (asub) { //使用jquery替换每一个异步返回的内容，注意此时可能代码还没有放到页面上，所以需要异步promise形式
                var subModule = require(path.resolve(path.dirname(curModule), asub.module) + MAIN);//todo:path 需要实现简单的浏览器版本,另外，如果不是相对路径，这里会出错
                subModule.render({})
                    .then(function (asubModule) { //runtime, add to dom
                        if ($('#' + asub.id).size() > 0) {
                            $('#' + asub.id).replace(asubModule.html);
                            if ($.isFunction(subModule.init)) {
                                subModule.init(curModule);
                            }
                            //todo: 事件支持, ke('submodule').fire('async added', name);
                        }
                        asubModule.async.resolve();
                    }).fail(function (err) {
                        errhandler(err);
                    });
            });
        });
        return asyncReplaceBegin;
    };

    /**
     * 预处理，为了提升选择器性能，给每一个puzzle id号
     * @param sub 子模块
     * @param htmlCode 本模块的html代码
     * @returns {*|XML|string|void} html代码
     */
    var addIdTo = function (sub, htmlCode) {
        sub.id = '_puz_' + (+new Date()) + (asyncSubCount++);
        return htmlCode.replace(
            sub.puz,
            sub.puz.replace(/><\/puzzle>/, ' id="' + sub.id + '"></puzzle>')
        );
    };

    /**
     * todo:render函数数据来源问题
     * 处理异步模块：使用 jquery 替换异步加载模块 todo:循环依赖问题
     * @param htmlCode
     * @param htmlCode 通过 jstm 和数据获取的包含子模板的 html 代码
     * @param subModules 模块依赖的子模块
     * @param defer promise的defer对象
     * @param curModule 当前render模块的路径
     * @returns {Promise<U>} promise，直接返回htmlcode，然后逐步解析子模块，todo:使用jquery选择器替换到dom中的相应位置
     */
    var parseAsync = function (htmlCode, subModules, defer, curModule) {
        var asyncSubs = subModules.filter(function (sub) {
            return sub.async === "true";
        });
        asyncSubs.forEach(function (sub) {
            htmlCode = addIdTo(sub, htmlCode);
        });
        defer.resolve({html: htmlCode, async: resolveAsync(asyncSubs, curModule)});
        return defer.promise;
    };

    /**
     * 解析此模块依赖的子模块
     * @param htmlCodeFn jstm 产生的纯净的js模板方法
     * @param curModule 当前模块路径，此参数是为了加载模块依赖的子模块（子模块可能会使用相对路径）
     * @returns Function 为了不修改原模板生成代码的形式，采用这种方式，当调用后返回的是一个 Promise
     * Promise  resolve with
     * {
     *  html: htmlCode,  subModule 的html代码
     *  async: asyncReplaceBegin  异步模块开始加载的promise
     * }
     */
    exports.parse = function (htmlCodeFn, curModule) {
        return function (data) {
            var defer = q.defer();
            var htmlCode = htmlCodeFn(data);
            var subModules = find.in(htmlCode);
            return parseSync(htmlCode, subModules, defer, curModule)//同步模块，直接替换原字符串中的匹配部分
                .then(function (htmlcode) {
                    return parseAsync(htmlcode, subModules, defer, curModule); //异步模块，直接展示现在的模块，然后按照优先级渲染模块
                })
        }
    };
});