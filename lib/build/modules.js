/**
 * @date 12-12-10
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */

var fs = require('fs');
var path = require('path');
var tp = require('jstm');
var alterCode = require('./alterCode');
require("consoleplusplus");
var config = require('../config')();

var output = config.output,
    moduleTemplatePath = config.moduleTemplatePath;

var allFilePath = output;
/**
 * 重新创建模块文件夹
 */
exports.reset = function () {
    var exists = fs.existsSync(allFilePath);
    if (!exists) {
        fs.mkdirSync(allFilePath);
    }
    fs.writeFileSync(
        allFilePath + '/modules.js',
        ''
    );
};
/**
 * 获取sourceMap偏移量
 */
var getSourceMapOffset = function () {
    var moduleTemplate = fs.readFileSync(moduleTemplatePath, 'utf-8');
    var preCode = moduleTemplate.split('module.exports')[0];
    var allLines = preCode.split('\r\n');
    var line = allLines.length;
    var pos = allLines[line - 1].length;
    return {
        line: line
    };
};

/**
 * 编译一个模块
 * @param filedir
 * @param value
 * @returns {*}
 */
exports.buildTemplate = function (filedir, value) {
    var templateDir = path.resolve(filedir, value);
    var jsFile = fs.readFileSync(templateDir + '/m.js');
    var render = tp.compileAdaptive(templateDir, 'm');
    var properties = {
        "id": value,
        "render": render,
        "init": 'function init(){' + jsFile.toString() + '}'
    };
    return tp.getTp('html').directCompile(alterCode.moduleCode(properties))({name: value}); //将模块名称传到模块的模板中
};

/**
 * 生成模版的js对象
 * @param filedir 文件夹路径
 * @param value  文件夹名称
 * @return boolean 返回是否成功生成，没生成成功，则不生成相应的css文件和测试用例
 */
exports.generate = function (filedir, value) {
    try {
        console.info('#red{[' + value + ']}#yellow{->}');
        if (!fs.existsSync(output + '/' + value)) {
            fs.mkdirSync(output + '/' + value);
        }
        var modulePath = path.resolve(output + '/' + value + '/' + value);
        fs.writeFileSync(
            modulePath + '.js',
            exports.buildTemplate(filedir, value)
        );
        tp.generateSourceMap(modulePath + '.js', output + '/' + value, function (sourcemap) {
            return sourcemap.offset(getSourceMapOffset()); //处理（代码合并到 moduleTemplate中时）产生的行位移
        });
        console.log('module success.');
        return true;
    } catch (err) {
        console.error('fail to generate the module javascript code for module:' + value +
        '\n' + 'for detail:' + err + '\r\n');
        return false;
    }
};

/**
 * 生成所有模块合并到一起的代码
 */
exports.generateFullModule = function () {
    fs.writeFileSync(
        allFilePath + '/modules.js',
        alterCode.getAllModule()
    );
    console.info('generate #yellow{[full module]} success.\n');
};