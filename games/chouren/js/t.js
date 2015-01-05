var t = Date.parse(new Date());
var appUrl = 'dist/js/all.min.js?_t=' + t;

//控制游戏时间
var gameTime = 10;

function getUrlParam(paras) {
    var url = location.href;
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    var paraObj = {};
    var i , j;
    for (i = 0; j = paraString[i]; i++) {
        paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
    }
    var returnValue = paraObj[paras.toLowerCase()];
    if ( typeof (returnValue) == "undefined") {
        return "";
    } else {
        return returnValue;
    }
}
var userName;
try{
    userName = decodeURIComponent(getUrlParam('userName'));
} catch(e){
    userName = getUrlParam('userName');
}
var wxData = {
    "imgUrl":'http://182.92.186.42/personal/slide/images/tfz.jpg',
    "link":window.location.href,
    "desc": '哈哈！我太坏了，把' + userName + '抽的满地找牙，大家继续整他',
    "title": '哈哈！我太坏了，把' + userName + '抽的满地找牙，大家继续整他'
};