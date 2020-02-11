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
    isScroll_x: true,
    allGoodsList: [],
    navigationHeight: null,
    itemId: null,
  },
  onLoad: async function(options) {
    var that = this;
    that.setData({
      thematicId: options.id ? options.id : ''
    })
    that.getThematicData();
    // that.data.isonLoad = await that.getAdvertsModule();

    // console.log(this.data.goodsList);

  },

  onReady1() {
    var that = this;
    var allItemWidth = 0;
    var navigationWidth = 0;
    var navigationHeight = 0;
    my.createSelectorQuery().selectAll('.all').boundingClientRect().exec((all) => {
      var allItem = all[0];
      for (var i = 0; i < allItem.length; i++) {
        allItemWidth += allItem[i].width;
      }
    })
    my.createSelectorQuery()
      .selectAll('.navigation').boundingClientRect()
      .exec((navigation) => {
        navigationWidth = navigation[0][0].width;
        navigationHeight = navigation[0][0].height;
        that.setData({
          navigationHeight: navigationHeight
        })



        if (allItemWidth > navigationWidth) {
          that.setData({
            isScroll_x: false
          })
        }
      })

  },


  /**
 * 获取专题模块
 * */
  getThematicData() {
    let that = this;
    let url = api.THEMATIC.GET_THEMATIC_DATA + '/' + that.data.thematicId
    http.get(url, {}, res => {
      let result = res.data ? res.data.data : {}

      // 模块数据--转换数据
      if (result.modules) {
        if (Object.keys(result.modules).length > 0) {
          for (let i = 0; i < result.modules.length; i++) {
            let item = result.modules[i]
            item.parseItem = JSON.parse(item.items);
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
        thematicAds: result
      })

    }, err => {
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







});
