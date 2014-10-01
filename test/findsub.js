require('chai').should();
var path = require('path');
var fs = require('fs');
var findSubModule = require('../lib/runtime/subModule/find');

describe('遍历树形结构和查找子模块', function () {
    describe('从 puzzle 标签中获取  属性的值', function () {
        it('只有  属性', function () {
            findSubModule.getDataFrom('a="tes a" b="1" c="true"').should.eql({
                a: "tes a",
                b: "1",
                c: "true"
            });
        });
        it('（无 =） + （有等号无值） 的属性', function () {
            findSubModule.getDataFrom('a="1" b="" c d= "a" e = "b" f=4 h= 5 g =7').should.eql({
                a: "1",
                b: "",
                c: "true",
                "d": "a",
                "e": "b",
                "f": "4",
                "g": "7",
                "h": "5"
            });
        });
        it('=类的属性', function () {
            findSubModule.getDataFrom('a="1" g= style="color:red"').should.eql({
                a: '1',
                g: '',
                style: 'color:red'
            });
        });
        it('属性字符串是单引号', function () {
            findSubModule.getDataFrom('a=\'1\'').should.eql({
                a: "1"
            });
        });
        it('属性中含有单引号', function () {
            findSubModule.getDataFrom('a="\'1\'23"').should.eql({
                a: "\'1\'23"
            });
        });
        it('含有转义字符的字符串', function () {
            findSubModule.getDataFrom('a="\"1\"23"').should.eql({
                a: "\"1\"23"
            });
        });
        it('属性值是布尔型', function () {
            findSubModule.getDataFrom('a=true').should.eql({
                a: "true"
            });
        });
    });

    describe('遍历文件树', function () {
        var code = fs.readFileSync(path.resolve(__dirname, './project/index.html'), 'utf-8').toString();
        it('检测index.html，子模块信息对象按优先级排列返回', function () {
            findSubModule.in(code).should.eql([
                {
                    "module": "./justAhtml",
                    "async": "true",
                    "priority": "4",
                    "puz": "<puzzle module=\"./justAhtml\" priority=\"4\" async></puzzle>"
                },
                {
                    "module": "./content",
                    "priority": "2",
                    "puz": "<puzzle module=\"./content\" priority=\"2\"></puzzle>"
                },
                {
                    "async": "true",
                    "module": "./foot",
                    "priority": "1",
                    "puz": "<puzzle module=\"./foot\" priority=\"1\" async></puzzle>"
                },
                {
                    "async": "true",
                    "module": "./bottom",
                    "priority": "1",
                    "puz": "<puzzle module=\"./bottom\" priority=\"1\" async></puzzle>"
                },
                {
                    "module": "./pureHtml",
                    "async": "true",
                    "priority": "1",
                    "puz": "<puzzle module=\"./pureHtml\" priority=\"1\" async></puzzle>"
                },
                {
                    "module": "./pureJade",
                    "async": "true",
                    "priority": "1",
                    "puz": "<puzzle module=\"./pureJade\" priority=\"1\" async></puzzle>"
                },
                {
                    "module": "./nav",
                    "new": "true",
                    "puz": "<puzzle module=\"./nav\" new></puzzle>"
                }
            ]);
        });
        it('无puzzle，返回[]', function () {
            findSubModule.in('<body>when walk through the code has no puzzle ,return a </body>').should.eql([]);
        });
    });
});
