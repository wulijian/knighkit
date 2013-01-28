/**
 * @date 13-1-14
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */
var original = null;
var generated = null;
/**
 * 扫描对象
 * @param n 开始位置
 */
var Scan = function (n) {
    this.start = n;
    this.value = n;
};

Scan.prototype = {
    constructor: Scan,
    /**
     * 跳过 n 个位置
     * @param n
     */
    skip: function (n) {
        this.value += n;
    },
    /**
     * 重新从起始位置开始
     */
    restart: function () {
        this.value = this.start;
    }
};
/**
 * 位置对象
 * @param line  行
 * @param column   列
 * @constructor
 */
var PosMap = function (line, column) {
    this.line = new Scan(line);
    this.column = new Scan(column);
};

PosMap.prototype = {
    constructor: PosMap,
    /**
     * 获取行列信息
     * @return {{line: (*|Function|String|number|number|Function|Function|Function|Function|value|o.value|String|String|String|String|String|String|Number|String|value|value|value|st.attrHooks.value|val.value|value|value|value|.Traverse.value|Traverse.value|string|jQuery.value|string|jQuery.value|string|jQuery.value|string|jQuery.value|jQuery.attrHooks.value|string|jQuery.value|jQuery.attrHooks.value|string|jQuery.value|jQuery.attrHooks.value), column: (*|Function|String|number|number|Function|Function|Function|Function|value|o.value|String|String|String|String|String|String|Number|String|value|value|value|st.attrHooks.value|val.value|value|value|value|.Traverse.value|Traverse.value|string|jQuery.value|string|jQuery.value|string|jQuery.value|string|jQuery.value|jQuery.attrHooks.value|string|jQuery.value|jQuery.attrHooks.value|string|jQuery.value|jQuery.attrHooks.value)}}
     */
    getPos: function () {
        return {
            line: this.line.value,
            column: this.column.value
        }
    }
};

exports.init = function (callback) {
    original = new PosMap(1, 0);
    generated = new PosMap(1, 0);
    if (callback !== undefined) {
        callback(original, generated);
    }
};
/**
 * 消耗代码，计算位置
 * @param str
 * @param isNewAline
 * @param recordIt
 * @param isLogicCode
 */
exports.consume = function (str, isNewAline, recordIt, isLogicCode) {
    var allLines = str.split(/\r\n/);
    if (isLogicCode) { //逻辑代码，需移动 <% = 的列号
        original.column.skip(2);// <%
        var isLogicValue = !!(str.indexOf('=') === 0); //是否值
        if (isLogicValue) {  //值 =
            original.column.skip(1);
        }
    }
    if (isNewAline) {
        generated.line.skip(1);
    }
    if (recordIt !== undefined) {
        recordIt({
            generated: generated.getPos(),
            original: original.getPos()
        });
    }

    if (allLines.length !== 1) {  //折行，重新计算
        original.column.restart();
    }
    original.column.skip(allLines[allLines.length - 1].length);
    original.line.skip(allLines.length - 1);

    if (isLogicCode) { //逻辑代码，需移动 %> 的列号
        original.column.skip(2);// %>
    }
};

