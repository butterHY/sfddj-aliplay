// var _myShim = require('..........my.shim');
/**
* 确认订单页面 
* @author 01368384
* 
* 跳转确认订单页面入口如下：
* 1.普通商品立即购买
* 2.普通商品送TA
* 3.购物车购买
* 4.团购商品立即开团
* 5.团购商品团长免单
* 6.团购商品单独购买
* 7.参团下单
* 
*/
var sendRequest = require('../../../../utils/sendRequest');
var constants = require('../../../../utils/constants');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
var utils = require('../../../../utils/util');
Page({
  data: {
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl,
    loadComplete: false,
    loadFail: false,
    totalSupplierCouponPrice: 0,      // 商家优惠总额
  },

  onLoad: function (options) {
    var that = this;
    var paymentId = options.paymentId;
    console.log(paymentId)
    this.setData({
      paymentId: paymentId
    });
  },

  /**
     * 生命周期函数--监听页面显示
     */
  onShow: function () {
    // utils.getNetworkType(this);
    this.toOrderPay();
  },

  /**
   * TO_ORDER_PAY
   */
  toOrderPay: function () {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.TO_ORDER_PAY, {
      paymentId: this.data.paymentId
    }, function (res) {
	  let result = res.data.result ? Object.assign({},res.data.result) : {}
	  if(result.orderSupplier) {
		  for(var i = 0; i < result.orderSupplier.length; i++){
			  var originalTotalPrice = 0;
			  var item = result.orderSupplier[i].orderGoodsList ? result.orderSupplier[i].orderGoodsList : [];
        result.orderSupplier[i].totalCouponPrice ?  that.data.totalSupplierCouponPrice += result.orderSupplier[i].totalCouponPrice : '';
			  for(var j = 0; j < item.length; j++){
				  originalTotalPrice += (item[j].quantity * item[j].salePrice)
			  }
			  result.orderSupplier[i].originalTotalPrice = originalTotalPrice
		  }
	  }

      that.setData({
        result: result,
        address: res.data.result.address,
        orderSupplier: res.data.result.orderSupplier,
        totalCouponPrice: res.data.result.totalCouponPrice,
        totalDepositPrice: res.data.result.totalDepositPrice,
        totalPrice: res.data.result.totalPrice ? res.data.result.totalPrice : 0,
        orderType: res.data.result.orderType,
        baseImageUrl: baseImageUrl,
        loadComplete: true,
        loadFail: false,
        totalSupplierCouponPrice: that.data.totalSupplierCouponPrice
      });
    }, function (err) {
      that.setData({
        loadFail: true
      })
    });
  },

  //去支付
  payOrder: function () {
    var paymentId = this.data.paymentId;
    var that = this;
    sendRequest.send(constants.InterfaceUrl.COUNTINUE_PAY_ORDER, {
      paymentId: paymentId
    }, function (res) {
      var orderStr = res.data.result.orderStr;
      var result = res.data.result;
      var orderSn = res.data.result.orderSn;
      if (orderStr.trade_no) {
        my.tradePay({
          tradeNO: orderStr.trade_no,
          success: function (res) {
            if (res.resultCode == '9000') {
              that.controllPayment(paymentId, 'success');
              my.showToast({
                content: '支付成功'
              });

              my.redirectTo({
                url: '/pages/shopping/paySucceed/paySucceed?orderSn=' + orderSn
              });

            }
            else if (res.resultCode == '6001') {
              my.showToast({
                content: '已取消'
              })
            }
            else if (res.resultCode == '6002') {
              my.showToast({
                content: '网络连接出错'
              })
            }
            else {
              my.showToast({
                content: '支付失败'
              })
            }
          },
          fail: function (res) {

            my.showToast({
              content: '调用支付失败'
            });

            that.controllPayment(paymentId, 'cancel');
          }
        });
      } else {
        my.showToast({
          content: orderStr.message
        })
      }

    }, function (err) {
      that.setData({
        showToast: true,
        showToastMes: err
      });
      setTimeout(function () {
        that.setData({
          showToast: false
        });
      }, 2000);
      that.controllPayment(paymentId, 'sysBreak');
    });
  },

  /**
   * 监控用户付款行为 success(成功)/cancel（取消）/sysBreak（异常）
   */
  controllPayment: function (paymentId, type) {
    sendRequest.send(constants.InterfaceUrl.CONTROL_PAYMENT, {
      paymentId: paymentId,
      type: type
    }, function (res) {
    }, function (err) {
    });
  }
});