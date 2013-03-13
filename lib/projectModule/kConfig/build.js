/**
 * nodejs build 文件时需要的配置文件
 * 以下路径配置需要以 base 路径为基础，不得使用相对路径
 */
module.exports = {
    "base": "", // 项目的根目录
    "template": "src/template", // 项目中待编译模版的路径
    "buildTemplate": "kConfig/moduleTemplate", //编译模版需要的 js 模块模版
    "output": "output", //输出路径
    "templateSuffix": ".html",
    "cssOutput": "src/styles/dict.css"
};