// var _myShim = require('........my.shim');
// pages/user/logistics/logistics.js 
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    expressDetail: [],
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var orderId = options.orderId;
    var goodsImg = options.goodsImg;
    sendRequest.send(constants.InterfaceUrl.USER_EXPRESS, {
      orderId: orderId
    }, function (res) {
      that.setData({
        expressDetail: res.data.result.expressDetail,
        deliveryNo: res.data.result.deliveryNo,
        goodsImg: goodsImg,
        baseImageUrl: constants.UrlConstants.baseImageUrl
      });
    }, function (err) {});
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
  onReachBottom: function () {}

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
});