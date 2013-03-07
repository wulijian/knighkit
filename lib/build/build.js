/**
 * @date 12-12-13
 * @describe:
 * @author: KnightWu
 */
var fs = require('fs');
var path = require('path');

require('./generate').buildAll(function () {
    var distDir = path.resolve(__dirname, "../../../../src/scripts/index");
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }
    setTimeout(function () {
        if (!require('./generate/package.json').debug) {
            require('jspacker').pack(
                "../../../../src/scripts/index",
                "../../../../dist",
                "business",
                "../../../../"
            );
        }
    }, 10);
});
