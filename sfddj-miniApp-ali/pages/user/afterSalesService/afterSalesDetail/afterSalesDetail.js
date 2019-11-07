// var _myShim = require('..........my.shim');
/**
* 售后详情
* @author 01368384  
*
*/

var constants = require('../../../../utils/constants');
var util = require('../../../../utils/util');
var sendRequest = require('../../../../utils/sendRequest');
var dateformat = require('../../../../utils/dateformat');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    workOrderId: '',
    needRedirect: '',
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl
  },

  onLoad: function (options) {
    var that = this;
    var pages = getCurrentPages();
    that.setData({
      needRedirect: pages.length == 5
    });
    var orderId = options.orderId;
    var workOrderId = options.workOrderId;
    that.data.orderId = orderId;
    that.data.workOrderId = workOrderId;
  },
  onShow: function () {
    var that = this;
    // my.showLoading({
    //   content: '加载中'
    // });
    // util.getNetworkType(that);
    that.getData();
  },

  getData: function () {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.AFTER_SALE_DETAIL, { orderId: that.data.orderId, workOrderId: that.data.workOrderId }, function (res) {
      
      if (res.data.result.workOrder.createDate) {
        res.data.result.workOrder.createDate = dateformat.DateFormat.format(new Date(res.data.result.workOrder.createDate),'yyyy-MM-dd hh:mm:ss');
      }
      if (res.data.result.workOrder.processDate) {
        res.data.result.workOrder.processDate = dateformat.DateFormat.format(new Date(res.data.result.workOrder.processDate),'yyyy-MM-dd hh:mm:ss');
      }
      if (res.data.result.refund && res.data.result.refund.refundDate) {
        res.data.result.refund.refundDate = dateformat.DateFormat.format(new Date(res.data.result.refund.refundDate),'yyyy-MM-dd hh:mm:ss');
      }
      that.setData({
        result: res.data.result,
        loadComplete: true,
        loadFail: false
      });
      // my.hideLoading();
    }, function (res) {
      that.setData({
        loadFail: true
      })
      my.showToast({
        content: res
      });
      // my.hideLoading();
    });
  },

  /**
   * 点击凭证图片
   */
  imageViewTap: function (e) {
    my.previewImage({
      urls: e.currentTarget.dataset.urls,
      current: e.currentTarget.dataset.current
    });
  },

  /**
  * 取消售后
  */
  cancelApply: function (e) {
    var that = this;
    my.showLoading({
      content: '取消中'
    });
    sendRequest.send(constants.InterfaceUrl.WORK_ORDER_CANCEL_APPLY, { workOrderId: that.data.workOrderId }, function (res) {
      that.getData();
    }, function (res) {
      my.hideLoading();
    });
  },

  /**
   * 取消申诉
   */
  cancelPlatform: function (e) {
    var that = this;
    my.showLoading({
      content: '取消中'
    });
    sendRequest.send(constants.InterfaceUrl.CANCEL_APPEAL, { workOrderId: that.data.workOrderId }, function (res) {
      that.getData();
    }, function (res) {
      my.hideLoading();
    });
  },

  /**
   * 同意金额
   */
  agreeRefound: function (e) {
    var that = this;
    my.showLoading({
      content: '加载中'
    });
    sendRequest.send(constants.InterfaceUrl.AGREE_REFUND_AMOUNT, { workOrderId: that.data.workOrderId }, function (res) {
      that.getData();
    }, function (res) {
      my.hideLoading();
    });
  },

  // 跳去客服网页版
  goToWebCall: function () {
    var that = this;
    var webCallLink = that.data.result.supplier.webCallParam;
    try {
      my.setStorageSync({
        key: 'webCallLink', // 缓存数据的key
        data: webCallLink, // 要缓存的数据
      });
    } catch (e) {}
    my.navigateTo({
      url: '/pages/user/webCallView/webCallView?link=' + webCallLink
    });
  }

});