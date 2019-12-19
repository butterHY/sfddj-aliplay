var toFix = function(value) {
  value = value ? value * 1 : 0;
  return value.toFixed(2); //此处2为保留两位小数
}

var numberChange = function(value) {
  return value * 1 > 0 ? '+' + value : value;
}


var strIndexOf = function(str, con) {
  str = typeof str == 'string' ? str : "";
  return str.indexOf(con) > -1;
}

// 生成一个随机数
var randowNum = function() {
  return Math.random() * 10;
}


// 判断链接是不是商品详情的链接
var isGoodsLink = function(link){
  var link = link && typeof(link) == 'string' ? link : ''
  return link.indexOf('shopping/goodsDetail/goodsDetail') > -1
}

// 判断链接是否是http开头的
var isHttpUrl =  function(url) {
  var url = url && typeof(url) == 'string' ? url : ''
  return url.substring(0,4).indexOf('http') > -1 
}

export default {
  toFix,
  numberChange,
  strIndexOf,
  randowNum,
  isGoodsLink,
  isHttpUrl
};