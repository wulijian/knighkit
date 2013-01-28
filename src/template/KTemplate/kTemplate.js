/**
 * @date 12-12-26
 * @describe: 简单的js模版 ,支持sourceMap的生成
 * @author: KnightWu
 * @version: 1.0
 */
var replaces = ["htmlCode='';", "htmlCode+=", ";", "htmlCode"];
var SYNTAXSIGN = {start: '<%', end: '%>', val: '=', dval: '-', sub: '<%=='};
var moduleName = 'tools'; //与 moduleTemplate.js 中变量一致
var fs = require('fs');
var sourceMap = require('source-map');
var path = require('path');
var error = require('../../info');
var ss = require('./sourceScaner');
require('./sourceMapExtension');
var suffix = '.html';
var templateToJsGenerator = null;
var subToCombinedTemplateNode = null;
var currentIndex = {};
var sourceRoot = null;
var fileRealPath = null;

var resetAll = function () {
    currentIndex = {};
    templateToJsGenerator = null;
    subToCombinedTemplateNode = new sourceMap.SourceNode(null, null, null);
    sourceRoot = null;
    fileRealPath = null;
};

/**
 * 编译模版代码
 * @param code html模版代码
 * @return {Function}  模版函数，接收一个数据，返回html代码
 */
var compile = function (code) {
    var fileName = path.basename(fileRealPath);  //文件名
    var tempCode = 'var ' + replaces[0] + '\n';
    tempCode += 'with(_data){\n';   //添加with支持，缩短取值路径
    ss.init(function (original, generated) {
        generated.line.skip(2);
    });

    templateToJsGenerator = new sourceMap.SourceMapGenerator({
        file: path.basename(sourceRoot) + '.js', //以文件夹名称作为文件名
        sourceRoot: sourceRoot  //模版文件的文件夹地址
    });
    // html与逻辑语法分离
    code.split(SYNTAXSIGN.start).forEach(function (codeSnip) {
        var codeArr = codeSnip.split(SYNTAXSIGN.end);
        var $0 = codeArr[0];
        var $1 = codeArr[1];
        if (codeArr.length === 1 && $0 !== '') {
            tempCode += html($0, fileName);
        } else {
            tempCode += logic($0, fileName);
            if (typeof $1 !== 'undefined' && $1 !== '') {
                tempCode += html($1, fileName);
            }
        }
    });
    tempCode += '}\n';
    tempCode += 'return ' + replaces[3] + replaces[2];
    var tmplFunction = function error() {
    };
    try {
        tmplFunction = new Function('_data', tempCode);
    } catch (err) {
        error.log(err);
        error.log(tempCode);
    }

    return tmplFunction;
};

/**
 * 处理 HTML 语句,直接将html代码编码,可以忽略特殊字符的影响.
 * @param code html模版中的代码
 * @param fileName html模版文件名
 * @return {string} 处理后生成的html代码
 */
var html = function (code, fileName) {
    var handledCode = code
        // 单双引号与反斜杠转义
        .replace(/('|"|\\)/g, '\\$1')
        // 换行符转义(windows + linux)
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/^(\\r\\n)+(\s)*(\\r\\n)+/g, '$1')
        //去掉结尾处的换行和空格
        .replace(/(\\r\\n)+(\s)*$/g, '');
    ss.consume(code, !!(handledCode !== ''), function (map) {
        map.source = fileName;
        templateToJsGenerator.addMapping(map);
    }, false);
    return (handledCode !== '') ? replaces[1] + "'" + handledCode + "'" + replaces[2] + '\n' : '';
};

/**
 * 处理逻辑语句
 * @param code html模版中的代码
 * @param fileName html模版文件
 * @return {string} 处理后的js代码
 */
var logic = function (code, fileName) {
    ss.consume(code, true, function (map) {
        map.source = fileName;
        templateToJsGenerator.addMapping(map);
    }, true);
    var handledCode = code;
    if (code.indexOf(SYNTAXSIGN.val) === 0) {    //是否值
        handledCode = replaces[1] + code.substring(1).replace(/[\s;]*$/, '') + replaces[2];
    }
    if (code.indexOf(SYNTAXSIGN.dval) === 0) {
        handledCode = replaces[1] + moduleName + '.escape(' + code.substring(1).replace(/[\s;]*$/, '') + ')' + replaces[2];
    }
    return handledCode + '\n';
};

/**
 * 生成sourceMap
 * sourceMap中指定的 sourceRoot 是指：在运行时，相对于当前运行页面的路径。所以需要动态的计算sourceRoot的值
 * @param runRoot  运行时路径
 */
var generateMap = function (runRoot) {
    var relRoot = './'; //默认的 sourceRoot,相当于当前运行文件的路径
    if (runRoot !== undefined) { //如果指定了运行路径
        relRoot = path.relative(runRoot, templateToJsGenerator._sourceRoot);// 计算运行路径和源文件位置的相对路径，作为最终map的sourceRoot
    }
    var fileName = templateToJsGenerator._file;
    var A2C = new sourceMap.SourceMapGenerator({
        file: fileName,
        sourceRoot: relRoot
    });
    A2C.combine(subToCombinedTemplateNode, templateToJsGenerator, fileName);
    return A2C;
};
/**
 * 代码对应的 sourceNode 数组
 * @param sourcePath 路径
 * @param code 代码
 * @return {Array} 返回sourceNode数组
 */
var sourceToSourceNode = function (sourcePath, code) {
    var enter = '\r\n';
    var codeNodes = code.split(enter);
    var sourceNodes = [], cIndex = currentIndex[sourcePath] || 1;
    var fileName = path.relative(sourceRoot, sourcePath);
    for (var i = 0, length = codeNodes.length; i < length; i++) {
        sourceNodes.push(new sourceMap.SourceNode(
            i + cIndex,
            0,
            fileName,
            codeNodes[i] + ((length - 1 === i) ? '' : enter))
        );
    }
    if (currentIndex[sourcePath] === undefined) {
        currentIndex[sourcePath] = length;
    } else {
        currentIndex[sourcePath] = currentIndex[sourcePath] + length - 1;
    }
    return sourceNodes;
};

/**
 * 把注释处理成空格和换行
 * todo:多行的文本正则无法处理，用____这种比较挫的方式代替
 * @param code
 */
var handleComments = function (code) {
    var comments = /<!--.*?--[\s]*>/g;
    var stCode = code.replace(/\r\n/g, '____');
    stCode = stCode.replace(comments, function (fragment) {
        var codes = fragment.split('____');
        var lines = codes.length;
        var column = codes[lines - 1].length + 1;
        var linesArr = (new Array(lines)).join('\r\n');
        var columnArr = (new Array(column)).join(' ');
        return linesArr + columnArr;
    });
    stCode = stCode.replace(/____/g, '\r\n');
    return stCode;
};

/**
 * 将子模版合并到父模版中
 * @param code 合成后的html模版代码
 * @param tPath html模版地址
 * todo:正则有问题
 * @return {*} 最终返回此模版的完整html模版代码
 */
var resolveSub = function (code, tPath) {
    code = handleComments(code);
    var codeChunk = new RegExp(SYNTAXSIGN.sub +
        '[\\s]*([^' + SYNTAXSIGN.end + '(]+)\\(([^' + SYNTAXSIGN.end + ']+)\\)[;\\s]*' + SYNTAXSIGN.end, 'g');
    var result = codeChunk.test(code.toString());
    if (result) {
        var subPath = RegExp.$1, dataArgument = RegExp.$2;
        var leftContext = RegExp.leftContext;
        var rightContext = RegExp.rightContext;
        subPath = path.resolve(path.dirname(tPath), subPath + suffix);
        subToCombinedTemplateNode.add(sourceToSourceNode(tPath, leftContext));
        var subTemplateCode = getSubTemplateCode(subPath, dataArgument);
        if (subTemplateCode.indexOf(SYNTAXSIGN.sub) !== -1) {
            subTemplateCode = resolveSub(subTemplateCode, subPath);
        } else {
            subToCombinedTemplateNode.add(sourceToSourceNode(subPath, subTemplateCode));
        }
        if (rightContext.indexOf(SYNTAXSIGN.sub) !== -1) {
            resolveSub(rightContext, tPath);
        } else {
            subToCombinedTemplateNode.add(sourceToSourceNode(tPath, rightContext));
        }
    } else { //无子模版
        subTemplateCode = subToCombinedTemplateNode.add(sourceToSourceNode(tPath, code));
    }
    return subTemplateCode;
};
/**
 * 获取子模块 html 模版代码
 * @param subPath 子模版ID号
 * @param dataArg 数据参数
 * @return {string}  返回此子模版的html模版代码
 */
var getSubTemplateCode = function (subPath, dataArg) {
    return SYNTAXSIGN.start + '(function(_data){' + SYNTAXSIGN.end +
        fs.readFileSync(subPath, 'utf-8') +
        SYNTAXSIGN.start + '})(' + dataArg + ');' + SYNTAXSIGN.end;
};

/**
 * 编译html模版代码
 * @param templatePath 主模版的路径，模版可能由多个子模版构成
 * @return {Function}  模版代码生成的js函数
 */
exports.compile = function (templatePath) {
    resetAll();
    fileRealPath = path.resolve(templatePath); // 模版主文件的真实地址
    sourceRoot = path.dirname(fileRealPath); // 模版主文件的文件夹地址
    resolveSub(fs.readFileSync(templatePath, 'utf-8'), templatePath);
    return compile(subToCombinedTemplateNode.toString());
};
/**
 * 生成sourceMap
 * @param generatedFilePath 与 sourceMap 相关联的生成文件的路径,
 * 其中文件名应是主模版文件夹名，在compile方法中生成
 * @param runRoot 运行时路径
 * @param handleMap 处理生成的map，没有则不变化
 * @return {*}
 */
exports.generateSourceMap = function (generatedFilePath, runRoot, handleMap) {
    var realPath = path.resolve(generatedFilePath); //最终生成的文件的路径
    var mapPath = realPath + '.map'; // map文件路径
    var templateSourceMap = generateMap(runRoot);
    if (handleMap !== undefined) {
        templateSourceMap = handleMap(generateMap(runRoot));
    }
    fs.writeFileSync(mapPath, templateSourceMap.toString());  //和生成的模版文件同路径下，写map文件
    fs.appendFileSync(realPath, '\n//@ sourceMappingURL=' + path.basename(mapPath));  //源文件连上map文件
};
/**
 * 初始化语法符号
 * @param config
 */
exports.initSyntax = function (config) {
    SYNTAXSIGN = config;
};