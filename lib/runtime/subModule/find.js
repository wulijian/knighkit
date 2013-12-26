/**
 * 实时查找子模块
 */
if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    /**
     * 从带有data-形式的字符串中获取数据信息
     * todo：data-a=的属性值中不能出现data-和=否则会出错
     * @example 见 test
     * @param propertyStr 带有 data- 形式属性的字符串
     */
    var getDataFrom = function (propertyStr) {
        // data- ( 一个或多个非空格>的字符 空格 = 空格 "' 非贪婪匹配非等号的字符 "' ?= 向后匹配一个空格或者>  )
        var dataReg = /data-([^\s>]+[\s]*=[\s]*(['"]?)[^=>]+?\2(?=[\s>]+))/gi;
        //转化成json对象的形式
        return JSON.parse("{\"" + propertyStr.match(dataReg)
            .join(',"')
            .replace(/data-/g, '')
            .replace(/=/g, '":') + "}");
    };

    /**
     * 从字符串中获取子模块
     * @param htmlCode html代码
     * @returns {Array} 按priority从高到低排列的子模块
     */
    var getSubModules = function (htmlCode) {
        var result = [];
        var puzReg = new RegExp(/<puzzle[\s]?(data-[^>]*)><\/puzzle>/ig);
        var puzzles = htmlCode.match(puzReg);
        if (puzzles === null) {
            return result;
        }
        puzzles.forEach(function (val) {
            var subModule = getDataFrom(val);
            subModule.puz = val;
            result.push(subModule);
        });
        result.sort(function (puz1, puz2) {
            var pri1 = puz1.priority || 0;
            var pri2 = puz2.priority || 0;
            if (pri1 < pri2) {
                return 1;
            } else if (pri1 > pri2) {
                return -1;
            } else {
                return 0;
            }
        });
        return result;
    };

    exports.in = getSubModules;
    exports.getDataFrom = getDataFrom;
});