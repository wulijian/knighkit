## 欢迎使用 knighkit.
knighkit 是自动化，模块开发，并支持自动打包，支持远程调试的前端开发框架。
目的是减少前端开发过程中的重复工作，使你更关注程序本身。

## 功能
#### 自动化生成项目结构
一条命令，完成项目的结构

#### 集成常用的 jquery underscore 库等
jquery 主要用于功能的开发，underscore 用于数据的处理等

#### 集成开发阶段使用的模块化开发库 seajs
seajs 用来完成开发阶段的模块加载和调试

#### 新型的模版组成方式，模版即模块。
每个模块都是一个文件夹，每个模块由以下文件构成:
* m.html/hogan/vm/jade 模版文件，支持4种，自动识别编译
* m.js 本模块的初始化
* m.css 样式
* m.json 本模块的测试数据
* data.js 模版的数据处理逻辑部分

#### 集成 jstm 模版管理工具
可以使用任意支持预编译的模版框架，强有力的模版构建管理能力
* 支持四种模版： jade，ktemplate，mustache（hogan.js），velecity
* 支持模版数据处理模块
* 支持将其他模版作为插件添加

#### 单独模版的测试页面
自动生成单独模版的测试页面，自动打包数据，方便测试每个小模块

#### 可定制 html 模版的生成模块
可方便的自行添加模版中需要的js工具库等

#### 自动重新编译
自动化监测模版文件变化，自动重新编译已修改的模版文件

#### 内建预览服务器
不需要启动自己的 HTTP 服务器，内置的服务器用一条命令就可以启动

#### 内建 weinre 远程调试服务器
一条命令就可以启动 weinre，简单方便的调试移动端

#### 支持 css 的合并压缩

#### 内置打包工具
自动打包，打包后不依赖 seajs

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

#### 添加一个模版
```
kkit -b list.html
```
运行上面的命令，会在 src/template 文件夹下生成 list 文件夹，并生成空的 m.js m.css m.__html__等。

list的后缀表示使用的模板引擎类型。

如果想使用 jade 模板，命令如下：

```
kkit -b list.jade
```
src/template 下，生成 list 文件夹，并生成空的 m.js m.css m.__jade__.


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

#### 启动静态服务器
```
kkit -s http
```
该命令可以启动一个http静态服务器，服务器的根目录对应项目的根目录。端口号对应配置文件中的端口号：configs.js中的 http.port，默认是 9527。

##### 模板编译中间件
此静态服务器集成了一个模板编译的中间件，作用是，当访问模板文件时，自动编译，返回给js加载器。如：

```
require('src/template/list');
```
以上代码在启动了静态服务器后，可以加载 template 模板文件夹下的 list 模板。

如果不启动静态服务器，会默认查找 src/template/list.js，在 knighkit 中，template/list 会是文件夹，其中包含 m.js m.html m.css 等。因此，会返回 404。

以上请求，经中间件处理，会编译相应的模板，并将模板编译后的 js 代码返回给 js 加载器。等同于直接加载使用 ``` kkit -b``` 以后的 js 文件：

```
require('output/list/list');
```
##### 使用第一种方式的好处

* 代码可读性好，让开发者一眼就能看出来引用的模板在哪里。
* 并将模板编译的细节对开发者做了隐藏，让开发者感觉不到模板的编译中间过程的存在。
* 提升开发效率，模板修改后，不再需要使用编译命令编译，直接刷新页面即可查看结果。

#### 启动weinre服务器
```
kkit -s weinre
```
启动 weinre 服务器。远程调试在手机上测试的页面。注意，手机和调试的 PC 需要在同一个网段内。


#### 项目打包
```
kkit -e
kkit --export
```
参数为项目入口的页面文件（如index.html），将文件名（index）作为项目名称，将主页和主页依赖的静态资源都拷贝到该目录下。

具体的步骤为，在项目根目录先会创建\_\_publish\_\_/{项目名}文件夹，经过分析页面，收集页面依赖的css，根据页面的js入口，合并压缩 js，在 html js css中收集依赖的静态资源（图片，svg，字体文件等）。静态资源拷贝到\_\_publish\_\_/{项目名}/statics下，css 拷贝到 \_\_publish\_\_/{项目名}/styles 文件夹下，压缩后的 js 拷贝到 \_\_publish\_\_/{项目名}/script 下；然后，根据配置文件中的staticResource，将相应的资源拷贝到 \_\_publish\_\_/{项目名}下相应的位置下。除配置在 staticResource 中的文件只是拷贝外，其他文件在拷贝后都会使用文件的 md5 值作为版本号。

```
"staticResource": [                                     
    {"source": "src/styles/icons", "target": "styles"}
]                                                  
```
通过以上配置，会将icons文件夹，拷贝到 \_\_publish\_\_/{项目名}/styles 下。

如果不传递任何参数，会默认在 \_\_publish\_\_ 下生成一个 \_\_allpacked 的文件夹，程序会遍历根文件夹下的.html的文件，依次作为入口，打包到 \_\_allpacked 文件夹下。这种方式比较适合含有公共模块较多的页面，在上传静态资源时，可以不必手动处理公共的静态资源。

注意：在执行此命令前，一定要执行 kkit -b 编译模板，否则，可能会报找不到js模板的错误。

#### CMS提交
```
kkit -c
kkit --cms
```
此处的 cms 提交是比较专有的代码，不适合所有公司的普遍情况。

之所以做一个 cms 提交出来，是想提供一种技术方案，即在没有后台 cms 接口，只有 cms 管理网站的情况下，我们如何做到自动提交文件到 cms。同样适用于 CDN 的提交。

内部实现暂时使用了 phantomjs，需配置环境变量，如果在使用npm安装knighkit过程中，phantomjs的自动下载一直被墙，建议直接去phantomjs官网下载，并配置环境变量。然后再执行一遍 ```npm install -g knighkit ``` 即可安装通过。 

CMS 后续打算直接使用 [berserkJS](https://github.com/tapir-dream/berserkJS)，不再使用phantomjs+capsperJS。


## Authors and Contributors
KnightWu (@wulijian)

## Support or Contact
wulijian722@gmail.com
