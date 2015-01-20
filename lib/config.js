/**
 * 管理读取配置文件
 */
var path = require('path');
var configs = null;
var rootPath = require('./runtime').rootPath;
module.exports = function () {
    if (configs === null) {
        configs = require(path.resolve(rootPath, 'kConfig/configs'));
    }
    return {
        output: path.resolve(rootPath, configs.output),
        template: path.resolve(rootPath, configs.template),
        moduleTemplatePath: path.resolve(rootPath, configs.buildTemplate, './moduleTemplate.js'),
        moduleObject: path.resolve(rootPath, configs.buildTemplate, './moduleObject.js'),
        allModuleTemplate: path.resolve(rootPath, configs.buildTemplate, './allModuleTp.js'),
        testPage: path.resolve(rootPath, configs.buildTemplate, 'testPageTemplate.html'),
        css: path.resolve(rootPath, configs.cssOutput),
        configs: configs
    }
};