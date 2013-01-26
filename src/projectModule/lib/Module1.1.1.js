/**
 * @date 12-12-12
 * @describe:
 *  简单实现 CommonJS 的 Modules/1.1.1
 *
 * 定义模块
 * math.js
 * define('math', function(require, exports, module) {
 *     exports.add = function(a, b){
 *          return a+b;
 *     }
 * });
 *
 * 调用模块
 * init.js
 * define('init',function(require, exports, module) {
 *     console.log(require('math').add(1,2,));
 * });
 * @author: wulj
 * @version: 1.0
 */


(function (window, undefined) {

    var STATUS = {
        "DEFINED": "The module is just DEFINED",
        "INITIALIZED": "The module is compiled and module.exports is available."
    };

    if (window.define) {
        return;
    }

    function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    }

    var MM = {}; //所有模块的集合
    var parent; //记录当前运行模块
    var entryModuleIdentifier = null; //初始化模块的名称
    var scripts = document.getElementsByTagName('script');   //获取script节点

    for (var i = 0, l = scripts.length; i < l && !entryModuleIdentifier; i++) {
        entryModuleIdentifier = scripts[i].getAttribute('data-main');   //获取初始化模块的名称 即程序入口
    }

    if (!entryModuleIdentifier) {   //入口不存在则抛出异常
        throw new Error('No data-main attribute in script tag.');
    }
    /**
     * require 的实现
     * @param identifier
     * @return {*}
     */
    function require(identifier) {
        if (!MM[identifier]) { //不存在该模块，则抛出异常
            throw new Error('Module ' + identifier + ' is not defined.');
        }
        var foreign = MM[identifier]; //否则，取出该模块
        if (foreign.module.status !== STATUS.INITIALIZED) {  //未初始化
            initializeModule(identifier);   //初始化该模块
        }
        return foreign.module.exports;  //返回模块的exports或其他
    }

    /**
     * 初始化模块
     * @param identifier 模块名
     */
    function initializeModule(identifier) {
        var current = MM[identifier], //获取模块
            module = current.module,
            exports = module.exports,
            factory = module.factory;
        module.parent = parent;//指向初始化时调用当前模块的模块。根据该属性，可以得到模块初始化时的 Call Stack.
        parent = current;
        if (isFunction(factory)) {  //检测模块的工厂方法是否函数
            var ret = factory(
                require,
                exports, //定义模块的exports
                module
            );
            if (ret !== undefined) {
                module.exports = ret;
            }
        } else {  //不是函数 直接返回factory 可以是对象
            module.exports = MM[identifier].factory;
        }
        module.status = STATUS.INITIALIZED;
    }

    /**
     * define ，用来定义模块
     * @param identifier 模块名
     * @param dependences 依赖模块名
     * @param factory  模块的实现
     */
    function define(identifier, dependences, factory) {
        if (MM[identifier]) {  //存在相同名称，抛出错误
            throw new Error('Module ' + identifier + ' has been defined already.');
        }
        if (typeof factory === 'undefined') {
            factory = dependences;
        }
        if (isFunction(factory) || factory === Object(factory)) { //factory不是函数或者对象，抛出异常
            /**
             *
             * @type {{factory: *, module: {id: *, exports: {}}, uri: string, dependencies: Array, parent: {}, factory: *, status: null}}
             */
            MM[identifier] = {  //模块的module属性，记录本模块的重要属性和方法
                module: {
                    id: identifier,
                    exports: {},
                    uri: '',
                    dependencies: [],
                    parent: undefined,
                    factory: factory,
                    status: STATUS.DEFINED
                }
            };
            if (identifier === entryModuleIdentifier) {   //如果此模块名称和初始化名称相同，表明是入口函数，直接执行
                initializeModule(identifier);
            }
        } else {
            throw new Error('factory of module ' + identifier + ' must be an object or a function.');
        }
    }

    window.define = define;
})(window);
