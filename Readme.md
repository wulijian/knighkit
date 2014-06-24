## 欢迎使用 knighkit
knighkit 是一个前端开发工作流，以组件化为中心，以消除前端开发过程中的重复工作为目的，使你更加关注程序本身。

让你的开发时间从 1 变成 0.99。

一切只是为了那 0.01？

```
Math.pow(0.99,1000);
```
## Features
#### 脚手架
使用命令，生成符合 knighkit 的项目结构，包括配置文件，总体结构，以及开发实例。

#### 组件化
所有模块以组件构成，你可以使用 puzzle 自由组合你的模块。组件是布局，组件提供内容。

#### promise HTML
组件的引入采用promise的方式，支持静态和动态两种引入方式，可方便的控制任何一个模块的现实顺序。

#### 强化的模板
##### 内置vm、ktemplate（类似ejs）、Mustache、jade模板的支持
##### 插件式的模板扩展方式
##### 扩展模版数据处理模块

#### 强大的debug
##### 可自动生成单独模版的测试页面
##### 支持动态无刷新页面更新（类似livereload，不需要插件）
##### 任何一个模块都可以单独测试

#### 静态服务器
不需要启动自己的 HTTP 服务器，内置的静态服务器用一条命令就可以启动

#### 远程调试
一条命令就可以启动 weinre，简单方便的调试移动端

#### 工程打包
根据入口页面打包工程，解析页面依赖的静态文件（图片等），css、js打包压缩。

## How to start?
```
$ npm install -g knighkit
```
安装成功后，可以输入
```
$ kkit -?
$ kkit -h
$ kkit --help
```
查看帮助。

## 构建你第一个 knighkit 项目
#### 初始化项目
```
kkit -g
kkit --generate
```
此命令可在执行命令的目录下，生成一个 knighkit 开发项目。

#### 生成模版
```
kkit -i
kkit --init
```
根据以上生成项目的 src/template/good.json 生成模版。
生成的模版在src/template中。

### 在模版中组合
使用puzzle标签，根据规则可以引入其他模块：

/index.html
```
<!doctype html>
<html>
<body>
<puzzle data-module="./title"></puzzle>
<puzzle data-module="./content"></puzzle>
</body>
</html>
```
/title/index.html
```
hello
```

/content/index.html
```
here is the content
```

访问/index.html，你将在浏览器中看到的代码：
```
<!doctype html>
<html>
<body>
<ac id="XXXXid">hello</ac>
<ac data-module="./content">here is the content</ac>
</body>
</html>
```

#### 编译模版
```
kkit -b
kkit --build
```
src/template中的模版会被编译输出到 output文件夹下。

#### 合并压缩 
```
kkit -p
kkit --package
```
根据配置文件中的配置打包，见配置文件
```
/**                                                  
 * 打包模块, 可设置多个                                       
 * path 是要打包文件的入口模块路径                                
 * name 是输出文件名称                                      
 * -------- begin -----------*/                      
"packModules": [                                     
    {"path": "src/scripts/business", "name": "business"}
]                                                  
```
以上配置会以 src/script/business 为主入口，打包程序后，以 business 为名称，输出到 dist 下两个文件：
```
dist/business.js
dist/business-min.js
```

## Authors and Contributors
KnightWu (@wulijian)

## Support or Contact
wulijian722@gmail.com
