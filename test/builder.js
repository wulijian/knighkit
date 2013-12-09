require('chai').should();
var path = require('path');
var fs = require('fs');
var builder = require('../lib/builder');
var q = require('q');
var dc = require('../lib/runtime/dataCache');

describe('module builder', function () {
    var modulePath = path.resolve(__dirname, './project/content');
    describe('give the module name, generate a module:', function () {
        var afterBuild;
        beforeEach(function () {
            afterBuild = builder.build(modulePath, __dirname);
        });
        it('after build, the render function will return a string:', function (done) {
            afterBuild.then(function () {
                require('./__project/content').render({a: 1, b: 3})
                    .should.eql('<link rel="stylesheet" href="content.css"/>\r\n<div id="content">\r\n    ' +
                        '<puzzle data-module="./mod1"></puzzle>\r\n    <puzzle data-module="./mod1"></puzzle>\r\n</div>');
                done();
            }).fail(function (error) {
                    done(error);
                });
        });
        it('after build, the data should be cached by runtime dataCache:', function (done) {
            afterBuild.then(function () {
                require('./__project/content').render({a: 6, b: "4"});
                dc.get(require('./__project/content').id).should.eql({a: 6, b: "4"});
                done();
            }).fail(function (error) {
                    done(error);
                });
        });
    });
});
