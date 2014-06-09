/**
 * 读取目录树
 */
var fs = require("fs");
var path = require('path');
var tp = require('jstm');
var MAIN = 'index';
var visiting = []; //计数，用来标示什么时候处理完所有的visitor

var supportedSuffix = tp.getSupportedSuffix();

/**
 * 读取所有模块中的模版，解析后合成模块
 *
 * 注意：顺序判断时，应注意一个文件夹中出现多个主页面的情况如： index.html index.jade，这里默认从数组 supportedSuffix 中找到一个既停止，因此
 * 编译结果和 supportedSuffix 中后缀名的顺序有关，考虑到 index.jade 一般会被某些工具自动编译一个index.html 出来，所以，默认的 supportedSuffix
 * 中的后缀顺序，html 在 jade 之前 [ 'hogan', 'html', 'jade', 'vm' ]，请在加载插件时注意此等情况。
 *
 * @param filedir 根文件路径
 * @param pre 遍历前要做的准备工作
 * @param visitor 遍历到文件后需要做的处理
 * @returns {Array} 返回visitor处理结果的数组
 */
var walkAllModules = function (filedir, pre, visitor) {
    if (!!pre) {
        pre();
    }
    for (var i = 0; i < supportedSuffix.length; i++) {
        if (fs.existsSync(path.resolve(filedir, './' + MAIN + '.' + supportedSuffix[i]))) {
            visiting.push(visitor(filedir));
            break;
        }
    }
    var files = fs.readdirSync(filedir);
    files.forEach(function (value) {
        var suffix = path.extname(value);
        var filename = path.basename(value, suffix);
        if (filename !== MAIN && supportedSuffix.indexOf(suffix.replace(/^\./, '')) !== -1) {
            visiting.push(visitor(filedir + '/' + filename));
        }
        var realPath = path.resolve(filedir, value);
        if (fs.statSync(realPath).isDirectory()) {
            walkAllModules(realPath, pre, visitor);
        }
    });
    return visiting;
};

exports.walk = walkAllModules;