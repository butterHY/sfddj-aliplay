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
    that.getGuessLike();
    http.post(api.LOGISTICS.GETEXPRESS, { 'orderSn': options.orderId}, function(res){
      let resData = res.data.data;
      let resRet = res.data.ret;
      if (resRet.code == '0' && resRet.message == "SUCCESS" && resData && resData.length > 0 ) {
        resData.forEach(value => {
          value.isCheckMore = false;
          // console.log(value.expectedDeliveryTime)
          // value.expectedDeliveryTime = utils.pointFormatTime(new Date(value.expectedDeliveryTime));

          value.expectedDeliveryTime = value.expectedDeliveryTime ? utils.pointFormatTime(new Date(value.expectedDeliveryTime)) : value.expectedDeliveryTime;

          switch(value.status) {
            case 'COLLECT': value.status = '待揽件'
                break;
            case 'TRANSIT': value.status = '运输中'
                break;
            case 'DELIVERY': value.status = '派送中'
                break;
            case 'SIGNED': value.status = '已签收'
                break;
            default: value.status = '待揽件'
          }

          value.detail.forEach(val => {
            val.time = new Date(val.time);
            val.dayTime = utils.formatTime(val.time);
            // + that.judgementTime(val.time.getSeconds()
            val.hoursTime =  ('' + that.judgementTime(val.time.getHours()) + ':' + that.judgementTime(val.time.getMinutes()) );
          })
          value.detail.unshift( {content: value.shipAddress } )
        })

        let mobilePhone = /1[3456789]\d{9}/g;
        // let fixedTelephone = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
        resData.forEach(value => {
          value.detail.forEach(val => {
             let checkMobilePhone = val.content.match(mobilePhone);
            if( checkMobilePhone ) {
              val.mobilePhone = checkMobilePhone[0];
              val.content = val.content.split(mobilePhone);
            }
          })
        })


        let firstTwoLogisticsDada = JSON.parse(JSON.stringify(resData));
        firstTwoLogisticsDada.forEach(value => {
          value.detail = value.detail.length > 2 ?  value.detail.slice(0,2) : value.detail;
        })



        that.setData({
          firstTwoLogisticsDada: firstTwoLogisticsDada,
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
    // that.data.logisticsDada[e.currentTarget.dataset.num].isCheckMore = !that.data.logisticsDada[e.currentTarget.dataset.num].isCheckMore;
    that.data.firstTwoLogisticsDada[e.currentTarget.dataset.num].isCheckMore = !that.data.firstTwoLogisticsDada[e.currentTarget.dataset.num].isCheckMore;
    
    if( that.data.firstTwoLogisticsDada[e.currentTarget.dataset.num].isCheckMore ) {
      that.data.firstTwoLogisticsDada[e.currentTarget.dataset.num].detail = that.data.logisticsDada[e.currentTarget.dataset.num].detail;
    } else if (  that.data.logisticsDada[e.currentTarget.dataset.num].detail.length > 2 ) {
      that.data.firstTwoLogisticsDada[e.currentTarget.dataset.num].detail = that.data.logisticsDada[e.currentTarget.dataset.num].detail.slice(0,2);
    }

    that.setData({
      // logisticsDada: that.data.logisticsDada
      firstTwoLogisticsDada: that.data.firstTwoLogisticsDada
    })
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

    http.get(api.GOODSDETAIL.lISTGOODSBYNAME, data, (res) => {
      if (res.data.ret.code == '0' && res.data.ret.message == "SUCCESS") {
        let resData = res.data.data;
        // 如果返回的数据长度等于请求条数说明还有更多数据
        resData && resData.length == that.data.youLikeLimit ? that.data.youLikeHasMore = true : that.data.youLikeHasMore = false;  

        // 0: 初始化; 1: 每次加载拼接进去的数据;
        type == '0' ? that.data.guessLikeGoods = resData : that.data.guessLikeGoods = that.data.guessLikeGoods.concat(resData);  

        // that.data.guessLikeGoods[0].hasLabel = true;
        // that.data.guessLikeGoods[2].hasLabel = true;

        that.setData({
          guessLikeGoods: that.data.guessLikeGoods,
          youLikeHasMore: that.data.youLikeHasMore,           // 是否还有更多                  
        });
      }
      that.setData({ youLikeIsLoadMore: false })								// 正在加载中的加载进度条
    }, (err) => { that.setData({ youLikeIsLoadMore: false }) })
  },


  // 物流时间
  judgementTime(data) {
    let timer = data < 10 ? '0' + data : data;
    return timer;
  },

  // 页面上拉加载
  onReachBottom() {
    // console.log('上拉加载');
    let that = this;
    if ( that.data.youLikeHasMore ) {
      that.setData({
        youLikeStart: that.data.guessLikeGoods.length
      });
      that.data.youLikeHasMore = false;
      that.getGuessLike('1');
    }
  },

  // 复制运单号
  handleCopy(e) {
    my.setClipboard({
      text: e.currentTarget.dataset.expressNo,
      success: function (res) {
        my.getClipboard({
          success: function (res) {
            my.showToast({
              content: '复制运单号成功',
            })
          }
        })
      }
    })
  },

  /**
	 * 添加购物车
	 */
	addCart: function(e) {
		let that = this;
		let productId = e.currentTarget.dataset.pid;
		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: productId, quantity: '1' }, function(res) {
			my.showToast({
				content: '添加购物车成功'
			});
		}, function(res) {
			my.showToast({
				content: res
			})
		});
	},

  callPhone(e) {
     if( e.currentTarget.dataset.phone ) {
      my.makePhoneCall({ number: e.currentTarget.dataset.phone });
     }
  }

});