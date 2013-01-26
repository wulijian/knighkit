/**
 * @date 12-12-17
 * @describe:
 * @author: wulj
 * @version: 1.0
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var config = require('./package.json');

const entry = path.resolve(__dirname, config.entry);
const scriptBasePath = path.resolve(__dirname, config.scriptBasePath);
const diskPath = path.resolve(__dirname, config.diskPath);
const businessOutput = diskPath + '/business';
const baseModuleFile = path.resolve(__dirname, config.baseModuleFile);

//生成代码的配置
var generateOptions = {
    indent_start: 0, // start indentation on every line (only when `beautify`)
    indent_level: 4, // indentation level (only when `beautify`)
    quote_keys: false, // quote all keys in object literals?
    space_colon: true, // add a space after colon signs?
    ascii_only: false, // output ASCII-safe? (encodes Unicode characters as ASCII)
    inline_script: false, // escape "</script"?
    width: 80, // informative maximum line width (for beautified output)
    max_line_len: 32000, // maximum line length (for non-beautified output)
    ie_proof: true, // output IE-safe code?
    beautify: true, // beautify output?
    source_map: null, // output a source map
    bracketize: false, // use brackets every time?
    comments: true, // output comments?
    semicolons: true  // use semicolons to separate statements? (otherwise, newlines)
};

/**
 * 获取压缩后的ast
 * @param ast
 * @return {*}
 */
var getCompressedAST = function (ast) {
    // compressor needs figure_out_scope too
    ast.figure_out_scope();
    var compressor = uglify.Compressor();
    ast = ast.transform(compressor);

    // need to figure out scope again so mangler works optimally
    ast.figure_out_scope();
    ast.compute_char_frequency();
    ast.mangle_names();

    // get Ugly code back :)
    return ast;
};

/**
 * 统一js代码中出现的模块的名字
 * @param moduleId
 * @return {String|XML}
 */
var uniteModuleId = function (moduleId) {
    return moduleId
        .replace(scriptBasePath, '')
        .replace(/\\/g, '/')
        .replace(/.js$/g, '');
};

/**
 * 统一代码中的模块id
 * @param currentModulePath   当前文件路径
 * @param moduleId   模块id
 * @return {uglify.TreeTransformer}
 */
var uniteModuleCode = function (currentModulePath, moduleId) {
    var moduleTF = new uglify.TreeTransformer(null, function (node, descend) {
        if (node instanceof uglify.AST_Call && node.expression.name === 'define') {
            var arg1 = new uglify.AST_String({
                "value": uniteModuleId(currentModulePath)
            });
            if (node.args.length === 3) {
                node.args[0] = arg1;
            } else {
                node.args.unshift(arg1);
            }

        }
        if (node instanceof uglify.AST_String) {
            var p = moduleTF.parent();
            if (p instanceof uglify.AST_Call && node !== p.expression && p.expression.name === 'require') {
                var foreignModuleRealPath = path.resolve(path.dirname(currentModulePath), node.getValue());
                if (!dependensies[currentModulePath][foreignModuleRealPath]) {
                    dependensies[currentModulePath].push({
                        basePath: path.dirname(currentModulePath),
                        moduleId: node.getValue(),
                        fullPath: foreignModuleRealPath
                    });
                    dependensies[currentModulePath][foreignModuleRealPath] = true;
                }
                node.value = uniteModuleId(foreignModuleRealPath);
            }
        }
        return node;
    });
    return  moduleTF;
};

var dependensies = {};

var allModule = {};
var resolveModule = function (modulePath, moduleId) {
    var moduleRealPath = path.resolve(modulePath, moduleId) + '.js';
    try {
        var moduleCode = fs.readFileSync(moduleRealPath, 'utf-8');
        var moduleDependence = dependensies[moduleRealPath] = [];

        var moduleAST = uglify.parse(moduleCode.toString(), {
            filename: moduleRealPath
        });
        var tsm = moduleAST.transform(
            uniteModuleCode(moduleRealPath, moduleId)
        );
        for (var index = 0, length = moduleDependence.length; index < length; index++) {
            if (!allModule[moduleDependence[index].fullPath]) {
                resolveModule(moduleDependence[index].basePath, moduleDependence[index].moduleId);
                allModule[moduleDependence[index].fullPath] = true;
            }
        }
        if (tsm.start.file !== entry + '.js') {
            fs.appendFileSync(businessOutput + '.js', tsm.print_to_string(generateOptions));
            fs.appendFileSync(businessOutput + '-min.js', getCompressedAST(tsm).print_to_string() + '\n');
        }

    } catch (err) {
        console.error(err);
    }
};


var moduleImp = fs.readFileSync(baseModuleFile + '.js', 'utf-8');

var compressedModuleImp = getCompressedAST(
    uglify.parse(
        moduleImp.toString(),
        {filename: baseModuleFile}
    )
);

exports.initialize = function () {
    fs.writeFileSync(
        businessOutput + '.js',
        moduleImp.toString()
    );
    fs.writeFileSync(
        businessOutput + '-min.js',
        compressedModuleImp.print_to_string()
    );

    resolveModule(__dirname, config.entry);
};



