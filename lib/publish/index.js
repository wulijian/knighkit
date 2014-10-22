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
    var projectPath = path.resolve(cwd, './__publish__/' + projectName);
    if(!fs.existsSync(path.resolve(cwd, './__publish__'))){
        fs.mkdirSync(path.resolve(cwd, './__publish__'));
    }
    if(fs.existsSync(projectPath)){
        shell.rm('-rf', projectPath);
    }
    fs.mkdirSync(projectPath);
    fs.mkdirSync(projectPath+ '/styles');
    fs.mkdirSync(projectPath+ '/scripts');
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

    // 压缩js
    var config = require(cwd + "/kConfig/configs");
    var httpReg = /(http:\/\/.+:[\d]+)|(https:\/\/.+:[\d]+)/;
    var fileReg = /file:[/]+/;
    if (httpReg.test(config.base)) {
        config.base = config.base.replace(httpReg, cwd)
    }
    if (fileReg.test(config.base)) {
        config.base = config.base.replace(fileReg, '');
    }
    require('jspacker').pack(
        path.resolve(cwd, scriptmain),
        path.resolve(cwd, './__publish__/' + projectName + '/scripts'),
        projectName,
        cwd,
        config
    );
    //拷贝需要的静态资源文件
    if (Array.isArray(config.staticResource)) {
        config.staticResource.forEach(function (val) {
            shell.cp('-Rf',
                path.resolve(cwd, val.source),
                path.resolve(cwd + '/__publish__/' + projectName, val.target));  //styles
        });
    }
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
