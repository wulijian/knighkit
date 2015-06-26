/**
 * @date 12-12-10
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */

var fs = require('fs');
var path = require('path');
var tp = require('jstm');
require("consoleplusplus");
var config = require('../config')();
var uglify = require('uglify-js');

var output = config.output;

var allFilePath = output;
/**
 * 重新创建模块文件夹
 */
exports.reset = function () {
    var exists = fs.existsSync(allFilePath);
    if (!exists) {
        fs.mkdirSync(allFilePath);
    }
};
/**
 * debug阶段转换合成以后的js代码中图片和css的路径，将相对于js文件的路径转换为相对于主页的路径
 * 默认.html都是在项目根文件夹下。如果，在模板中创建文件夹，文件夹中含有子模板，子模板中引用的图片的
 * 如：
 * index.html
 * src/template
 *  -a.js  <img src='./b.jpg'>
 *  -b.jpg
 * 转换后：
 *  -a.js  <img src='/src/template/b.jpg'>
 *
 * @param tempName
 * @param code 需处理的代码
 */
var alterSourcePath = function (tempName, code) {
    code = code.replace(/<(img)\s+[\s\S]*?["'\s\w\/]>\s*/ig, function (m) {
        var getSrc = m.match(/(?:\ssrc\s*=\s*)(['"]?)([^'"\s]*)\1/);
        var sourceSrc = getSrc[2];
        if (sourceSrc.indexOf('http') === 0 ||//网上的资源，直接返回，不处理
            sourceSrc === '') {//空的图片地址不处理
            return m;
        }
        var sourceRealPath = '/' + path.join(config.configs.template, tempName, sourceSrc);
        return m.replace(sourceSrc, sourceRealPath.replace(/\\/g, '/'));
    });
    code = code.replace(/<(link)\s+[\s\S]*?["'\s\w\/]>\s*/ig, function (m) {
        var getSrc = m.match(/(?:\shref\s*=\s*)(['"]?)([^'"\s]*)\1/);
        var sourceSrc = getSrc[2];
        if (sourceSrc.indexOf('http') === 0 ||//网上的资源，直接返回，不处理
            sourceSrc === '') {//空的图片地址不处理
            return m;
        }
        var sourceRealPath = '/' + path.join(config.configs.template, tempName, sourceSrc);
        return m.replace(sourceSrc, sourceRealPath.replace(/\\/g, '/'));
    });
    return code;
};

/**
 * 编译一个模块
 * @param filedir
 * @param value
 * @returns {*}
 */
exports.buildTemplate = function (filedir, value) {
    var templateDir = path.resolve(filedir, value);
    var render = tp.compileAdaptive(templateDir, 'm');
    var JsCode = "error";
    if (fs.existsSync(path.join(templateDir, 'index.js'))) { //如果含有index.js 优先使用index方式解析模块
        var tmpIndex = fs.readFileSync(path.join(templateDir, 'index.js'), 'utf-8');
        if (/___template___\((.*)\)/.test(tmpIndex)) {
            var paramOut = tmpIndex.match(/___template___\((.*)\)/)[1];
            var generateOptions = require(path.resolve(require('../runtime').rootPath, 'kConfig/codeStyle.json'));
            var functionBody = /function\s*.*?\{([\s\S]*)\}/;
            var templateCode = 'var _data = ' + paramOut + ';' + render.toString().match(functionBody)[1];
            //模块模版的语法树
            var mtAST = uglify.parse(tmpIndex.replace(/return\s*___template___\((.*)\)/, templateCode));
            JsCode = mtAST.print_to_string(generateOptions);
        }
    } else {
        var jsFile = fs.readFileSync(templateDir + '/m.js');
        var properties = {
            "id": value,
            "render": render,
            "init": 'function init(){' + jsFile.toString() + '}'
        };
        JsCode = tp.getTp('html').directCompile(require('./alterCode').moduleCode(properties))({name: value});
    }
    JsCode = alterSourcePath(value, JsCode); //将模块名称传到模块的模板中
    return JsCode;
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
        console.log('module success.');
        return true;
    } catch (err) {
        console.error('fail to generate the module javascript code for module:' + value +
            '\n' + 'for detail:' + err + '\r\n');
        return false;
    }
};
