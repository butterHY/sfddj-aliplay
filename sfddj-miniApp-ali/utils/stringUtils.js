// var _myShim = require("....my.shim");
/**
* 字符串工具类
* @author 854638
*/

function isNotEmpty(str) {
  if (str != "" && str != undefined && str != "undefined" && str != null && str != 'null') {
    return true;
  } else {
    return false;
  }
}

function isPhoneNumber(str) {
  var re = /^1\d{10}$/;
  return re.test(str);
}

//将秒格式化为时分
function formatSeconds(value) {
  var theTime = parseInt(value); // 秒 
  if (theTime < 0) {
    theTime = theTime / -1;
  }
  var theTime1 = 0; // 分 
  var theTime2 = 0; // 小时  
  if (theTime > 60) {
    theTime1 = parseInt(theTime / 60);
    theTime = parseInt(theTime % 60);
    if (theTime1 > 60) {
      theTime2 = parseInt(theTime1 / 60);
      theTime1 = parseInt(theTime1 % 60);
    }
  }
  // var result = "" + parseInt(theTime) + "秒";
  var result = "";
  if (theTime1 >= 0) {
    result = "" + parseInt(theTime1) + "分" + result;
  }
  if (theTime2 > 0) {
    result = "" + parseInt(theTime2) + "小时" + result;
  }
  return result;
}



module.exports = {
  isNotEmpty: isNotEmpty,
  isPhoneNumber: isPhoneNumber,
  formatSeconds: formatSeconds
};