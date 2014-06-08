/**
 * Created by wuwei on 14-6-4.
 */
var a ;
//var http = require("http");
//var fs = require('fs');
//http.get('http://localhost:9527/project',function(res,req){
//    res.setEncoding('utf8');
//    res.on('data',function(chunk){
//        fs.writeFileSync('./___index.js', chunk);
//        a = require('./___index');
//        setTimeout(function(){
//            console.log(a.render);
//        },1500);
//        fs.unlink('./___index.js');
//    });
//});
//
//setTimeout(function(){
//    b= require('./___index');
//    console.log(require('path').extname('a.js'));
//    console.log(b);
//},2000);

module._compile('var a =3; exports.geta = function(){return a;}',__dirname +'/a.js');
console.log(__dirname +'/a.js');
console.log(require.cache);
require('./a').geta();
//var a = require('http://localhost:9527/project/');
//console.table(a);