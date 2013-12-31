/**
 * 运行时深度查找子模块
 * 策略如下：
 * 先找出所有的同步模块，按优先级处理这些同步模块，
 * 当所有的同步模块归纳成html字符串后，
 * 如果用户调用了async的resolve()，开始加载异步模块。
 * 首先加载和本次渲染同级的异步模块，然后是优先级较高的同步模块中的异步模块，依次类推
 * 具体事例：
 *                                        A
 *                    A1(p=0)           A2(p=1)         A3（a）
 *    A11(a)      A12     A13        A21(a)   A22       A31
 *  A111    A121(a) A122                      A221
 *
 *  A代表根模块，分别引用了 A1 A2 A3, A1的优先级是0，A2的优先级是1，A3是异步模块
 *  那么，模块加载顺序如下，用括号括起来的表明一次渲染所需调用的模块：
 *
 *    A(A2 A1 A22 A221 A12 A13 A122)  A会找到所有同步模块，归纳出同步的html代码，展示，resolve后
 *     ↓
 *    A3（A31）                        A3 是 A 的异步子模块，A的同步模块完成后，A3开始加载，同时,A3含有同步模块A31，被同时加载
 *     ↓
 *    A21                             A21 是 A2 的异步子模块，A2比A1的优先级高，所以比A11先执行
 *     ↓
 *    A11（A111）                      A11 是 A1 的异步子模块，含有同步的 A111，同时被解析
 *     ↓
 *    A121                            A121 同样算A1的异步子模块，因为没有设置优先级（p），出现在A11后，所以，优先级比A11低，最后被加载
 *
 */
if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    var q = require('q'),
        path = require('path'),
        $ = require('jquery'),
        find = require('./find'),
        $s = require('../jsonselect'),
        db = require('../dataCache'),
        asyncSubCount = 0;

    require('setimmediate');

    if (q === null && typeof window !== 'undefined') {//使用requirejs时，q不是null
        q = Q;
    }

    var requireMod = function () {
        /**
         * 获取 amods 中的模块名称
         * @param curModule
         * @param subModule
         * @returns {*|XML|string|void}
         */
        var getModId = function (curModule, subModule) {
            if (!!define.amd) { //requirejs的module
                return path.normalize(path.dirname(curModule) + '\\' + subModule).replace(/\\/g, '/') + '/index';
            }
            return path.resolve(path.dirname(curModule), subModule) + '/index';
        };

        /**
         * 获取当前要解析的子模块
         * @param cur 当前模块
         * @param sub 子模块相对路径
         * @param callback 获取后的操作
         */
        return function (cur, sub, callback) {
            var subModuleId = getModId(cur, sub);
            try {
                var subModule = require(subModuleId);
                if (subModule !== undefined && subModule !== null) {
                    callback(subModule);
                } else {
                    console.warn("%cModule 【" + subModuleId + "】 is not implemented yet!", "color: blue; font-size:14px");
                }
            } catch (err) {
                console.warn("%cModule 【" + subModuleId + "】 is not implemented yet!", "color: blue; font-size:14px");
            }
        };
    }();

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
            requireMod(curModule, sub.module, function (mod) {
                var data = (sub.filter === undefined) ?
                    db.get(curModule) :
                    $s.match(
                        sub.filter,
                        db.get(curModule)
                    );
                syncRender.push(
                    mod.render(data || {})
                        .then(function (subModule) {
                            htmlCode = htmlCode.replace(sub.puz, subModule.html);
                            return subModule;
                        })
                );
            });
        });
        return q.all(syncRender)
            .then(function (syncsubs) {
                setImmediate(function () { //不阻塞渲染进程
                    syncsubs.forEach(function (syncsub) {
                        syncsub.async.resolve();
                    })
                });
                return htmlCode;
            });
    };

    /**
     * 解析异步模块，将异步模块加载到页面中
     * @param Subs 异步模块
     * @param curModule 当前运行的模块
     * @returns {*|Q.Deferred<T>} defer被resolve后，异步模块的加载才会执行
     */
    var resolveAsync = function (Subs, curModule) {
        var asyncReplaceBegin = q.defer();
        asyncReplaceBegin.promise.then(function (errhandler) {
            Subs
                .filter(function (sub) { //优先执行同步加载模块的初始化函数
                    return sub.async !== "true";
                })
                .forEach(function (sub) { //使用jquery替换每一个异步返回的内容，注意此时可能代码还没有放到页面上，所以需要异步promise形式
                    requireMod(curModule, sub.module, function (mod) {
                        setImmediate(function () {//不阻塞渲染进程
                            mod.init(curModule);
                        });
                    });
                    //todo: 事件支持, ke('submodule').fire('async added', name);
                });

            Subs
                .filter(function (sub) { //处理异步模块
                    return sub.async === "true";
                })
                .forEach(function (sub) { //使用jquery替换每一个异步返回的内容，注意此时可能代码还没有放到页面上，所以需要异步promise形式
                    requireMod(curModule, sub.module, function (mod) {
                        var data = (sub.filter === undefined) ?
                            db.get(curModule) :
                            $s.match(
                                sub.filter,
                                db.get(curModule)
                            );
                        mod.render(data)
                            .then(function (asubModule) { //runtime, add to dom
                                if ($('#' + sub.id).size() > 0) {
                                    $('#' + sub.id).replaceWith(asubModule.html);
                                    setImmediate(function () {//不阻塞渲染进程
                                        if ($.isFunction(mod.init)) {
                                            mod.init(curModule);
                                        }
                                    });
                                }
                                asubModule.async.resolve();
                            }).fail(function (err) {
                                errhandler(err);
                            });
                    });
                    //todo: 事件支持, ke('submodule').fire('async added', name);
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
     * 处理异步模块：使用 jquery 替换异步加载模块
     * @param htmlCode
     * @param htmlCode 通过 jstm 和数据获取的包含子模板的 html 代码
     * @param subModules 模块依赖的子模块
     * @param defer promise的defer对象
     * @param curModule 当前render模块的路径
     * @returns {Promise<U>} promise，直接返回htmlcode，然后逐步解析子模块
     */
    var parseAsync = function (htmlCode, subModules, defer, curModule) {
        var asyncSubs = subModules.filter(function (sub) {
            return sub.async === "true";
        });
        asyncSubs.forEach(function (sub) {
            htmlCode = addIdTo(sub, htmlCode);
        });
        defer.resolve({html: htmlCode, async: resolveAsync(subModules, curModule)});
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
            var subModules = find.in(htmlCode);//此处不可编译阶段注入：htmlcode可能依赖运行时的数据动态生成
            return parseSync(htmlCode, subModules, defer, curModule)//同步模块，直接替换原字符串中的匹配部分
                .then(function (htmlcode) {
                    return parseAsync(htmlcode, subModules, defer, curModule); //异步模块，直接展示现在的模块，然后按照优先级渲染模块
                })
        }
    };

    var glo;
    if (typeof window !== 'undefined') {
        glo = window;
    } else {
        glo = global;
    }

    glo.___subModule___ = exports;
});