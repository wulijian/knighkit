var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var path = require('path');
var fs = require('fs');
var builder = require('../lib/builder').root(path.resolve(__dirname, './project'));
require("consoleplusplus");
require("../lib/runtime/subModule/");

describe('模块编译和运行', function () {
    describe("编译项目中所有的模块", function () {
        var consoleinfo = console.info;
        console.info = function () {
        };
        it('遍历模块树，合并模板到模块', function (done) {
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

    describe("模板继承", function () {
        var consolewarn = console.info;
        var consoleerror = console.error;
        console.error = function () {
        };
        console.warn = function () {
        };
        it('模板继承', function (done) {
            require('./__project/content/mod3/mod31').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href="project/content/mod3/mod31/mod2.css"/>\r\n' +
                    'mod2....\r\n' +
                    '<div>\r\n' +
                    '    <ac id=".*"></ac>\r\n' +
                    '</div>\r\n' +
                    '<ac id=".*"></ac>\r\n' +
                    '<ac id=".*"></ac>\r\n' +
                    'mod2....')).notify(done);
            console.error = consoleerror;
        });
        console.warn = consolewarn;

    });

    describe('根据模块名称，渲染模块的htmlcode', function () {
        it('无子模块', function (done) {
            require('./__project/content/mod3').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href=".*mod3.css"/>\r\nmod3...')).notify(done);
        });

        it('两层子模块', function (done) {
            require('./__project/content/mod1').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href="project/content/mod1/mod1.css"/>\r\n' +
                    'mod1...\r\n' +
                    '<ac mid=".*"><link rel="stylesheet" href="project/content/mod3/mod3.css"/>\r\n' +
                    'mod3...</ac>\r\n' +
                    'mod1...')).notify(done);
        });

        it('3层子模块', function (done) {
            require('./__project/content').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href="project/content/content.css"/>\r\n' +
                    '<div id="content">\r\n' +
                    '    <ac mid=".*"><link rel="stylesheet" href="project/content/mod2/mod2.css"/>\r\n' +
                    'mod2....\r\n' +
                    '<div>\r\n' +
                    '    <ac mid=".*"><link rel="stylesheet" href="project/content/mod2/mod21/mod21.css"/>\r\n' +
                    '<div id="do"></div>\r\n' +
                    'mod21....</ac>\r\n' +
                    '</div>\r\n' +
                    '<ac id=".*"></ac>\r\n' +
                    '<ac mid=".*"><link rel="stylesheet" href="project/content/mod3/mod3.css"/>\r\n' +
                    'mod3...</ac>\r\n' +
                    'mod2....</ac>\r\n' +
                    '    <ac mid=".*"><link rel="stylesheet" href="project/content/mod1/mod1.css"/>\r\n' +
                    'mod1...\r\n' +
                    '<ac mid=".*"><link rel="stylesheet" href="project/content/mod3/mod3.css"/>\r\n' +
                    'mod3...</ac>\r\n' +
                    'mod1...</ac>\r\n' +
                    '</div>')).notify(done);// mod1 end
        });

        it('子模块声明是动态生成的', function (done) {
            require('./__project/foot').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href="project/foot/index.css"/>\r\n' +
                    '<ac mid=".*"><link rel="stylesheet" href="project/foot/mod1/index.css"/>\r\n' +
                    'mod1 in /foot...</ac>\r\n' +
                    '<ac mid=".*"><link rel="stylesheet" href="project/foot/mod1/index.css"/>\r\n' +
                    'mod1 in /foot...</ac>\r\n' +
                    '<ac mid=".*"><link rel="stylesheet" href="project/foot/mod1/index.css"/>\r\n' +
                    'mod1 in /foot...</ac>\r\n' +
                    'foot...')).notify(done);
        });

        it('jade生成的子模块声明', function (done) {
            require('./__project/nav').render({a: 1, b: 3})
                .get('html')
                .should.eventually.match(new RegExp('<link rel="stylesheet" href=".*nav.css"/>' +
                    '<ac id=".*"></ac>')).notify(done);
        });

//todo:怎样测试调用顺序
        it('异步模块添加dom到成功后按优先级回调', function (done) {
            require('./__project/content').render({a: 1, b: 3}).then(function (subModule) {
                subModule.error(function (err) {
                    done(err);
                });
                subModule.done();
                done();
            }).fail(function (err) {
                    done(err);
                });
        });

        it('数据过滤和缓存', function (done) {
            var consolelog = console.log;
            var consoleerror = console.error;
            console.log = console.error = function () {
            };
            require('./__project').render({a: 1, b: 3}).then(function (subModule) {
                subModule.done();
            }).fail(function (err) {
                    done(err);
                });
            setTimeout(function () {
                for (var key in ___runtimeCache___) {
                    if (___runtimeCache___.hasOwnProperty(key)) {
                        if (key.indexOf('content\\mod2\\index') !== -1) {
                            ___runtimeCache___[key].should.eql([1]);
                        }
                        if (key.indexOf('nav\\mod1\\index') !== -1) {
                            ___runtimeCache___[key].should.eql({a: 1, b: 3});
                        }
                        if (key.indexOf('foot\\mod1\\index') !== -1) {
                            ___runtimeCache___[key].should.eql([3]);
                        }
                    }
                }
                console.error = consoleerror;
                console.log = consolelog;
                done();
            }, 100);
        });
    });
});
