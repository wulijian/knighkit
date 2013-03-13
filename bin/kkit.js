/**
 * 命令行调用方式
 * @author KnightWu
 */
var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var shell = require('shelljs');
var tp = require('jstm');
require("consoleplusplus");
var generate = require(path.resolve(__dirname, '../lib/build'));

var cmd = process.cwd();
var setcwdAsTheRootPath = function () {
    var runtimePath = path.resolve(__dirname, '../lib/runtime.json');
    var runtime = require(runtimePath);
    runtime.rootPath = cmd;
    fs.writeFileSync(runtimePath, JSON.stringify(runtime));
};
setcwdAsTheRootPath();

var optimist = require('optimist').
    options('h', {
        alias: 'help'
    }).
    options('?', {
        alias: 'help',
        describe: 'Show all the options!'
    }).
    options('g', {
        alias: 'generate',
        describe: 'Generate the project at {projectPath}.'
    }).
    options('i', {
        alias: 'init',
        describe: 'Init template from testing data.'
    }).
    options('r', {
        alias: 'autoRebuild',
        describe: 'Auto rebuild modified template.'
    }).
    options('s', {
        alias: 'startServer',
        describe: 'start server of [http] or [weinre] or [all].'
    }).
    options('b', {
        alias: 'build',
        describe: 'build all template to output dir.'
    }).
    options('p', {
        alias: 'package',
        describe: 'package all src to [name]||"business". \n' +
            '                     Make sure you\'ve already run build command.'
    });

/**
 * 是否函数
 * @param obj
 * @return {boolean}
 */
var isFunction = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
};
/**
 * 分发命令的类
 * @param optimist
 * @constructor
 */
var Dispatcher = function (optimist) {
    this.optimist = optimist;
};

Dispatcher.prototype = {
    constructor: Dispatcher,
    run: function () {
        var ops = this.optimist.argv;
        for (var type in ops) {
            if (ops.hasOwnProperty(type) && isFunction(Dispatcher.handlers[type])) {
                Dispatcher.handlers[type].bind(this)(ops[type]);
            }
        }
    }
};

/**
 * 命令对应的处理函数
 * @type {{help: Function, generate: Function}}
 */
Dispatcher.handlers = {
    /**
     * 帮助文件
     * @param data
     */
    'help': function (data) {
        if (data) {
            console.log(this.optimist.help());
        }
    },
    /**
     * 调用生成   todo:路径不对
     */
    'generate': function () {
        var currentPath = process.cwd();
        var projectTemplatePath = path.resolve(__dirname, '../lib/projectModule');
        var seajsPluginPath = path.resolve(__dirname, '../node_modules/seajs/dist/sea-debug.js');

        tp.updateHelper(projectTemplatePath + '/lib/tpHelper');
        console.info('UpdatePlugin success.');

        shell.cp('-Rf', seajsPluginPath, projectTemplatePath + '/lib/');
        console.info('Generate seajs plugin success.');

        shell.cp('-Rf', projectTemplatePath + '/*', currentPath);
        console.info('Generate project from projectTemplate success.');
    },

    'init': function (data) {
        console.log(data);
    },

    'autoRebuild': function () {
        generate.autoBuild();
    },

    'startServer': function (data) {
        var start = {
            'http': function () {
                //run local web server
                app.use(express.static(cmd)); //todo:root地址需要整理
                app.listen(9527);
                console.info('start http server at #yellow{http://localhost:9527}');
            },
            'weinre': function () {
                //run weinre at httpPort 10089
                var weinre = path.resolve(__dirname, '../node_modules/weinre');
                var lib = path.join(weinre, 'lib');
                '--httpPort 10089 --boundHost -all-'.split(' ').forEach(function (val) {
                    process.argv.push(val);
                });
                var node_modules = path.join(weinre, 'node_modules');
                require(path.join(node_modules, 'coffee-script'));
                require(path.join(lib, '/cli')).run();
            },
            'all': function () {
                this['http']();
                this['weinre']();
            }
        };
        if (start[data] !== undefined) {
            start[data]();
        } else {
            console.error('Don\'t support server: ' + data);
        }
    },
    'build': function () {
        generate.buildAll();
    },
    'package': function (name) {
        var config = require(cmd + "/kConfig/commonJS");
        var httpReg = /http:\/\/|https:\/\//;
        if (httpReg.test(config.base)) {
            config.base = cmd;
        }
        require('jspacker').pack(
            cmd + "/src/scripts/index",
            cmd + "/dist",
            (name === true) ? "business" : name,
            cmd,
            config
        );
    }
};

/**
 * 执行分发命令
 */
new Dispatcher(optimist).run();


