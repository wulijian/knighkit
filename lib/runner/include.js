var fs = require('fs');
var path = require('path');

/**
 * <!--#include virtual="/index/index_news/news_list.htm"-->
 * 从字符串中获取子模块
 * @param htmlCode html代码
 */
var getSubModules = function (htmlCode) {
    var result = [];
    var puzzles = htmlCode.match(/<\!--#include\s+virtual\=(['"]?)(.*)\1\s*-->/g);
    if (puzzles === null) {
        return result;
    }
    puzzles.forEach(function (val) {
        var subInnerHTML = val.match(/<\!--#include\s+virtual\=(['"]?)(.*)\1\s*-->/);
        var subModule = {
            inc: val,
            module: subInnerHTML[2]
        };
        result.push(subModule);
    });
    return result;
};

var getFullPage = function (pageUrl, htmlCode) {
    var code = "";
    try {
        code = htmlCode || fs.readFileSync(pageUrl, 'utf-8');
        var allSubs = getSubModules(code);
        allSubs.forEach(function (sub) {
            var subUrl = path.join(path.dirname(pageUrl), sub.module);
            if (/^\/|\\/.test(sub.module)) {
                if (/\/pages\/|\\pages\\/.test(pageUrl)) { //处于pages文件夹中的页面，根设置在pages下，否则是项目的根文件夹（命令执行的位置）
                    subUrl = path.join(process.cwd(), "pages" + sub.module);//自动在pages文件夹中寻找
                } else {
                    subUrl = path.join(process.cwd(), sub.module);//自动在pages文件夹中寻找
                }
            }
            var subCode = getFullPage(subUrl);
            code = code.replace(sub.inc, subCode);
        });
    } catch (e) {
        console.warn(pageUrl, ' is not found local!');
        code = null;
    }

    return code;
};

exports.include = getFullPage;


