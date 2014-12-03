/**
 * 静态服务器，中间处理某些特殊请求，屏蔽使用者对template层编译的感知
 */
var builder = require('../build/modules');
var connect = require('connect');
var servestatic = require('serve-static');
var path = require('path');
var fs = require('fs');
require("consoleplusplus");

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
 * 开启httpserver
 * @param rootpath 根路径
 * @param httpPort 端口号
 * @param templateRoot 模板所在目录，只有模板需要重新编译
 */
exports.startHttpServer = function (rootpath, httpPort, templateRoot) {
    connect()
        .use(function (req, res, next) {
            return responseBuildEditedModule(rootpath, templateRoot, req, res, next);
        })
        .use(servestatic(rootpath))
        .listen(httpPort);
    console.info('start http server at #yellow{http://localhost:' + httpPort + '}');
};
