/**
 * @date 12-12-10
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require('fs');
var tp = require('jstm');
var path = require('path');
require("consoleplusplus");
var config = require('../config')();

var output = config.output,
    testPage = config.testPage;

/**
 * 使用模版中的css html模版，数据，初始化函数，生成测试文件
 * @param filedir 文件夹路径
 * @param value  文件夹名称
 */
exports.generate = function (filedir, value) {
    var renderTestPage = tp.compile(testPage);
    try {
        var realPath = path.resolve(filedir, value);
        var data = require(realPath + '/m.json');
        var moduleDir = output + '/' + value;
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                fs.writeFileSync(
                    moduleDir + '/' + key + '.html',
                    renderTestPage({
                        title: value + '/' + key,
                        data: JSON.stringify(data[key]),
                        moduleId: value,
                        hostPath: require('../ip').address()
                    })
                );
            }
        }
        console.log('testPage success.');
    } catch (err) {
        console.error('fail to generate the testPage for module:' + value);
        console.error('for detail:' + err + '\r\n');
    }
};