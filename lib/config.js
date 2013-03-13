/**
 * 管理读取配置文件
 */
var path = require('path');
var configs = null;
module.exports = function () {
    if (configs === null) {
        configs = require(path.resolve(require('./runtime').rootPath, 'kConfig/build'));
    }
    return {
        output: path.resolve(configs.base, configs.output),
        template: path.resolve(configs.base, configs.template),
        moduleTemplatePath: path.resolve(configs.base, configs.buildTemplate, './moduleTemplate.js'),
        moduleObject: path.resolve(configs.base, configs.buildTemplate, './moduleObject.js'),
        allModuleTemplate: path.resolve(configs.base, configs.buildTemplate, './allModuleTp.js'),
        testPage: path.resolve(configs.base, configs.buildTemplate, 'testPageTemplate.html'),
        css: path.resolve(configs.base, configs.cssOutput)
    }
};