// var _myShim = require('........my.shim');
// pages/user/addressManage/addressManage.js  
var constants = require('../../../utils/constants');
var sendRequest = require('../../../utils/sendRequest');
var utils = require('../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],
    isLoadMore: false,
    needRedirect: '',
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl,
    loadComplete: false,
    loadFail: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var pages = getCurrentPages();
    that.setData({
      needRedirect: pages.length == 5
    });
  },
  onShow: function () {
    this.setData({
      isLoadMore: true
    });
    var that = this;
    // utils.getNetworkType(that);
    sendRequest.send(constants.InterfaceUrl.SEARCH_ADDRESS, {}, function (res) {
      my.hideLoading();
      that.setData({
        addressList: res.data.result,
        isLoadMore: false,
        loadComplete: true,
        loadFail: false
      });
      // 测试临时添加的  alert
    }, function (err) {
      that.setData({
        isLoadMore: false,
        loadFail: true
      });
    }, 'GET');
  },

  onUnload: function () {
    // console.log(this.data.addressList);
    this.data.addressList.forEach(function(value, idex, arr) {
      if (value.isDefault) {
        my.setStorageSync({
          key: 'defaultAddress',
          data: value
        });
      }
    })
  },

  //设为默认地址
  setDefault: function (event) {
    var index = event.currentTarget.dataset.index;
    var addressList = this.data.addressList;
    for (var key in addressList) {
      if (key == index) {
        addressList[key].isDefault = true;
      } else {
        addressList[key].isDefault = false;
      }
    }
    var addressInfo = addressList[index];
    this.setData({
      addressList: addressList
    });

    // console.log(this.data.addressList)

    var payLoad = {
      realName: addressInfo.fullName,
      mobile: addressInfo.mobile,
      province: addressInfo.province,
      city: addressInfo.city,
      area: addressInfo.area,
      AccAddress: addressInfo.address,
      isDefault: addressInfo.isDefault ? '1' : '0',
      addressId: addressInfo.id
    };
    sendRequest.send(constants.InterfaceUrl.MODIFY_ADDRESS, payLoad, function (res) {
      my.hideLoading();
      my.navigateBack({});
    }, function (err) {
      my.hideLoading();
    });
  },

  //删除地址
  delAddr: function (event) {
    var index = event.currentTarget.dataset.index;
    var that = this;
    my.confirm({
      title: '删除地址',
      content: '是否删除地址？',
      success: function (res) {

        if (res.confirm) {
          my.showLoading({
            content: 'loading...'
          });

          sendRequest.send(constants.InterfaceUrl.DELETE_ADDRESS, {
            addressId: that.data.addressList[index].id
          }, function (res) {

            my.hideLoading();

            var addressList = that.data.addressList;
            addressList.splice(index, 1);
            that.setData({
              addressList: addressList
            });
          }, function (err) {

            my.hideLoading();
          });
        }
      }
    });
  },

  //跳转到修改（新建）地址页面
  modifyAddr: function (event) {
    var index = event.currentTarget.dataset.index;
    var address = this.data.addressList[index];
    if (this.data.needRedirect) {
      my.redirectTo({
        url: './addAddress/addAddress?pageType=1&&originalAddr=' + JSON.stringify(address)
      });
    } else {
      my.navigateTo({
        url: './addAddress/addAddress?pageType=1&&originalAddr=' + JSON.stringify(address)
      });
    }
  },

  //使用支付宝地址
  chooseAddr: function () {
    const that = this;
    my.getAddress({
      success: function (res) {
        var payLoad = {
          realName: res.result.fullname,
          mobile: res.result.mobilePhone,
          province: res.result.prov,
          city: res.result.city,
          area: res.result.area,
          AccAddress: res.result.address,
          isDefault: '1'
        };

        // 暂不支持香港，澳门，台湾地区的配送，请重新选择地址；
        // 用户取消操作；
        if(res.resultStatus == '6001') {
          return;
        } else if(res.resultStatus == '9000' && (res.result.prov == '澳门特别行政区' || res.result.prov == '香港特别行政区')) {
          payLoad.city = res.result.prov;
          payLoad.area = res.result.city;
        }

        my.showLoading({
          content: 'loading'
        });

        sendRequest.send(constants.InterfaceUrl.ADD_ADDRESS, payLoad, function (res) {
          my.hideLoading();
          sendRequest.send(constants.InterfaceUrl.SEARCH_ADDRESS, {}, function (res) {
            my.hideLoading();
            that.setData({
              addressList: res.data.result,
              isLoadMore: false,
              loadComplete: true,
              loadFail: false
            });
          }, function (err) {
            that.setData({
              isLoadMore: false,
              loadFail: true
            });
          }, 'GET');

        }, function (err) {
          my.hideLoading();
          if(err == '请填写完整的地址') {
            my.alert({
              title: '地址添加失败, 地址信息不完整',
            });
          }
        });
      }
    });
  }
});