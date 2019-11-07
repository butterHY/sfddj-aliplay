// var _myShim = require('........my.shim');
/**
* 支付成功页面 
* @author 01368384 
* 
*/
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var util = require('../../../utils/util');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
Page({
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
	  smallImgArg: '?x-oss-process=style/goods_img_3',
    couponShow: false,     // 优惠券弹窗
    couponAmount: null     // 优惠券弹窗的金额

  },
  onLoad: function (options) {
    var that = this;
    var orderSn = options.orderSn;
    var paymentId = options.paymentId;
    // console.log(options);
    sendRequest.send(constants.InterfaceUrl.GET_GOODS_AFTER_TRADE_SUC, { orderSn: orderSn }, function (res) {
      that.setData({
        recommondList: res.data.result,
        baseImageUrl: baseImageUrl
      });
    }, function (res) {
      // wx.showToast({
      //   title: res,
      // })
      // that.setData({
      //   showToastMes: res,
      //   showToast: true
      // })
      // setTimeout(function(){
      //   that.setData({
      //     showToast: false
      //   })
      // },2000)
    });

    sendRequest.send(constants.InterfaceUrl.couponPop, { paymentId: paymentId }, function (res) {
      // console.log(res);
      if(res.data.result) {
        that.setData({
          couponShow: true,
          couponAmount: res.data.result.couponAmount
        })
      }
    }, function (res) {
      // console.log(res);
    });
  },

  closeCouponShow() {
    // console.log('我知道了');
    this.setData({
      couponShow: false
    })
  },

});