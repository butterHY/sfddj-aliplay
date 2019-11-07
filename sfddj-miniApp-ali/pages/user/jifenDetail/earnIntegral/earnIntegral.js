// var _myShim = require("..........my.shim");

var sendRequest = require("../../../../utils/sendRequest");
var constants = require("../../../../utils/constants");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadComplete: true,
    loadFail: false,
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl, //图标，相当于本地图片目录
    currentTaped: [false, false, false, false],
    currentIndex: 4
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  // 点击选择
  pickMe: function (e) {
    var index = e.currentTarget.dataset.index;
    var that = this;
    var taped = that.data.currentTaped;
    // if(that.data.currentTaped[index]){
    for (var i = 0; i < taped.length; i++) {
      taped[i] = false;
    }
    if (that.data.currentIndex == index) {
      taped[index] = false;
    } else {
      taped[index] = !that.data.currentTaped[index];
    }

    // }
    that.setData({
      currentIndex: e.currentTarget.dataset.index,
      currentTaped: taped
    });
  },

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