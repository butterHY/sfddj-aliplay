// var _myShim = require('........my.shim');
/**
* 二级分类页面
* @author 01368384
*  
*/
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var dateformat = require('../../../utils/dateformat');
var util = require('../../../utils/util');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀

Page({

  data: {
    childrenCategoryTags: [],
    categoryId: null,
    activitysDetailId: null,
    isFatherCategory: false,
    start: 0,
    limit: 10,
    goodsList: [],
    hasMore: true,
    isLoadMore: false,
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    showToast: false,
    loadComplete: false,
    loadFail: false,
    activityStatus: '',
    tapedItem: null,
    requestKey: false
  },

  onLoad: async function (options) {
    //  onLoad 是初始化页面， 那 options 是在跳转到这个页面，在跳转的 url 地址中携带的数据；
    var that = this;
    var fatherCategory = {};
    // 设置页面头部的 title 
    my.setStorageSync({
      key: constants.StorageConstants.fatherCategoryId, // 缓存数据的key
        data: {
          // id: 76,
          name: '限时秒杀'
        }
    })
        if (options) {
            this.setData({
              categoryId: Number(options.goodsSn),
              activitysDetailId: options.activitysDetailId ? options.activitysDetailId : 0
            })
        }
        var isSuccess = await that.getActivityVenue();
        if (isSuccess.type) {
            for (var i = 0; i < this.data.childrenCategoryTags.length; i++) {
                  if (this.data.childrenCategoryTags[i].taped == true) {
                      this.setData({
                        tapedItem: i
                      })
                  }
            }
        that.getGoodsData(0);            
        }


  },



  /**
   * 获取头部活动场次
   * 
   */
  async getActivityVenue () {
      var that = this;

      return new Promise((reslove, reject) => {
          my.request({
              url: constants.UrlConstants.baseUrlOnly + constants.InterfaceUrl.POST_SPIKE_ACTIVITY_VENUE,
              method: 'POST',
              data: {
                  activitysId: that.data.categoryId,
                  channel: 'ALIPAY_MINIAPP'
              },
              headers: {
                'content-type': 'application/x-www-form-urlencoded',
                "client-channel": "alipay-miniprogram"
              },
              success: function(res) {

                var result = res.data.data;

                var activity_venue = [];
                var nowTime = new Date();

                for(var i = 0; i < result.detailVOS.length; i++ ){
                    var starTime = result.detailVOS[i].startDate;
                    var endTime = result.detailVOS[i].endDate;

                    starTime = starTime.toString().length < 13 ? new Date(starTime*1000) : new Date(starTime);
                    endTime = endTime.toString().length < 13 ? new Date(endTime*1000) : new Date(endTime);


                    var starMinutes = starTime.getMinutes() <= 0 ? '00' : ( starTime.getMinutes() < 10 ? '0' + starTime.getMinutes() : starTime.getMinutes() );
                    var endMinutes = endTime.getMinutes() <= 0 ? '00' : ( endTime.getMinutes() < 10 ? '0' + endTime.getMinutes() : endTime.getMinutes() );
                    var starHours = starTime.getHours() <= 0 ? '00' : ( starTime.getHours() < 10 ? '0' + starTime.getHours() : starTime.getHours() );
                    var endHours = endTime.getHours() <= 0 ? '00' : ( endTime.getHours() < 10 ? '0' + endTime.getHours() : endTime.getHours() );

                    var isOver = dateformat.DateFormat.compareDate(endTime, nowTime);             // 结束时间和当前时间对比，判断活动是否已经结束
                    var timeDifference = (nowTime.getTime() - starTime.getTime()) / (1000 * 60);  // 开始时间和当前时间对比，如果未结束判断距离开始还需多久

                    var message = '';        

                    if(isOver <= 0) {
                            message = '已结束'
                    } else if (timeDifference >= 0) {
                            message = '抢购中'
                    } else if (timeDifference < 0) {
                            message = '即将开抢'
                    }

                    activity_venue.push(
                      {
                        detailId: result.detailVOS[i].detailId,
                        status: result.detailVOS[i].status,
                        starTime: starHours +":"+ starMinutes,
                        endTime: endHours +":"+ endMinutes,
                        message: message
                      }
                    )
                }

                for (var i = 0; i < activity_venue.length; i++) {
                      if (activity_venue[i].message == '抢购中' && activity_venue[i+1] && activity_venue[i+1].message == '抢购中') {
                            activity_venue[i].message = '已开抢'
                      }
                      // 携带过来的子类 id 与 全部子类 id 匹配，如果相等，则给这个子类对象添加一个新的属性：value.taped = true;
                      if  ( (activity_venue[i].detailId && Number(activity_venue[i].detailId) == Number(that.data.activitysDetailId)) || (activity_venue[i].status && (activity_venue[i].status == 1)) ) {
                            activity_venue[i].taped = true;
                            that.setData({
                                activityStatus: activity_venue[i].message,
                                activitysDetailId: activity_venue[i].detailId
                            })

                      }
                }

                  that.setData({
                      childrenCategoryTags : activity_venue
                  })

                  reslove({
                    type: true
                  })
              },
              fail: function(res) {
                  reject({
                    type: false
                  })
              }
          });
      }) 

  },


  /**
   * 根据子类 categoryId 查询商品列表
   * type 0:刷新 1:加载更多
   */
  getGoodsData: function (type) {
    var that = this;
    this.setData({
      isLoadMore: true,
      requestKey: false         // 添加一个钥匙，一开始请求即关掉
    });

          my.request({
          url: constants.UrlConstants.baseUrlOnly + constants.InterfaceUrl.POST_SPIKE_GOODSLIST,
          method: 'POST',
          
          data: {
              activitysDetailId: this.data.activitysDetailId,
              start: this.data.start,
              limit: this.data.limit
          },
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            "client-channel": "alipay-miniprogram"
          },
          success: function(res) {

            var isLoadMore = false;                     //  isLoadMore 
            var requestKey  = true;                      //  请求钥匙，如果执行成功再打开
            var result = res.data.data;
            var hasMore = false;                       //   hasMore
            var goodsList = that.data.goodsList;
            if (result && result.length == that.data.limit) {
              hasMore = true;                         //   是否还有,如果请求回来的数据长度正常则证明还有更多的数据
            }
            if (type == 0) {
              goodsList = result;
            } else {
              goodsList = goodsList.concat(result);
            }
            for (var i = 0; i < goodsList.length; i++) {
                goodsList[i].activityStatus = that.data.activityStatus;
            }
            that.setData({
                goodsList: goodsList,
                baseImageUrl: baseImageUrl,
                hasMore: hasMore,
                isLoadMore: isLoadMore,
                loadComplete: true,
                loadFail: false,
                requestKey: requestKey
            });

          },
          fail: function(res) {
          }
      });

  },

  /**
   * 点击tag更新商品列表显示
   * @param e 点击参数
   */
  tagViewTap: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    that.data.childrenCategoryTags.forEach(function (value, index, array) {
     
      if (index == id) {
        // 赋予选中项样式
        value.taped = true;
        // 重置全局请求数据的 id  为选中项的  id, 重置全局按钮功能为当前活动对应的功能选项
        that.data.activitysDetailId = value.detailId ? value.detailId : that.data.activitysDetailId;
        
        that.setData({
          activitysDetailId: that.data.activitysDetailId,
          activityStatus: value.message
        })
        // 原来的滚动栏里点击首项选项时获取全部的商品数据
        that.data.isFatherCategory = id == 0;
      } else {
        value.taped = false;
      }
    });
    that.setData({
      childrenCategoryTags: that.data.childrenCategoryTags,
      start: 0,
      limit: 10
      // goodsList: []
    });
    // that.data.start = 0;

    // 重新请求数据
    that.getGoodsData(0);

    //滚动到屏幕顶部
    // my.pageScrollTo({
    //   scrollTop: 0
    // });
    that.setData({
      scrollTop: 0
    })
  },

  /**
  * 页面上拉触底事件的处理函数
  */
  lowLoadMore: function () {
    // if (this.data.hasMore) {
    //   this.data.start = this.data.goodsList.length
    //   this.getGoodsData(1)
    // } else {
    //   wx.showToast({
    //     title: '没有更多了',
    //   })
    // }

    if (this.data.hasMore && this.data.requestKey) {
      this.setData({
        start: this.data.goodsList.length
      });
      this.getGoodsData(1);
    }
  },

  /**
   * 监听屏幕滚动事件，调整tagView显示
   * @param e 滑动参数
   */
  scrollingFn: function (e) {
    var height = util.px2Rpx(e.detail.scrollTop);
    this.setData({
      sticky: height >= 120
    });
  },


});
