var utils = require('./utils');
var fs = require('fs');
var shell = require('shelljs');
var path = require('path');
var cwd = process.cwd();
require("consoleplusplus");
console.disableTimestamp();
var cleancss = require('clean-css');
var crypto = require('crypto');
var md5;

var allCss = [];
var allCssCode = '';
exports.reset = function () {
    allCss = [];
    allCssCode = '';
};
/**
 * 收集css代码，并拷贝css依赖的图片等资源到statics中
 * @param m link标签的html内容
 * @param cssPath css路径地址
 */
exports.collect = function (m, cssPath, root) {
    var csscode = fs.readFileSync(cssPath, 'utf-8');
    csscode = csscode.replace(utils.regs['url'], function (mu, $1, $2, $3) {
        if ($3 === '' || //空 url 不处理
            $3.indexOf('http') === 0 ) {//网上的资源，直接返回，不处理
            return mu;
        }
        var staticPath = path.resolve(path.dirname(cssPath), $3);
        shell.cp('-rf', staticPath, root + '/statics');//拷贝到目标目录
        console.info('#red{[copy file ' + $3 + ' to /statics.]}\n');
        var md5Name = utils.md5file(root + '/statics/' + path.basename(staticPath));
        return mu.replace($3, '../statics/' + md5Name); //css会被放到static统计的目录中，因此是 ../statics
    });
    allCssCode += csscode;
    allCss.push(m);
};
/**
 * 替换
 */
exports.replace = function (m, htmlpath, projectRoot, pageName, baseurl) {
    if (allCss[allCss.length - 1] === m) {//最后一个link标签
        console.info('#green{[pack css files]}:');
        var mincss = new cleancss().minify(allCssCode);
        md5 = crypto.createHash('md5');
        var cssMd5 = md5.update(mincss)
            .digest('hex')
            .substring(0, 6);
        fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectRoot + '/styles/' + pageName + '_' + cssMd5 + '.css'), mincss);
        allCss.forEach(function (val) {
            console.log(val.match(/(?:\shref\s*=\s*)(['"]?)([^'"\s]*)\1/)[2]);
        });
        console.info('#green{[pack css files done.]}\n');
        return '<link rel="stylesheet" href="' + baseurl + '/styles/' + pageName + '_' + cssMd5 + '.css"/>';
    } else if (m.match(/role\s*=\s*(['"]?)\s*debug\s*\1/) !== null) {//设置为role=debug的标签，删掉
        return '';
    }
    return m;
};
