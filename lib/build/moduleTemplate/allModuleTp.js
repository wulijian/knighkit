/**
 * @date 13-2-21
 * @describe: 对所有模版引用
 * @author: wulj
 * @version: 1.0
 */
define(function (require, exports, module) {
    module.exports = {
    <% for(var i=0; i<_data.length ; i++){ %>
        <% var comma = (i===_data.length-1)?'':',';%>
        "<%= _data[i] %>": require('./<%=_data[i]%>/<%=_data[i]%>')<%=comma%>
        <%}%>
    };
});