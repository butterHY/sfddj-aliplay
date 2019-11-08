var constants = require('../../../utils/constants');
var stringUtils = require('../../../utils/stringUtils');
var util = require('../../../utils/util');
var sendRequest = require('../../../utils/sendRequest');
import http from '../../../api/http';
import api from '../../../api/api';

// 弹幕参数
class Doomm {
  constructor(text, top, time) {  //内容，顶部距离，运行时间，颜色（参数可自定义增加）
    this.text = text;
    this.top = top;
    this.time = time;
    this.display = true;
    this.id = i++;
  }
}

Page({
  data: {
    baseImageLocUrl: constants.UrlConstants.baseImageLocUrl,          // 服务器图片域名

    // barrageList:[                                                     // 弹幕数据列表
    // "182****8470用户累计签到4天获得满29.00减10.00元优惠券",
    // "190****4706用户累计签到3天获得1.78元现金余额",
    // "132****5389用户连续签到3天获得1.47元现金余额"],
    barrageList: [],
    time: 7,
    signRuler: '',                                                  // 活动规则
    signBanner: [],                                                 // 轮播图数据
    signStatus: false,                                              // 签到状态
    signPrize: [],                                                  // 签到奖励
    calendarPrize: [],                                              // 日历处数据
    totalPrize: '',                                                 // 获取签到统计金额
    firstNow: '',                                                   // 当前月第一天的星期几
    monthDay: '',                                                   // 当前月份有几天

    checkCal: false,                                                  // 是否拉开日历
    initArrow: true,                                                  // 日历下拉按钮的初始指向
    showToast: false,
    errMsg:'签到成功',
    wordsLoop: 1,

    goodsList:[],                                                     // 商品列表

    signSwiperList: ['blue', 'green', 'yellow'],
  },
  onLoad() {
    let that = this;
    that.setBarrage();

    that.getSignData();
  },
  onShow() {
    let that = this;
    // that.winUsers();
  },

  /*
  *获取用户数据
  **/
 getSignData(){
   let that = this;
   http.post(api.SIGNIN.PRIZE_DETAIL,{},function(res){
      let dataItem = res.data;
      console.log(dataItem);
      if(dataItem.ret.code=="0"){
        that.setData({
          barrageList: dataItem.data.barrage,
          signRuler: dataItem.data.signRule,
          signBanner: dataItem.data.signBanner,
          calendarPrize: dataItem.data.allPrizes,
          signStatus: dataItem.data.signStatus,
          signPrize: dataItem.data.specialPrizes,
          goodsList: dataItem.data.goodsMinVOS,
          totalPrize: dataItem.data.prizeStatistic,
          firstNow: dataItem.data.weekDay,
          monthDay: dataItem.data.weekDay,
        })
      }
     },function(err){

     })
 },

  /**
   * 处理弹幕位置
  */
  setBarrage() {
      let that = this;
      let barrageNum = parseInt(that.data.barrageList.length/3)
      that.setData({
        time:barrageNum*7
      }) 
  },

  /**
   * 打开关闭日历
   */
  openCalendar(){
    let that = this;
    let isCheckCal = that.data.checkCal;
    // console.log('打开日历');
    that.setData({
      checkCal: !isCheckCal,
      initArrow: !isCheckCal,
    })
    // console.log(that.data.checkCal,that.data.initArrow)
    // that.data.checkCal = !that.data.checkCal;
    // that.data.initArrow = that.data.checkCal;
  },

  /** 
  * 已经签到过了
  */
  signedAlready(){
    let that = this;
    that.setData({
      showToast: true
    })
  },

  /*
  * 处理无缝滚动
  **/
 getSlipFn(arr, idx, timer, t){
   let that = this;
   let doommList = [];
   timer = setInterval(function(){
    if (arr[idx] == undefined) {
      idx = 0
        // 1.循环一次，清除计时器
        // doommList = []
        // clearInterval(cycle)

        // 2.无限循环弹幕
      doommList.push(new Doomm(arr[idx].content, (idx % 3) * 20, 5, getRandomColor()));
      if (doommList.length > 5) {   //删除运行过后的dom
        doommList.splice(0, 1)
      }
      that.setData({
        doommData: doommList
      })
      idx++
    } else {
      doommList.push(new Doomm(arr[idx].content, (idx % 3) * 20, 5, getRandomColor()));
      if (doommList.length > 5) {
        doommList.splice(0, 1)
      }
      that.setData({
        doommData: doommList
      })
      idx++
    }
   },t)
 }
});
