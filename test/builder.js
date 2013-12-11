var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var path = require('path');
var fs = require('fs');
var builder = require('../lib/builder');
var q = require('q');
var dc = require('../lib/runtime/dataCache');

describe('module builder', function () {
    describe('give the module name, generate a module:', function () {
        describe("the module without sub module:", function () {
            var afterBuild;
            var modulename = 'project/content/mod3';
            beforeEach(function () {
                afterBuild = builder.build(modulename, __dirname);
            });
            it('build simple module without sub:', function (done) {
                return afterBuild.then(function () {
                    return require('./__project/content/mod3').render({a: 1, b: 3});
                }).should.eventually.equal('<link rel="stylesheet" href="mod3.css"/>\r\nmod3...').notify(done);
            });
            it('after build, the data should be cached by runtime dataCache:', function (done) {
                afterBuild.then(function () {
                    require('./__project/content/mod3').render({a: 6, b: "4"});
                    dc.get(require('./__project/content/mod3').id).should.eql({a: 6, b: "4"});
                    done();
                }).fail(function (error) {
                        done(error);
                    });
            });
        });

        describe("the module with two layer sub module:", function () {
            var modulename2 = 'project/content/mod1';
            var modulename1 = 'project/content/mod3';
            it('parse sub module:', function (done) {
                q.all([
                        builder.build(modulename2, __dirname),
                        builder.build(modulename1, __dirname)
                    ])
                    .then(function () {
                        require('./__project/content/mod1').render({a: 1, b: 3}).then(function (html) {
                            html.should.eql('<link rel="stylesheet" href="mod1.css"/>\r\nmod1...\r\n' +
                                '<link rel="stylesheet" href="mod3.css"/>\r\nmod3...\r\nmod1...');
                            done();
                        })
                    }).fail(function (err) {
                        done(err);
                    });
            });
        });
        describe("the module with three layer sub module:", function () {
            this.timeout(3000);
            var modulename2 = 'project/content/mod1';
            var modulename1 = 'project/content/mod3';
            var modulename3 = 'project/content/mod2';
            var modulename0 = 'project/content';
            var modulename4 = 'project/content/mod2/mod21';

            it('parse sub module:', function (done) {
                q.all([
                        builder.build(modulename0, __dirname),
                        builder.build(modulename2, __dirname),
                        builder.build(modulename1, __dirname),
                        builder.build(modulename3, __dirname),
                        builder.build(modulename4, __dirname)
                    ])
                    .then(function () {
                        require('./__project/content').render({a: 1, b: 3}).then(function (html) {
                            html.should.eql('<link rel=\"stylesheet\" href=\"content.css\"/>\r\n<div id=\"content\">\r\n    ' +
                                '<link rel=\"stylesheet\" href=\"mod2.css\"/>\r\nmod2....\r\n<div>\r\n   ' +
                                ' <link rel=\"stylesheet\" href=\"mod21.css\"/>\r\n<div id="do"></div>\r\nmod21....\r\n</div>\r\n\r\n' +
                                '<link rel=\"stylesheet\" href=\"mod3.css\"/>\r\nmod3...\r\nmod2....\r\n    ' +
                                '<link rel=\"stylesheet\" href=\"mod1.css\"/>\r\nmod1...\r\n<link rel=\"stylesheet\" href='
                                + '\"mod3.css\"/>\r\nmod3...\r\nmod1...\r\n</div>');
                            done();
                        }).fail(function (err) {
                                done(err);
                            })
                    })
                    .fail(function (err) {
                        done(err);
                    });
            });
        });
    });
});
