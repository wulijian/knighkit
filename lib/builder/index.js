/**
 * @date 12-12-10
 * @describe: 根据模板生成函数，填充到模块主文件的 render 方法上
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require("q-io/fs");
var path = require('path');
var q = require('q');
var uglify = require('uglify-js');
var tp = require('jstm');
var shell = require('shelljs');
var projectRoot = '/';
var extractRoot = '/';
require("consoleplusplus");
console.disableTimestamp();
var walker = require('./walkFile');

var generateOptions = {
    "indent_start": 0,
    "indent_level": 4,
    "quote_keys": true,
    "space_colon": true,
    "ascii_only": false,
    "inline_script": false,
    "width": 80,
    "max_line_len": 32000,
    "beautify": true,
    "source_map": null,
    "bracketize": false,
    "comments": true,
    "semicolons": true
};

var build = function (realPath) {
    var modulename = path.relative(projectRoot, realPath);
    var targetPath = path.resolve(extractRoot, modulename);
    return fs.read(realPath + '/index.js')
        .then(function (code) {
            var render = tp.compileAdaptive(realPath, 'index');
            code = code.replace(
                /___template___/,
                'subfill.parse(' + ((typeof render === 'object') ? render.print_to_string(generateOptions) : render) + ', module.id)' //todo:或者module.path 等等能找到相应模块的就成
            );
            var indexAst = uglify.parse(code, {
                filename: realPath + '/index.js'
            });
            return indexAst.print_to_string(generateOptions);
        })
        .then(function (code) {
            shell.mkdir('-p', targetPath);
            return fs.write(targetPath + '/index.js', code)
                .then(function () {
                    console.info('#yellow{' + modulename + '}', ' done.');
                    return modulename;
                });
        });
};
/**
 * 设置项目根目录，根据此目录，进行项目的编译，将模板文件合并到方法中的 ___template___ 的位置
 * @param __rootPath 本次 build 的根目录
 * @returns {Object} 供链式调用使用的本node对象
 */
var setRoot = function (__rootPath) {
    projectRoot = __rootPath;
    extractRoot = path.resolve(__rootPath, '../__' + path.basename(__rootPath));
    return exports;
};

var buildAll = function (callback) {
    return q.all(walker.walk(
        projectRoot,
        function () { //pre
        },
        function (moduledir) {//build Module，返回promise对象，walkallmodule中使用此来判断是否所有模块构建完成
            return build(moduledir);
        })).then(function(allmods){
            callback(allmods);
        });
};

exports.build = build;
exports.root = setRoot;
exports.buildAll = buildAll;