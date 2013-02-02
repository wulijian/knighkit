/**
 * @describe: 编译支持vm后缀的模板
 * @time: 上午9:46
 * @author: Knight
 * @version: 0.0.1
 */
var uglify = require('uglify-js');

module.exports = {
  tp: require('velocity.js'),
  compile: function (filePath, dataProgress) {
    var template = this.tp.Parser.parse(fs.readFileSync(filePath, 'utf-8').toString());
    var ast = JSON.stringify(template);
    var vmTP = 'function TvmT (_data){\n' +
      dataProgress +
      'return (velocity(' + ast + ')).render(_data);\n' +
      '}';
    return  uglify.parse(vmTP);
  }
};
