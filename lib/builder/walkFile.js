/**
 * 读取目录树
 */

var fs = require("q-io/fs");
//读取所有模块中的模版，解析后合成模块
var walkAllModules = function wallall(filedir, pre, visitor) {
    if (!!pre) {
        pre();
    }
    return fs.read(filedir).then(function (files) {
        files.forEach(function (value) {
            if (fs.isDirectory(value) && fs.exists(value + '/index.js')) {
                wallall();
            }
            visitor(value);
        });
    });
};

exports.walk = walkAllModules;