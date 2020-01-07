// pages/shopping/storeInfo/storeInfoDetail/storeInfoDetail.js
let constants = require('../../../../utils/constants.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    showIntroduction: false,       //是否显示商家简介弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 点击显示商家简介
  tapStoreIntro(){
    this.setData({
      showIntroduction: true
    })
  },

  // 关闭商家简介弹窗
  colseCommonDialog(){
    this.setData({
      showIntroduction: false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})