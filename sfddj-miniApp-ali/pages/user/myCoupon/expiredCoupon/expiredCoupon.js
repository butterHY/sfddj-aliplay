
var sendRequest = require('../../../../utils/sendRequest.js')
var constants = require('../../../../utils/constants.js')
import http from '../../../../api/http'
import api from '../../../../api/api'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,           // 图片域名
    loadComplete: false,                                             // 是否加载完成
    loadFail: false,                                                 // 是否加载失败
    recommondList: [],                                               // 失效优惠券列表
    isExpired: true,                                                 // 失效优惠券
    isHasMore: false,                                                // 有没有失效优惠券
    start: 0,                                                        // 猜你喜欢开始数据
    limit: 8,                                                       // 猜你喜欢每页加载的数据
    pagerr: 1,                                                       // 猜你喜欢的页码数
    invalidScrollMore: true,                                         // 滚动加载开关
    invalidLoadMore: true,                                           // 加载开关
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 获取优惠券
    that.getGrayCoupon();

  },

  /**
   * 获取失效优惠券的数据
  */
  getGrayCoupon: function (){
    let that = this;
    http.post(api.COUPON.COUPON_INVALID_LIST, { start: that.data.start, limit: that.data.limit },
      function (res) {
        let dataItem = res.data;
        let expirescouponList = dataItem.data;
        if (dataItem.ret.code == 0) {
          that.setData({
            loadComplete: true,
            loadFail: false,
          })
          if (that.data.pagerr < 2 && expirescouponList.length == 0) {
            that.setData({
              recommondList: [],
              isHasMore: true,
              invalidScrollMore: false,
              invalidLoadMore: false,
            })
            return
          }

          if (that.data.pagerr > 1) {
            if (expirescouponList.length == 0) {
              // 显示没有更多了
              that.setData({
                invalidScrollMore: false,
                invalidLoadMore: false,
                isHasMore: false,
              })
              return
            }
          }
          if (expirescouponList) {
            expirescouponList.forEach(function (item, index) {
              item.beginDateStr = that.formatTime(item.beginDate)
              item.endDateStr = that.formatTime(item.endDate)
            })
          }
          that.setData({
            recommondList: that.data.recommondList.concat(expirescouponList),
          })

          console.log(that.data.recommondList)

          if (expirescouponList.length < that.data.limit) {
            that.setData({
              invalidScrollMore: false,
              invalidLoadMore: false,
              isHasMore: false,
            })
          }
        }
      },
      function (err) {
        that.setData({
          invalidScrollMore: false,
          invalidLoadMore: false,
          recommondList: [],
          isHasMore: true,
          loadFail: true
        })
      }
    )
  },

  /**
   * 触底事件 
   */
  loadMoreSearchResult: function () {
    let that = this;
    // 滚动开关打开时加载
    if (that.data.invalidScrollMore) {
      that.setData({
        start: (that.data.pagerr) * (that.data.limit),
        pagerr: that.data.pagerr + 1,
      })
      //  console.log(that.data.pagerr)
      that.getGrayCoupon();
    }
    //  console.log(567)
  },

  /**
   * format time
   * 将 millionSeconnd转化为yyyy.mm.dd的形式
   */
  formatTime(millSec) {
    var date = new Date(millSec);
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var date = date.getDate()
    var monthStr = month < 10 ? '0' + month : month
    var dateStr = date < 10 ? '0' + date : date
    return year + '.' + monthStr + '.' + dateStr
  },

})