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
    baseImageUrl: baseImageUrl,                                 // 图片资源路径
	  smallImgArg: '?x-oss-process=style/goods_img_2',            // 图片限制大小
    couponShow: false,                                          // 优惠券弹窗
    couponAmount: null,                                         // 优惠券弹窗的金额
    succeedSwiperList: [],                                      // 轮播图数据
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
    if(orderSn){
      that.getLikeList(orderSn)
    }

    // 获取付款成功发放的优惠券
    if(paymentId){
      that.getCoupon(paymentId)
    }

  },

  /*
  * 获取猜你喜欢数据
  **/
  getLikeList(sn){
    let that = this;
    sendRequest.send(constants.InterfaceUrl.GET_GOODS_AFTER_TRADE_SUC, { orderSn: sn }, function (res) {
      that.setData({
        recommondList: res.data.result,
        baseImageUrl: baseImageUrl
      });
    }, function (res) {});
  },

  /**
   * 获取支付成功发放的优惠券
  */
  getCoupon(id){
    let that = this;
    sendRequest.send(constants.InterfaceUrl.couponPop, { paymentId: id }, function (res) {
      if(res.data.result) {
        if(res.data.result != null && res.data.result!= undefined){
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
  closePop(){
    this.setData({
      couponShow: false
    })
  },

  /*
  *获取轮播图
  **/
  getMaterial() {
		let that = this;
		sendRequest.send(constants.InterfaceUrl.HOME_BANNER_LIST, { groupName: '支付宝_小程序_订单支付成功页面' }, function(res) {
			let result = res.data.result;
			that.setData({
				succeedSwiperList: result.material ? result.material : []
			})
		}, function(err) {}, 'GET', true)
	},

  /*
  *轮播跳转
  **/
 goToPage: function(e) {
		let that = this;
		let url = e.currentTarget.dataset.url;
		let chInfo = constants.UrlConstants.chInfo;

		if (url.indexOf('http') > -1) {
			my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
		}
		else {
      my.navigateTo({
				url: url
			});
		}
	},
});