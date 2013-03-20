/**
 * @author: yuanzhen
 * Date: 13-1-17 上午10:57
 */

var fs = require('fs');
var path = require('path');
require("consoleplusplus");
var template = require('../../config')().template;
var suffix = require('./package.json').suffix;

/**
 * 置空此类数据
 * @param jsonFileName
 */
var clearUpData = function (jsonFileName) {
    var files = fs.readdirSync(template);
    try {
        files.forEach(function (value) {
            var filePath = template + '/' + value + '/m.json';
            if (value.indexOf('.json') === -1) {  //是文件夹
                var geData = require(filePath);
                delete geData[jsonFileName.split('.')[0]];
                fs.writeFileSync(filePath, JSON.stringify(geData));
            }
        });
    } catch (error) {
        console.error(error);
    }

};

/**
 * 往模板文件里写数据
 * @param realPath
 * @param metaName
 * @param data
 */
var addDataToMjson = function (realPath, metaName, data) {
    var geData = require(realPath + "/m.json");
    geData[metaName] = data;
    fs.writeFileSync(realPath + "/m.json", JSON.stringify(geData));
    console.info('Append #red{[' + metaName + '.json/' + path.basename(realPath) + ']} data into #yellow{[' + realPath + '.json]} success.');
};

/**
 * 根据提供的json数据生成所有的模板文件
 * @param realPath 当前路径
 */
var generateAllFiles = function (realPath) {
    var exists = fs.existsSync(realPath);
    if (!exists) {
        fs.mkdirSync(realPath);
        for (var i = 0; i < suffix.length; i++) {
            fs.writeFileSync(realPath + "/m" + suffix[i], (suffix[i] == ".json") ? '{}' : ' ');
        }
        fs.writeFileSync(realPath + "/data.js", 'module.exports={};');
    }
};
/**
 * 根据提供的json数据,生成数据并且在模板文件中添加数据
 * @param value
 */
var generate = function (value) {
    var data = require(path.resolve(template + '/' + value));
    var word = value.split('.')[0];
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var realPath = template + '/' + key;
            generateAllFiles(realPath);
            addDataToMjson(realPath, word, data[key]);
        }
    }
};
/**
 * 初始化生成模板文件
 */
exports.initProject = function () {
    var files = fs.readdirSync(template);
    files.forEach(function (value) {
        if (value.indexOf('.json') > 0) {  //是文件夹
            clearUpData(value);
            setTimeout(function () {
                generate(value);
            }, 1000);
        }
    });
};


