/**
 * @date 12-12-13
 * @describe:
 * @author: KnightWu
 * @version: 1.0
 */

require('./generate').initialize(function () {
    setTimeout(function () {
        if (!require('./generate/package.json').debug) {
            require('./package').initialize();
        }
    }, 10);
});
