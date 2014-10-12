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

#### 在模版中组合
使用puzzle标签，根据规则可以引入其他模块：

/index.html
```
<!doctype html>
<html>
<body>
<puzzle module="./title"></puzzle>
<puzzle module="./content"></puzzle>
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
<ac module="./content">here is the content</ac>
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

## 使用Puzzle实现组件化

### 组件（文件夹）的结构
#### 模板
每个组件可以是一个文件夹，此文件夹下需要有一个 index.html 或者其他模板的入口文件，此组件在被引用时，入口文件的模板会合并数据后添加到被引用的位置。
#### css 
css可以在 index.html 中引入，或者在index.html引用的其他组件中引入。
#### js
每个组件包含一个index.js 文件，此文件中可以声明此组件的init方法，其中还包括模板解析的 render 方法。业务逻辑的写法和普通项目没有区别，同时支持 seajs 和 requirejs加载js模块的方式。
#### 其他静态资源
如 flash 图片等文件

### 简化后的组件
每个组件在项目里可以对应一个文件夹，但有时候我们不需要写js逻辑，或者仅仅是简单的子模板，那么你就可以使用以下简化后的组件。
#### 可以不提供index.js
如果不提供 index.js ，那么会使用默认的生成index.js，仅仅包含一个render方法。
#### 单独的模板文件。
|index.html
|nav.html

```
<!doctype html>
<html>
<body>
<puzzle module="./nav"></puzzle>
</body>
</html>
```

### puzzle标签

puzzle使用标签属性定制你所需要的组件。

#### module 
指定需要引用的组件的路径，可以是相对路径，比如：

```
<!doctype html>
<html>
<body>
<puzzle module="./title"></puzzle>
</body>
</html>
```
以上代码中的 ./title 是指引用此模板文件同目录下的 title 文件夹对应的组件。

#### async
属性默认值为true，不写表示非异步加载。等async没有设置（false）的模块加载到页面上以后，此类模块才会被加载展示，详见以下的模块优先级。

#### priority
如果一个模块包含 async属性（不是false），那么可以使用该属性控制这些模块的加载优先级。任务调度的逻辑如下：

1. 先找出所有的同步模块，按优先级处理这些同步模块，
2. 当所有的同步模块归纳成html字符串后，
3. 如果用户调用了async的resolve()，开始加载异步模块。
4. 首先加载和本次渲染同级的异步模块，然后是优先级较高的同步模块中的异步模块，依次类推

 具体事例：
 ```
                                        A
                     A1(p=0)           A2(p=1)         A3（a）
     A11(a)      A12      A13        A21(a)   A22       A31
    A111    A121(a) A122                      A221
```
 A代表根模块，分别引用了 A1 A2 A3, A1的优先级是0，A2的优先级是1，A3是异步模块。
 
 那么，模块加载顺序如下，用括号括起来的表明一次渲染所需调用的模块：
 
```
    A(A2 A1 A22 A221 A12 A13 A122)  A会找到所有同步模块，归纳出同步的html代码，展示，resolve后
      ↓
    A3（A31）                        A3 是 A 的异步子模块，A的同步模块完成后，A3开始加载，同时,A3含有同步模块A31，被同时加载
      ↓
     A21                             A21 是 A2 的异步子模块，A2比A1的优先级高，所以比A11先执行
      ↓
    A11（A111）                      A11 是 A1 的异步子模块，含有同步的 A111，同时被解析
     ↓
    A121                            A121 同样算A1的异步子模块，因为没有设置优先级（p），出现在A11后，所以，优先级比A11低，最后被加载
```
####filter
数据过滤规则，采用[jsonselect](http://jsonselect.org/#overview) 的规则，过滤父页面传过来的数据，比如：

```
<link rel="stylesheet" href="content.css"/>
<div id="content">
    <puzzle module="./mod2" filter=".a"></puzzle>
    <puzzle module="./mod1"></puzzle>
</div>
```
在引用 mod2 时，指定了filter，会从传入引用mod2的组件的数据中选出 a 属性对应的数据。
比如，原数据是：

```
{
	a:{
		b:3
	},
	c:5
}
```

那么在调用mod2的render函数时，传入的数据会是：

```
{
	b:3
}
```
#### name
用于模板继承，声明puzzle的name可以在使用 amod.extend时，替换name相同的部分。详见，模板继承。

### 模板继承
使用 amod.extend 可以使任何支持预编译的模板引擎支持模板继承。

```
amod.extend 模块名称（路径）
<puzzle module="想要使用的模块" name="替换到的位置"></puzzle>
```

实例如下：

meta/index.html

```
<link rel="stylesheet" href="mod2.css"/>
<div>
    <puzzle module="./mod21" name="content"></puzzle>
</div>
<puzzle module="./mod22" async></puzzle>
<puzzle module="../mod3" name="bottom"></puzzle>
```
假如我们有一个模板跟上述模板类似，不同的仅仅是其中某些引用：
extended/index.html

```
amod.extend ./meta
<puzzle module="./noexistmod" name="content" async></puzzle>
<puzzle module="../loextend" name="bottom" async></puzzle>
```

相当于 extended/index.html：
```
<link rel="stylesheet" href="mod2.css"/>
<div>
    <puzzle module="./noexistmod" name="content" async></puzzle>
</div>
<puzzle module="./mod22" async></puzzle>
<puzzle module="../loextend" name="bottom" async"></puzzle>
```
适用于两个模块类似，但略微不同的情况。

## Examples
请参照 test 目录下的例子。实例项目在 test/project 目录下。
其中，根目录下的runner-r.html、runner-s.html是项目开发阶段的运行页面。

#### 如何使用实例


1. 下载源代码，安装依赖的包。

    ```
    git clone -b puzzle https://github.com/wulijian/knighkit.git
    cd knighkit 
    npm install
    ```
2. 执行 debug-server.dat 或者 debug-server.sh，开启debug服务器。
3. 在浏览器中打开 [http://localhost:9528/runner-r.html#](http://localhost:9528/runner-r.html#),如果你喜欢使用seajs，请打开[http://localhost:9528/runner-s.html#](http://localhost:9528/runner-s.html#)
4. 上述地址中 # 号后可跟一个字符串，代表你想访问的模块的路径。# 号后是空，表明访问的是根路径 project/index.html。 如果访问 [http://localhost:9528/runner-r.html#content/mod1](http://localhost:9528/runner-r.html#content/mod1) 表明你访问的是 project/content/mod1/index.html


#### 项目的结构
1. project/index.html 是项目主入口文件，这个主文件可以是各种支持预编译的模板，现在支持的有vm，hogan，jade，ktemplate
2. 单个模块（组件）的写法和正常的项目木有区别，唯一的区别在于，可以使用puzzle来引用其他的组件

#### debug模式
开启debug服务之前，请将项目路径修改成你项目所在的绝对路径。路径的设定在 debug-server.sh 中 -r 的参数:
```
#! /bin/bash
node ./bin/kkit -r /Users/wuwei/github/knighkit/test/project -d all
```

1. 开启debug服务后，已经开启了超强的debug模式。
2. 修改任何一个css或者模板文件，在浏览器中打开的页面会无刷新更新，js修改后，浏览器会自动刷新。

## Authors and Contributors
KnightWu (@wulijian)

## Support or Contact
wulijian722@gmail.com
