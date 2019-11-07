// var _myShim = require('..........my.shim');

var constants = require('../../../../utils/constants');
var sendRequest = require('../../../../utils/sendRequest');

Page({
  data: {
    baseImgUrl: constants.UrlConstants.baseImageLocUrl
  },
  onLoad: function (options) {
    if (options.myPhone) {
      this.setData({
        myPhone: options.myPhone
      });
    }
  },
  onShow: function (e) {
    var that = this;
    try {
      if (my.getStorageSync({key:constants.StorageConstants.myPhone}).data) {
        that.setData({
          myPhone: my.getStorageSync({key: constants.StorageConstants.myPhone}).data
        });
        // 用完清除掉
        my.removeStorageSync({
          key: constants.StorageConstants.myPhone, // 缓存数据的key
        });
      } else {
        this.getMemberInfo();
      }
    } catch (e) {}
  },
  changePhoneNum: function () {
    my.navigateTo({
      url: '/pages/user/bindPhone/bindPhone?dataType=change'
    });
  },

  goToAddress: function () {
    my.navigateTo({
      url: '/pages/user/addressManage/addressManage'
    });
  },
  // 获取手机号
  getMemberInfo: function () {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.USER_USERINFO, {}, function (res) {
      that.setData({
        myPhone: res.data.result.mobile

      });
    }, function (err) {}, "GET");
  }
});