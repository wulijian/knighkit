/**
 * @date 12-12-10
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */

var fs = require('fs');
var path = require('path');
require("consoleplusplus");
var config = require('../config')();
var cssParse = require('css');
var _$ = require('jsonselect');
var shell = require('shelljs');

var css = config.css;
/**
 * 合成所有模版的css样式文件
 * @param filedir 文件夹路径
 * @param value  文件夹名称
 */
exports.generate = function (filedir, value) {
    try {
        var realPath = path.resolve(filedir, value);
        var cssFile = fs.readFileSync(realPath + '/m.css');
        fs.appendFileSync(
            css,
            cssFile.toString() + '\n'
        );
        copyRelativedImg(realPath, cssFile);
        console.log('style append success.');
    } catch (err) {
        console.error('fail to generate the module style code for module:' + value);
        console.error('for detail:' + err + '\r\n');
    }
};

/**
 * 清空样式文件
 * @realPath css文件所在的真实路径
 * @cssFile css文件的代码
 */
var copyRelativedImg = function (realPath, cssFile) {
    getAllImagesUrls(cssFile, function (imgRelPath) {
        var sPath = path.join(realPath, imgRelPath);
        var targetPath = path.join(path.dirname(css), path.dirname(imgRelPath));
        shell.cp('-rf', sPath, targetPath);
        console.log('copy ', sPath, ' to ', targetPath, " done.");
    });
};


/**
 * 清空样式文件
 * @callback 获取文件名后的回调，function(imgRelPath){}
 * @cssFile css文件的代码
 */
var getAllImagesUrls = function (cssFile, callback) {
    var imgPaths = _$.match('.declarations .value:contains("url(")', cssParse(cssFile.toString()).stylesheet.rules);
    imgPaths.forEach(function (val) {
        var reg = /url\(["']?(.*\.{1}(?:png|gif|jpg|jpeg))["']?\).*/g;
        var filterPath = reg.exec(val);
        if (!!filterPath && filterPath !== null && filterPath.length > 0) {
            var imgRelPath = filterPath[1];
            callback(imgRelPath);
        }
    });
};


/**
 * 清空样式文件
 */
exports.reset = function () {
    fs.writeFileSync(
        css,
        ''
    );
};
