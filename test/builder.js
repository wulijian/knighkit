require('should');
var path = require('path');
var fs = require('fs');
var builder = require('../lib/builder');
var q = require('q');

describe('module builder', function () {
    var modulePath = path.resolve(__dirname, './project/content');
    describe('give the module name, generate a module:', function () {
        it('after build, the render function will return a string:', function (done) {
            builder.build(modulePath, __dirname).then(function(){
                require('./__modules/project/content').render({a: 1, b: 3})
                    .should.eql('<link rel="stylesheet" href="content.css"/>\r\n<div id="content">\r\n   ' +
                        ' <puzzle data-module="./mod1"></puzzle>\r\n    <puzzle data-module="./mod1"></puzzle>\r\n</div>');
                done();
            });
        });
    });
});
