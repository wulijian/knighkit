var path = require('path');
var utils = require('./utils');
require("consoleplusplus");
var fs = require('fs');
var shell = require('shelljs');
console.disableTimestamp();
var cwd = process.cwd();
var crypto = require('crypto');
var md5;

var config = require(cwd + "/kConfig/configs");
/**
 * 打包js代码，并输出到固定位置
 * @param projectRoot
 * @param pageName
 * @param scriptmain
 */
var packJsCode = function (htmlpath, projectRoot, pageName, scriptmain, baseurl, publishroot) {
    var httpReg = /(http:\/\/.+:[\d]+)|(https:\/\/.+:[\d]+)/;
    var fileReg = /file:[/]+/;
    if (httpReg.test(config.base)) {
        config.base = config.base.replace(httpReg, cwd);
    }
    if (fileReg.test(config.base)) {
        config.base = config.base.replace(fileReg, '');
    }
    require('jspacker').pack(
        path.resolve(cwd, scriptmain),
        path.resolve(cwd, './__publish__/' + projectRoot + '/scripts'),
        pageName,
        cwd,
        config
    );
    var jsMinfilePath = path.resolve(cwd, './__publish__/' + projectRoot + '/scripts/' + pageName + '-min.js');
    var jscode = fs.readFileSync(jsMinfilePath, 'utf-8');
    jscode = jscode.replace(utils.regs['img'], function (m) {//处理js中出现的img标签
        return require('./img').replace(m, htmlpath, projectRoot, pageName, baseurl, publishroot);
    });
    md5 = crypto.createHash('md5');
    var jsMd5 = md5.update(jscode)
        .digest('hex')
        .substring(0, 6);
    shell.rm('-rf', jsMinfilePath);
    if (baseurl === config.serverUrl) { //发布到服务器阶段，删除未压缩的文件
        shell.rm('-rf', path.resolve(cwd, './__publish__/' + projectRoot + '/scripts/' + pageName + '.js'));
    }
    fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectRoot + '/scripts/' + pageName + '_' + jsMd5 + '.js'), jscode);
    return jsMd5;
};

exports.replace = function (m, htmlpath, projectRoot, pageName, baseurl, publishroot) {
    var mainJs = m.match(/seajs.use\((['"]?)([^'"\s]*)\1\)/);
    if (mainJs !== null) { //找到seajs的默认入口，压缩合并，并查找里面的img标签，拷贝图片，并md5
        console.info('#green{[pack js files]}:');
        var charsetm = m.match(/charset=(['"]?)([^'"\s]*)\1/);
        var charset = (charsetm === null) ? (config.scriptCharset || '') : charsetm[2];
        var jsMd5 = packJsCode(htmlpath, projectRoot, pageName, mainJs[2], baseurl, publishroot);
        console.info('#green{[pack js files done.]}\n');
        return '<script type="text/javascript" charset="' + charset
            + '" data-main="' + mainJs[2].replace('.', '')
            + '" src="' + baseurl + '/scripts/' + pageName + '_' + jsMd5 + '.js" async></script>'
    } else if (m.match(/role\s*=\s*(['"]?)\s*debug\s*\1/) !== null) {//设置为role=debug的标签，删掉
        return '';
    }
    return m;
};