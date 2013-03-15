/**
 * @date 12-12-10
 * @describe: 生成所有模块
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require('fs');
var path = require('path');
require("consoleplusplus");
var shell = require('shelljs');
var watch = require('watch');

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
    var template = require('../config')().template;
    if (!fs.existsSync(template + '/' + moduleDir)) {
        console.error("No template named: #red{" + moduleDir + "}");
        return;
    }
    try {
        if (fs.statSync(template + '/' + moduleDir).isDirectory()) {
            shell.rm(require('../config')().output + '/' + moduleDir + '/*');
            var ys = require('./modules').generate(template, moduleDir);
            if (ys) {
                require('./moduleTestPage').generate(template, moduleDir);
                if (!!updateCss) {
                    require('./styles').generate(template, moduleDir);
                }
                console.log('\n');
            }
        }
    } catch (error) {
        console.log(error);
    }
};

/**
 * 读取所有模块中的模版，解析后合成模块
 * @param callback
 */
var buildAll = function (callback) {
    var output = require('../config')().output;
    var template = require('../config')().template;
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

/**
 * 编译 不传任何参数编译全部
 * @param templateId 模版名称，如果是字符串代表模版的名称，如果是function 代表callback
 * @param callback
 */
exports.build = function (templateId, callback) {
    if (typeof templateId === 'function' || typeof templateId === 'undefined') {
        buildAll(callback);
    } else if (typeof templateId === 'string') {
        buildModule(templateId);
    } else {
        throw "Illegal arguments." + arguments.toString() + "\n" +
            "Arguments must be templateId{String} or function callback or nothing.";
    }
};

/**
 * 自动编译更新修改的模块
 */
exports.autoBuild = function () {
    var template = require('../config')().template;
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