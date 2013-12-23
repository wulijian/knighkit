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

describe('module builder', function () {
    describe('give the module name, generate a module:', function () {
        describe("the module without sub module:", function () {
            it('build simple module without sub:', function (done) {
                builder.build(path.resolve(__dirname, 'project/content/mod3'))
                    .then(function () {
                        return require('./__project/content/mod3').render({a: 1, b: 3});
                    })
                    .get('html')
                    .should.eventually.eql('<link rel="stylesheet" href="mod3.css"/>\r\nmod3...').notify(done);
            });
            it('after build, the data should be cached by runtime dataCache:', function (done) {
                require('./__project/content/mod3').render({a: 6, b: "4"});
                dc.get(require('./__project/content/mod3').id).should.eql({a: 6, b: "4"});
                done();
            });
        });

        describe("the module with two layer sub module:", function () {
            it('parse sub module:', function (done) {
                q.all([
                        builder.build(path.resolve(__dirname, 'project/content/mod1')),
                        builder.build(path.resolve(__dirname, 'project/content/mod3'))
                    ])
                    .then(function () {
                        return require('./__project/content/mod1').render({a: 1, b: 3})
                    })
                    .get('html')
                    .should.eventually.eql('<link rel="stylesheet" href="mod1.css"/>\r\n' +
                        'mod1...\r\n' +
                        '<link rel="stylesheet" href="mod3.css"/>\r\n' +
                        'mod3...\r\n' +
                        'mod1...').notify(done);
            });
        });

        describe("the module with three layer sub module:", function () {
            this.timeout(3000);
            it('parse sub module:', function (done) {
                q.all([
                        builder.build(path.resolve(__dirname, 'project/content')),
                        builder.build(path.resolve(__dirname, 'project/content/mod1')),
                        builder.build(path.resolve(__dirname, 'project/content/mod2')),
                        builder.build(path.resolve(__dirname, 'project/content/mod2/mod21')),
                        builder.build(path.resolve(__dirname, 'project/content/mod2/mod22')),
                        builder.build(path.resolve(__dirname, 'project/content/mod3'))
                    ])
                    .then(function () {
                        return require('./__project/content').render({a: 1, b: 3});
                    })
                    .get('html')
                    .should.eventually.match(new RegExp('<link rel=\"stylesheet\" href=\"content.css\"/>\r\n' +
                        '<div id=\"content\">\r\n    ' +
                        '<link rel=\"stylesheet\" href=\"mod2.css\"/>\r\n' + // mod2 start
                        'mod2....\r\n' +
                        '<div>\r\n' +
                        '    <link rel=\"stylesheet\" href=\"mod21.css\"/>\r\n' +// mod21 start
                        '<div id="do"></div>\r\n' +
                        'mod21....\r\n' +// mod21 end
                        '</div>\r\n' +
                        '<puzzle data-module="./mod22" data-async="true".*></puzzle>\r\n' +// mod22 should not be replaced
                        '<link rel=\"stylesheet\" href=\"mod3.css\"/>\r\n' +  // mod3 start
                        'mod3...\r\nmod2....\r\n' +                           // mod3 end mod2 end
                        '    <link rel=\"stylesheet\" href=\"mod1.css\"/>\r\n' + // mod1 start
                        'mod1...\r\n' +
                        '<link rel=\"stylesheet\" href=\"mod3.css\"/>\r\n' +// mod3 start
                        'mod3...\r\n' +// mod3 end
                        'mod1...\r\n' +
                        '</div>')).notify(done);// mod1 end
            });
        });

        describe("submodule in for loop:", function () {
            it('parse sub module:', function (done) {
                q.all([
                        builder.build(path.resolve(__dirname, 'project/foot')),
                        builder.build(path.resolve(__dirname, 'project/foot/mod1'))
                    ])
                    .then(function () {
                        return require('./__project/foot').render({a: 1, b: 3})
                    })
                    .get('html')
                    .should.eventually.eql('<link rel="stylesheet" href="index.css"/>\r\n' +
                        '    <link rel="stylesheet" href="index.css"/>\r\n' +
                        'mod1 in /foot...\r\n' +
                        '    <link rel="stylesheet" href="index.css"/>\r\n' +
                        'mod1 in /foot...\r\n' +
                        '    <link rel="stylesheet" href="index.css"/>\r\n' +
                        'mod1 in /foot...\r\n' +
                        'foot...').notify(done);
            });
        });

        describe("puzzle in jade:", function () {
            it('parse sub module:', function (done) {
                q.all([
                        builder.build(path.resolve(__dirname, 'project/nav')),
                        builder.build(path.resolve(__dirname, 'project/nav/mod1'))
                    ])
                    .then(function () {
                        return require('./__project/nav').render({a: 1, b: 3})
                    })
                    .get('html')
                    .should.eventually.match(new RegExp('<link rel="stylesheet" href="nav.css"/>' +
                        '<puzzle data-module="./mod1" data-async="true".*></puzzle>')).notify(done);
            });
        });

//todo:怎样测试调用顺序
        describe("异步模块添加dom到成功后按优先级回调:", function () {
            it('dom 回调:', function (done) {
                q.all([
                        builder.build(path.resolve(__dirname, 'project/nav')),
                        builder.build(path.resolve(__dirname, 'project/nav/mod1/mod11')),
                        builder.build(path.resolve(__dirname, 'project/nav/mod1/mod12')),
                        builder.build(path.resolve(__dirname, 'project/nav/mod1'))
                    ])
                    .then(function () {
                        require('./__project/nav').render({a: 1, b: 3}).then(function (subModule) {
                            subModule.async.promise.fail(function (err) {
                                done(err);
                            });
                            subModule.async.resolve(done);
                            done();
                        }).fail(function (err) {
                                done(err);
                            });
                    }).fail(function (err) {
                        done(err);
                    });
            });
        });

        describe("资源路径转换:", function () {
            it('路径转换:', function () {

            });
        });

        describe("数据的处理，data 来源和选择:", function () {
            it('selector筛选父模板data中的部分数据:', function () {
            });
            it('模板自己请求数据，selector无作用:', function () {
            });
        });

        describe("遍历模块树:", function () {
            it('遍历模块树:', function (done) {
                require('../lib/builder/walkFile').walk(path.resolve(__dirname, './project'), false, function (value) {
                    console.log(value);
                });
            })
        });

        describe.only("编译项目中所有的模块:", function () {
            it('遍历模块树:', function (done) {
                builder.buildAll();
            })
        });
    });
});
