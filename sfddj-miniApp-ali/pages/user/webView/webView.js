// var _myShim = require('........my.shim');

Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // try {
    //   var link = my.getStorageSync({
    //     key: 'swiperUrl', // 缓存数据的key
    //   }).data;
    //   console.log(link)
      this.setData({
        link: `https://ten.sobot.com/chat/h5/v2/index.html?sysnum=0662d9d57e404c098245fae5b2b8d056&uname=` + options.uname
      });
      console.log(this.data.link)
    //   console.log(this.data.link)
    //   my.removeStorageSync({
    //     key: 'swiperUrl', // 缓存数据的key
    //   });
    // } catch (e) {}
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