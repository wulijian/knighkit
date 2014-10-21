/**
 * 按入口页面输出项目
 */
var path = require('path');
var fs = require('fs');
var shell = require('shelljs');
var cheerio = require('cheerio');
var cleancss = require('clean-css');

var cwd = process.cwd();
/**
 * 输出项目
 * @param indexpage 项目入口页面
 */
exports.publish = function (indexpage) {
    var pagecode = fs.readFileSync(path.resolve(cwd, indexpage), 'utf-8');
    var projectName = path.basename(indexpage, '.html');
    fs.mkdirSync(path.resolve(cwd, './__publish__'));
    fs.mkdirSync(path.resolve(cwd, './__publish__/' + projectName));
    fs.mkdirSync(path.resolve(cwd, './__publish__/' + projectName + '/styles'));
    fs.mkdirSync(path.resolve(cwd, './__publish__/' + projectName + '/scripts'));
    var $ = cheerio.load(pagecode);
    var scriptmain = handleSeajsMain(pagecode, $);
    fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectName + '/styles/' + projectName + '-min.css'),
        minCss($));
    $('link').remove();
    $('script').remove();
    $('head').append('<link rel="stylesheet" href="./styles/' + projectName + '-min.css"/>');
    $('body').append('<script type="text/javascript" data-main="' + scriptmain.replace('.', '') + '" src="scripts/' + projectName + '-min.js" async></script>');
    var htmlcode = $.html().replace(/([\r\n\s\f\t\v])+/gm, "$1");
    fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectName + '/index.html'), htmlcode);

    var config = require(cwd + "/kConfig/configs");
    require('jspacker').pack(
        path.resolve(cwd, scriptmain),
        path.resolve(cwd, './__publish__/' + projectName + '/scripts'),
        projectName,
        cwd,
        config
    );

    shell.cp('-Rf', cwd + '/src/styles/icon', cwd + '/__publish__/' + projectName + '/styles/icon');  //styles
    shell.cp('-Rf', cwd + '/src/images', cwd + '/__publish__/' + projectName + '/src/images');  //styles
};
/*
 获取依赖的css列表
 */
var getAllCssByOrder = function ($) {
    var allcss = [];
    var alllinks = $('link');
    for (var i = 0; i < alllinks.length; i++) {
        allcss.push(alllinks.eq(i).attr('href'));
    }
    return allcss;
};
/*
 压缩页面中用到的css
 */
var minCss = function ($) {
    var allCss = getAllCssByOrder($);
    var allCssCode = '';
    allCss.forEach(function (val, idx) {
        allCssCode += fs.readFileSync(path.resolve(cwd, val));
    });

    return new cleancss().minify(allCssCode);
};
/**
 * 找到seajs的入口模块
 **/
var handleSeajsMain = function (code, $) {
    var res = code.match(/.*seajs.use\([''](.+)['"]\).*/);
    return res[1];
};
