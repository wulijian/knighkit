/**
 * @date 12-12-10
 * @describe: 生成所有模块
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require('fs');
var path = require('path');
require("consoleplusplus");
var config = require('./package.json');
var shell = require('shelljs');
var watch = require('watch');

const template = path.resolve(__dirname, config.template),
    output = path.resolve(__dirname, config.output);

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

var buildModule = function (moduleDir, updateCss) {
    try {
        if (fs.statSync(template + '/' + moduleDir).isDirectory()) {
            if (!config.debug || config.except.indexOf(moduleDir + ',') < 0) {
                shell.rm(output + '/' + moduleDir + '/*');
                var ys = require('./modules').generate(template, moduleDir);
                if (ys) {
                    require('./moduleTestPage').generate(template, moduleDir);
                    if (!!updateCss) {
                        require('./styles').generate(template, moduleDir);
                    }
                    console.log('\n');
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

//读取所有模块中的模版，解析后合成模块
exports.buildAll = function (callback) {
    if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
    }
    walkAllModules(
        template,
        function () {
            require('./styles').reset();
            require('./modules').reset();
        },
        function (moduleDir) {
            buildModule(moduleDir, true)
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

exports.autoBuild = function () {
    watch.createMonitor(template, function (monitor) {
        monitor.on("created", function (f, stat) {
            // Handle file changes
        });
        monitor.on("changed", function (file, curr, prev) {
            var realPath = path.resolve(__dirname, file);
            var moduleDir = path.relative(template, realPath);
            var moduleName = moduleDir.split(path.sep)[0];
            buildModule(moduleName);
        });
        monitor.on("removed", function (f, stat) {
            // Handle removed files
        });
    });
};