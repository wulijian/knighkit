/**
 * 静态服务器，中间处理某些特殊请求，屏蔽使用者对template层编译的感知
 */
var builder = require('../build/modules');
var connect = require('connect');
var servestatic = require('serve-static');
var puz = require('../puzzle');
var inc = require('./include');
var path = require('path');
var fs = require('fs');
require("consoleplusplus");
var config = require('../config')();

/**
 * 自动重新编译被修改的模块
 * 筛选 req.url 中【含有 templateRoot,并且是请求templateRoot下的直接子js文件】的请求，自动build后返回给加载器
 * 如 {templateRoot}/list.js {templateRoot}/user.js
 * @param rootpath 项目根路径
 * @param req 请求
 * @param res 响应
 * @param next connect的下一步
 * @param templateRoot 模板所在目录，只有模板需要重新编译
 * @returns {*}
 */
var responseBuildEditedModule = function (rootpath, templateRoot, req, res, next) {
    if (req.url.indexOf(templateRoot) !== -1) {
        var relPath = path.relative(path.join(rootpath, templateRoot), path.join(rootpath, req.url));
        var modname = path.basename(req.url, path.extname(req.url));
        if (!fs.existsSync(path.join(rootpath, req.url)) //不存在此js文件，如果存在，不处理，例如 require('/src/template/index.js'),如果index.js 存在，则直接返回
            && fs.existsSync(path.join(rootpath, templateRoot, modname))//存在此文件夹
            && path.dirname(relPath) === '.'//请求的是template下的文件
            && path.extname(req.url) === '.js') {//请求的是js格式的文件
            res.setHeader('Content-Type', 'application/javascript');
            res.end(builder.buildTemplate(path.join(rootpath, templateRoot), modname));
        } else {
            return next();
        }
    } else {
        return next();
    }
};

/**
 * 运行时支持 puzzle 标签的解析， <puzzle module="./*.html"></puzzle>
 * 运行时支持 include 语法的解析， <!--#include virtual='/news_list2.html' -->
 * 其中，puzzle页面片中可以包含 include ，但include引用中，不可以包含 puzzle 标签
 * @param rootpath 项目根路径
 * @param req 请求
 * @param res 响应
 * @param next connect的下一步
 */
var responsePageMapping = function (rootpath, req, res, next) {
    var urlMapping = config.configs.urlMapping;
    if (/text\/html/.test(req.headers.accept) && urlMapping !== undefined) { //url请求的是 text/html
        var targetUrl = req.url.replace(/\?.*/, '');
        var matched = false;

        for (var idx = 0, len = urlMapping.length; idx < len; idx++) {
            var urlmap = urlMapping[idx];
            if (urlmap.url instanceof RegExp) {
                var matchedUrl = targetUrl.match(urlmap.url);
                if (matchedUrl !== null) {
                    matched = true;
                    targetUrl = urlmap.target.replace(/\{\$(\d)\}/g, function ($0, $1) {
                        return matchedUrl[$1];
                    });
                    break;
                }
            } else {
                if (urlmap.url === targetUrl) { //链接相同
                    matched = true;
                    targetUrl = urlmap.target;
                    break;
                }
            }
        }
        if (matched) {
            var relPath = path.join(rootpath, targetUrl);
            if (!/\.html|\.htm/.test(targetUrl)) { //默认读取index.html 或者 index.htm
                relPath = path.join(rootpath, targetUrl, 'index.html');
                if (!fs.existsSync(relPath)) { //检查是否存在 index.html 不存在，取值 index.htm
                    relPath = path.join(rootpath, targetUrl, 'index.htm');
                }
            }
            var puzcode = puz.puz(relPath);
            if (puzcode === null) {
                return next();
            } else {
                var code = inc.include(relPath, puz.puz(relPath));
                if (code !== null) {
                    res.end(code);
                } else {
                    return next();
                }
            }
        } else {
            return next();
        }
    } else {
        return next();
    }
};

/**
 * 开启httpserver
 * @param rootpath 根路径
 * @param httpPort 端口号
 * @param templateRoot 模板所在目录，只有模板需要重新编译
 */
exports.startHttpServer = function (rootpath, httpPort, templateRoot) {
    var con = connect()
        .use(function (req, res, next) {
            return responseBuildEditedModule(rootpath, templateRoot, req, res, next);
        }).use(function (req, res, next) {
            return responsePageMapping(rootpath, req, res, next);
        }).use(servestatic(rootpath));

    if (config.configs.additionRoot !== undefined) {
        config.configs.additionRoot.forEach(function (val) {
            con.use(servestatic(path.resolve(rootpath, val)));
        });
    }
    con.listen(httpPort);
    console.info('start http server at #yellow{http://localhost:' + httpPort + '}');
};
