// var _myShim = require('..........my.shim');
/**
* 商家执照信息页面
* @author 01368384 
*/
var constants = require('../../../../utils/constants');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀

Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var images = options.images;
    images = images.split(',');
    this.setData({
      images: images,
      baseImageUrl: baseImageUrl
    });
  },
  /**
   * 查看图片
   */
  imageViewTap: function (e) {
    var urls = e.currentTarget.dataset.urls;
    var url = baseImageUrl + e.currentTarget.dataset.current;
    var newUrls = [];
    urls.forEach(function (v, i, arr) {
      v = baseImageUrl + v;
      newUrls.push(v);
    });
    my.previewImage({
      urls: newUrls,
      current: url
    });
  }

});