// pages/user/myCoupon/couponInfo/couponInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    platList:[
      {
        title: '1、什么是年丰大当家平台优惠券？',
        content: '年丰大当家平台优惠券是为年丰大当家平台发行和认可的购物券，可在年丰大当家App和年丰大当家公众号中下单时使用，可抵扣相应的金额。',
        image: '',
        open: false
      }, {
        title: '2、年丰大当家平台优惠券的使用条件？',
        content: '（1）优惠券有品类及金额限制，需要在对应品类下且满足限制金额后才可使用；\r\n（2）每个订单只能使用一张平台优惠券；\r\n（3）拼单、特卖活动商品不能使用优惠券。',
        image: '',
        open: false
      }, {
        title: '3、如何获取年丰大当家平台优惠券？',
        content: '年丰大当家会在线上不定期的举办发送优惠券的活动。通过年丰大当家App，或网页都可以领取年丰大当家平台优惠券。',
        image: '',
        open: false
      }, {
        title: '4、年丰大当家平台优惠券可以找零兑换吗？',
        content: '年丰大当家平台优惠券不找零，不兑换。',
        image: '',
        open: false
      }, {
        title: '5、订单取消后会退还优惠券吗？',
        content: '优惠券关联的所有订单处于待发货状态下取消全部订单时，优惠券会自动退还，其他情况优惠券不会自动退还。',
        image: '',
        open: false
      }
    ]
  },

  /**
   * 平台券点击事件
  */
  platListEvent: function (event) {
    let that = this;
    let index = event.currentTarget.dataset.index
    let list = that.data.platList
    for (let key in list) {
      if (key == index) {
        list[key].open = !list[key].open
      } else {
        list[key].open = false
      }
    }
    that.setData({
      platList: list
    })
  },

})