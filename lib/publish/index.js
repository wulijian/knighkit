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
var crypto = require('crypto');
var md5;

var cwd = process.cwd();
var allPackName = '__allpacked';

var config = require(cwd + "/kConfig/configs");
var concatServerBaseUrl = '';
/**
 * 输出项目
 * @param pageUrl 项目入口页面
 */
exports.publish = function (pageUrl) {
    if (pageUrl === undefined || pageUrl === '_toserver') {//如果是发布到服务端，包括cdn，加上配置文件中的serverUrl
        if(pageUrl === '_toserver'){
            concatServerBaseUrl = config.serverUrl;
        }
        pageUrl = allPackName;
    }
    mkProjectDir(!!pageUrl ? pageUrl : allPackName);
    if (pageUrl === allPackName) {
        var files = fs.readdirSync(cwd);
        files.forEach(function (value) {
            if (path.extname(value) === '.html' || path.extname === '.htm') {
                publishOnePage(value, allPackName);
            }
        });
    } else {
        publishOnePage(pageUrl);
    }

    var pageName = path.basename(pageUrl, '.html');
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
    var minCssCode = new cleancss().minify(allCssCode);
    md5 = crypto.createHash('md5');
    var cssMd5 = md5.update(minCssCode)
        .digest('hex')
        .substring(0, 6);
    fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectRoot + '/styles/' + pageName + '_' + cssMd5 + '.css'), minCssCode);
    return cssMd5;
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
 * @param allPackName 项目配置
 */
var publishOnePage = function (pageUrl, allPackName) {
    console.info('#yellow{<-----pack ' + pageUrl + '----->}:');
    var pagecode = fs.readFileSync(path.resolve(cwd, pageUrl), 'utf-8');
    var projectRoot = allPackName || path.basename(pageUrl, '.html');
    var pageName = path.basename(pageUrl, '.html');
    var res = pagecode.match(/.*seajs.use\([''](.+)['"]\).*/);
    var scriptmain = res[1];//seajs的入口模块
    var $ = cheerio.load(pagecode);
    console.info('#green{[pack css files]}:');
    var cssMd5 = packCss($, projectRoot, pageName);
    console.info('#green{[pack css files done.]}\n');
    console.info('#green{[pack js files]}:');
    var jsMd5 = packJsCode(projectRoot, pageName, scriptmain);
    console.info('#green{[pack js files done.]}\n');
    console.info('#green{[create html file]}:');
    createHtmlPage($, projectRoot, pageName, scriptmain, cssMd5, jsMd5);
    console.info('#green{[create html file done.]}\n');
    console.info('#yellow{<-----pack ' + pageUrl + ' done----->}\n\n');
};

/**
 * 处理页面代码，输出到固定位置
 * @param $
 * @param projectRoot
 * @param pageName
 * @param scriptMain
 */
var createHtmlPage = function ($, projectRoot, pageName, scriptMain, cssMd5, jsMd5) {
    $('link[role=debug]').remove();
    $('script[role=debug]').remove();
    $('head').append('<link rel="stylesheet" href="' + path.join(concatServerBaseUrl, './styles/') + pageName + '_' + cssMd5 + '.css"/>');
    $('body').append('<script type="text/javascript" data-main="' + scriptMain.replace('.', '') + '" src="' + path.join(concatServerBaseUrl, './scripts/') + pageName + '-min_' + jsMd5 + '.js" async></script>');
    var htmlcode = $.html().replace(/([\r\n\s\f\t\v])+/gm, "$1");
    fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectRoot + '/' + pageName + '.html'), htmlcode);
    console.log('created ' + pageName + '.html');
};
/**
 * 打包js代码，并输出到固定位置
 * @param projectRoot
 * @param pageName
 * @param scriptmain
 */
var packJsCode = function (projectRoot, pageName, scriptmain) {
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
    var jsfilePath = path.resolve(cwd, './__publish__/' + projectRoot + '/scripts/' + pageName + '-min.js');
    var jscode = fs.readFileSync(jsfilePath, 'utf-8');
    md5 = crypto.createHash('md5');
    var jsMd5 = md5.update(jscode)
        .digest('hex')
        .substring(0, 6);
    shell.rm('-rf', jsfilePath);
    fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectRoot + '/scripts/' + pageName + '_' + jsMd5 + '.js'), jscode);
    return jsMd5;
};
