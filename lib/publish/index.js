/**
 * 按入口页面输出项目
 */
var path = require('path');
var fs = require('fs');
var shell = require('shelljs');
var utils = require('./utils');
require("consoleplusplus");
console.disableTimestamp();

var cwd = process.cwd();
var allPackName = '__allpacked';

var config = require(cwd + "/kConfig/configs");
var concatServerBaseUrl = '.';
var projectPublishRoot = '';

/**
 * 创建项目输出目录
 * @param pageUrl
 */
var mkProjectDir = function (pageUrl) {
    var projectName = path.basename(pageUrl, '.html');
    var projectPath = path.resolve(cwd, './__publish__/' + projectName);
    projectPublishRoot = projectPath;
    if (!fs.existsSync(path.resolve(cwd, './__publish__'))) {
        fs.mkdirSync(path.resolve(cwd, './__publish__'));
    }
    if (fs.existsSync(projectPath)) {
        shell.rm('-rf', projectPath);
    }
    fs.mkdirSync(projectPath);
    fs.mkdirSync(projectPath + '/styles');
    fs.mkdirSync(projectPath + '/scripts');
    fs.mkdirSync(projectPath + '/statics');
};
/**
 * 发布一个项目
 * @param pageUrl 项目入口文件路径
 * @param allPackName 项目配置
 */
var publishOnePage = function (pageUrl, allPackName) {
    console.info('#yellow{<-----pack ' + pageUrl + '----->}:');
    var projectRoot = allPackName || path.basename(pageUrl, '.html');
    var pageName = path.basename(pageUrl, '.html');
    fs.writeFileSync(path.resolve(cwd, './__publish__/' + projectRoot + '/' + pageName + '.html'), analyzeHtml(pageUrl, projectRoot, pageName));
    console.info('#yellow{<-----pack ' + pageUrl + ' done----->}\n\n');
};

/**
 * 获取<script ... src="path"></script>
 * 获取<img ... src="path"></script>
 * 获取<link ... rel="stylesheet" href="path" />
 * @param htmlpath html文件的路径
 * @param projectRoot 项目根目录
 * @param pageName 页面文件名
 */
var analyzeHtml = function (htmlpath, projectRoot, pageName) {
    var content = fs.readFileSync(path.resolve(cwd, htmlpath), 'utf-8');
    var reg = new RegExp([utils.regs.img.source, utils.regs.script.source, utils.regs.link.source, utils.regs.style.source].join('|'), 'ig');
    require("./link").reset();
    content.replace(utils.regs.link, function (m) {//搜集所有link ，拷贝link 所需资源到statics，并将md5后的名称替换css中的名称
        if (m.match(/role\s*=\s*(['"]?)\s*debug\s*\1/) !== null) { //只处理带有role=debug的项
            var getHref = m.match(/(?:\shref\s*=\s*)(['"]?)([^'"\s]*)\1/);
            var cssPath = path.resolve(path.dirname(htmlpath), getHref[2]);
            require("./link").collect(m, cssPath, projectPublishRoot);
        }
    });

    return content.replace(reg, function (m, $1, $2, $3, $4) {
        return require('./' + ($1 || $2 || $3 || $4)).replace(m, htmlpath, projectRoot, pageName, concatServerBaseUrl, projectPublishRoot);
    });
};

/** * 输出项目
 * @param pageUrl 项目入口页面
 */
exports.publish = function (pageUrl) {
    if (pageUrl === undefined || pageUrl === '_toserver') {//如果是发布到服务端，包括cdn，加上配置文件中的serverUrl
        if (pageUrl === '_toserver') {
            concatServerBaseUrl = config.serverUrl;
            if (concatServerBaseUrl === undefined) {
                console.error('Please check out your config file, and set the attribute "serverUrl"!');
                return;
            }
        }
        pageUrl = allPackName;
    }
    mkProjectDir(pageUrl);
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