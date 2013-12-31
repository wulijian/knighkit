var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var path = require('path');
var fs = require('fs');
var builder = require('../lib/builder').root(path.resolve(__dirname, './project'));
var q = require('q');
var dc = require('../lib/runtime/dataCache');
require("consoleplusplus");
require("../lib/runtime/subModule/");

describe('module builder', function () {
    describe("编译项目中所有的模块:", function () {
        var consoleinfo = console.info;
        console.info = function () {
        };
        it('遍历模块树，合并模板到模块:', function (done) {
            builder.buildAll(function (allmods) {
                allmods.should.be.eql([
                    '',
                    'content',
                    'content/mod1',
                    'content/mod2',
                    'content/mod2/mod21',
                    'content/mod2/mod22',
                    'content/mod3',
                    "content/mod3/loextend",
                    'content/mod3/mod31',
                    'foot',
                    'foot/mod1',
                    'nav',
                    'nav/mod1',
                    'nav/mod1/mod11',
                    'nav/mod1/mod12'
                ]);
                fs.existsSync(path.resolve(__dirname, './__project/amods.js')).should.be.true;
                done();
                console.info = consoleinfo;
            }).fail(function (err) {
                    done(err);
                    console.info = consoleinfo;
                });
        });
    });

    describe("模板 extend:", function () {
        var consolewarn = console.info;
        console.warn = function () {
        };
        it('for layout extend:', function (done) {
            require('./__project/content/mod3/mod31').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href=".*mod2.css"/>\r\n' +
                    'mod2....\r\n' +
                    '<div>\r\n' +
                    '    <puzzle data-module="./mod21" data-name="content".*></puzzle>\r\n' +
                    '</div>\r\n' +
                    '<puzzle data-module="./mod22" data-async="true".*></puzzle>\r\n' +
                    '<puzzle data-module="../loextend" data-name="bottom" data-async="true".*></puzzle>\r\n' +
                    'mod2....')).notify(done);
        });
        console.warn = consolewarn;
    });

    describe('give the module name, generate a module:', function () {
        it('render module without sub module:', function (done) {
            require('./__project/content/mod3').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href=".*mod3.css"/>\r\nmod3...')).notify(done);
        });

        it('parse sub module with two layer sub module:', function (done) {
            require('./__project/content/mod1').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href=".*mod1.css"/>\r\n' +
                    'mod1...\r\n' +
                    '<link rel="stylesheet" href=".*mod3.css"/>\r\n' +
                    'mod3...\r\n' +
                    'mod1...')).notify(done);
        });

        it('parse sub module with three layer sub module:', function (done) {
            require('./__project/content').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel=\"stylesheet\" href=\".*content.css\"/>\r\n' +
                    '<div id=\"content\">\r\n    ' +
                    '<link rel=\"stylesheet\" href=\".*mod2.css\"/>\r\n' + // mod2 start
                    'mod2....\r\n' +
                    '<div>\r\n' +
                    '    <link rel=\"stylesheet\" href=\".*mod21.css\"/>\r\n' +// mod21 start
                    '<div id="do"></div>\r\n' +
                    'mod21....\r\n' +// mod21 end
                    '</div>\r\n' +
                    '<puzzle data-module=".*mod22" data-async="true".*></puzzle>\r\n' +// mod22 should not be replaced
                    '<link rel=\"stylesheet\" href=\".*mod3.css\"/>\r\n' +  // mod3 start
                    'mod3...\r\nmod2....\r\n' +                           // mod3 end mod2 end
                    '    <link rel=\"stylesheet\" href=\".*mod1.css\"/>\r\n' + // mod1 start
                    'mod1...\r\n' +
                    '<link rel=\"stylesheet\" href=\".*mod3.css\"/>\r\n' +// mod3 start
                    'mod3...\r\n' +// mod3 end
                    'mod1...\r\n' +
                    '</div>')).notify(done);// mod1 end
        });

        it('parse sub module with sub module in for loop:', function (done) {
            require('./__project/foot').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href=".*index.css"/>\r\n' +
                    '    <link rel="stylesheet" href=".*index.css"/>\r\n' +
                    'mod1 in /foot...\r\n' +
                    '    <link rel="stylesheet" href=".*index.css"/>\r\n' +
                    'mod1 in /foot...\r\n' +
                    '    <link rel="stylesheet" href=".*index.css"/>\r\n' +
                    'mod1 in /foot...\r\n' +
                    'foot...')).notify(done);
        });

        it.skip('parse sub module that puzzle in jade:', function (done) {
            require('./__project/nav').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href=".*nav.css"/>' +
                    '<puzzle data-module="./mod1" data-async="true".*></puzzle>')).notify(done);
        });

//todo:怎样测试调用顺序
        it('异步模块添加dom到成功后按优先级回调:', function (done) {
            require('./__project/content').render({a: 1, b: 3}).then(function (subModule) {
                subModule.async.promise.fail(function (err) {
                    done(err);
                });
                subModule.async.resolve(done);
                done();
            }).fail(function (err) {
                    done(err);
                });
        });
    });
});
