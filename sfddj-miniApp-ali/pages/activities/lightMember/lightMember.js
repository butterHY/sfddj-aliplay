import api from '../../../api/api';
import https from '../../../api/http';
let sendRequest = require('../../../utils/sendRequest');
let constants = require('../../../utils/constants');
let stringUtils = require('../../../utils/stringUtils');
let utils = require('../../../utils/util');

Page({
  data: {
    baseImageUrl: constants.UrlConstants.baseImageUrl,
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    ossImgStyle: '?x-oss-process=style/goods_img_2',
    loadComplete: false,        //是否加载完成
    loadFail: false,           //是否加载失败
    time_CutTime: null,         //倒计时
    countSecond: '00',         //倒计时的秒
    countMinute: '00',         //倒计时的分钟
    countHour: '00',          //倒计时的小时
    banRightMargin: 0,        //banner图的右边距
    isLightMember: false,
    showRuleStatus: false,
    openingButtonData: {},     // 底部按钮数据
  },
  onLoad: async function() {
    let returnBack = await this.getAdvertisingModule();
    returnBack.type == "SUCCESS" ? this.getEasyMemberInfo() : ''
  },

  onShow() {},

  isShowRule() {
    this.setData({
      showRuleStatus: !this.data.showRuleStatus
    })
  },

  getAdvertisingModule() {
    let that = this;
    return new Promise((reslove, reject) => {
      https.get(api.LIGHTMEMBER.GETLIGHTMEMBER, {}, (res) => {
        let resData = res.data.data;
        let resRet = res.data.ret;
        if( resRet && resRet.code == '0' && resRet.message == "SUCCESS" && resData ) {
          if (Object.keys(resData.modules).length > 0) {
            resData.modules.forEach( value => {
              value.parseItem = JSON.parse(value.items);
              value.parseItem = that.replaceFields(value.parseItem);
              value.topIntervalColor ? value.topIntervalColor = value.topIntervalColor.replace('#', '') : '';
              value.backgroundColor ? value.backgroundColor = value.backgroundColor.replace('#', '') : '';
              
              switch(value.moduleType) {
                case "SET_LOW_BUTTON":
                  that.data.openingButtonData = value
                break;
                case "EASY_MEMBER_TITLE":
                  value.moduleType = "TITLE"
                break;

                case "EASY_MEMBER_COUPON":
                  value.parseItem.forEach(couponVal => {
                    switch(couponVal.couponStatus) {
                      case "NO_RECEIVE":
                        couponVal.couponText = "立即领取"
                      break;
                      case "NORMAR":
                        couponVal.couponText = "去使用"
                      break;
                      case "USED":
                        couponVal.couponText = "已使用"
                      break;
                      default:
                      break;
                    }
                  })
                break;
                default:
                break;
              }
            })

            // 设置标题
            if (resData.pageName) {
              my.setNavigationBar({
                title: resData.pageName,
                success() { },
                fail() { },
              });
            }

            that.setData({
              loadComplete: true,
              loadFail: false,
              thematicAds: resData,
              headData: resData.classify == "已注册" ? resData.modules.find(value => value.moduleType == "REGISTERED") : resData.modules.find(value => value.moduleType == "UNREGISTERED"),
              openingButtonData: that.data.openingButtonData,
              isLightMember: resData.classify == "已注册" ? true : false,
            })
            reslove({
              type: 'SUCCESS'
            })
          } 
        }
      }, (res) => {
        that.setData({
          loadComplete: true,
          loadFail: true,
        })
        reject({
          type: 'FAIL'
        })
      }) 
    })
  },

  replaceFields(data) {
    data.forEach(val => {
      val.titleType = val.type;
      val.listType = val.type;
      val.moduleTitle = val.titleName;
      val.titlePosition = val.position;
      val.fontSize ?  val.fontSize = parseInt(val.fontSize) : '';
      val.fontSizeColor ? val.fontColor = val.fontSizeColor.replace('#', '') : '';
      val.titleImage = val.imageUrl;
    })
    return data
  },


  // 管理按钮的跳转
  goToPage(data){
    let that = this;
    let chInfo = constants.UrlConstants.chInfo;
    let url = data.currentTarget.dataset.url;
    if ( url.substring(0,4).indexOf('http') != -1 ) {
      my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
    } else {
      my.navigateTo({
        url
      });
    }
  },

  // 轻会员跳转
  goToLightMember() {
    my.navigateToMiniService({
      serviceId: "2019072365974237", // 插件id,固定值勿改
      servicePage: "pages/hz-enjoy/main/index", // 插件页面地址,固定值勿改
      extraData: {
        "alipay.huabei.hz-enjoy.templateId": "2020040700020903320005426669",
        "alipay.huabei.hz-enjoy.partnerId": "2088421251942323",
      },
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {},
    });
  },


  getCoupon: function(e) {
    // 如果没有开通轻会员应先弹窗提示不请求接口
    let that = this;
    if( !that.data.isLightMember ) {
      my.showToast({
        content: '注册成为轻会员才可以领取！',
        duration: 2000,
      })
      return;
    }
    let index = e.currentTarget.dataset.index;
    let ruleSign = e.currentTarget.dataset.ruleSign;
    let fatherIndex = e.currentTarget.dataset.fatherIndex;

    https.post(api.GOODSDETAIL.GOODS_DETAIL_DRAWCOUPON, { ruleSign }, function(res) {
      let resData = res.data.data;
      if (resData && resData.length > 0) {
        resData[0].beginDateStr = utils.pointFormatTime(new Date(resData[0].beginDate));
        resData[0].endDateStr = utils.pointFormatTime(new Date(resData[0].endDate));
        switch(resData[0].couponStatus) {
          case "NO_RECEIVE":
            couponVal.couponText = "立即领取"
          break;
          case "NORMAR":
            couponVal.couponText = "去使用"
          break;
          case "USED":
            couponVal.couponText = "已使用"
          break;
          default:
          break;
        }

        that.data.thematicAds.modules[fatherIndex].parseItem[index] = resData[0];

        that.setData({
          thematicAds: that.data.thematicAds
        })
      }
    }, function(err) {
      my.showToast({
        content: err,
        duration: 2000,
      })
    })
  },


  getEasyMemberInfo() {
    let that = this;
    let data = that.data.isLightMember ? {outSignNo: that.data.thematicAds.lightMemberId} : {}
    https.get(api.LIGHTMEMBER.GETEASYMEMBERINFO, data, function(res){
      let resData = res.data.data;
      let resRet = res.data.ret;
      if(resRet.code == '0' && resRet.message == "SUCCESS" && resData) {
        resData.headImage = resData.headImage ? that.data.baseImageUrl + resData.headImage : that.data.baseLocImgUrl + 'miniappImg/icon/icon_default_head.jpeg';
        resData.gmtSign = Math.round((new Date().getTime() - resData.gmtSign) / 1000 /60 /60 /24) // 签约时间
        resData.gmtUnSign = utils.formatTime(new Date(resData.gmtUnSign));
        that.data.headData = Object.assign(that.data.headData, resData);
        that.setData({
          headData: that.data.headData
        })
      }
    }, function(res) {
    })
  },

  // 阻止下拉刷新
  onPullDownRefresh() {
    my.stopPullDownRefresh()
  },
  
});
