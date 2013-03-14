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

#### 内建 webnire 远程调试服务器
一条命令就可以启动 webnire，简单方便的调试移动端

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