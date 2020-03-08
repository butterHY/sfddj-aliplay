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
import http from '../../../api/http'
import api from '../../../api/api'
Page({
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: baseImageUrl,                                 // 图片资源路径
    smallImgArg: '?x-oss-process=style/goods_img_2',            // 图片限制大小
    couponShow: false,                                          // 优惠券弹窗
    couponAmount: null,                                         // 优惠券弹窗的金额
    succeedSwiperList: [],                                      // 轮播图数据
    likeStart: 0,
    likeLimit: 10,
    isLoadComplete: false
  },
  onLoad: function (options) {
    let that = this;
    var orderSn = options.orderSn;
    // let orderSn = '160090017269329';
    let paymentId = options.paymentId;
    // let paymentId = '1306';

    // 获取轮播图列表
    that.getMaterial();

    // 获取猜你喜欢列表
    // if (orderSn) {
    //   that.getLikeList(orderSn)
    // }
    that.getGuessLike(0)

    // 获取付款成功发放的优惠券
    if (paymentId) {
      that.getCoupon(paymentId)
    }

  },

  /*
  * 获取猜你喜欢数据---旧的
  **/
  getLikeList(sn) {
    let that = this;
    sendRequest.send(constants.InterfaceUrl.GET_GOODS_AFTER_TRADE_SUC, { orderSn: sn }, function (res) {
      that.setData({
        recommondList: res.data.result,
        baseImageUrl: baseImageUrl
      });
    }, function (res) { });
  },

  // 新的猜你喜欢
  getGuessLike(type) {
    let that = this;
    let data = {
      start: this.data.likeStart,
      limit: this.data.likeLimit,
      groupName: '支付宝小程序猜你喜欢'
    }
    if (type == 0) {
      data.isFirst = 1
    }
    http.get(api.GOODS.LISTGOODSBYNAME, data, res => {
      let result = res.data.data ? res.data.data : []
      let lastRecommentList = that.data.recommondList
      let recommondList = []
      let isLoadComplete = false
      if (result.length < that.data.likeLimit) {
        isLoadComplete = true
      }
      if (type == 1) {
        recommondList = lastRecommentList.concat(result)
      } else {
        recommondList = result
      }
      that.setData({
        recommondList: recommondList,
        isLoadComplete
      })
    }, err => {
      that.setData({
        recommondList: []
      })
    })
  },

  /**
   * 获取支付成功发放的优惠券
  */
  getCoupon(id) {
    let that = this;
    sendRequest.send(constants.InterfaceUrl.couponPop, { paymentId: id }, function (res) {
      if (res.data.result) {
        if (res.data.result != null && res.data.result != undefined) {
          that.setData({
            couponShow: true,
            couponAmount: res.data.result.couponAmount
          })
        }
      }
    }, function (res) {
      // console.log(res);
    });
  },

  closeCouponShow() {
    // console.log('去使用');
    my.navigateTo({
      url: '/pages/user/myCoupon/myCoupon',
    });
  },

  /*
  * 关闭优惠券弹窗
  **/
  closePop() {
    this.setData({
      couponShow: false
    })
  },

  /*
  *获取轮播图
  **/
  getMaterial() {
    let that = this;
    sendRequest.send(constants.InterfaceUrl.HOME_BANNER_LIST, { groupName: '支付宝_小程序_订单支付成功页面' }, function (res) {
      let result = res.data.result;
      that.setData({
        succeedSwiperList: result.material ? result.material : []
      })
    }, function (err) { }, 'GET', true)
  },

  /*
  *轮播跳转
  **/
  goToPage: function (e) {
    let that = this;
    let { url, index, type } = e.currentTarget.dataset;
    let chInfo = constants.UrlConstants.chInfo;

    // 猜你喜欢商品友盟+统计 
    if (type == 'goods') {
      let data = {
        channel_source: 'mini_alipay', supplierName: that.data.recommondList[index].nickName, supplierId: that.data.recommondList[index].supplierId, goodsName: that.data.recommondList[index].goodsName, goodsSn: that.data.recommondList[index].goodsSn, goodsCategoryId: that.data.recommondList[index].goodsCategoryId
      }

      that.umaTrackEvent(type, data)

    }

    if (type == 'banner') {
      // let data = 
      that.umaTrackEvent(type, data)
    }


    if (url.substring(0,4).indexOf('http') > -1) {
      my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
    }
    else {
      my.navigateTo({
        url: url
      });
    }
  },

  umaTrackEvent(type, data) {
    if (type == 'goods') {
      my.uma.trackEvent('paySucceed_guessLikeGoods', data)
    }
    else if (type == 'banner') {
      my.uma.trackEvent('paySucceed_banner', data)
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.isLoadComplete) {
      this.setData({
        likeStart: this.data.recommondList.length,
      })
      this.getGuessLike(1)
    }
  },

});