/**
 * 开发阶段运行时辅助对象
 * 提供静态服务器，socketio刷新浏览器服务
 */
if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    var builder = require('../builder');
    var connect = require('connect');
    var path = require('path');
    require("consoleplusplus");
    var sio = require('socket.io');
    var socketIOPort = 9529;
    /**
     * 自动重新编译被修改的模块
     * @param rootpath 项目根路径
     * @param req 请求
     * @param res 响应
     * @param next connect的下一步
     * @returns {*}
     */
    var responseBuildEditedModule = function (rootpath,req,res, next) {
        //筛选出符合以index.js 或者跟随时间戳的js请求，编译后返回
        if (req.url.indexOf(path.relative( process.cwd(),rootpath)) === 1 && /index\.js(\?t=\d*)?$/.test(req.url)) {
            var modsource = (process.cwd() + '/' + req.url).replace(/index\.js(\?t=\d*)?$/, '');
            if (path.extname(modsource) === '') {
                res.setHeader('Content-Type', 'application/javascript');
                builder.builds(modsource).then(function (code) {
                    res.end(code);
                });
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
     */
    exports.startHttpServer = function (rootpath, httpPort) {
        connect()
            .use(function (req, res, next) {
                return responseBuildEditedModule(rootpath,req,res, next);
            })
            .use(connect.static(process.cwd()))
            .listen(httpPort);
        console.info('start http server at #yellow{http://localhost:' + httpPort + '}');
    };

    /**
     * 检测文件变化，推送变化到浏览器
     * @param rootpath 根目录
     * @param socket 跟browser之间的socket连接
     */
    var watchFileUpdateAndEmitToBrowser = function (rootpath, socket) {
        var isTemplate = /\.html$|\.vm$|\.hogan$|\.jade$/;
        var isCSS = /\.css$/;
        var isJS = /\.js/;
        require('watch').createMonitor(rootpath, {interval: 150}, function (monitor) {
            monitor.on("created", function (f, stat) {
                // Handle file changes
            });
            monitor.on("changed", function (file, curr, prev) {
                var type = '';
                var fileName = path.basename(path.relative(file, process.cwd()));
                if (isTemplate.test(fileName)) {
                    fileName = fileName.replace(isTemplate, '');
                    type = "template";
                }
                if (isCSS.test(fileName)) {
                    type = 'css';
                }
                if (isJS.test(fileName)) {
                    type = 'js';
                }
                socket.emit('updateTemplate', {
                    fn: fileName,
                    type: type
                });
            });
            monitor.on("removed", function (f, stat) {
                // Handle removed files
            });
        });
    };
    /**
     * 启动socket连接
     * @param rootpath 项目根路径
     */
    exports.startSocketIOServer = function (rootpath) {
        var io = sio.listen(socketIOPort);
        io.sockets.on('connection', function (socket) {
            watchFileUpdateAndEmitToBrowser(rootpath, socket);
        });
        console.info('start socket server at #yellow{http://localhost:' + 9529 + '}');
    };

});