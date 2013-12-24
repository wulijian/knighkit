/**
 * @date 13-2-21
 * @describe: 对所有模版引用，seajs 不提供动态加载模块，因此采用引用的方式加载
 * @author: wulj
 * @version: 1.0
 */
if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define(function (require, exports, module) {
    module.exports = {
    <% for(var i=0; i<_data.length ; i++){ %>
        <% var comma = (i===_data.length-1)?'':',';%>
        "<%= _data[i] %>": require('./<%=_data[i]%>/<%=_data[i]%>')<%=comma%>
        <%}%>
    };
});