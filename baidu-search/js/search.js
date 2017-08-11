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
$(function () {
    var $input = $('.search-text');

    $input.keyup(function () {
        //获取输入的内容
        var sVal = $(this).val();
        //发送jsonp的连接请求
        $.ajax({
            url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?',
            type: 'get',
            dataType: 'jsonp',
            // jsonpCallback: 'baidu.sug',
            data: { wd: sVal }
        })
            .done(function (data) {
                //通过json对象中的s这个键拿到数据列表
                //var lsData = data.s;
                //对列表进行遍历取出里面的值
                //var str = '';
                //for (var index = 0; index < lsData.length; index++) {
                    //str += '<li>' + lsData[index] + '</li>';
                //}
                //$list.html(str);
            })
            .fail(function (data) {
                return;
            });

    })


})
