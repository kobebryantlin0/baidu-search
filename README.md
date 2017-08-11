# baidu-search
realize searching with intelligence tips from baidu<br/>
readme来源于我的博客：http://blog.csdn.net/kobebryantlin0/article/details/77103884
## 引言
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;最近打算给自己的小项目加入一个智能搜索的提示，就像在使用百度或者360搜索时，每输入一个字都会出现一个包含关键词的下拉列表的提示，这个轮子如果后端自己造的话，先不谈造出来好不好用，首先肯定会增加一些额外的工作量。俗话说：君子生非异也，善假于物也，于是自然第一想法先去看看有没有现成的接口，后来发现是我想多了，唉，看来这些大厂们还是比较小气的。看来只有亲自去抓一条它们的请求报文分析一下了，分析完后我派出了兵器库里的Jsonp帮我实现了这个功能。最后实现的效果如下图所示：
![这里写图片描述](http://img.blog.csdn.net/20170811211016809?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQva29iZWJyeWFudGxpbjA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
## 实现过程：
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;首先是去抓一个请求报文和一个返回的数据包看看，打开百度搜索，任意输入一个内容，然后通过F12打开chrome开发者工具，查看network,我在搜索框里输入了一个m，于是就在Headers里面拿到了这么一串Request URL,我把它粘贴在下面分析一下（其实很多参数我也不知道是干啥的)。

```
Request URL:
https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=m&json=1&p=3&sid=1451_19036_21093_17001&req=2&csor=1&cb=jQuery110208041528279304828_1502445662172&_=1502445662175

```
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;分析上面这个URL,<font color="red">wd=m</font> 这个肯定表示请求数据了，然后再看一下<font color="red">cb</font>这个字段，cb应该是callback的缩写，也就是Jsonp中Jsonpcallback对应的字段,后面那个JQuery开头的一长串数字是Jquery自动生成的回调函数名，如果没有什么特殊需求的处理，这个回调函数并不会有什么太大卵用，因为即使不带这一项，一样可以请求到数据，不信可以试着将下面这个缩减版的链接复制到浏览器的地址栏中试一下，https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=m 你会得到下面这样的数据：

```
window.baidu.sug({q:"m",p:false,s:["美团","mysql","美图秀秀","蚂蜂窝","慕课网","梦幻西游","魅族","名侦探柯南","美元对人民币汇率","魔兽世界"]});
```
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;但是在使用百度的智能提示时，会存在一个问题，虽然我们在浏览器中不带回调函数可以请求到数据，但是由于使用jQuery中的Jsonp请求时，请求路径中带的键名默认是叫callback，而不是cb，所以百度返回的数据是用window.baidu.sug()这个函数去包裹的，而Jsonp的本质是利用了&lt;script>标签src这个属性可以跨越请求资源的特性，所以就像引入一段远程的js文件一样，返回的callback函数会被立即执行，这个时候如果我们没有写baidu.sug这个回调函数，那么程序就会出现找不到sug这个属性的错误。
</p>	
***
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color="#4dd4bf">再解释一遍上面这个问题，百度对客户端发送过来的请求有两种处理形式，如果客户端的请求链接有cb这个键，注意一定要叫<font color="red">cb</font>,那么就会通过键获取到对应的值，这个值就是客户端的回调函数，然后用回调函数包裹具体的数据返回，这个回掉函数如果使用JQuery时不默认指定Jsonpcallback这一项，那么Jquery会默认替我们生成一个回调函数，一般是这种形式：

```
jQuery110208041528279304828_1502445662172({"q":"m","p":false,"bs":"","csor":"1","status":0,"g":[ { "q": "美团", "t": "n", "st": { "q": "美团", "new": 0 } }, { "q": "美图秀秀", "t": "n", "st": { "q": "美图秀秀", "new": 0 } }, { "q": "蚂蜂窝", "t": "n", "st": { "q": "蚂蜂窝", "new": 0 } }, { "q": "慕课网", "t": "n", "st": { "q": "慕课网", "new": 0 } }, { "q": "mac", "t": "n", "st": { "q": "mac", "new": 0 } }, { "q": "梦幻西游", "t": "n", "st": { "q": "梦幻西游", "new": 0 } }, { "q": "魅族", "t": "n", "st": { "q": "魅族", "new": 0 } }, { "q": "mysql", "t": "n", "st": { "q": "mysql", "new": 0 } }, { "q": "名侦探柯南", "t": "n", "st": { "q": "名侦探柯南", "new": 0 } }, { "q": "美元对人民币汇率", "t": "n", "st": { "q": "美元对人民币汇率", "new": 0 } } ],"s":["美团","美图秀秀","蚂蜂窝","慕课网","mac","梦幻西游","魅族","mysql","名侦探柯南","美元对人民币汇率"]});
```
<font color="#4dd4bf">正是由于上面这种函数是jquery生成的，所以加载回来的数据执行时不会出现报错，但是如果没有以cb为键的一项，那么返回的结果通通都会用window.baidu.sug这个函数包裹，这个时候我们的js中并没有这个函数，如果没定义的话就会出现报错，我们需要自己去定义出baidu.sug这个函数，即使里面什么也不写。</font></p>
## 遇到的问题
<br>最开始我获取数据的代码是按照下面这样写的：

```
$(function () {
    var $input = $('.search-text');
    $input.keyup(function () {
        //获取输入的内容
        var sVal = $(this).val();
        var lsData = data.s;
        //发送jsonp的连接请求
        $.ajax(
	        url:'https://sp0.baidu.com/
        5a1Fazu8AA54nxGko9WTAnF6hhy/su?',
            type: 'get',
            dataType: 'jsonp',
            // jsonpCallback: 'baidu.sug',
            data: { wd: sVal }
        })
           .done(function (data) {
                //通过json对象中的s这个键拿到数据列表
                var lsData = data.s;
                //对列表进行遍历取出里面的值
                var str = '';
                for (var index = 0; index < lsData.length; index++) {
                    str += '<li>' + lsData[index] + '</li>';
                }
                $list.html(str);
            })
            .fail(function (data) {
                return;
            });
    })

});
```
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;但是不知道为什么在回调函数中可以拿到数据，Jquery内部解析却出错了，直接就跳到了fail函数，后来当我去用同样的方式请求360的数据时就没出现这种问题，个人仔细比对了一下数据也没什么大的差异，唉，可能是我道行太浅吧。于是我这时候深深体会到了回调函数的好处，把对数据处理的逻辑直接扔到了回调函数里，请求还是正常的用Jquery中的jsonp去请求，对回来的数据进行处理和页面呈现时就去回掉函数里做，嗯，这样美滋滋。具体代码就是下面这些：
```
var baidu = new Object();
baidu.sug = function (data) {
    //通过json对象中的s这个键拿到数据列表
    var $list = $('.list-text');
    var lsData = data.s;
    //对列表进行遍历取出里面的值
    var str = '';
    for (var index = 0; index < lsData.length; index++) {
        str += '<li>' + lsData[index] + '</li>';
    }
    $list.html(str);
}
```
## 最后
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;到这里，整个功能就实现了，其实也是挺简单的，下面简单说说360搜索，360就比百度可爱多了，随便抓一个请求url分析一下,https://sug.so.360.cn/suggest?callback=suggest_so&encodein=utf-8&encodeout=utf-&fields=word&word=m，
360后台对所有的请求只有一种处理，就是通过callback这个键所带的函数名包裹数据返回，同时Jquery会完成正常的解析，调用done这个函数，所有的逻辑我们便可以都写在done这个函数里了，给360一个大大的么么哒。具体核心实现只用下面这一段代码就够了：

```
 $.ajax({
               // 360搜索的联想数据jsonp接口地址：
               url:'https://sug.so.360.cn/suggest?',
               type:'get',
               dataType:'jsonp',
               // 传给服务器的参数：
               data:{word:sVal}
            })
            .done(function(dat){
               console.log(dat);
               //console.log(dat.s);

               // 获取数据里面的文字列表
               var aDat = dat.s;

               var sTr = '';
               for(var i=0;i<aDat.length;i++)
               {
                  sTr += '<li>'+aDat[i]+'</li>';
               }

               $list.html(sTr);
  })
```
最后斗胆附上我的Github地址，文中介绍的代码完整实现都在这里了，如果对您有帮助，给个star么么哒。 https://github.com/kobebryantlin0/baidu-search
