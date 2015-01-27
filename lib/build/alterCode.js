/**
 * @date 12-12-13
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var config = require('../config')();

var output = config.output,
    moduleTemplatePath = config.moduleTemplatePath,
    moduleObject = config.moduleObject;

//模块模版的语法树
var mtAST = uglify.parse(fs.readFileSync(moduleTemplatePath, 'utf-8'), {
    filename: "moduleTemplate.js" // default is null
});
//单个模版对象的语法树
var moAST = uglify.parse(fs.readFileSync(moduleObject, 'utf-8'), {
    filename: "moduleObject.js" // default is null
});
/**
 * 用模版的代码生成模块代码
 * @param properties
 * @return {{}}
 */
var createOneModuleObject = function (properties/*,allinone*/) {
    var oneModule = {};
    moAST.transform(new uglify.TreeTransformer(null, function (node, descend) {
        if (node instanceof uglify.AST_VarDef) {
            oneModule = node.value;
        }
        if (properties[node.key] !== undefined && node instanceof
            uglify.AST_ObjectProperty) {
            if (node.key === 'init') {
                node.value = uglify.parse(properties[node.key]);
                return node;
            }
            //此处  properties[node.key] 中的值直接来源于 plugin compile 的返回值
            if (node.key === 'render') {
                switch (typeof properties[node.key]) {
                    case 'object':
                        node.value = properties[node.key];
                        break;
                    case 'string':
                        node.value = uglify.parse(properties[node.key]);
                        break;
                }
                return node;
            }
        }
    }));
    return oneModule;
};

/**
 * 生成一个模块
 * @param _module
 * @return {*}
 */
var singleModule = function (_module) {
    return mtAST.transform(new uglify.TreeTransformer(null, function (node, descend) {
        if (node instanceof uglify.AST_Assign && node.left.print_to_string() === 'module.exports') {
            node.right = _module;
            return node;
        }
    }));
};
/**
 * 生成单个模块的代码
 * todo:这里返回的代码是经过uglify美化过的，所以可能会发生和sourcemap不一致的情况，以后再改
 * @param properties
 * @return {*}
 */
exports.moduleCode = function (properties) {
    //生成代码的配置
    var generateOptions = require(path.resolve(require('../runtime').rootPath, 'kConfig/codeStyle.json'));
    var _module = createOneModuleObject(properties);
    return singleModule(_module).print_to_string(generateOptions);
};