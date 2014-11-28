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

/**
 * 新建一个模块
 * @param mpath
 * @param suffix
 */
var createModule = function (mpath, suffix) {
    fs.mkdirSync(mpath);
    fs.writeFileSync(mpath + '/data.js', 'module.exports = {};');
    fs.writeFileSync(mpath + '/m.css', '');
    fs.writeFileSync(mpath + '/m.js', '');
    fs.writeFileSync(mpath + '/m' + suffix, '');
    fs.writeFileSync(mpath + '/m.json', '{}');
    console.error("Template created: #red{" + path.basename(mpath) + "}");
};

var buildModule = function (moduleDir, updateCss) {
    var template = require('../config')().template;
    if (path.extname(moduleDir) !== '') { // -b modulename.html .vm .hogan 创建新模块
        var suffix = path.extname(moduleDir);
        var mname = path.basename(moduleDir, suffix);
        var mpath = template + '/' + mname;
        if (fs.existsSync(mpath)) {//已经存在同名的模块
            console.error("Template already existed: #red{" + moduleDir + "}");
        } else {
            createModule(mpath, suffix);
        }
    } else {//编译过程
        try {
            if (fs.statSync(template + '/' + moduleDir).isDirectory()) {
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
            if (!fs.existsSync(template + '/' + moduleDir)) {
                console.error("No template named: #red{" + moduleDir + "}");
            } else {
                console.log(error);
            }
        }
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
            shell.rm('-rf', require('../config')().output);   //一次性清除所有输出
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