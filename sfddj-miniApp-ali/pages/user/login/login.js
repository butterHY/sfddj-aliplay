// var _myShim = require('........my.shim');

var constants = require('../../../utils/constants');
var sendRequest = require('../../../utils/sendRequest');
var util = require('../../../utils/util');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
    } catch (e) {}
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  // 点击授权按钮
  btnGetUserInfo: function (e) {
    try {
      my.setStorageSync({key:'isLogin',data: true});
    } catch (e) {}
    if (e.detail.errMsg == 'getUserInfo:ok') {
      try {
        my.setStorageSync({
          key: 'encryptedData', // 缓存数据的key
          data: e.detail.encryptedData, // 要缓存的数据
        });
        my.setStorageSync({
          key: 'iv', // 缓存数据的key
          data: e.detail.iv, // 要缓存的数据
        });
        my.setStorageSync({
          key: 'rawData', // 缓存数据的key
          data: e.detail.iv, // 要缓存的数据
        });
        my.setStorageSync({
          key: 'signature', // 缓存数据的key
          data: e.detail.signature, // 要缓存的数据
        });
        my.setStorageSync({
          key: 'userInfo', // 缓存数据的key
          data: e.detail.userInfo, // 要缓存的数据
        });
        var now_url = my.getStorage({
          key: 'loginUrl', // 缓存数据的key
          success: (res) => {

            my.reLaunch({
              url: '/' + res.data
            });
          },
        });
      } catch (e) {}
    } else {
      var now_url = my.getStorage({
        key: 'loginUrl', // 缓存数据的key
        success: (res) => {

          my.reLaunch({
            url: '/' + res.data
          });
        },
      });
    }
  },

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

});