/**
 * @description
 * 此方法用来代替原模板方法，在开发阶段可以像正常的函数一样调用，在build阶段，会被 index.html 与 data.js 合并而成的方法替代。
 * @example 例如：
 *  ___injection___(data)
 *  会被处理成：
 *
 *  function anonymous(_data) {
 *      var htmlCode = "";
 *     with (_data || {}) {
 *          htmlCode += '';
 *      }
 *     return htmlCode;
 *  }(data)
 *
 * @returns {string} 默认返回空字符串
 * @private
 */
function ___template___() {
    return '';
}