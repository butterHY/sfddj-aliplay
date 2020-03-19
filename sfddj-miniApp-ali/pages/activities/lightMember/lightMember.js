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
    headData: [],
  },
  onLoad() {
    my.setNavigationBar({
      title: '会员中心',
      backgroundColor: '#2b2d3e',
      // borderBottomColor,
      // image,
    })

    this.getAdvertisingModule();
  },

  isShowRule() {
    console.log(this.data.showRuleStatus)
    this.setData({
      showRuleStatus: !this.data.showRuleStatus
    })
  },

  getAdvertisingModule() {
    let that = this;
    https.get(api.LIGHTMEMBER.GETLIGHTMEMBER, {}, (res) => {
      let resData = res.data.data;
      let resRet = res.data.ret;
      if( resRet && resRet.code == '0' && resRet.message == "SUCCESS" && resData ) {
        if (Object.keys(resData.modules).length > 0) {
          resData.modules.forEach( value => {
            value.parseItem = JSON.parse(value.items);

            value.parseItem = that.replaceFields(value.parseItem);
            
            if( value.moduleType == "SINGLE" || value.moduleType == "DOUBLE" ) {
              value.moduleType = value.moduleType == "SINGLE" ? "SINGLEGOODS" : "DOUBLEGOODS";
              value.topIntervalColor ? value.topIntervalColor = value.topIntervalColor.replace('#', '') : '';
              value.backgroundColor ? value.backgroundColor = value.backgroundColor.replace('#', '') : '';
            }

            if( value.moduleType == "TITLE" &&  value.backgroundColor ) {
              value.backgroundColor ? value.backgroundColor = value.backgroundColor.replace('#', '') : '';
            }

            if( value.moduleType == "GOODS" ) {
              value.moduleType = "GOODSLIST"; 
              value.topIntervalColor ? value.topIntervalColor = value.topIntervalColor.replace('#', '') : '';
              value.backgroundColor ? value.backgroundColor = value.backgroundColor.replace('#', '') : '';
            }

            if( value.moduleType == 'COUPON' ) {
              value.topIntervalColor ? value.topIntervalColor = value.topIntervalColor.replace('#', '') : '';
              value.backgroundColor ? value.backgroundColor = value.backgroundColor.replace('#', '') : '';
            }

            // console.log(value)
            // console.log(value.moduleType == "REGISTERED" && resData.classify == "已注册")
            // that.data.headData = (value.moduleType == "REGISTERED" && resData.classify == "已注册") ? value : (value.moduleType == "UNREGISTERED" && resData.classify != "已注册" ? value : []);


          })

          console.log(resData)
          that.setData({
            thematicAds: resData,
            headData: resData.classify == "已注册" ? resData.modules.find(value => value.moduleType == "REGISTERED") : resData.modules.find(value => value.moduleType == "UNREGISTERED"),
            isLightMember: resData.classify == "为注册" ? true : false,
          })
          console.log(that.data.thematicAds);
          console.log(that.data.headData);
          console.log(that.data.isLightMember);
        }
      }
    }, () => {
      console.log(res)
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
  }
  
});
