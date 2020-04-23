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
  onLoad: function() {
    // 判断是否绑定了手机
    try {
      let user_memId = my.getStorageSync({
        key: "user_memId",
      }).data;
      this.setData({
        user_memId: user_memId == 'null' || user_memId == null || user_memId == 'undefined' || user_memId == undefined ? '默认是会员' : user_memId
      })

      // this.setData({
      //   user_memId: 0
      // })
      console.log(this.data.user_memId)
    } catch (e) { }
  },

  // 轻会员点击去使用没有走 onShow
  onShow: async function(options) {
    console.log('页面重新显示， onShow')
    let returnBack = await this.getAdvertisingModule();
    returnBack.type == "SUCCESS" ? this.getEasyMemberInfo() : '';
  },

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
                      // case "USED":
                      //   couponVal.couponText = "已使用"
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
            console.log('广告请求成功， 是否是轻会员', that.data.isLightMember)
            console.log('广告请求成功， 广告数据', that.data.thematicAds)
            console.log('广告请求成功， 头部数据', that.data.headData)
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
    let that = this;
    console.log(that.data.thematicAds.lightMemberId)
    my.navigateToMiniService({
      serviceId: "2019072365974237", // 插件id,固定值勿改
      servicePage: "pages/hz-enjoy/main/index", // 插件页面地址,固定值勿改
      extraData: {
        "alipay.huabei.hz-enjoy.templateId": that.data.thematicAds.lightMemberId,
        "alipay.huabei.hz-enjoy.partnerId": "2088421251942323",
      },
      success: (res) => {
        console.log('打开成功', res)
      },
      fail: (res) => {
        console.log('打开失败', res)
      },
      complete: (res) => {},
    });
  },

    /**
   * 领取优惠群
   * */
  getCoupon: function(e) {
    // 如果没有开通轻会员应先弹窗提示不请求接口
    let that = this;
    console.log(e)
    // if( !that.data.isLightMember ) {
    //   my.showToast({
    //     content: '注册成为轻会员才可以领取！',
    //     duration: 2000,
    //   })
    //   return;
    // }
    let index = e.currentTarget.dataset.index;
    let ruleSign = e.currentTarget.dataset.ruleSign;
    let fatherIndex = e.currentTarget.dataset.fatherIndex;

    https.post(api.GOODSDETAIL.GOODS_DETAIL_DRAWCOUPON, { ruleSign }, function(res) {
      console.log(res)
      console.log(that.data.thematicAds.modules[fatherIndex].parseItem[index]);
      let resData = res.data.data;
      resData[0].id = resData[0].couponId;
      if (resData && resData.length > 0) {
        switch(resData[0].couponStatus) {
          case "NO_RECEIVE":
            resData[0].couponText = "立即领取"
          break;
          case "NORMAR":
            resData[0].couponText = "去使用"
          break;
          // case "USED":
          //   resData[0].couponText = "已使用"
          // break;
          default:
          break;
        }

        that.data.thematicAds.modules[fatherIndex].parseItem[index] = resData[0];
        my.showToast({
          content: '领取成功',
          duration: 2000,
        })

        that.setData({
          thematicAds: that.data.thematicAds
        })
        console.log(that.data.thematicAds)
      }
    }, function(err) {
      console.log(err)
      my.showToast({
        content: err,
        duration: 2000,
      })
    })
  },

    /**
   * 去使用按钮
   * */
  toUseCoupon(e) {
    console.log(e)
    let linkType = e.currentTarget.dataset.linkType;
    let couponId = e.currentTarget.dataset.couponid;
    let useLink = e.currentTarget.dataset.uselink;
    // linkType 0跳转uselink, 1跳转商城首页， 2跳转优惠券可使用商品列表

    console.log(linkType, couponId, useLink, e)
    if (linkType == 0) {
      my.navigateTo({
        url: useLink
      });
    } else if (linkType == 1) {
      my.switchTab({
        url: '/pages/home/home',
      })
    } else if (linkType == 2) {
      my.navigateTo({
        url: '/pages/home/grouping/grouping?pageFrom=coupon&couponId=' + couponId
      });
    }
  },


  getEasyMemberInfo() {
    let that = this;
    let data = {outSignNo: that.data.thematicAds.lightMemberId};
    https.get(api.LIGHTMEMBER.GETEASYMEMBERINFO, data, function(res){
      let resData = res.data.data;
      let resRet = res.data.ret;
      if( resRet.code == '0' && resRet.message == "SUCCESS" && resData ) {
        resData.gmtSign = Math.round((new Date().getTime() - resData.gmtSign) / 1000 /60 /60 /24); // 签约时间
        !resData.gmtUnSign ? that.getGmtUnSign() : resData.gmtUnSign = utils.formatTime(new Date(resData.gmtUnSign));
        that.data.headData = Object.assign(that.data.headData, resData);
        that.setData({
          headData: that.data.headData
        })
        console.log('请求 getEasyMemberInfo 后的 headData', that.data.headData)
      }
    }, function(res) {
    })
  },

  // 获取已注册用户的到期时间；
  getGmtUnSign() {
    let that = this;
    https.post(api.LIGHTMEMBER.AGREEMENTQUERY, { outSignNo: that.data.thematicAds.lightMemberId }, (res) => {
      console.log('请求到期时间 成功',res)
      let resRet = res.data.ret;
      let resData = res.data.data;
     if( resRet.code == '0' && resRet.message == "SUCCESS" && resData ) {
       that.data.headData.gmtUnSign = utils.formatTime(new Date(resData));
        that.setData({
          headData: that.data.headData
        })
      }
      console.log('请求到期时间成功重新修改  headData',res)
    },(res) => {
      console.log('请求到期时间 报错',res)
    })
  },

  // 获取手机号
  getPhoneNumber: function(e) {
    let that = this;
    console.log('获取手机号')
    console.log(this.data.user_memId)
    my.getPhoneNumber({
      success: (res) => {
        let response = res.response
        sendRequest.send(constants.InterfaceUrl.USER_BINGMOBILEV4, {
          response: response,
        }, function(res) {
          if (res.data.result) {
            try {
              my.setStorageSync({ key: constants.StorageConstants.tokenKey, data: res.data.result.loginToken });
              my.setStorageSync({ key: 'user_memId', data: res.data.result.memberId });
            } catch (e) {
              my.setStorage({ key: 'user_memId', data: res.data.result.memberId });
            }
            console.log('获取成功设置成功1', res.data.result.loginToken, res.data.result.memberId)
          }
          else { }

          my.showToast({
            content: '绑定成功'
          })
          that.setData({
            user_memId: res.data.result ? res.data.result.memberId : '默认会员'
          })

          console.log('获取成功设置成功2', that.data.user_memId)
        }, function(res, resData) {
          // '1013',为该用户已绑定手机号；
          var resData = resData ? resData : {}
          if (resData.errorCode == '1013') {
            that.setData({
              user_memId: '默认会员'
            })
            my.setStorage({ key: 'user_memId', data: '默认会员' });
            console.log('获取成功设置失败1', that.data.user_memId) 
          } else {
            my.showToast({
              content: res,
              duration: 2000,
            })
            console.log('获取成功设置失败2', that.data.user_memId) 
          }
        });
      },
      fail: (res) => {
        my.navigateTo({
          url: '/pages/user/bindPhone/bindPhone'
        });
        console.log('获取失败', that.data.user_memId) 
      },
    });
  },

  // 阻止下拉刷新
  onPullDownRefresh() {
    my.stopPullDownRefresh()
  },
  
});
