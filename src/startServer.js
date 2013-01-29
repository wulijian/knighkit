var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();

//run local web server
app.use(express.static(path.resolve(__dirname, '../')));
app.listen(9527);

//run weinre at httpPort 10089
var rootPath = path.resolve(__dirname, '../node_modules/weinre');
var lib = path.join(rootPath, 'lib');
process.argv.push('--httpPort');
process.argv.push('10089');
process.argv.push('--boundHost');
process.argv.push('-all-');
var node_modules = path.join(rootPath, 'node_modules');
require(path.join(node_modules, 'coffee-script'));
require(path.join(lib, '/cli')).run();

