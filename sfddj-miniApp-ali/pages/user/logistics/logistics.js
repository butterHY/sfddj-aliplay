// var _myShim = require('........my.shim');
// pages/user/logistics/logistics.js 
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var utils = require('../../../utils/util.js')


import http from '../../../api/http'
import api from '../../../api/api'




Page({
  /**
   * 页面的初始数据
   */
  data: {
    expressDetail: [],
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl,                      // 生产图片服务器
    baseImageUrl: constants.UrlConstants.baseImageUrl,                          // 测试或生产图片服务器
    // isCheckMore: false,
    move: null,

    // 猜你喜欢数据
    guessLikeGoods: [],
    youLikeStart: 0,
    youLikeLimit: 3,
    youLikeHasMore: true,
    youLikeIsLoadMore: false,
    youLikeLoadComplete: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // var orderId = options.orderId;
    // var goodsImg = options.goodsImg;
    // sendRequest.send(constants.InterfaceUrl.USER_EXPRESS, {
    //   orderId: orderId
    // }, function (res) {
    //   that.setData({
    //     expressDetail: res.data.result.expressDetail,
    //     deliveryNo: res.data.result.deliveryNo,
    //     goodsImg: goodsImg,
    //     baseImageUrl: constants.UrlConstants.baseImageUrl
    //   });
    // }, function (err) {});

    that.getGuessLike();
    http.post(api.LOGISTICS.GETEXPRESS, { 'orderSn': options.orderId}, function(res){
      let resData = res.data.data;
      let resRet = res.data.ret;
      if (resRet.code == '0' && resRet.message == "SUCCESS" && resData && resData.length > 0 ) {
        resData.forEach(value => {
          value.isCheckMore = false;
          value.detail.forEach(val => {
            val.time = new Date(val.time);
            val.dayTime = utils.formatTime(val.time);
            
            val.hoursTime = that.judgementTime(val.time.getHours()) + ':' + that.judgementTime(val.time.getMinutes()) + ":" + that.judgementTime(val.time.getSeconds());
          })
        })

        that.setData({
          logisticsDada: resData
        })
      }
    }, function(err){
    })



  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
  onReachBottom: function () {},


  checkMore(e) {
    let that = this;
    that.data.logisticsDada[e.currentTarget.dataset.num].isCheckMore = !that.data.logisticsDada[e.currentTarget.dataset.num].isCheckMore;
    that.setData({
      // isCheckMore: !that.data.isCheckMore,
      logisticsDada: that.data.logisticsDada
    })
    // if (!that.data.logisticsDada[e.currentTarget.dataset.num].isCheckMore) {
    //   let height = 0;
    //   let clas = '.js_expressDetail' + e.currentTarget.dataset.num;
    //   my.createSelectorQuery().selectAll(clas).boundingClientRect().exec(function (res) {
    //     res[0].forEach(value => {
    //       height += value.height;
    //     })
    //     let animation = my.createAnimation({
    //       duration: 1000,
    //       timeFunction: 'linear',
    //       transformOrigin: '0 50% 100%'
    //     })
    //     animation.height(height + 52 + 55.5).step();
    //     that.data.logisticsDada[e.currentTarget.dataset.num].move = animation.export();
    //     that.data.logisticsDada[e.currentTarget.dataset.num].isCheckMore = !that.data.logisticsDada[e.currentTarget.dataset.num].isCheckMore;
    //     that.setData({
    //       // isCheckMore: !that.data.isCheckMore,
    //       logisticsDada: that.data.logisticsDada
    //     })
    //   })
    // } else {
    //   let clas = '.js_logisticsOrder' + e.currentTarget.dataset.num;
    //   that.data.move = 'move' + e.currentTarget.dataset.num;
    //   let animation = my.createAnimation({
    //     duration: 1000,
    //     timeFunction: 'linear',
    //     transformOrigin: '100% 50% 0'
    //   })
    //   animation.height(148).step();
    //   that.data.logisticsDada[e.currentTarget.dataset.num].move = animation.export();
    //   that.data.logisticsDada[e.currentTarget.dataset.num].isCheckMore = !that.data.logisticsDada[e.currentTarget.dataset.num].isCheckMore;
    //   that.setData({
    //       // isCheckMore: !that.data.isCheckMore,
    //       logisticsDada: that.data.logisticsDada
    //   })
    // }

  },


  // 获取达观推荐的商品---猜你喜欢
  getGuessLike(type) {
    let that = this;
    let data = {
      groupName: '支付宝小程序猜你喜欢',
      start: that.data.youLikeStart,
      limit: that.data.youLikeLimit
    }
    that.setData({ youLikeIsLoadMore: true });

    http.get(api.LOGISTICS.lISTGOODSBYNAME, data, (res) => {
      if (res.data.ret.code == '0' && res.data.ret.message == "SUCCESS") {
        let resData = res.data.data;
        // 如果返回的数据长度等于请求条数说明还有更多数据
        resData && resData.length == that.data.youLikeLimit ? that.data.youLikeHasMore = true : that.data.youLikeHasMore = false;  

        // 0: 初始化; 1: 每次加载拼接进去的数据;
        type == '0' ? that.data.guessLikeGoods = resData : that.data.guessLikeGoods = that.data.guessLikeGoods.concat(resData);  

        that.setData({
          guessLikeGoods: that.data.guessLikeGoods,
          youLikeHasMore: that.data.youLikeHasMore,           // 是否还有更多                  
        });
      }
      that.setData({ youLikeIsLoadMore: false })								// 正在加载中的加载进度条
    }, (err) => { that.setData({ youLikeIsLoadMore: false }) })
  },


  // 拖拽优惠券弹窗
  lowLoadMore: function () {
    let that = this;
    if ( that.data.youLikeHasMore ) {
      that.setData({
        youLikeStart: that.data.guessLikeGoods.length
      });
      that.data.youLikeHasMore = false;
      that.getGuessLike('1');
    }
  },

  judgementTime(data) {
    let timer = data < 10 ? '0' + data : data;
    return timer;
  }

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
});