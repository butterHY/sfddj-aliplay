// var _myShim = require('..........my.shim');
/**
* 申请客服介入
*/

var constants = require('../../../../utils/constants');
var util = require('../../../../utils/util');
var sendRequest = require('../../../../utils/sendRequest');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
var wordsList = [{ str: '对商家售后结果有异议' }, { str: '商家服务态度不好' }, { str: '未收到退款/补发' }, { str: '投诉商品' }, { str: '其他' }]; //申请退款

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageList: [],
    wordsList: wordsList,
    description: '',
    orderId: '',
    workOrderId: '',
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var orderId = options.orderId;
    var workOrderId = options.workOrderId;
    that.data.orderId = orderId;
    that.data.workOrderId = workOrderId;
    for(var i = 0; i < wordsList.length; i++){
      wordsList[i].taped = false;
    }
    that.setData({
      imageList: [],
      wordsList: wordsList
    })
  },

  uploadImage: function (e) {
    var that = this;
    util.uploadImage(1, function (res) {
      that.data.imageList.push(res);
      that.setData({
        imageList: that.data.imageList,
        baseImageUrl: baseImageUrl
      });
    }, function (res) {
    });
  },
  deleteImage: function (e) {
    var index = e.currentTarget.dataset.index;
    var that = this;
    my.confirm({
      title: '提示',
      content: '确定要删除图片',
      success: function (res) {
        if (res.confirm) {
          that.deleteImageWorkOrder(that.data.imageList[index]);
          that.data.imageList.splice(index, 1);
          that.setData({
            imageList: that.data.imageList
          });
        } else if (res.cancel) {
        }
      }
    });
  },
  deleteImageWorkOrder: function (imgUrl) {
    sendRequest.send(constants.InterfaceUrl.DELETE_IMAGE, { imgUrl: imgUrl }, function (res) {
      my.showToast({
        content: '删除成功'
      });
    }, function (res) {});
  },
  resonTap: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    that.data.wordsList.forEach(function (v, i, arr) {
      if (index == i) {
        v.taped = true;
      } else {
        v.taped = false;
      }
    });
    that.setData({
      wordsList: that.data.wordsList
    });
  },
  descInput: function (e) {
    this.data.description = e.detail.value;
  },
  descBlur: function (e) {
    if (e.detail.value.length < 10 || e.detail.value.length > 200) {
      my.showToast({
        content: '请输入10-200字'
      });
    }
  },
  submitTap: function (e) {
    var that = this;
    var applyCause = '';
    that.data.wordsList.forEach(function (v, i, arr) {
      if (v.taped) {
        applyCause = v.str;
      }
    });
    if (!applyCause) {
      my.showToast({
        content: '请选择申请原因'
      });
      return;
    }
    if (that.data.description.length < 10 || that.data.description.length > 200) {
      my.showToast({
        content: '请输入10-200字描述'
      });
      return;
    }

    // 上传图片格式转字符串
    var imageList = that.data.imageList;
    imageList = imageList.join(',');
    
    var data = {
      appealDesc: that.data.description,
      fileCode: imageList,
      workOrderId: that.data.workOrderId,
      orderId: that.data.orderId,
      appealCause: applyCause
    };
    my.showLoading({
      content: '加载中'
    });
    sendRequest.send(constants.InterfaceUrl.APPLY_APPEAL, data, function (res) {
      my.hideLoading();
      my.showToast({
        content: '申请成功'
      });
      my.navigateBack({});
    }, function (res) {
      my.hideLoading();
    });
  }

});