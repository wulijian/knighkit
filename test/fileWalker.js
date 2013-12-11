require('chai').should();
var path = require('path');
var fs = require('fs');
var filewalker = require('../lib/fileWalker');

describe('File tree walker', function () {
    describe('getDataFrom：get data- from puzzle', function () {
        it('<puzzle data-a="tes a" data-b=1 data-c=true><\/puzzle>:', function () {
            filewalker.getDataFrom('<puzzle data-a="tes a" data-b=1 data-c=true><\/puzzle>').should.eql({
                a: "tes a",
                b: 1,
                c: true
            });
        });
        it('<puzzle data-a="1" data-b=1 style="color:red" data-c=true onclick=""><\/puzzle>:', function () {
            filewalker.getDataFrom('<puzzle data-a="1" data-b=1 style="color:red" data-c=true onclick=""><\/puzzle>').should.eql({
                a: "1",
                b: 1,
                c: true
            });
        });
        it('<puzzle data-a="1" data-b="" data-c data-d=><\/puzzle>:', function () {
            filewalker.getDataFrom('<puzzle data-a="1" data-b="" data-c data-d=><\/puzzle>').should.eql({
                a: "1",
                b: ""
            });
        });
        it('<puzzle data-a="1"  data-=""  data-h="df" data-b=1   data-g= style="color:red" data-c=true><\/puzzle>:', function () {
            filewalker.getDataFrom('<puzzle data-a="1"  data-=""  data-h="df" data-b=1   data-g= style="color:red" data-c=true><\/puzzle>').should.eql({
                a: "1",
                b: 1,
                h: "df",
                c: true
            });
        });
    });

    describe('walk the file tree', function () {
        var code = fs.readFileSync(path.resolve(__dirname, './project/index.html'), 'utf-8').toString();
        it('when walk through index.html, all submodules should be found and order by priority:', function () {
            filewalker.getSubModules(code).should.eql([
                {
                    module: './content',
                    priority: 2,
                    async: true,
                    puz: '<puzzle data-module="./content" data-priority=2 data-async=true></puzzle>'
                },
                {
                    module: './foot',
                    async: true,
                    priority: 1,
                    new: false,
                    puz: '<puzzle data-module="./foot" data-priority=1 data-new=false data-async=true></puzzle>'
                },
                {
                    module: './nav',
                    new: true,
                    puz: '<puzzle data-module="./nav" data-new=true></puzzle>'
                }
            ]);
        });
        it('when walk through the code has no puzzle ,return a []:', function () {
            filewalker.getSubModules('<body>when walk through the code has no puzzle ,return a </body>').should.eql([]);
        });
    });
});
