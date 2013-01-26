/**
 * @date 12-12-13
 * @describe:
 * @author: wulj
 * @version: 1.0
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var config = require('./package.json');

/**
 * 偏移位置对象
 * @type {{line: number, column: number}}
 */
var templateToCodeOffset = {
    line: 0,
    column: 0
};

const templateTool = path.resolve(__dirname, config.templateTool),
    moduleTemplatePath = templateTool + '/moduleTemplate.js',
    moduleObject = templateTool + '/moduleObject.js';

//生成代码的配置
var generateOptions = require('../codeStyle.json');
//获取模块的模版
var moduleTemplate = fs.readFileSync(moduleTemplatePath, 'utf-8');
var moduleObjectTemplate = fs.readFileSync(moduleObject, 'utf-8');
//模块模版的语法树
var mtAST = uglify.parse(moduleTemplate, {
    filename: "moduleTemplate.js" // default is null
});
//所有模块模版的语法树
var amtAST = uglify.parse(moduleTemplate, {
    filename: "moduleTemplate.js" // default is null
});
//单个模版对象的语法树
var moAST = uglify.parse(moduleObjectTemplate, {
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
        if (properties[node.key] !== undefined && node instanceof uglify.AST_ObjectProperty) {
            if (node.key === 'init') {
                node.value = uglify.parse(properties[node.key]);
                return node;
            }
            if (node.key === 'tp') {
                node.value = properties[node.key];
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
            templateToCodeOffset.line = node.start.line + 1; // +1 对应到 tp： 的行
            node.right = _module;
            return node;
        }
    }));
};
/**
 * 将单个的模块添加到总模块中
 * @param id 模块id
 * @param _module
 */
var appendToAllModule = function (id, _module) {
    amtAST = amtAST.transform(new uglify.TreeTransformer(null, function (node, descend) {
        if (node instanceof uglify.AST_Assign && node.left.property === 'exports') {
            node.right.properties.push(new uglify.AST_ObjectKeyVal({
                key: id,
                value: _module
            }));
            return node;
        }
    }));
};
/**
 * 获取所有模块合并到一起的代码
 * @return {*}
 */
exports.getAllModule = function () {
    return amtAST.print_to_string(generateOptions);
};
/**
 * 生成单个模块的代码
 * todo:这里返回的代码是经过uglify美化过的，所以可能会发生和sourcemap不一致的情况，以后再改
 * @param properties
 * @return {*}
 */
exports.moduleCode = function (properties) {
    var _module = createOneModuleObject(properties);
    appendToAllModule(properties.id, _module);
    return singleModule(_module).print_to_string(generateOptions);
};
/**
 * 获取代码合并到模版中的位置偏移量
 * @return {{line: number, column: number}}
 */
exports.getOffset = function () {
    return templateToCodeOffset;
};