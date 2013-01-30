/**
 * @date 12-12-10
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */

var fs = require('fs');
var path = require('path');
var info = require('../../info');

var config = require('./package.json');
var css = path.resolve(__dirname, config.css);
/**
 * 合成所有模版的css样式文件
 * @param filedir 文件夹路径
 * @param value  文件夹名称
 */
exports.generate = function (filedir, value) {
    try {
        var realPath = path.resolve(filedir, value);
        var cssFile = fs.readFileSync(realPath + '/m.css');
        fs.appendFileSync(
            css,
            cssFile.toString() + '\n'
        );
        info.logt('Append module [' + value + '] style into [' + css+'] success.');
    } catch (err) {
        info.error('fail to generate the module style code for module:' + value);
        info.error('for detail:' + err + '\r\n');
    }
};

/**
 * 清空样式文件
 */
exports.reset = function () {
    fs.writeFileSync(
        css,
        ''
    );
};
