// var _myShim = require("........my.shim");

var sendRequest = require("../../../utils/sendRequest");
var constants = require("../../../utils/constants");
var dateFmt = require("../../../utils/dateformat");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadComplete: false, //在数据请求回来成功后改成true,失败也要改成true
    loadFail: false, //在数据请求回来成功后改成false, 失败后改成true
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl, //图标，相当于本地图片目录,
    start: 0,
    limit: 8,
    end: 0,
    endPage: false, //收支明细是否显示完
    showToast: false //提示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getIntegral();
    that.getIntegralRecord(that.data.start, 0);
    that.setData({
      loadComplete: true
    });
  },

  /**
   * 获取积分详情
   * */
  getIntegral: function () {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.GET_INTEGRAL, {}, function (res) {

      that.setData({
        memberPoint: res.data.result.memberPoint,
        rate: res.data.result.rate
        // records: records
      });
    }, function (err) {}, 'GET');
  },

  /**
   * 获取积分收支明细
   * */
  getIntegralRecord: function (start, type) {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.GET_INTEGRAL_RECORD, {
      start: start,
      limit: that.data.limit
    }, function (res) {
      var records = res.data.result;
      var endPage = that.data.endPage;
      if (records.length == 0) {
        endPage = true;
      } else {
        for (var i = 0; i < records.length; i++) {
          // 转换创建时间
          records[i].createDate = dateFmt.DateFormat.format(new Date(records[i].createDate), "yyyy-MM-dd hh:mm:ss");
          // 判断积分正负
          if (records[i].detail > 0) {
            records[i].negative = false;
          } else {
            records[i].negative = true;
          }
          // 判断项目类型
          switch (records[i].operation) {
            case 'SHOPING':
              records[i].operationName = '购物';
              break;
            case 'FIRSTSHOPING':
              records[i].operationName = '购物';
              break;
            case 'COMMENT':
              records[i].operationName = '评论';
              break;
            case 'SYSTEMSENDING':
              records[i].operationName = '系统发放';
              break;
            case 'LOGIN':
              records[i].operationName = '每日登录';
              break;
            case 'COMPLETEINFORMATION':
              records[i].operationName = '完善资料';
              break;
            case 'BINGMOBILE':
              records[i].operationName = '绑定手机号';
              break;
            case 'AFTERSALE':
              records[i].operationName = '全部退款';
              break;
            case 'TIAOZENG':
              records[i].operationName = '手动调增';
              break;
            case 'TIAOJIAN':
              records[i].operationName = '手动调减';
              break;
            case 'PARTAFTERSALE':
              records[i].operationName = '购物';
              break;
            case 'SHOPUSE':
              records[i].operationName = '购物';
              break;
            case 'NOPAY':
              records[i].operationName = '未支付退还';
              break;
            case 'SHOPDEDUCT':
              records[i].operationName = '积分抵扣';
              break;
            default:
              records[i].operationName = '其他';
          }
        }
        if (records.length < that.data.limit) {
          endPage = true;
        }
      }
      if (type == 0) {
        records = records;
      } else {
        records = that.data.recordsList.concat(records);
      }
      // if((that.data.start+that.data.limit) > records.length){
      //   that.setData({
      //     endPage: true
      //   })
      // }
      that.setData({
        recordsList: records,
        endPage: endPage
      });
    }, function (err) {}, 'GET');
  },

  /**
   * 加载更多
   * */
  getMoreDet: function () {
    var that = this;
    var start = that.data.start;
    start++;
    that.setData({
      start: start
    });
    that.getIntegralRecord(that.data.start, 1);
    // if(that.data.end >= that.data.records.length){
    //   that.setData({
    //     endPage:true
    //   })
    // }
  },

  // 抽奖敬请期待提示
  showNoTip: function () {
    var that = this;

    that.setData({
      showToast: true,
      errMsg: '敬请期待!'
    });

    setTimeout(function () {
      that.setData({
        showToast: false
      });
    }, 2000);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
  onReachBottom: function () {}

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
});