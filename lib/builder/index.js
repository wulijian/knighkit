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

var build = function (modulePath) {
    var realPath = modulePath;
    var modulejs = fs.read(realPath + '/index.js').then(function (code) {
        var render = tp.compileAdaptive(realPath, 'index');
        var indexAst = uglify.parse(code, {
            filename: realPath + '/index.js'
        });
        indexAst = indexAst.transform(new uglify.TreeTransformer(null, function (node, descend) {
            if (render !== undefined && node instanceof uglify.AST_ObjectProperty) {
                //此处  properties[node.key] 中的值直接来源于 plugin compile 的返回值
                if (node.key === 'render') {
                    node.value = (typeof render === 'object') ? render : uglify.parse(render);
                    return node;
                }
            }
        }));
        return indexAst.print_to_string(generateOptions);
    });
    return modulejs.then(function (code) {
        fs.write(realPath + '/index.js', code);
    });
};

exports.build = build;