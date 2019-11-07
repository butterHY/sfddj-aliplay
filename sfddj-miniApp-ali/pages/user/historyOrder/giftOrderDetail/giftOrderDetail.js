// var _myShim = require("..........my.shim");
var sendRequest = require("../../../../utils/sendRequest");
var constants = require("../../../../utils/constants");
var utils = require("../../../../utils/util");
var dateformat = require("../../../../utils/dateformat");
var baseImageUrl = constants.UrlConstants.baseImageUrl;
var base64imageUrl = constants.UrlConstants.baseImageLocUrl; //图片资源地址前缀 
Page({
  /**
  * 页面的初始数据
  */
  data: {
    payType: '',
    loadComplete: false,
    loadFail: false,
    errMsg: '',
    orderTime: '',
    needRedirect: '',
    orderGiftList: [],
    base64imageUrl: baseImageUrl,
    showType: '',
    goodsItemL: '',
    paymentOrderId: '',
    supplierId: '',
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl

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
    var orderSn = options.orderSn;
    this.setData({
      orderSn: orderSn
    });
    that.data.paymentOrderId = options.paymentOrderId;
  },

  onShow: function () {
    var that = this;
    this.getOrderDetail();
    this.data.interval = setInterval(function () {
      that.getLastTime();
    }, 1000);
  },

  /**
   * 获取订单详情
   */
  getOrderDetail() {
    var that = this;

    sendRequest.send(constants.InterfaceUrl.MULTIG_GTFT_ORDER_DETAIL + that.data.paymentOrderId, {}, function (res) {
      var remainSecond = res.data.result.remainSecond;
      that.countLeftTime(remainSecond);
      that.setData({
        supplier: res.data.result.supplier,
        payType: res.data.result.payType,
        orderTime: res.data.result.payTime,
        loadComplete: true,
        loadFail: false,
        orderGiftList: res.data.result.orderList,
        goodsItemL: res.data.result.goodsItem,
        totalPaidAmount: res.data.result.totalPaidAmount,
        activityDiscountAmount: res.data.result.activityDiscountAmount,
        couponDiscountAmount: res.data.result.couponDiscountAmount,
        totalDepositAmount: res.data.result.totalDepositAmount,
        paidAmount: res.data.result.paidAmount,
        totalFee: res.data.result.totalFee,
        giftRemainQty: res.data.result.giftRemainQty,
        remainSecond: res.data.result.remainSecond,
        orderSn: res.data.result.orderSn,
        supplierId: res.data.result.supplier.supplierId
      });
    }, function (err) {
      that.setData({
        loadComplete: true,
        loadFail: true,
        errMsg: err
      });
    }, "GET");
  },
  //提醒发货
  remindDelivery: function () {
    var that = this;
    setTimeout(function () {
      that.setData({
        showToast: true
      });
    }, 500);
    setTimeout(function () {
      that.setData({
        showToast: false
      });
    }, 2000);
  },
  /**
     * 获取下单时间
     */
  getOrderTime(createTime) {
    var date = new Date(createTime);
    var year = date.getFullYear();
    var month = date.getMonth() + 1 < 10;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    return year + "" + month + day + " " + hour + ":" + min + ":" + sec;
  },

  /**
   * 获取剩余时间
   */
  countLeftTime(remainSecond) {
    var that = this;
    var interval = setInterval(function () {
      if (remainSecond > 0) {
        var leftHour = parseInt(remainSecond / 3600);
        var leftMin = parseInt((remainSecond - leftHour * 3600) / 60);
        var leftSec = remainSecond - leftHour * 3600 - leftMin * 60;
        var leftHourStr = leftHour < 10 ? '0' + leftHour : leftHour;
        var leftMinStr = leftMin < 10 ? '0' + leftMin : leftMin;
        var leftSecStr = leftSec < 10 ? '0' + leftSec : leftSec;
        remainSecond = remainSecond - 1;
        that.setData({
          leftTime: leftHourStr + ":" + leftMinStr + ":" + leftSecStr
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);
    this.setData({
      interval: interval
    });
  },

  /**
  * 获取剩余时间
  * */
  getLastTime() {
    var remainSecond = this.data.remainSecond;
    if (remainSecond > 0) {
      var leftHour = parseInt(remainSecond / 3600);
      var leftMin = parseInt((remainSecond - leftHour * 3600) / 60);
      var leftSec = remainSecond - leftHour * 3600 - leftMin * 60;
      this.setData({
        leftHour: leftHour < 10 ? '0' + leftHour : leftHour,
        leftMin: leftMin < 10 ? '0' + leftMin : leftMin,
        leftSec: leftSec < 10 ? '0' + leftSec : leftSec,
        remainSecond: this.data.remainSecond - 1
      });
    } else {
      clearInterval(this.data.interval);
      this.setData({
        outOfTime: true
      });
    }
  },
  //删除订单
  deleteOrder: function (event) {
    // var orderId = event.currentTarget.dataset.orderId
    // this.setData({
    //   dialogTitle: '确认要删除订单吗？',
    //   dialogParam: {
    //     orderId: orderId
    //   },
    //   dialogUrl: constants.InterfaceUrl.ORDER_DELETE,
    //   dialogMethod: 'GET',
    //   showDialog: true,
    // })

    var orderId = event.currentTarget.dataset.orderId;
    var that = this;
    my.confirm({
      title: '删除订单',
      content: '确认要删除订单吗？',
      success: function (res) {
        if (res.confirm) {
          sendRequest.send(constants.InterfaceUrl.ORDER_DELETE, {
            orderId: orderId
          }, function (res) {
            my.navigateBack({});
          }, function (err) {
            my.showToast({
              content: '删除失败, ' + err
            });
          }, 'GET');
        }
      }
    });
  },

  /**
   * 用户确认收货
   */
  orderReceive: function (event) {

    var that = this;

    var index = event.currentTarget.dataset.index;

    var order = that.data.orderGiftList[index];
    // var orderId = event.currentTarget.dataset.orderId
    // this.setData({
    //   dialogTitle: '确认要收货吗？',
    //   dialogParam: {
    //     orderId: orderId
    //   },
    //   dialogUrl: constants.InterfaceUrl.ORDER_RECEIVE,
    //   dialogMethod: 'POST',
    //   showDialog: true,
    // })

    var orderId = order.orderId;

    my.confirm({
      title: '确认收货',
      content: '确认要收货吗？',
      success: function (res) {
        if (res.confirm) {
          sendRequest.send(constants.InterfaceUrl.ORDER_RECEIVE, {
            orderId: orderId
          }, function (res) {
            that.gotoCommentJump(index);
            that.getOrderDetail();
          }, function (err) {
            my.showToast({
              content: '确认收货失败, ' + err
            });
          });
        }
      }
    });
  },

  /**
   * 评价晒单
   */
  gotoCommentJump(event) {
    var order = this.data.orderGiftList[event];
    // var goodsPic = order.goodsImg;
    // var orderId = order.orderId;
	let {goodsImg, orderId, goodsSn} = this.data.orderGiftList[event]
    var supplierId = this.data.supplierId;
    var that = this;
    sendRequest.send(constants.InterfaceUrl.FIND_GOODS_COMMENT, {
      oId: orderId
    }, function (res) {
      if (that.data.needRedirect) {
        my.redirectTo({
          url: '/pages/user/historyOrder/commentAndShare/commentAndShare?orderId=' + orderId + '&goodsPic=' + goodsImg + '&supplierId=' + supplierId + '&goodsSn=' + goodsSn, // 需要跳转的应用内非 tabBar 的目标页面路径 ,路径后可以带参数。参数规则如下：路径与参数之间使用
        });
      } else {
        my.navigateTo({
          url: '/pages/user/historyOrder/commentAndShare/commentAndShare?orderId=' + orderId + '&goodsPic=' + goodsImg + '&supplierId=' + supplierId + '&goodsSn=' + goodsSn
        });
      }
    }, function (err) {
      my.confirm({
        title: '评价晒单',
        content: '该商品您已评价过，请勿重复评价'
      });
    }, "GET");
  },

  gotoComment(event) {
    var index = event.currentTarget.dataset.index;
    var order = this.data.orderGiftList[index];
    // var goodsPic = order.goodsImg;
    // var orderId = order.orderId;
	let {goodsImg, orderId, goodsSn} = this.data.orderGiftList[index];
    var supplierId = this.data.supplierId;
    var that = this;
    sendRequest.send(constants.InterfaceUrl.FIND_GOODS_COMMENT, {
      oId: orderId
    }, function (res) {
      if (that.data.needRedirect) {
        my.redirectTo({
          url: '/pages/user/historyOrder/commentAndShare/commentAndShare?orderId=' + orderId + '&goodsPic=' + goodsPic + '&supplierId=' + supplierId + '&goodsSn=' + goodsSn, // 需要跳转的应用内非 tabBar 的目标页面路径 ,路径后可以带参数。参数规则如下：路径与参数之间使用
        });
      } else {
        my.navigateTo({
          url: '/pages/user/historyOrder/commentAndShare/commentAndShare?orderId=' + orderId + '&goodsPic=' + goodsPic + '&supplierId=' + supplierId + '&goodsSn=' + goodsSn
        });
      }
    }, function (err) {
      my.confirm({
        title: '评价晒单',
        content: '该商品您已评价过，请勿重复评价'
      });
    }, "GET");
  }
});