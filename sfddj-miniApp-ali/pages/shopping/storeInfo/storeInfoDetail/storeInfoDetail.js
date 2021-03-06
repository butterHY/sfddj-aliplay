let constants = require('../../../../utils/constants.js')
import http from '../../../../api/http';
import api from '../../../../api/api';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: constants.UrlConstants.baseImageUrl, // 图片资源地址前缀
    showIntroduction: false,                           // 是否显示商家简介弹窗
    supplierId: '',                                    // 商家id

    supplierDetail: '',                               // 商家详情
    starYew: [],                                      // 黄色星星
    startGray: [],                                    // 灰色星星
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.supplierId){
      this.setData({
        supplierId: options.supplierId
      })
    }
    this.getSupplierDetail()
  },

  // 获取商家信息
  getSupplierDetail() {
    let that = this
    let data = {
      supplierId: this.data.supplierId
    }
    http.post(api.SUPPLIER.GET_SUPPLIER_DETAIL, data, res => {
      let result = res.data.data ? res.data.data : {}
      that.setData({
        supplierDetail: result,
      })
      if(result.supplierScore || result.supplierScore == "0"){
        this.startEvent(result.supplierScore);

      }
      if(result.createDate){
        this.dateEvent(result.createDate);
      }
    }, err => {

    })

  },

  // 综合评分小星星个数
  startEvent: function(num){
    let that = this;
    let arr1 = new Array(num * 1);    // 评分 黄色星星个数
    let arr2 = [];                    // 灰色星星个数
    if (num * 1 < 5) {
      let idx = 5 - num * 1;
      arr2 = new Array(idx);
    }
    that.setData({
      starYew: arr1,
      startGray: arr2,
    })
  },

  // 处理时间
  dateEvent: function(date){
    let that = this;
    let fmt = '-';
    let str = '';

    date = new Date(date)

    str += date.getFullYear() + fmt;

    date.getMonth() < 9 ? str += '0' + (date.getMonth() + 1) + fmt : str += (date.getMonth() + 1) + fmt;

    date.getDate() < 9 ? str += '0' + date.getDate() + ' ' : str += date.getDate() + ' ';

    date.getHours() < 10 ? str += '0' + date.getHours() + ':' : str += date.getHours() + ':';
    date.getMinutes() < 10 ? str += '0' + date.getMinutes() : str += date.getMinutes() + ':';
    date.getSeconds() < 10 ? str += '0' + date.getSeconds() : str += date.getSeconds();

    that.setData({
      openTime: str
    })
  },

  // 点击显示商家简介
  tapStoreIntro(){
    this.setData({
      showIntroduction: true
    })
  },

  // 关闭商家简介弹窗
  onPopupClose(){
    this.setData({
      showIntroduction: false
    })
  },
})