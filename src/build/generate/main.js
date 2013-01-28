/**
 * @date 12-12-10
 * @describe: 生成所有模块
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require('fs');
var path = require('path');
var info = require('../../info');
var config = require('./package.json');
var shell = require('shelljs');

const template = path.resolve(__dirname, config.template);
var output = path.resolve(__dirname, config.output);

//读取所有模块中的模版，解析后合成模块
var walkAllModules = function (filedir, pre, visitor, callback) {
    if (!!pre) {
        pre();
    }
    var files = fs.readdirSync(filedir);
    files.forEach(function (value) {
        visitor(filedir, value);
    });
    callback();
};

//读取所有模块中的模版，解析后合成模块
exports.initialize = function (callback) {
    shell.rm(output + '/*'); //remove all old files.
    walkAllModules(
        template,
        function () {
            require('./styles').reset();
            require('./modules').reset();
        },
        function (filesDir, moduleDir) {
            try {
                if (fs.statSync(template + '/' + moduleDir).isDirectory()) {
                    if (config.debug && config.except.indexOf(moduleDir + ',') >= 0) {
                        return;
                    } else {
                        var ys = require('./modules').generate(filesDir, moduleDir);
                        if (ys) {
                            require('./moduleTestPage').generate(filesDir, moduleDir);
                            require('./styles').generate(filesDir, moduleDir);
                            info.log('\n');
                        }
                    }
                }
            } catch (error) {
            }
        },
        function () {
            require('./modules').generateFullModule();
            if (!!callback) {
                process.nextTick(function () {
                    callback();
                });
            }
        }
    );
};




