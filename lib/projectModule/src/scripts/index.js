/**
 * Date: 13-1-14
 * Time: 下午12:18
 */
define(function (require, exports) {
    var $ = require('jquery');
    var global = require('global');
    var modA = require('./ui/moduleA/index');
    $(function () {
        modA.init();
    });
});