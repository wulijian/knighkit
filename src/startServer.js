var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.resolve(__dirname, '../')));

app.listen(9527);