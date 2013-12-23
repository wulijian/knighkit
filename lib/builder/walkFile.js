/**
 * 读取目录树
 */

var fs = require("q-io/fs");
var q = require('q');
var path = require('path');

//读取所有模块中的模版，解析后合成模块
var walkAllModules = function (filedir, pre, visitor) {
    if (!!pre) {
        pre();
    }
    return fs.list(filedir)
        .then(function (files) {
            files.forEach(function (value) {
                var realPath = path.resolve(filedir, value);
                fs.isDirectory(realPath)
                    .then(function (isdir) {
                        if (isdir) {
                            walkAllModules(realPath, function () {
                            }, visitor);
                        }
                    })
            });
            fs.exists(filedir + '/index.js').then(function () {
                visitor(filedir);
            });
        }).fail(function (err) {
            console.log(err);
        });
};

exports.walk = walkAllModules;