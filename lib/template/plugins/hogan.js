/**
 * @describe: 支持mustache模板预编译
 * @time: 上午9:47
 * @author: Knight
 * @version: 0.0.1
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var info = require('../../info');

module.exports = {
  tp: require('hogan.js'),
  compile: function (filePath, dataProgress) {
    var templateCode = fs.readFileSync(filePath, 'utf-8').toString();
    templateCode = templateCode.replace(/"/g, '\\"');
    var template = this.tp.compile(templateCode, {
      asString: true
    });
    var hoganTP = 'function ThoganT (_data){\n' +
      dataProgress +
      'var template = new hogan.Template(' + template + ');\n' +
      'return template.render(_data);\n' +
      '}\n';
    return  uglify.parse(hoganTP);
  },
  update: function (to) {
    var projectPath = path.resolve(__dirname, '../../')
      , nodeModulePath = path.resolve(__dirname, '../../node_modules');
    var hogan = ['hogan.js/lib/template.js'];
    var code = 'define(function(require, exports, module){\n';
    for (var i = 0; i < hogan.length; i++) {
      code += fs.readFileSync(nodeModulePath + '/' + hogan[i], 'utf-8').toString();
    }
    code += '});\n';
    fs.writeFileSync((to || projectPath) + '/lib/hogan.js', code);
    info.logt('Update hogan.js success.');
  }
};
