/**
 * @date 13-1-16
 * @describe:
 * @author: wulj
 * @version: 1.0
 */
var tp = require('./KTemplate/kTemplate');
var velocity = require('velocity.js');
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var templatePlugin = require('./templatePlugin');
var templatePluginUpdate = require('./updatePlugin');
var currentTemplate = null;
const TEMPLATENAME = 'm';  //主模版名称

//添加支持html后缀的解析
templatePlugin.add({
    suffix: 'html',
    tp: tp,
    compile: function (filePath, dataProgress) {
        var template = tp.compile(filePath);
        var templateFunc = uglify.parse(template.toString());
        if (dataProgress !== '') {
            templateFunc.body[0].body.unshift(uglify.parse(dataProgress));
        }
        return templateFunc;
    }
});

//添加支持vm后缀的解析
templatePlugin.add({
    suffix: 'vm',
    tp: velocity,
    compile: function (filePath, dataProgress) {
        var template = velocity.Parser.parse(fs.readFileSync(filePath, 'utf-8').toString());
        var ast = JSON.stringify(template);
        var vmTP = 'function TvmT (_data){\n' +
            dataProgress +
            'return (velocity(' + ast + ')).render(_data);\n' +
            '}';
        return  uglify.parse(vmTP);
    }
});

//添加支持vm后缀的解析
templatePlugin.add({
    suffix: 'hogan',
    tp: null,
    compile: function (filePath, dataProgress) {
        var templateCode = fs.readFileSync(filePath, 'utf-8').toString();
        templateCode = templateCode.replace(/"/g, '\\"');
        var template = hogan.compile(templateCode, {
            asString: true
        });

        var hoganTP = 'function ThoganT (_data){\n' +
            dataProgress +
            'var template = new hogan.Template(' + template + ');\n' +
            'return template.render(_data);\n' +
            '}\n';
        return  uglify.parse(hoganTP);
    }
});

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
    var render = tp.compile(filePath, dataProgress);
    currentTemplate = tp.tp;
    return render;
};

/**
 * 解析模版语句
 * @param templatePath 模版路径
 * @return {Function} 返回解析后的函数
 */
exports.compile = function (templatePath) {
    var suffixReg = /.*\.(.*$)/g;
    var suffix = suffixReg.exec(templatePath)[1];
    var tp = templatePlugin.all()[suffix];
    var render = compile(templatePath, tp);
    return new Function('_data', getCodeInFunction(render));
};

/**
 * 解析模版语句，适用于Module模块的生成，自动匹配模版
 * @param templateDir 模版文件夹路径
 * @return {null} 返回解析后的对象
 */
exports.compileModule = function (templateDir) {
    var render = null;
    var allPlugins = templatePlugin.all();
    for (var suffix in allPlugins) {
        var realPath = templateDir + '/' + TEMPLATENAME + '.' + suffix;
        if (allPlugins.hasOwnProperty(suffix) && fs.existsSync(realPath)) {
            render = compile(realPath, allPlugins[suffix]);
        }
    }
    return render;
};

/**
 * 当前模版生成 sourceMap
 * todo:异步执行时可能会有问题
 */
exports.generateSourceMap = function () {
    if (currentTemplate !== null && currentTemplate.generateSourceMap !== undefined) {
        currentTemplate.generateSourceMap.apply(undefined, arguments);
    }
};

/**
 * 增加一种解析模板插件支持
 * @param pluginConfig
 */
exports.addPlugin = function (pluginConfig) {
    templatePlugin.add(pluginConfig);
};

exports.updatePlugins = templatePluginUpdate.updatePlugins;