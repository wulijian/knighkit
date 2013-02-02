/**
 * @date 12-12-10
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require('fs');
var tp = require('jstm');
var path = require('path');
var info = require('../../info');
var config = require('./package.json');
var os = require('os');

var output = path.resolve(__dirname, config.output),
    templatePage = path.resolve(__dirname, config.templatePage),
    suffix = config.templateSuffix;

/**
 * 获取host地址
 * @return {*|Function|Function|Function|Function}
 */
var getHostUrl = function () {
    var hostIps = os.networkInterfaces();
    for (var host in hostIps) {
        if (hostIps.hasOwnProperty(host)) {
            if (host !== 'Loopback Pseudo-Interface 1' && host !== 'Teredo Tunneling Pseudo-Interface') {
                return hostIps[host][1].address;//本机ip
            }
        }
    }
};
/**
 * 使用模版中的css html模版，数据，初始化函数，生成测试文件
 * @param filedir 文件夹路径
 * @param value  文件夹名称
 */
exports.generate = function (filedir, value) {
    var renderTestPage = tp.compile(templatePage);
    try {
        var realPath = path.resolve(filedir, value);
        var data = require(realPath + '/m.json');
        var moduleDir = output + '/' + value;
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                fs.writeFileSync(
                    moduleDir + '/' + key + suffix,
                    renderTestPage({
                        title: value + '/' + key,
                        data: JSON.stringify(data[key]),
                        moduleId: value,
                        hostPath: getHostUrl()
                    })
                );
            }
        }
        info.logt('generate testPage [' + value + '/' + key + suffix + '] success.');
    } catch (err) {
        info.error('fail to generate the testPage for module:' + value);
        info.error('for detail:' + err + '\r\n');
    }
};