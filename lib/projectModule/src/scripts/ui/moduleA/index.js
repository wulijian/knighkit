/**
 * @describe: UI模块A的业务逻辑
 */
define(function (require, exports, module) {
    var $ = require('jquery');
    exports.init= function () {
        var data = {hi:'user',hello:'world'};
        $('#hogan').html(require('src/template/example-hogan').render(data));
        $('#html').html(require('src/template/example-html').render(data));
        $('#jade').html(require('src/template/example-jade').render(data));
        $('#vm').html(require('src/template/example-vm').render(data));
    }
});
