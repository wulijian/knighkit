/**
 * @date 12-12-10
 * @describe: 根据模板生成函数，填充到模块主文件的 render 方法上
 * @author: KnightWu
 * @version: 1.0
 */
var afs = require("q-io/fs");
var fs = require("fs");
var path = require('path');
var q = require('q');
var uglify = require('uglify-js');
var shell = require('shelljs');
var tp = require('jstm');
var layoutExtend = require('./layoutExtend');
var uniURL = require('./uniURL');
var watch = require('watch');
var walker = require('./walkFile');
require("consoleplusplus");

var allModuleTp = path.resolve(__dirname, './aModsTp.js');
var defaultIndexSourcePath = path.resolve(__dirname, './defaultIndex.js');
var MAIN = 'index';
var projectRoot = null;
var extractRoot = '/';

console.disableTimestamp();

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
 * todo: 纯子模板（区别于子模块，文件夹里的是子模块），的编译有问题，没有被编译
 * @param realPath 真实路径
 * @returns {IPromise<U>|Promise<U>|JQueryGenericPromise<U>|JQueryPromise<U>}
 */
var buildOne = function (realPath) {
    var modulename = path.relative(projectRoot, realPath);
    var targetPath = path.resolve(extractRoot, modulename);
    return buildM2Code(realPath)
        .then(function (code) {
            shell.mkdir('-p', targetPath);
            return afs.write(targetPath + '/' + MAIN + '.js', code)
                .then(function () {
                    console.info('#yellow{' + modulename + '}', ' done.');
                    return modulename.replace(/\\/g, '/');
                });
        }).fail(function (err) {
            console.error(err);
        });
};
/**
 * debug 服务开启后，根据给定的路径，生成 js 代码。
 * 此方法用于 kkit cli中，注意，在kkit 的cli中，如果发现是
 * @param realPath js代码的路径。
 * @returns {*}
 */
var buildM2Code = function (realPath) {
    var modulename = path.relative(projectRoot, realPath);
    var targetPath = path.resolve(extractRoot, modulename);
    var existIndexSource = realPath + '/' + MAIN + '.js';
    var indexSourcePath = fs.existsSync(existIndexSource) ? existIndexSource : defaultIndexSourcePath;
    return afs.read(indexSourcePath)
        .then(function (code) {
            var render;
            if (!fs.existsSync(realPath)) { //不是文件夹
                render = layoutExtend(realPath) || tp.compileAdaptive(path.dirname(realPath), path.basename(realPath));
            } else {
                render = layoutExtend(realPath) || tp.compileAdaptive(realPath, MAIN);
            }
            var subParser = '___kkit___.parse(' + ((typeof render === 'object') ? render.print_to_string(generateOptions) : render) + ', module.id)';
            subParser = subParser.replace(/\(_data\)[\s]*{/, function ($1) {
                return $1 + 'if(typeof ___kkit___.db!=="undefined"){___kkit___.db.add(module.id, _data);}' //todo:id号相同，但位置可能不同
            });
            code = code.replace(
                /___template___/,
                subParser
            );
            code = uniURL(code, realPath, projectRoot, targetPath); //静态资源路径转换
            var indexAst = uglify.parse(code, {
                filename: realPath + '/' + MAIN + '.js'
            });
            return indexAst.print_to_string(generateOptions);
        }).fail(function (err) {
            console.error(err);
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

/**
 * 编译 projectRoot 文件夹下所有的模块
 * @param callback
 * @returns {*|Q.IPromise<U>|Q.Promise<U>|JQueryGenericPromise<U>|JQueryPromise<U>}
 */
var buildAll = function (callback) {
    return buildinDir(projectRoot)
        .then(function (allmods) {
            return afs.write(extractRoot + '/amods.js',
                tp.compile(allModuleTp, 'html')(allmods))
                .then(function () {
                    callback(allmods);
                });
        });
};

/**
 * 编译 tempPath下的模块，需要先制定rootPath
 * @param tempPath
 * @returns {*|Collection|Q.Promise<T[]>|Server}
 */
var buildinDir = function (tempPath) {
    if (projectRoot === null) {
        throw new Error('Please set projectRoot using method root first.');
    }
    return q.all(
        walker.walk(
            tempPath,
            function () { //pre
            },
            function (moduledir) {//build Module，返回promise对象，walkallmodule中使用此来判断是否所有模块构建完成
                return buildOne(moduledir);
            }
        )
    );
};

/**
 * build文件夹下的模块
 * @param tempPath
 * @param callback
 * @returns {*}
 */
var build = function (tempPath, callback) {
    if (tempPath === projectRoot) {
        return buildAll(callback);
    } else {
        return buildinDir(tempPath);
    }
};

/**
 * build文件夹下的模块
 * @param tempPath
 * @param callback
 * @returns {*}
 */
var autoBuild = function (callback) {
    watch.createMonitor(projectRoot, function (monitor) {
        monitor.on("created", function (f, stat) {
            // Handle file changes
        });
        monitor.on("changed", function (file, curr, prev) {
            buildOne(path.dirname(
                path.resolve(__dirname, file)
            ));
        });
        monitor.on("removed", function (f, stat) {
            // Handle removed files
        });
    });
};

exports.build = build;
exports.builds = buildM2Code;
exports.root = setRoot;
exports.autoBuild = autoBuild;
exports.buildAll = buildAll;