/**
 * @date 13-1-16
 * @describe: 管理所有模版的模块
 * 可通过add方法添加模版支持，其中compile部分为预编译阶段，update为更新模版的渲染模块到项目的lib中
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var templatePlugin = require('./templatePlugin');
const TEMPLATENAME = 'm';  //主模版名称
var info = require('../info');
var currentTemplatePlugin = null;

/**
 * 加载所有插件
 * @param pluginsPath
 */
var loadPlugins = function (pluginsPath) {
    var plugins = fs.readdirSync(pluginsPath);
    plugins.forEach(function (pluginName) {
        loadPlugin(path.resolve(pluginsPath, './' + pluginName));
    });
};
/**
 * 加载单个插件
 * @param pluginPath 插件路径
 */
var loadPlugin = function (pluginPath) {
    var pluginName = path.basename(pluginPath, '.js');
    var pluginDir = path.dirname(pluginPath);
    var plugin = require(path.resolve(pluginDir, './' + pluginName));
    plugin.suffix = pluginName;
    templatePlugin.add(plugin);
};

loadPlugins(path.resolve(__dirname, './plugins')); //默认加载 todo:以后移动到项目统一加载的位置

/**
 * 获取uglify函数对象中的所有语句
 * @param funObj
 * @return {string}
 */
var getCodeInFunction = function (funObj) {
    var codeArr = funObj.body[0].body;
    var code = '';
    for (var idx = 0; idx < codeArr.length; idx++) {
        code += codeArr[idx].print_to_string() + ';';
    }
    return code;
};

/**
 * 获取数据处理对象的字符串
 * @param realPath
 * @return {*}
 */
var extendDataProgressToData = function (realPath) {
    var templateDir = path.dirname(realPath);
    var dataProgress = null;
    try {
        dataProgress = fs.readFileSync(templateDir + '/data.js', 'utf-8');
    } catch (e) {
    }
    var fragment = '{}';
    try {
        fragment = uglify.parse(dataProgress).body[0].body.right.print_to_string();
    } catch (err) {
    }
    fragment = (fragment === '{}') ? '' : '_data = tools.mixin(_data,' + fragment + ');';
    return fragment;
};

/**
 * 读出文件，根据后缀调用不同方法生成模版
 * @param filePath 模板文件路径
 * @param tp  后缀
 * @return {null}
 */
var compile = function (filePath, tp) {
    var sourceCode = fs.readFileSync(filePath, 'utf-8');
    if (sourceCode.trim() === '') {
        throw new Error('The template [' + filePath + '] is empty');
    }
    var dataProgress = extendDataProgressToData(filePath);
    currentTemplatePlugin = tp;
    return tp.compile(filePath, dataProgress);
};

module.exports={
    loadPlugins : loadPlugins,
    loadPlugin : loadPlugin,
    /**
     * 增加一种解析模板插件支持
     * @param pluginConfig
     */
    addPlugin : function (pluginConfig) {
        templatePlugin.add(pluginConfig);
    },
    /**
     * update all plugins that will be used in the project lib for template render.
     * @param to  the file update to {to} dir
     */
    updatePluginExternalApi : function (to) {
        var allPlugins = templatePlugin.all();
        for (var type in allPlugins) {
            if (allPlugins.hasOwnProperty(type) && allPlugins[type].update !== null) {
                allPlugins[type].update(to);
            }
        }
    },
    /**
     * 当前模版生成 sourceMap
     * todo:异步执行时可能会有问题
     */
    generateSourceMap : function () {
        if (currentTemplatePlugin.sourceMap !== null) {
            currentTemplatePlugin.sourceMap.apply(currentTemplatePlugin, arguments);
        }
    },
    /**
     * 解析模版语句
     * @param templatePath 模版路径
     * @return {Function} 返回解析后的函数
     */
    compile : function (templatePath) {
        var suffixReg = /.*\.(.*$)/g;
        var suffix = suffixReg.exec(templatePath)[1];
        var tp = templatePlugin.all()[suffix];
        var render = compile(templatePath, tp);
        return new Function('_data', getCodeInFunction(render));
    },
    /**
     * 解析模版语句，适用于Module模块的生成，自动匹配模版
     * @param templateDir 模版文件夹路径
     * @return {null} 返回解析后的对象
     */
    compileModule : function (templateDir) {
        var render = null;
        var allPlugins = templatePlugin.all();
        for (var suffix in allPlugins) {
            var realPath = templateDir + '/' + TEMPLATENAME + '.' + suffix;
            if (allPlugins.hasOwnProperty(suffix) && fs.existsSync(realPath)) {
                render = compile(realPath, allPlugins[suffix]);
            }
        }
        return render;
    }
};