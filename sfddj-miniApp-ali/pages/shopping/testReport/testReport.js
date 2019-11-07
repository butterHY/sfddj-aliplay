// var _myShim = require('........my.shim');
/**
* 检验报告页面
* @author 01368384
*  
*/
var constants = require('../../../utils/constants');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀

Page({

  onLoad: function (options) {
    this.setData({
      url: baseImageUrl + options.inspectReportImagePath
    });
  }

});