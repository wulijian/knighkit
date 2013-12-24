/**
 * 读取目录树
 */

var fs = require("fs");
var path = require('path');
var visiting = []; //计数，用来标示什么时候处理完所有的visitor

//读取所有模块中的模版，解析后合成模块
var walkAllModules = function (filedir, pre, visitor, alldone) {
    if (!!pre) {
        pre();
    }
    if (fs.existsSync(path.resolve(filedir, './index.js'))) {
        visiting.push(visitor(filedir));
    }
    var files = fs.readdirSync(filedir);
    files.forEach(function (value) {
        var realPath = path.resolve(filedir, value);
        if (fs.statSync(realPath).isDirectory()) {
            walkAllModules(realPath, pre, visitor);
        }
    });
    return visiting;
};

exports.walk = walkAllModules;