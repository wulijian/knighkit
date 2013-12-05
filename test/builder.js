require('should');
var path = require('path');
var fs = require('fs');
var builder = require('../lib/builder');
var q = require('q');
var generateOptions = {
    "indent_start": 0,
    "indent_level": 4,
    "quote_keys": true,
    "space_colon": true,
    "ascii_only": false,
    "inline_script": false,
    "width": 80,
    "max_line_len": 32000,
    "beautify": true,
    "source_map": null,
    "bracketize": false,
    "comments": true,
    "semicolons": true
};

describe('module builder', function () {
    var modulePath = path.resolve(__dirname, './project/content');
    beforeEach(function () {
        var code = fs.readFileSync(modulePath + '/index-backup.js');
        fs.writeFile(modulePath + '/index.js', code);
    });
    describe('give the module name, generate a module:', function () {
        it('after build, the render function will return a string:', function () {
            builder.build(modulePath).then(function(){
                require('./project/content').render({}).should.eql('<link rel="stylesheet" href="content.css"/>\r\n<div id="content">\r\n    <puzzle data-module="./mod1"></puzzle>\r\n    <puzzle data-module="./mod1"></puzzle>\r\n</div>');
            });
        });
    });
});
