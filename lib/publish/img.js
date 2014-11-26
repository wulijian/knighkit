var path = require('path');
var shell = require('shelljs');
var utils = require('./utils');
require("consoleplusplus");
console.disableTimestamp();

exports.replace = function (m, htmlpath, projectRoot, pageName, baseurl, publishroot) {
    var getSrc = m.match(/(?:\ssrc\s*=\s*)(['"]?)([^'"\s]*)\1/);
    if (getSrc[2].indexOf('http') === 0 ||//网上的资源，直接返回，不处理
        getSrc[2] === '') {//空的图片地址不处理
        return m;
    }
    var imgSrc = path.resolve(path.dirname(htmlpath), getSrc[2].replace(/\?.*/, ''));//处理图片后面加 ?xxx的情况
    shell.cp('-rf', imgSrc, publishroot + '/statics');//拷贝到目标目录
    console.info('#red{[copy files ' + getSrc[2].replace(/\?.*/, '') + ' to /statics.]}\n');
    var md5name = utils.md5file(path.resolve(publishroot + '/statics', path.basename(imgSrc)));//对目标目录的资源名进行md5处理
    return m.replace(getSrc[2], './statics/' + md5name);
};