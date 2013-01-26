/**
 * Created with IntelliJ IDEA.
 * User: Knight
 * Date: 13-1-21
 * Time: 下午12:56
 * To change this template use File | Settings | File Templates.
 */
var TemplatePlugin = function (config) {
    this.tp = config.tp;
    this.compile = config.compile;
    TemplatePlugin.plugins[config.suffix] = this;
};

TemplatePlugin.plugins = {};

TemplatePlugin.prototype = {
    constructor: TemplatePlugin
};

exports.add = function (config) {
    return new TemplatePlugin(config);
};
exports.all = function () {
    return TemplatePlugin.plugins;
};