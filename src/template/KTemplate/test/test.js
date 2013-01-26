function anonymous(_data) {
var htmlCode='';
htmlCode+='<div id=\"phrsListTab\" class=\"trans-wrapper clearfix\">';
 var word = _data.word, baseTrans = word.baseTrans; 
 if (baseTrans["pic-dict"]) { 
(function(_data){
htmlCode+='               ';
 var pics = _data["picdict-pics"]; 
(function(_data){
htmlCode+='<ul>\r\n    <li>21</li>\r\n    <li>22 ';
(function(_data){
htmlCode+='<div>hohohohohohohohohoho</div>';
})(_data);
htmlCode+='</li>\r\n    <li>23</li>\r\n    <li>24</li>\r\n</ul>';
})(_data);
htmlCode+='\r\n<div class=\"selected-container\">\r\n    <a class=\"selected_img\" href=\"#\">\r\n        <img src=\"';
htmlCode+= pics[0].url;
htmlCode+='\" alt=\"图片词典-有道\"/>\r\n        <span>点击更换图片</span>\r\n    </a>\r\n</div>\r\n<div class=\"img-list\">\r\n    <span class=\"select-just\">点击选择您觉得符合这个词条的图片<a class=\"close-img\" href=\"#\">关闭</a></span>\r\n    <ul class=\"all-img\">';
  for (var i = 0; i < pics.length; i++ ) { 
htmlCode+='\r\n        <li>\r\n            <a href=\"#\"><span><img src=\"';
htmlCode+= pics[i].url;
htmlCode+='\" alt=\"\" data-link=\"http://renren.com\" data-site=\"人人\"></span></a>\r\n        </li>';
 } 
htmlCode+='\r\n    </ul>';
(function(_data){
htmlCode+='<ul>\r\n    <li>1</li>\r\n    <li>2</li>\r\n    <li>3</li>\r\n    <li>4</li>\r\n</ul>';
})(_data);
htmlCode+='\r\n    <div class=\"full-content\">\r\n        <img src=\"\" alt=\"\">\r\n        <a class=\"source-link\" href=\"http://www.163.com\" target=\"_blank\">163.com</a>\r\n    </div>\r\n</div>';
})(getVal.val(baseTrans, "pic-dict"));
 } 
htmlCode+='                           a --> asdga \r\n\r\n\r\n\r\n           <h1>thanks</h1>';
 if ( baseTrans["simple-dict"] ) { 
htmlCode+='\r\n    <h2>\r\n        <span class=\"keyword\">';
htmlCode+= word.input;
htmlCode+='</span>\r\n        <a href=\"#\" title=\"加入单词本\" class=\"sp add-fav add-faved\"></a>\r\n        <a href=\"#\" title=\"加入单词本\" class=\"sp add-fav\"></a>\r\n\r\n        <div class=\"baav\">\r\n            <span class=\"pronounce\">英<span class=\"phonetic\">';
htmlCode+= getVal.val(baseTrans, "ukphone");
htmlCode+='</span>\r\n                <a href=\"#\" title=\"发音\" class=\"sp dictvoice\"></a></span>\r\n            <span class=\"pronounce\">美<span class=\"phonetic\">';
htmlCode+= getVal.val(baseTrans, "usphone");
htmlCode+='</span>\r\n                <a href=\"#\" title=\"发音\" class=\"sp dictvoice\"></a></span>\r\n        </div>\r\n    </h2>';
 var trs = getVal.val(baseTrans, "trs"), trsLength = trs.length; if ( trsLength > 0 ) { 
htmlCode+='\r\n    <div class=\"trans-container\">\r\n        <ul>';
 for ( var i = 0; i < trsLength; i++ ) { 
 var senObj = trs[i].l; 
 for (var key1 in senObj ) 
htmlCode+='\r\n            <li><span class=\"def\">';
htmlCode+= senObj[key1];
htmlCode+='</span></li>';
}
 } 
htmlCode+='\r\n        </ul>\r\n    </div>';
 } 
htmlCode+='\r\n</div>';
return htmlCode;
}
//@ sourceMappingURL=test.js.map