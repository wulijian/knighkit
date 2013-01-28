/**
 * @date 13-1-14
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */
var sourceMap = require('source-map');
var path = require('path');
/**
 * 合并 A 到 B， B 到 C 的map，最终生成 A 到 C 的 map，增加到本 map 生成者上
 * @param A2B
 * @param B2C
 * @param file 生成map时所需的file名称
 */
sourceMap.SourceMapGenerator.prototype.combine = function (A2B, B2C, file) {  //return A2C map
    A2B = convertToSourceMapConsumer(A2B, file);
    B2C = convertToSourceMapConsumer(B2C, file);
    var self = this;
    B2C.eachMapping(function (mapping) {   //original order
        self.addMapping(getA2CMapping(mapping, A2B));
    }, sourceMap.SourceMapConsumer.ORIGINAL_ORDER);
};
/**
 * 将一个 obj 转化成 consumer 类型
 * @param obj
 * @param file
 * @return {{}}
 */
var convertToSourceMapConsumer = function (obj, file) {
    var objConsumer = obj;
    if (obj instanceof sourceMap.SourceMapGenerator) {
        objConsumer = new sourceMap.SourceMapConsumer(obj.toString());
    }
    if (obj instanceof sourceMap.SourceNode) {
        objConsumer = new sourceMap.SourceMapConsumer(
            obj.toStringWithSourceMap({file: file}).map.toString()
        );
    }
    return objConsumer;
};
/**
 * 生成单条 A 到 C 的 map
 * @param generatedMapping
 * @param sourceMap
 * @return {{generated: {line: *, column: *}, source: *, original: *}}
 */
var getA2CMapping = function (generatedMapping, sourceMap) {
    var APos = sourceMap.originalPositionFor({
        line: generatedMapping.originalLine,
        column: generatedMapping.originalColumn
    });
    return {
        generated: {
            line: generatedMapping.generatedLine,
            column: generatedMapping.generatedColumn
        },
        source: APos.source,
        original: APos
    };
};
/**
 * 格式化位置对象
 * @param posObj
 * @return {*}
 */
var formatPos = function (posObj) {
    if (posObj !== undefined) {
        posObj = {
            line: posObj.line || 0,
            column: posObj.column || 0
        }
    } else {
        posObj = {line: 0, column: 0};
    }
    return posObj;
};

/**
 * 改变这个map，生成一个新的map对象
 * @param walker  遍历操作
 */
sourceMap.SourceMapGenerator.prototype.transform = function (walker) {
    var offsetObj = new sourceMap.SourceMapGenerator({
        file: this._file,
        sourceRoot: this._sourceRoot
    });
    var objConsumer = new sourceMap.SourceMapConsumer(this.toString());
    objConsumer.eachMapping(function (mapping) {   //generated order
        offsetObj.addMapping(walker(mapping));
    });
    return offsetObj;
};

/**
 * line 和 column 平移固定的值，比如，所有的行号和列号
 * @param generated
 * @param original
 * @return {*}
 */
sourceMap.SourceMapGenerator.prototype.offset = function (generated, original) {
    generated = formatPos(generated);
    original = formatPos(original);
    var sourceRoot = this._sourceRoot;
    return this.transform(function (mapping) {
        return {
            generated: {
                line: mapping.generatedLine + generated.line,
                column: mapping.generatedColumn + generated.column
            },
            source: path.relative(sourceRoot, mapping.source),
            original: {
                line: mapping.originalLine + original.line,
                column: mapping.originalColumn + original.column
            }
        };
    });
};
