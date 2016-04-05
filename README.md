# TVUI API 手册 #
  TVUI是基于JavaScript的电视应用程序用户界面软件开发工具包，为创建效果、互动电视应用程序，提供必要的功能，节省开发的时间和规模。

## TVUI.Util ##
工具函数静态类，不需要实例化，直接调用即可。
### TVUI.Util.encode(str) ###
字符转码，等于 encodeURIComponent
### TVUI.Util.decode(str) ###
字符转码，等于 decodeURIComponent
### TVUI.Util.proxy(func, obj, [param1], [param2],...) ###
作用域代理函数
 @param func 要修改作用域的函数
 @param obj  作用域对象
 @returns {Function} 修改后的函数
举例1：
 var func # TVUI.Util.proxy(function(){
    console.log(this.name); //--> kenny
 }, {name:'kenny'});
  
 func();

举例2：
可注入参数
 var func # TVUI.Util.proxy(function(str){
    console.log(this.name); //--> kenny
    console.log(str); //--> hello
 }, {name:'kenny'}, 'hello');
  
 func();

### TVUI.Util.likeArray(array) ###
判断是否一个类数组
 @param array 要判断的数组
 @returns {boolean}
### TVUI.Util.queryToJson(str)###
把查询字符串转换成json格式，中文自动解码, 适合在需要获取多个参数时使用

举例：
  var query # 'name#kenny&age#18';
  var json # TVUI.Util.queryToJson(query);  
  console.log(json); //--> {name:'kenny', age:18}

### TVUI.Util.getParam(name, [url])###
根据url参数名称，获取对应的值

 @param name 参数名称
 @url 指定的url，可选， 默认是当前页面的url，即location.href
 @returns {String} 参数值

举例：

  var url # 'http://www.baidu.com/?key#abc';
  var value # TVUI.Util.getParam('key', url);
  console.log(value); //--> abc

### TVUI.Util.param(obj) ###
把json格式数据转换成查询字符串，该方法是 TVUI.Util.queryToJson(str) 的逆转换

 @param obj json格式数据
 @returns {String} 查询字符串

举例：
 var obj # {name:'kenny', age:18};
 var str # TVUI.Util.param(obj);
 console.log(str); //--> name#kenny&age#18

### TVUI.Util.getFileName([pathName]) ###
获取文件名，不包含扩展名

 @pathName 文件路径，可选，默认是当前页面的url
 @returns {String} 文件名称

### TVUI.Util.log([param1],[param2]...) ###
输出控制台，用作代替console.log, 由于机顶盒或浏览器未开启调式模式时，是不支持console的，在调试时打了console又忘记删除就会造成程序崩溃，建议用TVUI.Util.log代替，用法与console.log完全一致

### TVUI.Util.guid() ###
生成一个guid，无参数

### TVUI.Util.pad(num, n) ###
数字补零
 @param num 要补零的数字
 @n 位数
 @returns {String} 

举例：
  var str # TVUI.Util.pad(9, 3);
  console.log(str); //--> 009

### TVUI.Util.range(data, num, index) ###
循环从数组中取出指定项，并且指定项目在中间

举例：

   var arr # [1,2,3,4,5];
  TVUI.Util.range(arr, 3, 0); //--> [5, 1, 2]
  TVUI.Util.range(arr, 3, 1); //--> [1, 2, 3]
  TVUI.Util.range(arr, 3, 2); //--> [2, 3, 4]
  TVUI.Util.range(arr, 3, 3); //--> [3, 4, 5]
  TVUI.Util.range(arr, 3, 4); //--> [4, 5, 1]

### TVUI.Util.rangeLeft(data, num, index) ###
循环从数组中取出指定项，并且指定项目在左边第一个

举例：

 var arr # [1,2,3,4,5];
 TVUI.Util.rangeLeft(arr, 3, 0); //--> [1, 2, 3]
 TVUI.Util.rangeLeft(arr, 3, 1); //--> [2, 3, 4]
 TVUI.Util.rangeLeft(arr, 3, 2); //--> [3, 4, 5]
 TVUI.Util.rangeLeft(arr, 3, 3); //--> [4, 5, 1]
 TVUI.Util.rangeLeft(arr, 3, 4); //--> [5, 1, 2]

### TVUI.Util.rangeFixed(data, num, index) ###
在数组范围内中取出指定项

举例：

 var arr # [1,2,3,4,5];
 TVUI.Util.rangeFixed(arr, 3, 0); //--> [1, 2, 3]
 TVUI.Util.rangeFixed(arr, 3, 1); //--> [1, 2, 3]
 TVUI.Util.rangeFixed(arr, 3, 2); //--> [2, 3, 4]
 TVUI.Util.rangeFixed(arr, 3, 3); //--> [3, 4, 5]
 TVUI.Util.rangeFixed(arr, 3, 4); //--> [3, 4, 5]

### TVUI.Util.timeout(func, time, [obj]) ###
延时执行，用来代替setTimeout, 由于setTimeout会修改函数的this指向，TVUI.Util.timeout可以指定作用域this，建议使用代替setTimeout

 @func 延时执行的函数
 @time 延时时间
 @obj 作用域对象，可选
 @returns{Number} 

举例：
 TVUI.Util.timeout(function(){
   console.log(this.name); //--> kenny
 }, 1000, {name:'kenny'});

### TVUI.Util.date(dateStr, format, options) ###
日期时间处理函数

 @dateStr 日期对象或字符串
 @format 输入格式，如 yyyy-MM-dd hh:mm:ss
 @options 时间偏移选项，可选，默认：｛y:0, M:0, d:0, h:0, m:0, s:0｝
 @returns{String|Date}

举例：

 var now # new Date();
 TVUI.Util.date(now,'yyyy-MM-dd',{d:1}); //--> 当前日期增加一天

### TVUI.Util.tpl(template, data) ###
模版处理函数，用作根据数据和模版生成视图

 @template 模版字符串
 @data 数据，数组或对象
 @returns{String}

举例：
 <nowiki>var template # '<p>{$name},{$age}</p>';
 TVUI.Util.tpl(template, {name:'kenny',age:18}); //--> <p>kenny,18</p>
 TVUI.Util.tpl(template, [{name:'kenny',age:18},{name:'sam',age:20}]); //--> <p>kenny,18</p><p>sam,20</p></nowiki>

如果模版内容比较多，可以把模版写到html里面，如：

html：
  <nowiki><script type#"template/text" id#"template">
    <p>{$name},{$age}</p>
  </script></nowiki>

js:
  var template # $('#template').html();

### TVUI.Util.getCharCount(str) ###
获取字符串字节数，1个中文算2个字节

### TVUI.Util.subStr(str, len) ###
截取字符串，1个中文算2个字节
 @str 要截取的字符串
 @len 截取字节长度
 @returns{String}

### TVUI.Util.getSTBType() ###
获取机顶盒类型，'''不推荐使用'''

## TVUI.Event ##
事件模块，提供dom事件绑定和删除功能，事件是采用原生addEventListener绑定方式
### TVUI.Event.on(type, handler, [scope])  ###
绑定一个事件

 @type 事件名称，如：keyup keydown
 @handler 回调函数
 @scope 作用域，就是handler中的 this 指向的对象 
 @returns {TVUI.uuid|*} 返回唯一的标识id

### TVUI.Event.off([type], [handler])  ###
删除事件

用法：
 TVUI.Event.off(type, handler) 删除具体一个事件
 TVUI.Event.off(type) 删除指定一类事件，例如要删除keyup的全部事件 off('keyup')
 TVUI.Event.off()  删除所有事件
 TVUI.Event.off(id) 删除指定id标识的事件
 TVUI.Event.off(ids) 删除指定id标识数组的事件

### TVUI.Event.fire(type, keyCode)  ###

触发事件

 @param type 事件名称
 @param keyCode 模拟事件keyCode

### TVUI.Event.onPress(callback, [scope])  ###

按键事件，不需要长按连续触发的，建议使用这个绑定方式，提高性能

 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
 @param scope 作用域
 @returns {TVUI.uuid|*} 事件唯一标识

### TVUI.Event.onKey(code, callback, [scope])  ###

按键事件，这种绑定方式支持长按连续触发

 @param code 按键的keyCode
 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
 @param scope 作用域
 @returns {*[]} 事件唯一标识数组

### TVUI.Event.onKeys(codes, callback, [scope])  ###

绑定多个按键事件

 @param codes 按键keyCode数组
 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
 @param scope 作用域
 @returns {Array} 事件唯一标识数组

### TVUI.Event.onOk(callback, [scope])  ###

确定键事件

 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
 @param scope 作用域
 @returns {*[]} 事件唯一标识数组

### TVUI.Event.onLeft(callback, [scope])  ###

方向左键事件

 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
 @param scope 作用域
 @returns {*[]} 事件唯一标识数组

### TVUI.Event.onRight(callback, [scope])  ###

方向右键事件

 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
 @param scope 作用域
 @returns {*[]} 事件唯一标识数组

### TVUI.Event.onUp(callback, [scope])  ###
方向上键事件

 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
 @param scope 作用域
 @returns {*[]} 事件唯一标识数组

### TVUI.Event.onDown(callback, [scope])  ###

方向下键事件

 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
 @param scope 作用域
 @returns {*[]} 事件唯一标识数组

### TVUI.Event.onMove(callback, [scope])  ###

同时绑定 上下左右 键事件

 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象，并且有direction属性标识按键的方向
 @param scope 作用域
 @returns {Array} 事件唯一标识数组

### TVUI.Event.onNumber(callback, [scope])  ###

绑定数字键 0~9 事件

 <nowiki>@param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象，并且有number属性标识按键的数字
@param scope 作用域
@returns {TVUI.uuid|*} 事件唯一标识</nowiki>

### TVUI.Event.onComKey(codes, callback, [scope])  ###

组合按键事件，例如 96956 这类的事件

 @param codes 组合的keyCode数组
 @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
 @param scope 作用域
 @returns {TVUI.uuid|*} 事件唯一标识

### TVUI.Event.onComNumber(change, callback, [scope])  ###

数字组合键，例如输入频道号

 @param change 数字改变时回调，参数 num 数值
 @param callback 完成时回调，参数 num 数值
 @param scope 作用域
 @returns {Array} 事件唯一标识数组

### TVUI.Event.onSystem(callback, [scope])  ###

绑定系统事件

 @param callback 事件回调函数，回调函数参数是事件对象
 @param scope 作用域
 @returns {TVUI.uuid|*} 事件唯一标识

## TVUI.Class ##
类工厂，用来创建类对象
### TVUI.Class([parent]) ###
创建类的工厂函数

 @param parent  父类，可选
 @returns {_class}
 @constructor

用法：
 1） TVUI.Class() 创建一个类
 2） TVUI.Class(parent) 创建一个类，并继承parent类
 3） TVUI.Class.create() 创建一个类
 4)  TVUI.Class.create(includeObj) 创建一类，并添加实例方法
 5） TVUI.Class.create(includeObj, parent) 创建一个类，继承parent，并添加实例方法

举例：
 <nowiki>var Person # TVUI.Class.create({
   init : function(){

   },
   say : function(){
     console.log('hello');
   }
 });
 var Men # TVUI.Class(Parent); // Men继承了Person
</nowiki>

### TVUI.Class.create(include, [parent]) ###
创建类的快捷方式

  @param include 可选，实例方法集合
  @param parent 可选，父类

举例：

 <nowiki>var Person # TVUI.Class.create({
   init : function(){

   },
   say : function(){
     console.log('hello');
   }
 });

 var Men # TVUI.Class({
    eat : function(){
    }
 },Parent); // Men继承了Person</nowiki>

### 类 ###
指用TVUI.Class创建的类对象
#### 类的静态方法 ####
##### extend(obj) #####

 给类对象添加静态方法

 @param obj 静态方法集合对象
 @returns {_class}

举例：

 <nowiki>var Person # Class();
 Person.extend({
    say : function(){
      //to do something
    }
  });
 Person.say(); // Person拥有了say的方法</nowiki>

##### include(obj) #####
添加实例方法函数

 @param obj 方法集合对象
 @returns {_class}

举例：

 <nowiki>var Person # Class();
 Person.include({
     say : function(){
         //to do something
      }
  });
 var person # new Person();
 person.say(); // 这样person就有了say的方法</nowiki>

##### proxy(func, [args]) #####
代理函数，用做替换函数的作用域

 @param func 要提供作用域的函数，在func函数内部的this指向实例
 @param args 可选，附加参数
 @returns {*}

##### proxyAll(param1, [param2], .....) #####

代理多个函数

用法：
 this.proxyAll('func1', 'func2', .......);

#### 类的实例方法 ####
类对象，在实例化之后，实例对象拥有的方法

##### _init() #####
底层初始化方法，在实例化时自动运行，在init执行之前执行

##### init() #####
初始化方法，在实例化时自动运行，在_init执行之后执行

##### proxy(func, [args]) #####
代理函数，用做替换函数的作用域

 @param func 要提供作用域的函数，在func函数内部的this指向实例
 @param args 可选，附加参数
 @returns {*}

##### proxyAll(param1, [param2], .....) #####

代理多个函数

用法：
 this.proxyAll('func1', 'func2', .......);

## TVUI.Base ##
基类，提供组件基础功能
### 静态方法 ###
TVUI.Base不需要实例化就拥有的自定义事件支持的三个方法
#### TVUI.Base.on(ev, callback) ####
绑定自定义事件

 @param ev  事件名称
 @param callback 回调函数
 @returns {_event} 对象

用法：
 1) TVUI.Base.on('event1', callback)
 2) TVUI.Base.on('event1 event2', callback) 绑定多个事件，空格隔开

#### TVUI.Base.fire(ev, [param1], [param2], ....) ####
触发事件

 @param ev 事件名称
 @param param1 事件传递的参数，可选
 @returns {boolean} 是否已经触发

用法：
 TVUI.Base.fire(eventName, param1, param2.....)

#### TVUI.Base.off([ev], [callback]) ####
销毁事件
 @param ev  事件名称，可选，为空即销毁对象的所有事件
 @param callback  句柄，可选
 @returns {_event}

用法：

 1) TVUI.Base.off('event1', callback) 删除对象指定一个事件
 2) TVUI.Base.off('event1') 删除对象指定一类事件
 3) TVUI.Base.off() 删除改对象的全部事件

### 实例属性和方法 ###
TVUI.Base 实例化得到的对象拥有以下属性和方法，由于TVUI.Base是类创建的，所以也拥有TVUI.Class实例的全部属性和方法
#### id ####
实例化会分配标识id，是全局唯一的，递增

#### _active ####
组件状态，布尔值，true/false, 用作记录组件状态是否活动的

#### __eventIdArray ####
私有属性，不建议调用， 记录组件的绑定的事件，用作销毁

#### registerEvent(eventId) ####
注册事件，用TVUI.Event绑定的事件，必须要注册才能在组件destroy时被销毁

 @param eventId 事件id, TVUI.Event绑定事件时返回的id

#### active() ####
设置组件状态为活动

#### unActive() ####
设置组件状态为非活动

#### destroy() ####
销毁组件，执行后，组件将删除所有事件，并释放内存

#### on(ev, callback) ####
绑定自定义事件

 @param ev  事件名称
 @param callback 回调函数
 @returns {_event} 对象

用法：
 1) base.on('event1', callback)
 2) base.on('event1 event2', callback) 绑定多个事件，空格隔开

#### fire(ev, [param1], [param2], ....) ####
触发事件

 @param ev 事件名称
 @param param1 事件传递的参数，可选
 @returns {boolean} 是否已经触发

用法：
 base.fire(eventName, param1, param2.....)

#### off([ev], [callback]) ####
销毁事件
 @param ev  事件名称，可选，为空即销毁对象的所有事件
 @param callback  句柄，可选
 @returns {_event}

用法：

 1) base.off('event1', callback) 删除对象指定一个事件
 2) base.off('event1') 删除对象指定一类事件
 3) base.off() 删除改对象的全部事件

### 事件 ###
#### active() ####
组件被激活时触发

#### unActive() ####
组件被设置为非活动时触发

#### destroy() ####
组件被销毁时触发

## TVUI.Page ##
页面组件，需要实例化
### 参数选项 ###
实例化时的参数对象
#### lang ####
页面语言版本 zh 或 en 默认 zh
#### name ####
页面名称标识，如果需要使用页面缓存数据，必须设置name
#### history ####
是否记录页面浏览历史，布尔值， 默认 true
#### enableBack ####
是否响应返回键，布尔值，默认true, 如果设置为false，点击返回键不后退页面
#### home ####
是否首页，布尔值，默认false， 退出键调转到首页标识的页面
#### unload ####
页面unload时的回调函数，函数要有返回布尔值，如果返回false会阻止页面unload
#### level ####
页面层级，数字类型，默认为0， 大于0，即启动页面按层级调转
#### backUrl ####
返回页面url，默认值null， 在页面没有历史记录时，按键返回将调转到这个url

### 属性和方法 ###
继承于TVUI.Base， 拥有其全部的属性和方法，以下仅列举了Page特有的属性和方法，继承过来的请参考TVUI.Base
#### name ####
页面名称标识

#### cache ####
页面缓存数据，setCache方法的数据保存在这里

#### params ####
页面url参数json

#### lang ####
页面语言

#### url ####
页面url

#### panels ####
页面包含的panels集合

#### activePanel ####
当前活动的panel对象

#### level ####
页面层级

#### isUnload ####
页面是否已经unload

#### addHistory() ####
记录浏览历史

#### clearHistory() ####
清空浏览历史

#### back() ####
后退页面

#### exit() ####
退出页面，如果有主页，调转到主页，没有即返回上一页
#### go(url, [param]) ####
调转页面

 @param  url 跳转到的页面地址
 @param param 参数json，可选

#### refresh() ####
刷新当前页面

#### setCache(json) ####
记录缓存

#### getCache() ####
获取缓存数据

#### clearCache() ####
情况缓存数据

#### saveCache() ####
保存缓存数据到机顶盒环境变量中，在页面unload的时候会自动保存

#### setLang(lang) ####
设置页面语言 zh 或 en

#### addPanel(panel1,[panel2], ...) ####
把panel加入到页面中，页面可以对包含的panel做协调

#### active() ####
激活页面，页面可以响应事件

#### unActive() ####
设置页面未非活动，页面不再响应事件

### 事件 ###
#### unload() ####
页面unload时触发

#### active() ####
页面激活时触发

#### unActive() ####
页面非激活时触发

#### back() ####
页面返回时触发

#### exit() ####
页面退出时触发

#### setLang(lang) ####
语言改变时触发
参数： 
lang  改变后的语言 zh 或 en

## TVUI.Panel ##
面板组件。 需要实例化， 可以实现导航、列表功能， 继承TVUI.Base

### 参数选项 ###
#### active ####
初始激活状态
#### cols ####
列数
#### data ####
菜单数组或dom集合
#### disabled ####
禁用单元格索引，从0开始计算，例如要禁用第一个和第三个，设置 disabled :[0,2]
#### focusIndex ####
初始焦点位置索引，默认0， 从0开始计算
#### focusClass ####
焦点样式className，默认 focus
#### selectClass ####
确定后的菜单样式className， 默认 select
#### leaveClass ####
离开panel的菜单className，默认 leave
#### loop ####
是否循环，默认 false
#### pager ####
TVUI.Pager实例
#### textSelector ####
截取文字所在位置的选择器
#### textChar ####
截取多少个字符，一个中文按2个字符计算，-1表示不截取
textAttrName ####
截取文字属性名称，默认 data-text
### 属性和方法 ###
实例化的对象拥有的属性和方法

#### _active ####
活动状态，布尔值，为false时不相应键盘事件

#### data ####
数据项数据，可以是jQuery对象或元素集合

#### disabled ####
禁用项索引数组
#### focusIndex ####
当前获得焦点项目索引

#### cols ####
布局列数
#### rows ####
布局行数
#### loop ####
是否循环切换
#### pager ####
分页组件实例
#### active([index]) ####
设置活动状态
参数：
index 焦点切换到第几项，可选， 如果不传，即上次获得焦点的项目

#### unActive() ####
设置非活动状态，不响应事件

#### reset(data, [focusIndex], [cols]) ####
重置属性

 @param data 数据数组，可以是jQuery对象或元素集合
 @focusIndex 焦点项索引，可选，默认 0
 @cols 布局列数，可选，默认上次的布局

#### indexToCell(index) ####
项索引转换成坐标

 @index 项索引
 @returns {Array}坐标
 
#### cellToIndex(cell) ####
坐标转换成索引

 @param cell 坐标
 @returns {Number} 索引

#### disable(idx)  ####
禁用项

 @param idx 项索引

#### enable(idx) ####
开启项

 @param idx 项索引

#### validate(cell)  ####
验证项是否可用

 @param cell 坐标
 @returns {Boolean} 

#### next(cell, direction) ####
切换到下一项
 
 @param cell 当前的坐标
 @param direction 切换的方向
  

#### select(index) ####
选择项

  @param index 项索引

#### focus(idx) ####
获得焦点

  @param idx 项索引

#### autoFocus(type) ####
自动获得焦点

  @param type 可选，0：初始化时，1：向下翻页时，2：向上翻页时

#### blur() ####
失去焦点

### 事件 ###
#### reset(data, focusIndex, cols)  ####
重启属性时触发

#### disable(idx, this) ####
 禁用项时触发

#### enable(idx, this) ####
开启项时触发

#### leave(pos, cell) ####
离开时触发

 @param pos 离开方向，up down left right
 @param cell 离开的坐标

#### select(index, item) ####
选中时触发

 @param index 项索引
 @item 项目对象

#### focus(index, item) ####
获得焦点时触发

 @param index 项索引
 @item 项目对象

#### blur(index, item) ####
获得焦点时触发

 @param index 项索引
 @item 项目对象

#### active() ####
激活时触发
#### unActive() ####
禁用时触发

## TVUI.Pager ##
分页组件，提供分页功能支持

### 参数选项 ###
#### total ####
数据记录数
#### pageSize ####   
每页多少条           
#### pageIndex ####  
初始显示第几页，从0开始计算          
#### type ####
分页方式，0：不自动分页，1：垂直方向自动分页，2：水平方向自动分页
#### async ####
是否异步分页，同步分页是只通过设置html位移来实现分页，异步是动态创建html

### 属性和方法 ###
#### total ####
记录总数
#### pageSize ####
页大小，每页展示几个
#### pageCount ####
页总数
#### pageIndex ####
当前页面索引，从0开始算
#### type ####
分页方式，0：不自动分页，1：垂直方向自动分页，2：水平方向自动分页
#### async ####
是否异步分页，同步分页是只通过设置html位移来试下分页，异步是动态创建html
#### itemIndex ####
当前游标所在索引
#### move(index, type) ####
移动游标
#### reset(total, [pageSize], [pageIndex]) ####
重置分页，在记录数改变的时候，需要执行重置

 @param total 记录数
 @param pageSize  页面大小，可选
 @param pageIndex 现在第几页，可选

#### change(pageIndex, [type]) ####
切换分页

 @param pageIndex 切换到第几页
 @param type 分页方式，可选， 0:初始化，1：向下翻，2：向上翻
#### next() ####
下一页
#### prev() ####
上一页
#### first() ####
第一页
#### last() ####
最后一页

### 事件 ###
#### move(itemIndex, this) ####
游标移动时触发

#### reset(total, pageSize, pageIndex) ####
重置分页时触发

#### change(pageIndex, type) ####
切换分页时触发

#### next(pageIndex, this) ####
先后分页时触发

#### prev(pageIndex, this) ####
向前分页时触发

## TVUI.ScrollBar ##
滚动条组件，需要实例化

### 参数选项 ###
#### view ####
可视区选择器或元素对象
#### content ####
滚动内容选择器或元素对象
#### track ####
滚动条轨道选择器或元素对象
#### handle ####
滚动条柄选择器或元素对象
#### panel ####
Panel 实例
#### scrollLength ####
内容每次滚动的距离，单位像素，没有panel时才有效
#### handleHeight ####
句柄高度， null值表示自动按比例计算

### 属性和方法 ###
#### panel ####
panel实例
#### $view ####
可视区对象
  @type {*|HTMLElement}
#### $content  ####
内容对象
 @type {*|HTMLElement}
#### $track ####
滚动条轨道对象
 @type {*|HTMLElement}

#### $handle  ####
滚动条句柄对象
 @type {*|HTMLElement}

#### currentStep ####
当前滚动到第几步
 @type {number}
#### viewHeight ####
可视区高度
#### contentHeight ####
内容区高度
#### scrollHeight ####
内容需要滚动的长度
#### trackHeight ####
滚动轨道的高度
#### handleHeight ####
滚动句柄的高度
#### scrollSteps ####
总共需要滚动多少步
#### perContent ####
内容区每一步滚动的距离
#### scrollTrackHeight ####
滚动条需要滚动的距离
#### perScroller ####
滚动条每一步要滚滚东的距离
#### reset([contentHeight]) ####
重置滚动条
 @param contentHeight 滚动内容高度，可选
#### hide() ####
隐藏滚动条
#### show() ####
显示滚动条
#### scroll(step) ####
执行滚动
 @param step

#### next() ####
向下滚
#### prev() ####
向上滚

### 事件 ###
#### show() ####
显示时触发
#### hide() ####
隐藏时触发
#### scroll(bar, content, step) ####
滚动时触发
 @param bar 滚动条滚动距离
 @param content 内容滚动距离
 @param step 第几步

## TVUI.Widget ##
### 参数选项 ###
#### url ####
接口url地址
#### cardNumber ####
用户卡号
#### pageCode ####
GCMS的页面标识
#### textMap ####
GCMS文字组件的标识和页面html元素id的键值对，如：{code:'#id1,#id2'} 多个id用英文逗号分隔
#### imageMap ####
GCMS图片组件的标识和页面html元素id的键值对，如：{code:'#id1,#id2'} 多个id用英文逗号分隔
#### page ####
页面Page实例，如果有中英文切换或者有视频、音乐播放就必须要传入page
#### baseUrl ####
静态图片路径
#### cache ####
请求缓存数据，如果为true, 请求数据保存到机顶盒环境变量，需要重启机顶盒才会清空缓存

### 属性和方法 ###
#### textMap ####
#### imageMap ####
#### page ####
#### setData(type, data) ####
#### getData() ####
#### render() ####
#### destroy() ####

### 事件 ###
#### dataLoaded ####
#### playError ####
#### playEnd ####

## TVUI.Dialog ##
### 参数选项 ###
#### title ####
标题
#### content ####
对话框内容
#### width ####
宽度 默认 300
#### height ####
高度，如不设置，即自动
#### theme ####
自定义css className
#### btns ####
格式 [{text:'确定',handler:function(){},theme:'ok'}]
#### timeout ####
多少毫秒后自动关闭
#### page ####
页面实例
#### btnFocusClass ####
按钮获得焦点时的className
#### mask ####
是否显示遮罩层
#### auto ####
是否实例化时自动显示

### 属性和方法 ###
#### show() ####
#### hide() ####
#### destroy() ####

### 事件 ###
### TVUI.Dialog.alert(page, content, [callback], [timeout])  ###
### TVUI.Dialog.confirm(page, content, [okCallback], [cancelCallback]) ###

## TVUI.Player ##
### 参数选项 ###
### 属性和方法 ###
### 事件 ###

## TVUI.API ##
### TVUI.API.DataAccess ###
### TVUI.API.SysSetting ###
### TVUI.API.CA ###
### TVUI.API.Network ###
### TVUI.API.FileSystem ###
### TVUI.API.user ###
### TVUI.API.EPG ###

## TVUI.Log ##
## TVUI.Key ##
## TVUI.Lang ##
## Zepto ##
## SeaJs##
