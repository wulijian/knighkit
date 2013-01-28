/**
 * plugin template
 * @author: Knight
 */
var TemplatePlugin = function (config) {
    this.tp = config.tp;
    this.compile = config.compile;
    this.update = config.update || null;
    this.sourceMap = config.sourceMap || null;
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