var constants = require('../../../utils/constants');
var stringUtils = require('../../../utils/stringUtils');
var util = require('../../../utils/util');
var sendRequest = require('../../../utils/sendRequest');
import http from '../../../api/http';
import api from '../../../api/api';

// 弹幕参数
class Doomm {
  constructor(text, top, time, i) {  //内容，顶部距离，运行时间，颜色（参数可自定义增加）
    this.text = text;
    this.top = top;
    this.time = time;
    this.id = i;
  }
}

Page({
  data: {
    baseImageLocUrl: constants.UrlConstants.baseImageLocUrl,        // 路径域名 
    baseImageUrl: constants.UrlConstants.baseImageUrl,              // 服务器图片域名
    smallImgArg: '?x-oss-process=style/goods_img_3',
    loadSignFail: false,
    loadSwipeFail: false,
    loadComplete: false,
    barrageList: [],                                                // 弹幕数据列表
    barrage_timer: null,                                            // 轮播图定时器
    roll_timer: null,                                               // 签到奖励滚动定时器
    isShowPrize: false,                                             // 是否显示奖励

    signRuler: [],                                                  // 活动规则
    isRulerShow: false,                                             // 控制活动规则显示
    signBanner: [],                                                 // 轮播图数据
    signStatus: false,                                              // 签到状态
    signPrize: [],                                                  // 签到奖励
    calendarPrize: [],                                              // 日历处数据
    totalPrize: '',                                                 // 获取签到统计金额
    firstNow: '',                                                   // 当前月第一天的星期几
    monthDay: '',                                                   // 当前月份有几天
    calendarWeekArr: [],                                            // 处理后的日历数组
    currentWeekNo: 0,                                               // 当前周是第几周
    currentDay: 0,                                                  // 今天是几号

    closeCalendar: true,                                            // 关闭日历
    checkCal: false,                                                // 是否拉开日历
    initArrow: true,                                                // 日历下拉按钮的初始指向
    showToast: false,
    errMsg: '',
    goodsList: [],                                                  // 商品列表
    calendarHeight: 80,                                             // 日历起始高度
    allWeeks: 0,                                                    // 共有多少周
    openCalendar: false,                                            // 打开日历高度
    isSignTap: true,                                                // 签到按钮防多次点击
    arrowTap: true,                                                 // 箭头防双击
  },
  onLoad() {
    let that = this;

    // 获取用户数据
    that.getSignData();

    // 获取轮播数据
    that.getMaterial();
  },
  onShow() {
    let that = this;
    // that.winUsers();
  },

  /*
  *获取用户数据
  **/
  getSignData() {
    let that = this;
    http.post(api.SIGNIN.PRIZE_DETAIL, {}, function(res) {
      let dataItem = res.data;
      if (dataItem.ret.code == "0") {
        let barrageArr = dataItem.data.barrage;                 // 弹幕数据
        let prize_timer = null;                                 // 定时器 滚动奖励显示使用
        let PrizeData = [];                                     // 模拟总的奖励数据
        let rulerData = dataItem.data.signRule;                 // 获取活动规则数据
        let stagePrizeData = dataItem.data.specialPrizes;       // 签到奖励
        let calendarData = dataItem.data.allPrizes;             // 日历处数据
        PrizeData[0] = dataItem.data.prizeStatistic;

        // 给数据赋值
        that.setData({
          calendarPrize: calendarData,                          // 日历处数据
          signStatus: dataItem.data.signStatus,                 // 签到状态
          signPrize: stagePrizeData,                            // 签到奖励
          goodsList: dataItem.data.goodsMinVOS,                 // 热卖商品列表
          firstNow: dataItem.data.weekDay * 1,                    // 当前月第一天的星期几
          monthDay: dataItem.data.days * 1,                       // 当前月份共有几天
          loadComplete: true,                                   // 加载完成
        })

        // 设置日历所需数据
        that.sureDate(calendarData);

        // 活动规则
        if (rulerData) {
          // 如果活动规则存在
          if (rulerData.indexOf('\r\n') != -1) {
            // 活动规则不止一行
            that.setData({
              signRuler: rulerData.split('\r\n')
            })
          } else {
            // 活动规则只有一行
            that.setData({
              signRuler: [rulerData]
            })
          }
        } else {
          // 活动规则不存在
          that.setData({
            signRuler: ['暂无活动规则']
          })
        }

        // 设置弹幕
        if (barrageArr && barrageArr.length > 0) {
          // 设置滚动
          let numBarr = 0;
          let barrageHroArr = [];
          let idxBarr = 0;
          clearInterval(that.data.barrage_timer);
          that.data.barrage_timer = setInterval(function() {
            if (barrageArr[idxBarr] == undefined) {
              idxBarr = 0
            }
            numBarr++;
            that.scrollHorizen(numBarr, barrageArr, idxBarr, barrageHroArr, 8, 90, function(list) {
              that.setData({
                barrageList: list
              });
              idxBarr++;
            })
          }, 1500)
        }

        // 设置所获得的奖励滚动
        if (PrizeData[0]) {
          // 设置滚动
          let num = 0;
          let prizeHroArr = [];
          let idx = 0;
          clearInterval(that.data.roll_timer);
          that.data.roll_timer = setInterval(function() {
            if (PrizeData[idx] == undefined) {
              idx = 0
            }
            num++;
            that.scrollHorizen(num, PrizeData, idx, prizeHroArr, 5.5, 0, function(list) {
              that.setData({
                totalPrize: list
              });
              idx++
            })
          }, 3600)

          // 让奖励显示同步
          clearTimeout(prize_timer);
          prize_timer = setTimeout(function() {
            that.setData({
              isShowPrize: true                     // 不管是有无奖励 显示对应的数据
            })
          }, 3600)
        } else {
          that.setData({
            isShowPrize: true                      // 不管是有无奖励 显示对应的数据
          })
        }

        // 签到按钮下方滚到到获得的奖励处
        if (stagePrizeData && stagePrizeData.length > 0) {
          stagePrizeData.forEach(function(el, index) {
            if (el.status) {

              if (stagePrizeData[index + 1]) {
                that.setData({
                  views: stagePrizeData[index + 1].day
                })
              } else {
                that.setData({
                  views: el.day
                })
              }

            }
          })
        }

      }
    }, function(err) {
      that.setData({
        loadSignFail: true
      })
    })
  },

  /**
   * 获得写日历所需的数据
   * */
  sureDate(jsonData) {
    let that = this;
    let newDate = new Date();
    let allDate = that.data.monthDay;                                              // 一月总共有几天
    let currentDay = newDate.getDate();                                            // 今日几号
    let firstDay = that.data.firstNow;                                             // 当前月第一天是周几
    // let firstDay = 6;
    let allWeeks = Math.ceil((allDate + firstDay) / 7);                            // 总共多少周
    let currentWeekNo = Math.ceil((currentDay + firstDay) / 7);                    // 今天在第几周
    let leftArr = [];                                                              // 定义一个把对象转换成数组的空数组
    that.setData({
      currentWeekNo: currentWeekNo,
      currentDay: currentDay,
      allWeeks: allWeeks,
    });

    // 每月从周几开始 不是第一天的前边补0
    if (firstDay != 7) {
      for (let i = 0; i < firstDay; i++) {
        leftArr.push(0)
      }
    }
    // 把对象转换成数组
    for (let key in jsonData) {
      jsonData[key].day = key
      leftArr.push(jsonData[key])
    }

    // 将数组中的数据分配到每一周
    if (leftArr && leftArr.length > 0) {
      that.split(leftArr);
    }

  },

  /**
   * 把数组截取
  */
  split(arr) {
    let that = this;
    let splitArr = [];
    let midArr = that.data.calendarWeekArr;
    // 每七个截取一次
    splitArr = arr.splice(0, 7);
    midArr.push(splitArr);
    // 把截取的数组放储存起来
    that.setData({
      calendarArr: midArr
    })
    // 重复调取
    if (arr && arr.length > 0) {
      that.split(arr)
    }

  },


  /*
  *获取轮播图
  **/
  getMaterial() {
    let that = this;
    sendRequest.send(constants.InterfaceUrl.HOME_BANNER_LIST, { groupName: '支付宝_小程序_签到页面' }, function(res) {
      let result = res.data.result;
      that.setData({
        signBanner: result.material ? result.material : [],
        loadComplete: true,
      })
    }, function(err) {
      that.setData({
        loadSwipeFail: true
      })
    }, 'GET', true)
  },

  /*
  *轮播跳转
  **/
  goToPage: function(e) {
    let that = this;
    let url = e.currentTarget.dataset.url;
    let chInfo = constants.UrlConstants.chInfo;

    if (url.substring(0,4).indexOf('http') > -1) {
      my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
    }
    else {
      if (url) {
        my.navigateTo({
          url: url
        });
      }

    }
  },

  /**
   * 处理弹幕位置
  */
  setBarrage() {
    let that = this;
    let barrageNum = parseInt(that.data.barrageList.length / 3)
    that.setData({
      time: barrageNum * 7
    })
  },

  /**
   * 获取活动规则
  */
  getRuler() {
    let that = this;
    that.setData({
      isRulerShow: true
    })
  },

  /**
    * 关闭活动规则弹窗
  */
  onCloseRuler() {
    let that = this;
    that.setData({
      isRulerShow: false
    })
  },

  /**
   * 打开关闭日历
   */
  openCalendar() {
    let that = this;
    let isCheckCal = that.data.checkCal;
    let allWeeks = that.data.allWeeks * 1;        // 共有多少周
    let arrowTap = that.data.arrowTap;            // 防双击
    let arrow_timer = null;                       // 防双击定时器
    console.log(arrowTap)
    if(!arrowTap)return;
    that.setData({
      arrowTap: false
    })
    clearTimeout(arrow_timer);
    arrow_timer = setTimeout(function(){
      that.setData({
        arrowTap: true
      })
    },1000)
    // 处理箭头翻转
    that.setData({
      checkCal: !isCheckCal,
      initArrow: !isCheckCal,
    })

    // 处理日历打开与关闭
    if (isCheckCal) {
      that.setData({
        calendarHeight: 80
      })
      setTimeout(function() {
        that.setData({
          openCalendar: false
        })
      }, 350)
    } else {
      that.setData({
        calendarHeight: 80 * allWeeks,
        openCalendar: true,
      })
    }
  },

  /**
   * 签到按钮
  */
  signedEvent() {
    let that = this;
    if (!that.data.isSignTap) return;
    that.setData({
      isSignTap: false,
    })
    http.post(api.SIGNIN.MEMBER_SIGN, {}, function(res) {
      let dataItem = res.data;
      let signPop_timer = null;
      if (dataItem.ret.code == "0") {
        // 1 未签到  2 签到成功
        if (dataItem.data.signStatus == 2) {
          // 清空数据
          that.setData({
            calendarPrize: [],                // 日历处数据
            signStatus: true,                 // 签到状态
            signPrize: [],                    // 签到奖励
            goodsList: [],                    // 热卖商品列表
            firstNow: '',                     // 当前月第一天的星期几
            monthDay: '',                     // 当前月份共有几天
            calendarWeekArr: [],              // 每次使用都清空一下
            barrageList: [],
            calendarArr: [],
            totalPrize: [],
          })
          clearInterval(that.data.barrage_timer);
          clearInterval(that.data.roll_timer);

          // 再请求一次页面数据，使其覆盖原来的是数据
          that.getSignData()
        }
      }
      // 弹窗
      that.setData({
        errMsg: dataItem.data.message,
        showToast: true,
        isSignTap: true,
      })
      clearTimeout(signPop_timer);
      signPop_timer = setTimeout(function() {
        that.setData({
          showToast: false
        })
      }, 2000)

    }, function(err) {
      let err_timer = null;
      // 弹窗
      that.setData({
        errMsg: '签到失败',
        showToast: true,
        isSignTap: true,
      })
      clearTimeout(err_timer)
      err_timer = setTimeout(function() {
        that.setData({
          showToast: false
        })
      }, 2000)
    })
  },

  /** 
  * 已经签到过了
  */
  signedAlready() {
    let that = this;
    let signed_timer = null;
    that.setData({
      errMsg: '您已经签过到了',
      showToast: true
    });
    clearTimeout(signed_timer);
    signed_timer = setTimeout(function() {
      that.setData({
        showToast: false
      });
    }, 2000)
  },

  /**
   * 关闭弹窗
  */
  showPoup() {
    let that = this;
    that.setData({
      showToast: false
    })
  },

  /*
  * 处理无缝滚动
  **/
  scrollHorizen(index, arr, ide, doommList, rollT, nTop, fn) {
    doommList.push(new Doomm(arr[ide], (index % 3) * nTop, rollT, index));// 0 1 2  0 1 2 
    if (doommList.length > 6) {
      doommList.splice(0, 1)
    }
    if (fn) fn(doommList);
  },

  onHide() {
    let that = this;
    // clearInterval(that.data.barrage_timer);
    // clearInterval(that.data.roll_timer);
  },
  onUnload() {
    let that = this;
    // clearInterval(that.data.barrage_timer);
    // clearInterval(that.data.roll_timer);
  }

});
