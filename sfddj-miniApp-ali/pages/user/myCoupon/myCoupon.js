// let _myShim = require('........my.shim');
// pages/user/myCoupon/myCoupon.js
let sendRequest = require('../../../utils/sendRequest');
let constants = require('../../../utils/constants');
let stringUtils = require('../../../utils/stringUtils');
let utils = require('../../../utils/util');
import http from '../../../api/http';
import api from '../../../api/api';
import _ from 'underscore';
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    iconSize: my.getSystemInfoSync().windowWidth * 68 / 750,           // icon勾选的大小
		smallImgArg: '?x-oss-process=style/goods_img_3',                   // 设置图片大小
    couponFail: false,                                                 // 优惠券获取失败
    guessLikeFail: false,                                              // 猜你喜欢数据获取失败
    couponSwiper: [],                                                  // 轮播图数据

    couponList: [],                                                    // 优惠券列表
    isHasCoupon: true,                                                 // 是否有优惠券
    loadingMore: true,                                                 // 优惠券加载中
    loadingAddMore: false,                                             // 优惠券点击加载更多
    loadingNoMore: false,                                              // 优惠券没有更多了
    couponStart: 0,                                                    // 优惠券开始数据
    couponlimit: 3,                                                    // 优惠券第一页加载的数据
    couponMoreLimit: 20,                                               // 优惠券除第一页外每页加载的数据
    couponPagerr: 1,                                                   // 优惠券页码数
    couponLoadTap: true,                                               // 优惠券加载更多按钮防止双击
    recommondList: [],                                                 // 猜你喜欢存储数据
    bGuessLike: false,                                                 // 猜你喜欢数据是否存在
    start: 0,                                                          // 猜你喜欢开始数据
    limit: 20,                                                         // 猜你喜欢每页加载的数据
    pagerr: 1,                                                         // 猜你喜欢的页码数
    guessLikeLoadMore: true,                                           // 加载中
    guessLikeScrollMore: true,                                         // 猜你喜欢滚动加载开关
    exchangeTap: true,                                                 // 兑换按钮防止双击
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    // this.setData({
    //   newResult: options
    // })
    // this.getCouponList();
    //广告位轮播
    this.getMaterial()  

    that.getMemberWebCall();
    // 获取优惠券
     that.getCouponList(that.data.couponStart,that.data.couponlimit);
     that.getGuessLikeData(that.data.start, 1)   // 获取猜你喜欢的数据
  },

  onShow: function() {
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
  getCouponList (start,limit) {
     let that = this
     http.post(api.COUPON.COUPON_VALID_LIST,{
      'start':start,
      'limit':limit
     },function(res){
       let dataItem = res.data;
       let couponListData = dataItem.data;
       let hadList = that.data.couponList;
       if (dataItem.ret.code == '0'){
          // 显示出来加载更多按钮
          that.setData({
            loadingMore: false,
            loadingAddMore: true,
            couponLoadTap: true,
            loadComplete: true
          })

         if (that.data.couponPagerr < 2 && couponListData.length <= 0){
            that.setData({
              isHasCoupon: false,
            })
            return
          }
          if(that.data.couponPagerr > 1){
            if (couponListData.length <= 0){
                that.setData({
                  loadingMore: false,
                  loadingAddMore: false,
                  loadingNoMore: true
                })
                return
              }
          }

         if (couponListData) {
           couponListData.forEach(function (item, index) {
             item.beginDateStr = that.formatTime(item.beginDate)
             item.endDateStr = that.formatTime(item.endDate)
           })
         }

         that.setData({
           couponList: hadList.concat(couponListData)
         })

         if (couponListData.length < limit){
            that.setData({
              loadingMore: false,
              loadingAddMore: false,
              loadingNoMore: true
            })
          }

       }else{
         // 就显示没有优惠券页面
         that.setData({
           isHasCoupon: false
         })
       }

     },function(err){
        // 就显示没有优惠券页面
        that.setData({
          isHasCoupon: false,
          couponLoadTap: true,
          couponFail: true,
        })
     })
   },

    /**
    * 点击加载更多优惠券
   */
   couponLoadMore(){
      let that = this;
      if (that.data.couponLoadTap){
        that.setData({
          couponLoadTap : false,                                                                                  // 防止双击
          loadingMore: true,
          loadingAddMore: false,
          loadingNoMore: false,
          couponStart: that.data.couponlimit + that.data.couponMoreLimit*(that.data.couponPagerr - 1),
          couponPagerr: that.data.couponPagerr + 1
        })

        that.getCouponList(that.data.couponStart, that.data.couponMoreLimit)
      }
   },

  /*
  *获取轮播图
  **/
  getMaterial() {
		let that = this;
		sendRequest.send(constants.InterfaceUrl.HOME_BANNER_LIST, { groupName: '支付宝_小程序_优惠券页面' }, function(res) {
			let result = res.data.result;
			that.setData({
				couponSwiper: result.material ? result.material : []
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
     let ruleSign = this.data.ruleSign
     let that = this

     if (!that.data.exchangeTap) {    // 防止兑换按钮双击
       return
     }

     this.setData({
       showDialog: false,
       ruleSign: '',
       showClear: false,
       exchangeTap: false,
     })
    //  console.log('aa', stringUtils.isNotEmpty(ruleSign.trim()), ruleSign.trim())
    //  if (stringUtils.isNotEmpty(ruleSign.trim())) {
     if (ruleSign.trim().length >= that.data.maxLength && that.data.isRightSign) {
       sendRequest.send(
         constants.InterfaceUrl.EXCHANGE_COUPON, {
           ruleSign: ruleSign
         },
         function(res) {

           let result = res.data.result;
           if (result[0].errMsg) {
             that.showToast(result[0].errMsg)
           } else {
             if(result && Object.keys(result).length > 0){
               that.showToast('兑换成功')
             }


             that.setData({
               couponLoadTap: true,                                                // 加载更多按钮防止双击
               loadingMore: true,
               loadingAddMore: false,
               loadingNoMore: false,
               couponStart: 0,
               couponPagerr: 1,
               couponList: [],
               exchangeTap: true,                                                  // 兑换按钮防止多次点击
             })
             if(!that.data.isHasCoupon){
                that.setData({
                  isHasCoupon: true
                })
             }
             that.getCouponList(that.data.couponStart,that.data.couponlimit);
           }
           
           that.setData({
             exchangeTap: true,               // 兑换按钮防止多次点击
           })
         },
         function(err) {
           let msg = err
           that.showToast(msg)
           that.setData({
             exchangeTap: true,               // 兑换按钮防止多次点击
           })
         }
       )
     } else {
       let msg = '';
       if (ruleSign == ''){
         msg = '请输入优惠券编码'
       } else{
         msg = '请输入正确的优惠券编码'
       }
      //  let msg = '该劵码不存在，请稍后重试'
       that.showToast(msg)
       that.setData({
         exchangeTap: true,               // 兑换按钮防止多次点击
       })
     }
   },

  /**
   *  显示toast
   */
  showToast: function(msg) {
    let that = this;
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
  * 获取个人资料接口获取联系客服
  * */
   getMemberWebCall: function () {
     let that = this
     sendRequest.send(constants.InterfaceUrl.POST_MEMBER_INFOLIST, {}, function (res) {
       let myInfoData = res.data.result ? res.data.result : {}
       that.setData({
         webCallParam: res.data.result.webCallParam ? res.data.result.webCallParam : '',
         myInfoData: myInfoData
       })
     }, function (err) {

     }, 'POST')
   },

   // 跳去客服网页版
   goToWebCall: function () {
     let that = this
     let webCallLink = that.data.webCallParam

     try {
       my.setStorageSync('webCallLink', webCallLink)
       my.navigateTo({
         url: '/pages/user/webCallView/webCallView?link=' + webCallLink + '&newMethod=new',
       })
     } catch (e) {

     }

   },

   /**
    * 切换优惠券列表
    */
   changeCouponList() {
     my.navigateTo({
       url: '/pages/user/myCoupon/expiredCoupon/expiredCoupon',
     })
   },

  /**
   * 去使用按钮
   * */
  toUseCoupon(e) {
     let linkType = e.currentTarget.dataset.linkType;
     let couponId = e.currentTarget.dataset.couponid;
     let useLink = e.currentTarget.dataset.uselink;
     // linkType 0跳转uselink, 1跳转商城首页， 2跳转优惠券可使用商品列表
     if (linkType == 0){
       my.navigateTo({
         url: useLink
       });
     } else if (linkType == 1){
       my.switchTab({
         url: '/pages/home/home',
       })
     } else if (linkType == 2){
       my.navigateTo({
         url: '/pages/home/grouping/grouping?pageFrom=coupon&couponId=' + couponId
       });
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
    let current = e.detail.current;
    let that = this;
    // that.setData({
    //   currentIndex: current
    // })
    that.setCurrentIndexFn(current);
  },
  // 手动调currentIndex
  setCurrentIndexFn: function(index) {
    let that = this;
    that.setData({
      currentIndex: index
    });
  },

  /**
   * 轮播图跳转
   * */
  goToLink: function(e) {
    let isLink = e.currentTarget.dataset.islink;
    let url = e.currentTarget.dataset.url;
    let goodsSn = e.currentTarget.dataset.goodssn;

    if (isLink) {
      if (url) {
        if (url.indexOf('shop/goods/view') != -1) {
          let index = url.lastIndexOf("\/");
          goodsSn = url.substring(index + 1, index + 15);
          my.navigateTo({
            url: '/pages/shopping/goodsDetail/goodsDetail?goodsSn=' + goodsSn
          });
        } else if (url.indexOf('GroupBuying/goods') != -1) {
          let index = url.lastIndexOf("\/");
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
  },

  /**
   * 添加到购物车
   */
   addCart: function (e) {
     let that = this
     let productId = e.currentTarget.dataset.pid;
     console.log('加入购物车');
     my.showLoading({
       content: '加载中',
     })
     sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: productId, quantity: '1' }, function (res) {
      //  my.hideLoading()
       my.showToast({
         content: '添加购物车成功',
       })
       // my.showLoading({
       //   title: '加载中',
       // })
      //  that.getCartData();//更新购物车
      that.setData({
         loadComplete: true
       })

     }, function (res) {
      //  my.hideLoading()
       // my.showToast({
       //   title: res,
       // })
       that.setData({
         // showDialog3: false,
         showToast: true,
         showToastMes: res,
         loadComplete: true
       })
       setTimeout(function () {
         that.setData({
           showToast: false
         })
       }, 2000)
     })
   },

  /**
    * 使用说明
   */
  useTip: function(){
    let that = this;
    my.navigateTo({
      url: '/pages/user/myCoupon/couponInfo/couponInfo'
    })
  },

    /**
    * 获取猜你喜欢的数据
    */
   getGuessLikeData (start, type){
     let that= this;
     let loadNum = 0;
     let getData = [];
     if (loadNum < 5){
       http.get(api.GUESSLIKE, { start: that.data.start, limit: that.data.limit, is_first: type }, function (res) {
         let dataItem = res.data;
         let dataList = dataItem.data;
         let guessLikeData = that.data.recommondList;
         if(dataItem.ret.code == 0){
            that.setData({
                loadComplete: true
            })
            if(that.data.pagerr < 2 && dataList.length == 0){
              that.setData({
                recommondList: [],
              })
              return
            }

           if (that.data.pagerr > 1){
             if (dataList.length == 0){
                // 显示没有更多了
                that.setData({
                  guessLikeScrollMore: false,
                  guessLikeLoadMore: false,
                })
                return
              }
            }

           that.setData({
             recommondList: guessLikeData.concat(dataList),
           })
           // bGuessLike
           if(that.data.recommondList.length > 0){
              that.setData({
                bGuessLike: true
              })
           }

           if (dataList.length < that.data.limit){
             that.setData({
               guessLikeScrollMore: false,
               guessLikeLoadMore: false,
             })
           }

         }
        //  console.log(that.data.recommondList)
       }, function (err) {
         that.setData({
           recommondList: []
         })
       })
     }else{
       that.setData({
         guessLikeScrollMore: false,
         guessLikeLoadMore: false,
         guessLikeFail: true
       })
     }
     
   },

	/**
	* 页面上拉触底事件的处理函数
	*/
	lowLoadMore: function() {
    let that = this;
    if (that.data.guessLikeScrollMore){
       that.setData({
         start: (that.data.pagerr)*(that.data.limit),
         pagerr: that.data.pagerr+1,
       })
       that.getGuessLikeData(that.start);
     }
	},

});

