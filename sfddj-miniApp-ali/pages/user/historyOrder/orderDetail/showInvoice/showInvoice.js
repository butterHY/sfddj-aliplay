// var _myShim = require('............my.shim');
// pages/user/historyOrder/orderDetail/showInvoice/showInvoice.js
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var invUrl = getApp().invUrl;
    this.setData({
      invUrl: invUrl
    });
  },

  checkBigImageFn(e) {
    var invUrl = e.currentTarget.dataset.urls;
    var newUrls = [];
    newUrls[0] = invUrl;
    my.previewImage({
      urls: newUrls,
      current: invUrl
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {}
});