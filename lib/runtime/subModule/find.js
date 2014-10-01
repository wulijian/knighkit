/**
 * 实时查找子模块
 */
if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    /**
     * 从属性中获取数据信息
     * @example 见 test
     * @param propertyStr 属性的字符串
     */
    var getDataFrom = function (propertyStr) {
        // ( 一个或多个非空格>的字符 空格 = 空格 "' 非贪婪匹配非等号的字符 "' ?= 向后匹配一个空格或者>  )
        var datas = {};
        var dataReg = /([^\s<>'"]+[\s]*=[\s]*(['"]?)[^=>]+?\2(?=[\s]+))|([^\s<>'"]+)/gi;
        (propertyStr + ' ').match(dataReg).forEach(function (dataAttr) {
            var dataKey = dataAttr.match(/^([^\s].*)=/);
            var dataValue = dataAttr.match(/=[\s]*(['"]?)(.*)[\s]*\1/);
            if (dataValue === null) {
                datas[dataAttr] = "true";
            }
            if (dataKey !== null && dataValue !== null) {
                datas[dataKey[1].trim()] = dataValue[2]; //string 去掉外面的 ' 和 "
            }
        });
        //转化成json对象的形式
        return datas;
    };

    /**
     * 从字符串中获取子模块
     * @param htmlCode html代码
     * @returns {Array} 按priority从高到低排列的子模块
     */
    var getSubModules = function (htmlCode) {
        var result = [];
        var puzReg = new RegExp(/<puzzle[\s]+?([^>]*)>.*<\/puzzle>/ig);
        var puzzles = htmlCode.match(puzReg);
        if (puzzles === null) {
            return result;
        }
        puzzles.forEach(function (val) {
            var subModule = getDataFrom(val.replace(/<puzzle|>.*<\/puzzle>/g,''));
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

    /**
     * 获取是 layout 的模块，标志，含有name属性
     * @param htmlCode
     * @returns {Array} 返回含有 name 的子模块，定义此类子模块为 layout，可在extend的时候被替换
     */
    var getLayoutSubs = function (htmlCode) {
        var lsubsObj = {};
        getSubModules(htmlCode)
            .filter(function (sub) {
                return sub.name !== undefined;
            })
            .forEach(function (sub) {
                lsubsObj[sub.name] = sub;
            });
        return lsubsObj;
    };

    exports.in = getSubModules;
    exports.layoutsIn = getLayoutSubs;
    exports.getDataFrom = getDataFrom;
});