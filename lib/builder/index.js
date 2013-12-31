/**
 * @date 12-12-10
 * @describe: 根据模板生成函数，填充到模块主文件的 render 方法上
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require("q-io/fs");
var nfs = require("fs");
var path = require('path');
var q = require('q');
var uglify = require('uglify-js');
var shell = require('shelljs');
var tp = require('jstm');
var projectRoot = '/';
var extractRoot = '/';
require("consoleplusplus");
console.disableTimestamp();
var walker = require('./walkFile');
var findSubModule = require('../runtime/subModule/find');
var allModuleTp = path.resolve(__dirname, './aModsTp.js');
var EXTENDTAG = 'amod.extend';
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
 *  .*?非贪婪匹配
 * @param source
 * @returns {*|XML|string|void}
 */
var unicodeSrc = function (source, realpath) {
    var getUniSrc = function ($1, $3) {
        return $1.replace($3, path.resolve(realpath, $3).replace(/\\/g, '/'))
    };
    var srcReg = new RegExp(/src[\s]?=[\s]?(['"]?)(.*?)\1/ig);
    var hrefReg = new RegExp(/link.*?href[\s]?=[\s]?(['"]?)(.*?)\1/ig); //只过滤link中的href，css文件
    return source.replace(srcReg,function ($1, $2, $3) {
        return getUniSrc($1, $3);
    }).replace(hrefReg, function ($1, $2, $3) {
            return getUniSrc($1, $3);
        });
};

var compileLayout = function () {
    var compile = function (realPath, suffix, extendedCode) {
        var tempIndexMod = realPath + '/__' + MAIN + '.' + suffix;
        nfs.writeFileSync(
            tempIndexMod,
            extendedCode
        );
        var render = tp.compileAdaptive(realPath, '__' + MAIN);
        nfs.unlink(tempIndexMod);
        return render;
    };
    /**
     * 预先检测模板是不是extend layout 如果是，编译并当做render结果返回
     * @param realPath 模块路径
     * @returns {*|XML|string|void} 返回字符串或者uglify对象
     */
    return  function (realPath) {
        var extendedCode, render;
        tp.getSupportedSuffix().forEach(function (suffix) {
            if (nfs.existsSync(realPath + '/' + MAIN + '.' + suffix)) {
                var extendCode = nfs.readFileSync(realPath + '/' + MAIN + '.' + suffix, 'utf-8').toString();
                if (extendCode.trim().indexOf(EXTENDTAG) === 0) {
                    var firstline = extendCode.split('\r\n')[0];
                    var layout = firstline.replace(EXTENDTAG, '')
                        .replace(/[\s]*/g, '');
                    var extendSubs = findSubModule.layoutsIn(extendCode);
                    var layoutfrom = path.resolve(realPath, layout) + '/' + MAIN + '.' + suffix;
                    var layoutCode = nfs.readFileSync(layoutfrom, 'utf-8').toString();
                    var layoutSubs = findSubModule.layoutsIn(layoutCode);
                    for (var subName in layoutSubs) {
                        if (layoutSubs.hasOwnProperty(subName)) {
                            extendedCode = layoutCode.replace(
                                new RegExp(layoutSubs[subName].puz, 'g'),
                                extendSubs[subName].puz
                            );
                        }
                    }
                    render = compile(realPath, suffix, extendedCode);
                }
            }
        });
        return render;
    }
}();
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
            var render = compileLayout(realPath) || tp.compileAdaptive(realPath, MAIN);
            var subParser = '___subModule___.parse(' + ((typeof render === 'object') ? render.print_to_string(generateOptions) : render) + ', module.id)';
            subParser = subParser.replace(/\(_data\)[\s]*{/, function ($1) {
                return $1 + 'if(typeof ___db___!=="undefined"){___db___.add(module.id, _data);}'
            });
            code = code.replace(
                /___template___/,
                subParser
            );
            code = unicodeSrc(code, realPath); //静态资源路径转换
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