/**
 * 读取目录树
 */

var fs = require("q-io/fs");
//读取所有模块中的模版，解析后合成模块
var walkAllModules = function (filedir, pre, visitor, callback) {
    if (!!pre) {
        pre();
    }
    var files = fs.readdirSync(filedir);
    files.forEach(function (value) {
        visitor(value);
    });
    callback();
};

exports.walk = walkAllModules;