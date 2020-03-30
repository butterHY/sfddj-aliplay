// let _myShim = require('........my.shim');
/**
* 秒杀页面
* @author 01368384
*  
*/
// let sendRequest = require('../../../utils/sendRequest');
import http from '../../../api/http'
let constants = require('../../../utils/constants');
let dateformat = require('../../../utils/dateformat');
let util = require('../../../utils/util');
let baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀

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
    let that = this;
    let fatherCategory = {};
    // 设置页面头部的 title
    console.log(options);
    // 原有用于缓存父分类 id，暂时注释掉;
    // my.setStorageSync({
    //   key: constants.StorageConstants.fatherCategoryId, // 缓存数据的key
    //     data: {
    //       // id: 76,
    //       name: '限时秒杀'
    //     }
    // })
      if (options) {
        this.setData({
          categoryId: Number(options.goodsSn),
          activitysDetailId: options.activitysDetailId ? options.activitysDetailId : 0
        })
      }
      let isSuccess = await that.getActivityVenue();
      if (isSuccess.type) {
        this.setData({
          tapedItem: this.data.childrenCategoryTags.findIndex(value => {return value.taped == true})
        })
        that.getGoodsData(0);            
      }
  },

  /**
   * 获取头部活动场次
   */
  async getActivityVenue () {
      let that = this;
      return new Promise((reslove, reject) => {
        http.post(constants.InterfaceUrl.POST_SPIKE_ACTIVITY_VENUE, {activitysId: that.data.categoryId, channel: 'ALIPAY_MINIAPP'} ,(res) => {
          console.log(res);
          let result = res.data.data;
          let resRet = res.data.ret;

          if( resRet.code == "0" && resRet.message == "SUCCESS" && result ) {
            let activity_venue = [];
            let nowTime = new Date();
            result.detailVOS.forEach((value, index) => {
              let starTime = value.startDate;
              let endTime = value.endDate;
              starTime = starTime.toString().length < 13 ? new Date(starTime*1000) : new Date(starTime);
              endTime = endTime.toString().length < 13 ? new Date(endTime*1000) : new Date(endTime);
              let starMinutes = starTime.getMinutes() <= 0 ? '00' : ( starTime.getMinutes() < 10 ? '0' + starTime.getMinutes() : starTime.getMinutes() );
              let endMinutes = endTime.getMinutes() <= 0 ? '00' : ( endTime.getMinutes() < 10 ? '0' + endTime.getMinutes() : endTime.getMinutes() );
              let starHours = starTime.getHours() <= 0 ? '00' : ( starTime.getHours() < 10 ? '0' + starTime.getHours() : starTime.getHours() );
              let endHours = endTime.getHours() <= 0 ? '00' : ( endTime.getHours() < 10 ? '0' + endTime.getHours() : endTime.getHours() );

              let isOver = dateformat.DateFormat.compareDate(endTime, nowTime);             // 结束时间和当前时间对比，判断活动是否已经结束
              let timeDifference = (nowTime.getTime() - starTime.getTime()) / (1000 * 60);  // 开始时间和当前时间对比，如果未结束判断距离开始还需多久

              let message = '';        
              if(isOver <= 0) {
                message = '已结束'
              } else if (timeDifference >= 0) {
                message = '抢购中'
              } else if (timeDifference < 0) {
                message = '即将开抢'
              }
              console.log(message)
              activity_venue.push(
                {
                  detailId: value.detailId,
                  status: value.status,
                  starTime: starHours +":"+ starMinutes,
                  endTime: endHours +":"+ endMinutes,
                  message: message
                }
              )
            })


            for (let i = 0; i < activity_venue.length; i++) {
              if ( activity_venue[i].message == '抢购中' && activity_venue[i+1] && activity_venue[i+1].message == '抢购中' ) {
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
          }
        }, (res) => {
          reject({
            type: false
          })
        })
      }) 
  },


  /**
   * 根据子类 categoryId 查询商品列表
   * type 0:刷新 1:加载更多
   */
  getGoodsData: function (type) {
    let that = this;
    this.setData({
      isLoadMore: true,
      requestKey: false         // 添加一个钥匙，一开始请求即关掉 如果执行成功再打开
    });
    let data = {
        activitysDetailId: that.data.activitysDetailId,
        start: that.data.start,
        limit: that.data.limit
    };

    http.post(constants.InterfaceUrl.POST_SPIKE_GOODSLIST, data, (res) => {
      let resDate = res.data.data;
      let resRet = res.data.ret;
      
      if( resRet.code == "0" && resRet.message == "SUCCESS" && resDate ) {
        let goodsList = that.data.goodsList;
        let hasMore = resDate && resDate.length == that.data.limit ? true : false;
        goodsList = type == 0 ? resDate : that.data.goodsList.concat(resDate);
        console.log(that.data.activityStatus)
        console.log(goodsList)
        goodsList.forEach(value => {value.activityStatus = that.data.activityStatus;})
        that.setData({
            goodsList,
            hasMore,
            isLoadMore: false,
            loadComplete: true,
            loadFail: false,
            requestKey: true
        });
      }
    }, (res) => {
        that.setData({
            isLoadMore: false,
            loadComplete: true,
            loadFail: true
        });
    })
  },

  /**
   * 点击tag更新商品列表显示
   * @param e 点击参数
   */
  tagViewTap: function (e) {
    let that = this;
    let id = e.currentTarget.id;
    that.data.childrenCategoryTags.forEach(function (value, index) {
      if (index == id) {
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
    let height = util.px2Rpx(e.detail.scrollTop);
    this.setData({
      sticky: height >= 120
    });
  },


});
