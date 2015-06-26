/**
 * @describe: UI模块A的业务逻辑
 */
define(function (require, exports, module) {
    var $ = require('jquery');
    exports.init = function () {
        var data = {hi: 'user', hello: 'world'};
        $('#hogan').html(require('template/example-hogan').render(data));
        require('template/example-hogan').init();
        $('#html').html(require('template/example-html').render(data));
        require('template/example-html').init();
        $('#jade').html(require('template/example-jade').render(data));
        require('template/example-jade').init();
    }
});
