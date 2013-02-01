/**
 * 命令行调用方式
 * @author KnightWu
 */

var optimist = require('optimist').
  options('h', {
    alias: 'help'
  }).
  options('?', {
    alias: 'help',
    describe: 'Show all the options!'
  }).
  options('g', {
    alias: 'generate',
    describe: 'Generate the project that contains whole structure.'
  }).
  options('i', {
    alias: 'init',
    describe: 'Init htmlTemplate from testing data.'
  });

/**
 * 是否函数
 * @param obj
 * @return {boolean}
 */
var isFunction = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};
/**
 * 分发命令的类
 * @param optimist
 * @constructor
 */
var Dispatcher = function (optimist) {
  this.optimist = optimist;
};

Dispatcher.prototype = {
  constructor: Dispatcher,
  run: function () {
    var ops = this.optimist.argv;
    for (var type in ops) {
      if (ops.hasOwnProperty(type) && isFunction(Dispatcher.handlers[type])) {
        Dispatcher.handlers[type].bind(this)(ops[type]);
      }
    }
  }
};

/**
 * 命令对应的处理函数
 * @type {{help: Function, generate: Function}}
 */
Dispatcher.handlers = {
  /**
   * 帮助文件
   * @param data
   */
  'help': function (data) {
    if (data) {
      console.log(this.optimist.help());
    }
  },
  /**
   * 调用生成
   * @param data
   */
  'generate': function (data) {
    console.log(data);
  }
};

/**
 * 执行分发命令
 */
new Dispatcher(optimist).run();


