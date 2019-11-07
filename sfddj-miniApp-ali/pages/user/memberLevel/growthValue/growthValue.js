// var _myShim = require("..........my.shim");

var sendRequest = require("../../../../utils/sendRequest");
var constants = require("../../../../utils/constants");
var dateFmt = require("../../../../utils/dateformat");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    start: 0,
    limit: 20,
    loadDone: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGrowthValue();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  //获取成长值明细
  getGrowthValue: function (type) {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.GET_GROWVALUE_RECORD, {
      start: that.data.start,
      limit: that.data.limit
    }, function (res) {
      var result = res.data.result;
      if (result) {
        for (var key in result) {
          result[key].newDate = dateFmt.DateFormat.format(new Date(result[key].createDate), 'yyyy-MM-dd hh:mm:ss');
          if (result[key].operation == 'SHOPING' || result[key].operation == 'FIRSTSHOPING' || result[key].operation == 'PARTAFTERSALE' || result[key].operation == 'SHOPUSE') {
            result[key].operationName = '购物';
          } else if (result[key].operation == 'COMMENT') {
            result[key].operationName = '评论';
          } else if (result[key].operation == 'SYSTEMSENDING') {
            result[key].operationName = '系统发放';
          } else if (result[key].operation == 'LOGIN') {
            result[key].operationName = '每日登录';
          } else if (result[key].operation == 'COMPLETEINFORMATION') {
            result[key].operationName = '完善资料';
          } else if (result[key].operation == 'BINGMOBILE') {
            result[key].operationName = '绑定手机号';
          } else if (result[key].operation == 'AFTERSALE') {
            result[key].operationName = '全部退款';
          } else if (result[key].operation == 'TIAOZENG') {
            result[key].operationName = '手动调增';
          } else if (result[key].operation == 'TIAOJIAN') {
            result[key].operationName = '手动调减';
          } else if (result[key].operation == 'NOPAY') {
            result[key].operationName = '未支付退还';
          } else {
            result[key].operationName = '其它';
          }
        }
        if (type == 1) {
          result = that.data.result.concat(result);
        } else {
          result = result;
        }

        that.setData({
          result: result
        });
      } else {
        loadDone: true;
      }
    }, function (err) {}, 'GET');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (!that.data.loadDone) {
      that.setData({
        start: ++that.data.start
      });
      that.getGrowthValue(1);
    }
  }

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
});