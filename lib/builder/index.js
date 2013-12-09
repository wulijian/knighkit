/**
 * @date 12-12-10
 * @describe: 根据模板生成函数，填充到模块主文件的 render 方法上
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require("q-io/fs");
var path = require('path');
var q = require('q');
var uglify = require('uglify-js');
var tp = require('jstm');
var shell = require('shelljs');

var generateOptions = {
    "indent_start": 0,
    "indent_level": 4,
    "quote_keys": true,
    "space_colon": true,
    "ascii_only": false,
    "inline_script": false,
    "width": 80,
    "max_line_len": 32000,
    "beautify": true,
    "source_map": null,
    "bracketize": false,
    "comments": true,
    "semicolons": true
};

var build = function (modulePath, cwd) {
    var realPath = modulePath;
    var targetPath = path.resolve(cwd, './__project/content');
    return fs.read(realPath + '/index.js')
        .then(function (code) {
            var render = tp.compileAdaptive(realPath, 'index');
            code = code.replace(/___template___/, (typeof render === 'object') ? render.print_to_string(generateOptions) : render);
            var indexAst = uglify.parse(code, {
                filename: realPath + '/index.js'
            });
            return indexAst.print_to_string(generateOptions);
        })
        .then(function (code) {
            shell.mkdir('-p', targetPath);
            return fs.write(targetPath + '/index.js', code);
        });
};

exports.build = build;