/**
 * 自动初始化项目目录和基础库
 * @author KnightWu
 */
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var tp = require('./template');
var info = require('./info');

var projectTemplatePath = path.resolve(__dirname, './projectModule');
var projectPath = path.resolve(__dirname, '../../');
var seajsPluginPath = path.resolve(__dirname, '../node_modules/seajs/dist/sea-debug.js');

tp.updatePlugins(projectTemplatePath);
info.logt('UpdatePlugin success.');

shell.cp('-Rf', seajsPluginPath, projectTemplatePath + '/lib/');
info.logt('Generate seajs plugin success.');

//shell.cp('-Rf', projectTemplatePath + '/*', projectPath);
info.logt('Generate project from projectTemplate success.');



