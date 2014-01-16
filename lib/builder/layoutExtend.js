/**
 * @date 12-12-10
 * @describe: 根据模板生成函数，填充到模块主文件的 render 方法上
 * @author: KnightWu
 * @version: 1.0
 */
var nfs = require("fs");
var path = require('path');
var tp = require('jstm');

var findSubModule = require('../runtime/subModule/find');

var EXTENDTAG = 'amod.extend';
var MAIN = 'index';

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
module.exports = function (realPath) {
    var extendedCode, render;
    tp.getSupportedSuffix().forEach(function (suffix) {
        if (nfs.existsSync(realPath + '/' + MAIN + '.' + suffix)) {
            var extendCode = nfs.readFileSync(realPath + '/' + MAIN + '.' + suffix, 'utf-8').toString();
            if (extendCode.trim().indexOf(EXTENDTAG) === 0) {
                var firstline = extendCode.split(/\r?\n/)[0];
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
};
