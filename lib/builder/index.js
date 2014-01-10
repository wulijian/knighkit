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
var shell = require('shelljs');
var tp = require('jstm');
var layoutExtend = require('./layoutExtend');
var uniURL = require('./uniURL');
var projectRoot = '/';
var extractRoot = '/';
require("consoleplusplus");
console.disableTimestamp();
var walker = require('./walkFile');
var allModuleTp = path.resolve(__dirname, './aModsTp.js');
var MAIN = 'index';

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
/**
 * 编译模块
 * @param realPath 真实路径
 * @returns {IPromise<U>|Promise<U>|JQueryGenericPromise<U>|JQueryPromise<U>}
 */
var build = function (realPath) {
    var modulename = path.relative(projectRoot, realPath);
    var targetPath = path.resolve(extractRoot, modulename);
    return fs.read(realPath + '/' + MAIN + '.js')
        .then(function (code) {
            var render = layoutExtend(realPath) || tp.compileAdaptive(realPath, MAIN);
            var subParser = '___subModule___.parse(' + ((typeof render === 'object') ? render.print_to_string(generateOptions) : render) + ', module.id)';
            subParser = subParser.replace(/\(_data\)[\s]*{/, function ($1) {
                return $1 + 'if(typeof ___db___!=="undefined"){___db___.add(module.id, _data);}'
            });
            code = code.replace(
                /___template___/,
                subParser
            );
            code = uniURL(code, realPath, projectRoot,targetPath); //静态资源路径转换
            var indexAst = uglify.parse(code, {
                filename: realPath + '/' + MAIN + '.js'
            });
            return indexAst.print_to_string(generateOptions);
        })
        .then(function (code) {
            shell.mkdir('-p', targetPath);
            return fs.write(targetPath + '/' + MAIN + '.js', code)
                .then(function () {
                    console.info('#yellow{' + modulename + '}', ' done.');
                    return modulename.replace(/\\/g, '/');
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
    return q.all(
            walker.walk(
                projectRoot,
                function () { //pre
                },
                function (moduledir) {//build Module，返回promise对象，walkallmodule中使用此来判断是否所有模块构建完成
                    return build(moduledir);
                }
            )
        )
        .then(function (allmods) {
            return fs.write(
                    extractRoot + '/amods.js',
                    tp.compile(allModuleTp, 'html')(allmods)
                )
                .then(function () {
                    callback(allmods);
                });
        });
};

exports.build = build;
exports.root = setRoot;
exports.buildAll = buildAll;