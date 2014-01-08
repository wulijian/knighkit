/**
 * 该模块负责模块的调度和结果的归纳
 *
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
        requireMod = require('./requireMod'),
        utils = require('./utils');

    var handle = {
        syncPre: function (syncConfs, result) {
            return result;
        },
        asyncPre: function (syncConfs, result) {
            return result;
        },
        resolveSyncWith: function (reducedResult) {
            return {result: reducedResult};
        },
        sync: function (subConf, curMod, mod, subModuleId) {
            return null;
        },
        async: function (subConf, curMod, mod, subModuleId, errhandler) {
            return null;
        },
        findSub: function (result) {
            return [];
        }
    };

    require('setimmediate');

    if (q === null && utils.isBrowser()) {//使用requirejs时，q不是null
        q = Q;
    }

    /**
     * todo:render函数数据来源问题
     * 解析静态依赖的子模块，将子模块的渲染结果放到htmlcode中的相应位置，然后渲染数据
     * @param syncConfs 模块依赖的子模块配置
     * @param defer promise的defer对象
     * @param curMod 当前运行模块的数据
     * @returns {Promise<U>} promise，以此解析子模块，将子模块的htmlcode替换到相应位置后，填充到promise
     */
    var parseSync = function (syncConfs, defer, curMod) {
        curMod.result = handle.syncPre(syncConfs, curMod.result);
        var syncRender = []; //todo: 不存在同步加载的模块怎么办
        syncConfs.forEach(function (subConf) {
            requireMod(curMod.id, subConf.module, function (mod, subModuleId) {
                syncRender.push(handle.sync(subConf, curMod, mod, subModuleId));
            });
        });
        return q.all(syncRender)
            .then(function (reducedSubs) {
                return {
                    result: curMod.result,
                    reducedSubs: reducedSubs
                };
            });
    };

    /**
     * 解析异步模块，将异步模块加载到页面中
     * @param syncConfs 模块依赖的同步子模块
     * @param asyncConfs 模块依赖的异步子模块
     * @param curMod 当前运行的模块
     * @returns {*|Q.Deferred<T>} defer被resolve后，异步模块的加载才会执行
     */
    var resolveAsync = function (syncConfs, asyncConfs, curMod) {
        var asyncReplaceBegin = q.defer();
        var curModule = curMod.id;
        var reducedSubs = curMod.reducedSubs;
        asyncReplaceBegin.promise.then(function (errhandler) {
            setImmediate(function () {
                syncConfs.forEach(function (subConf) {
                    requireMod(curModule, subConf.module, function (mod) {
                        setImmediate(function () {//不阻塞渲染进程
                            mod.init(curModule);
                        });
                    });
                    //todo: 事件支持, ke('submodule').fire('async added', name);
                });

                asyncConfs.forEach(function (subConf) {
                    requireMod(curModule, subConf.module, function (mod, subModuleId) {
                        handle.async(subConf, curMod, mod, subModuleId, errhandler);
                    });
                    //todo: 事件支持, ke('submodule').fire('async added', name);
                });
            });
        }).then(function () {
                setImmediate(function () {
                    reducedSubs.forEach(function (syncsub) {
                        syncsub.done();
                    })
                });
            });
        return asyncReplaceBegin;
    };

    /**
     * todo:render函数数据来源问题
     * 处理异步模块：使用 jquery 替换异步加载模块
     * @param syncConfs 模块依赖的同步子模块
     * @param asyncConfs 模块依赖的异步子模块
     * @param defer promise的defer对象
     * @param curMod 当前运行模块的数据
     * @returns {Promise<U>} promise，直接返回htmlcode，然后逐步解析子模块
     */
    var parseAsync = function (syncConfs, asyncConfs, defer, curMod) {
        curMod.result = handle.asyncPre(asyncConfs, curMod.result);
        defer.resolve(
            utils.mixin(
                {
                    done: function () {
                        resolveAsync(syncConfs, asyncConfs, curMod).resolve(true);
                    },
                    error: function (callback) {
                        resolveAsync(syncConfs, asyncConfs, curMod).promise.fail(function (err) {
                            callback(err);
                        })
                    }
                },
                handle.resolveSyncWith(curMod.result)
            )
        );
        return defer.promise;
    };

    exports.config = function (handler) {
        utils.mixin(handle, handler);
    };

    /**
     * 解析此模块依赖的子模块
     * @param fn jstm 产生的纯净的js模板方法
     * @param curModuleId 当前模块路径，此参数是为了加载模块依赖的子模块（子模块可能会使用相对路径）
     * @returns Function 为了不修改原模板生成代码的形式，采用这种方式，当调用后返回的是一个 Promise
     * Promise  resolve with
     * {
     *  html: htmlCode,  subModule 的html代码
     *  async: asyncReplaceBegin  异步模块开始加载的promise
     * }
     */
    exports.start = function (fn, curModuleId) {
        return function (data) {
            var defer = q.defer();
            var curMod = {
                id: curModuleId,
                result: fn(data)
            };
            var subConfs = handle.findSub(curMod.result);
            var asyncConfs = subConfs.filter(function (subConf) { //处理异步模块
                return subConf.async === "true";
            });
            var syncConfs = subConfs.filter(function (subConf) { //处理异步模块
                return subConf.async !== "true";
            });
            return parseSync(syncConfs, defer, curMod)//同步模块，直接替换原字符串中的匹配部分
                .then(function (synRe) {
                    var curMod = {
                        result: synRe.result,
                        id: curModuleId,
                        reducedSubs: synRe.reducedSubs
                    };
                    return parseAsync(syncConfs, asyncConfs, defer, curMod); //异步模块，直接展示现在的模块，然后按照优先级渲染模块
                })
        }
    };
    (utils.isBrowser() ? window : global).___subModule___ = exports;
});