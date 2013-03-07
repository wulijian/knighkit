/**
 * @date 12-12-13
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */
require('./generate').buildAll(function () {
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
