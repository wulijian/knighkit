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
var info = require('../../info');
var config = require('./package.json');
const templateTool = path.resolve(__dirname, config.templateTool),
    moduleTemplatePath = templateTool + '/moduleTemplate.js';

var output = path.resolve(__dirname, config.output);
var allFilePath = output + '/__all';
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
 * 生成模版的js对象
 * @param filedir 文件夹路径
 * @param value  文件夹名称
 * @return boolean 返回是否成功生成，没生成成功，则不生成相应的css文件和测试用例
 */
exports.generate = function (filedir, value) {
    try {
        var templateDir = path.resolve(filedir, value);
        var jsFile = fs.readFileSync(templateDir + '/m.js');
        var render = tp.compileAdaptive(templateDir, 'm');
        info.logt('module [' + value + '] begin to generate：');
        info.log('----------------------------------------------------------->');
        var properties = {
            "id": value,
            "tp": render,
            "init": 'function init(){' + jsFile.toString() + '}'
        };
        var modulePath = path.resolve(output + '/' + value + '/' + value);
        if (!fs.existsSync(output + '/' + value)) {
            fs.mkdirSync(output + '/' + value);
        }
        fs.writeFileSync(
            modulePath + '.js',
            alterCode.moduleCode(properties)
        );
        tp.generateSourceMap(modulePath + '.js', output + '/' + value, function (sourcemap) {
            return sourcemap.offset(getSourceMapOffset()); //处理（代码合并到 moduleTemplate中时）产生的行位移
        });
        info.logt('generate module [' + modulePath + '] success.');
        return true;
    } catch (err) {
        info.error('fail to generate the module javascript code for module:' + value +
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
    info.logt('generate [full module] success.\n');
};