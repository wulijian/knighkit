require('should');
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
                    sync: true
                },
                {
                    module: './foot',
                    sync: true,
                    priority: 1,
                    new: false
                },
                {
                    module: './nav',
                    new: true
                }
            ]);
        });
    });
});
