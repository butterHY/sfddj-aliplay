// var _myShim = require('........my.shim');
// pages/user/myCoupon/myCoupon.js
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var stringUtils = require('../../../utils/stringUtils');
var utils = require('../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // couponList: [],
    showDialog: false,
    showToast: false,
    isExpired: false, //是否过期，true:是，false:否
    ruleSign: '',
    baseImageUrl: constants.UrlConstants.baseImageUrl,
    isLoadMore: false,
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    loadComplete: false,
    loadFail: false,
    maxLength: 6,   //检验兑换码的字数
    isRightSign: true,
    iconSize: my.getSystemInfoSync().windowWidth * 68 / 750,  //icon勾选的大小
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.setData({
    //   newResult: options
    // })
    // this.getCouponList();
    // this.getMaterialPic()  //广告位轮播
  },

  onShow: function() {
    var that = this;
    // utils.getNetworkType(that);
    that.getCouponList();
  },

  /**
   * 响应input输入
   */
  handleExchangeInput(event) {
    let { value } = event.detail;
    let isRightSign = true;

    if (/^[a-zA-Z0-9]*$/g.test(value)) {
      isRightSign = true;
    }
    else {
      isRightSign = false
    }

    this.setData({
      ruleSign: event.detail.value,
      isRightSign: isRightSign
    });

  },


  /**
   * 清除兑换码的输入
   * */
  exchangeClear() {
    this.setData({
      ruleSign: ''
    })
  },

  /**
   * 获取用户的优惠券
   */
  getCouponList: function() {
    this.setData({
      isLoadMore: true
    });
    var that = this;
    sendRequest.send(constants.InterfaceUrl.GET_COUPON_LIST, {
      isExpire: this.data.isExpired
    }, function(res) {
      var couponList = res.data.result;
      if (couponList) {
        couponList.forEach(function(item, index) {
          item.beginDateStr = that.formatTime(item.beginDate);
          item.endDateStr = that.formatTime(item.endDate);
        });
      }

      that.setData({
        couponList: couponList,
        isLoadMore: false,
        loadComplete: true,
        loadFail: false
      });
    }, function(err) {
      that.setData({
        couponList: [],
        isLoadMore: false,
        loadFail: true
      });
    });
  },

  /**
   * 获取轮播图图片
   * */
  getMaterialPic: function() {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.GET_MATERIALGROUP, { groupName: "优惠券轮播" }, function(res) {
      that.setData({
        material: res.data.result.material
      });
    }, function(err) {
    }, 'GET');
  },

  /**
   * 显示对话框
   */
  showDialog() {
    this.setData({
      showDialog: true
    });
  },

  /**
   * 取消兑换优惠券
   */
  cancel() {
    this.setData({
      showDialog: false,
      ruleSign: ''
    });
  },

  /**
   * 确认兑换优惠券
   */
  sure() {
    var ruleSign = this.data.ruleSign;
    var that = this;
    this.setData({
      showDialog: false,
      ruleSign: ''
    });
    if (stringUtils.isNotEmpty(ruleSign.trim())) {
      sendRequest.send(constants.InterfaceUrl.EXCHANGE_COUPON, {
        ruleSign: ruleSign
      }, function(res) {
        var result = res.data.result;

        if (result[0].errMsg) {
          my.showToast({
            content: result[0].errMsg
          })
        } else {
          if (result && Object.keys(result).length > 0) {
            that.showToast('兑换成功')
          }
          that.getCouponList();
        }
      }, function(err) {
        var msg = err;
        that.showToast(msg);
      });
    } else {
      var msg = '该劵码不存在，请稍后重试';
      that.showToast(msg);
    }
  },

  /**
   *  显示toast
   */
  showToast: function(msg) {
    var that = this;
    this.setData({
      errMsg: msg,
      showToast: true
    });
    setTimeout(function() {
      that.setData({
        showToast: false
      });
    }, 1500);
  },

  /**
   * 切换优惠券列表
   */
  changeCouponList() {
    this.setData({
      isExpired: !this.data.isExpired,
      couponList: []
    });
    this.getCouponList();
  },


  /**
   * 去使用按钮
   * */
  toUseCoupon(e) {
    let id = e.currentTarget.dataset.couponid;
    let useLink = e.currentTarget.dataset.uselink;
    let limitType = e.currentTarget.dataset.limitType;

    // 如果有返回跳转的链接,则直接跳转
    if (useLink && useLink != 'undefined' && useLink != 'null') {
      my.navigateTo({
        url: useLink
      });
    }
    else {

      //  如果是这些类型就跳去首页，否则就跳去分组页
      if (limitType == 0 || limitType == 4 || limitType == 5 || limitType == 6) {
        my.switchTab({
          url: '/pages/home/home',
        })
      } else {
        my.navigateTo({
          url: '/pages/home/grouping/grouping?pageFrom=coupon&couponId=' + id
        });
      }
    }

  },

  /**
   * format time
   * 将 millionSeconnd转化为yyyy.mm.dd的形式
   */
  formatTime(millSec) {
    var date = new Date(millSec);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var date = date.getDate();
    var monthStr = month < 10 ? '0' + month : month;
    var dateStr = date < 10 ? '0' + date : date;
    return year + '.' + monthStr + '.' + dateStr;
  },

  // 轮播图改变
  swiperChange: function(e) {
    var current = e.detail.current;
    var that = this;
    // that.setData({
    //   currentIndex: current
    // })
    that.setCurrentIndexFn(current);
  },
  // 手动调currentIndex
  setCurrentIndexFn: function(index) {
    var that = this;
    that.setData({
      currentIndex: index
    });
  },

  /**
   * 轮播图跳转
   * */
  goToLink: function(e) {
    var isLink = e.currentTarget.dataset.islink;
    var url = e.currentTarget.dataset.url;
    var goodsSn = e.currentTarget.dataset.goodssn;

    if (isLink) {
      if (url) {
        if (url.indexOf('shop/goods/view') != -1) {
          var index = url.lastIndexOf("\/");
          goodsSn = url.substring(index + 1, index + 15);
          my.navigateTo({
            url: '/pages/shopping/goodsDetail/goodsDetail?goodsSn=' + goodsSn
          });
        } else if (url.indexOf('GroupBuying/goods') != -1) {
          var index = url.lastIndexOf("\/");
          goodsSn = url.substring(index + 1, index + 15);
          my.navigateTo({
            url: '/pages/home/pintuan/tuangouGoodsDetail?goodsSn=' + goodsSn
          });
        } else {
          try {
            my.setStorageSync({
              key: 'swiperUrl', // 缓存数据的key
              data: url // 要缓存的数据
            });
          } catch (e) { }
          my.navigateTo({
            url: '/pages/user/webView/webView?link=' + url
          });
        }
      }
    }
  }
});