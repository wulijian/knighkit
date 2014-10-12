/**
 * @date 12-12-10
 * @describe: 归一化资源路径，对静态资源地址、require的模块的相对地址做了转换处理
 * @author: KnightWu
 * @version: 1.0
 */
var path = require('path');

/**
 * 静态资源字符串处理所需正则
 * @type {*[]}
 */
var staticRegs = [
    new RegExp(/src[\s]?=[\s]?(['"]?)(.*?)\1/ig),
    new RegExp(/link.*?href[\s]?=[\s]?(['"]?)(.*?)\1/ig) //.*?非贪婪匹配 只过滤link中的href，css文件
];
/**
 * 对require中的路径做转换，将相对路径转换成相对与目标路径的路径，不处理 /a/b 以及 a/b形式的路径，处理 . 开头的路径
 * @type {*[]}
 */
var jsRegs = [
    new RegExp(/require.*?\((['"]?)(\..*?)\1\)/ig) //只过滤link中的href，css文件
];

/**
 * 处理静态资源
 * @param realpath 静态资源原路径
 * @param $1 符合 staticRegs 的字符串
 * @param $3 从 $1 中选出的路径部分
 * @param projectRoot 项目根路径
 * @param targetPath  目标文件夹地址
 * @returns {*|XML|string|void}
 */
var getStaticUniSrc = function (realpath, $1, $3, projectRoot, targetPath) {
    return $1.replace(
        $3,  //路径部分
        path.relative(
            projectRoot, //当前项目文件夹
            path.resolve(realpath, $3) //目标路径
        ).replace(/\\/g, '/')
    );
};
/**
 * 处理js的require
 * @param realpath 静态资源原路径
 * @param $1 符合 staticRegs 的字符串
 * @param $3 从 $1 中选出的路径部分
 * @param projectRoot 项目根路径
 * @param targetPath  目标文件夹地址
 * @returns {*|XML|string|void}
 */
var getJsUniSrc = function (realpath, $1, $3, projectRoot, targetPath) {
    return $1.replace(
        $3,  //路径部分
        path.relative(
            projectRoot, //当前项目文件夹
            path.resolve(realpath, $3) //目标路径
        ).replace(/\\/g, '/')
    );
};

/**
 * .*?非贪婪匹配
 * @param source 源代码
 * @param realpath  资源原路径
 * @param projectRoot 项目根路径
 * @param targetPath 目标文件夹地址
 * @returns {*|XML|string|void}
 */
module.exports = function (source, realpath, projectRoot, targetPath) {
    var unied = source;
    for (var j = 0; j < jsRegs.length; j++) {
        unied = unied.replace(jsRegs[j
            ], function ($1, $2, $3) {
            return getJsUniSrc(realpath, $1, $3, projectRoot, targetPath);
        })
    }
    for (var i = 0; i < staticRegs.length; i++) {
        unied = unied.replace(staticRegs[i], function ($1, $2, $3) {
            return getStaticUniSrc(realpath, $1, $3, projectRoot, targetPath);
        })
    }
    return unied;
};