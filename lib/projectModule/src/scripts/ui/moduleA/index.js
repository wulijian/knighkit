/**
 * @describe: UI模块A的业务逻辑
 */
define(function (require, exports, module) {
    var $ = require('jquery');
    exports.init= function () {
        var data = {hi:'user',hello:'world'};
        $('#hogan').html(require('output/example-hogan/example-hogan').render(data));
        $('#html').html(require('output/example-html/example-html').render(data));
        $('#jade').html(require('output/example-jade/example-jade').render(data));
        $('#vm').html(require('output/example-vm/example-vm').render(data));
    }
});
