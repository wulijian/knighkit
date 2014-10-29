/**
 * 按入口页面输出项目
 */
var path = require('path');
var fs = require('fs');
var shell = require('shelljs');
var cheerio = require('cheerio');
var cleancss = require('clean-css');
require("consoleplusplus");
console.disableTimestamp();

var cwd = process.cwd();
var allPackName = '__allpacked';
/**
 * 输出项目
 * @param pageUrl 项目入口页面
 */
exports.publish = function (pageUrl) {
    var config = require(cwd + "/kConfig/configs");
    mkProjectDir(!!pageUrl ? pageUrl : allPackName);
    if (pageUrl === undefined) {
        var files = fs.readdirSync(cwd);
        files.forEach(function (value) {
            if (path.extname(value) === '.html' || path.extname === '.htm') {
                publishOnePage(value, config, allPackName);
            }
        });
    }else{
        publishOnePage(pageUrl, config);
    }

    var pageName = !!pageUrl ? path.basename(pageUrl, '.html') : allPackName;
    //拷贝需要的静态资源文件
    if (Array.isArray(config.staticResource)) {
        config.staticResource.forEach(function (val) {
            shell.cp('-Rf',
                path.resolve(cwd, val.source),
                path.resolve(cwd + '/__publish__/' + pageName, val.target));  //styles
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
/**
 * 压缩页面中用到的css，输出到固定位置
 * @param $
 * @param projectRoot
 * @param pageName
 */
var packCss = function ($, projectRoot, pageName) {
    var allCss = getAllCssByOrder($);
    var allCssCode = '';
    allCss.forEach(function (val, idx) {
        console.log(val);
        allCssCode += fs.readFileSync(path.resolve(cwd, val));
    });
    fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectRoot + '/styles/' + pageName + '-min.css'),
        new cleancss().minify(allCssCode));
};

/**
 * 创建项目输出目录
 * @param pageUrl
 */
var mkProjectDir = function (pageUrl) {
    var projectName = path.basename(pageUrl, '.html');
    var projectPath = path.resolve(cwd, './__publish__/' + projectName);
    if (!fs.existsSync(path.resolve(cwd, './__publish__'))) {
        fs.mkdirSync(path.resolve(cwd, './__publish__'));
    }
    if (fs.existsSync(projectPath)) {
        shell.rm('-rf', projectPath);
    }
    fs.mkdirSync(projectPath);
    fs.mkdirSync(projectPath + '/styles');
    fs.mkdirSync(projectPath + '/scripts');
};
/**
 * 发布一个项目
 * @param pageUrl 项目入口文件路径
 * @param config 项目配置
 * @param allPackName 项目配置
 */
var publishOnePage = function (pageUrl, config, allPackName) {
    console.info('#yellow{<-----pack ' + pageUrl + '----->}:');
    var pagecode = fs.readFileSync(path.resolve(cwd, pageUrl), 'utf-8');
    var projectRoot = allPackName || path.basename(pageUrl, '.html');
    var pageName = path.basename(pageUrl, '.html');
    var res = pagecode.match(/.*seajs.use\([''](.+)['"]\).*/);
    var scriptmain = res[1];//seajs的入口模块
    var $ = cheerio.load(pagecode);
    console.info('#green{[pack css files]}:');
    packCss($, projectRoot, pageName);
    console.info('#green{[pack css files done.]}\n');
    console.info('#green{[create html file]}:');
    createHtmlPage($, projectRoot, pageName, scriptmain);
    console.info('#green{[create html file done.]}\n');
    console.info('#green{[pack js files]}:');
    packJsCode(config, projectRoot, pageName, scriptmain);
    console.info('#green{[pack js files done.]}\n');
    console.info('#yellow{<-----pack ' + pageUrl + ' done----->}\n\n');
};

/**
 * 处理页面代码，输出到固定位置
 * @param $
 * @param projectRoot
 * @param pageName
 * @param scriptMain
 */
var createHtmlPage = function ($, projectRoot, pageName, scriptMain) {
    $('link[role=debug]').remove();
    $('script[role=debug]').remove();
    $('head').append('<link rel="stylesheet" href="./styles/' + pageName + '-min.css"/>');
    $('body').append('<script type="text/javascript" data-main="' + scriptMain.replace('.', '') + '" src="scripts/' + pageName + '-min.js" async></script>');
    var htmlcode = $.html().replace(/([\r\n\s\f\t\v])+/gm, "$1");
    fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectRoot + '/' + pageName + '.html'), htmlcode);
    console.log('created ' + pageName + '.html');
};
/**
 * 打包js代码，并输出到固定位置
 * @param config
 * @param projectRoot
 * @param pageName
 * @param scriptmain
 */
var packJsCode = function (config, projectRoot, pageName, scriptmain) {
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
};
