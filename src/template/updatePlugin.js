/**
 * 更新模板
 * @author: Knight
 */
var path = require('path');
var fs = require('fs');
var info = require('../info');

const projectPath = path.resolve(__dirname, '../../')
    , nodeModulePath = path.resolve(__dirname, '../../node_modules');
var hogan = ['hogan.js/lib/template.js', 'hogan.js/lib/compiler.js'];

var updateHogan = function (to) {
    var code = 'define(function(require, exports, module){\n';
    for (var i = 0; i < hogan.length; i++) {
        code += fs.readFileSync(nodeModulePath + '/' + hogan[i], 'utf-8').toString();
    }
    code += '});\n';
    fs.writeFileSync((to || projectPath) + '/lib/hogan.js', code);
    info.logt('Update hogan.js success.');
};

exports.updatePlugins = function (to) {
    updateHogan(to);
};
