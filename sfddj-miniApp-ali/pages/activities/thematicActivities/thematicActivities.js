var constants = require('../../../utils/constants');
var stringUtils = require('../../../utils/stringUtils');
var util = require('../../../utils/util');
var sendRequest = require('../../../utils/sendRequest');

import http from '../../../api/http'
import api from '../../../api/api'


Page({
  data: {
    advertsArr: [],
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: constants.UrlConstants.baseImageUrl,
    current: 1,
    ossImgStyle: '?x-oss-process=style/goods_img_2',
    loadComplete: false,   //是否加载完成
    loadFail: false,       //是否加载失败
    time_CutTime: null,     //倒计时
    countSecond: '00',         //倒计时的秒
    countMinute: '00',         //倒计时的分钟
    countHour: '00',         //倒计时的小时
    banRightMargin: 0,       //banner图的右边距
  },
  onLoad: async function(options) {


    var that = this;
    that.setData({
      thematicId: options.id ? options.id : '',
    })
    that.getThematicData();

  },

  /**
 * 获取专题模块
 * */
  getThematicData() {
    let that = this;
    let url = api.THEMATIC.GET_THEMATIC_DATA + '/' + that.data.thematicId
    http.get(url, {}, res => {
      let result = res.data ? res.data.data : {}
      let hasCountDown = false
      // 模块数据--转换数据
      if (result.modules) {
        if (Object.keys(result.modules).length > 0) {
          for (let i = 0; i < result.modules.length; i++) {
            let item = result.modules[i]
            item.parseItem = JSON.parse(item.items);
            // 如果是商品滚动模块且有倒计时
            if (item.moduleType == 'GOODSSCROLL') {
              hasCountDown = item.parseItem[0].timerType == 'DAY_TIMER' || hasCountDown ? true : false
            }
          }
        }
      }

      // 设置标题
      if (result.pageName) {
        my.setNavigationBar({
          title: result.pageName,
          success() { },
          fail() { },
        });
      }

      that.setData({
        thematicAds: result,
        loadComplete: true,
        loadFail: false,
        hasCountDown,
        banRightMargin: util.rpx2Px(30),
      })

      if (hasCountDown) {
        that.CutDataTime()
      }

    }, err => {
      that.setData({
        loadComplete: true,
        loadFail: true,
      })
    })

  },


  goToPage: function(e) {
    let that = this;
    let chInfo = constants.UrlConstants.chInfo;
    let { url } = e.currentTarget.dataset
    // let { title, type, index } = e.currentTarget.dataset



    if (url.substring(0, 4).indexOf('http') > -1) {
      my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
    }
    else {

      my.navigateTo({
        url: url
      });
    }



  },


  onPullDownRefresh() {

    // 阻止下拉刷新
    my.stopPullDownRefresh()
  },

  // 当天倒计时
  cutTimeToday: function() {
    var date = new Date();
    date.setMilliseconds(0);

    var nowDate = date.getTime();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setDate(date.getDate() + 1);
    var nextDay = date.getTime();
    var diffTime = (nextDay - nowDate) / 1000;
    return diffTime
  },

  // 倒计时
  CutDataTime: function() {
    let that = this;
    let ss = that.cutTimeToday() % 60;
    let mm = ((that.cutTimeToday() - ss) / 60) % 60;
    let hh = (that.cutTimeToday() - that.cutTimeToday() % 3600) / 3600;
    ss = ss < 10 ? ('0' + ss) : ss;
    mm = mm < 10 ? ('0' + mm) : mm;
    hh = hh < 10 ? ('0' + hh) : hh;

    this.setData({
      countSecond: ss,
      countMinute: mm,
      countHour: hh
    })

    clearTimeout(that.time_CutTime);
    that.time_CutTime = setTimeout(function() {
      that.CutDataTime()
    }, 1000);

  },



});
