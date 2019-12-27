// var _myShim = require('........my.shim');
/**
* 我的售后页面
* @author 01368384   
* 
* AFTER_SALES_AUDIT：售后审核中
* SELLER_HANDLED：商家已经处理 
* SELLER_AGREED_REFUND：商家同意退款 
* USER_REVOKE：用户主动撤销 
* APPEAL_AUDIT：申诉审核中  
* REFUND_SUCCESS：退款成功 
* AFTER_SALES_CLOSURE：售后关闭 
* PLATFORM_HANDLED：平台介入
* 
*/

var constants = require('../../../utils/constants');
var sendRequest = require('../../../utils/sendRequest');
var dateFormat = require('../../../utils/dateformat');
var utils = require('../../../utils/util');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl,
    loadComplete: false,
    loadFail: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},
  onShow: function () {
    this.setData({
      isLoadMore: true
    });
    // utils.getNetworkType(this);
    this.getData();
  },
  /**
   * 获取售后数据
   */
  getData: function () {

    var that = this;
    sendRequest.send(constants.InterfaceUrl.SEARCH_APPLY, {}, function (res) {
      res.data.result.forEach(function (v, i, arr) {
        v.createDate = dateFormat.DateFormat.format(new Date(v.createDate), 'yyyy-MM-dd hh:mm');
      });
      that.setData({
        result: res.data.result,
        baseImageUrl: baseImageUrl,
        isLoadMore: false,
        loadComplete: true,
        loadFail: false
      });
      my.hideLoading();
    }, function (res) {
      my.hideLoading();
      that.setData({
        loadFail: true
      })
    });
  },

  /**
   * 取消售后
   */
  cancelApply: function (e) {
    var that = this;
    my.showLoading({
      content: '取消中'
    });
    var workOrderId = e.currentTarget.dataset.workid;
    sendRequest.send(constants.InterfaceUrl.WORK_ORDER_CANCEL_APPLY, { workOrderId: workOrderId }, function (res) {
      that.getData();
    }, function (res) {
      my.hideLoading();
    });
  },


  // 评价
  openComments(e){
    var that = this;
    var supplierId = e.currentTarget.dataset.supplierId;
    var workOrderId = e.currentTarget.dataset.workOrderId;
    var response = {};
    response.supplierId = supplierId;
    response.workOrderId = workOrderId;
    that.setData({
      showComments: true,
      response: response
    })
  },

  closeComment(e){
    var that = this;
    that.setData({
      showComments: e
    })
  },

  submitEnding(e){
    var that = this;
    var result = e;
    // if(result.)
    that.setData({
      showComments: result.showComment,
      // showToast: true,
      showToastMes: result.showMes
    })
    // 如果是成功则刷新下页面更新状态
    if(result.success){
      that.getData();
    }

    my.showToast({
      content: result.showMes
    })

    // setTimeout(function(){
    //   that.setData({
    //     showToast: false
    //   })
    // },2000)

  },

});