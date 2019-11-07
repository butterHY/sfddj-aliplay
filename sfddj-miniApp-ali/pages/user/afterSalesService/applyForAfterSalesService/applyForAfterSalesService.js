// var _myShim = require('..........my.shim');
/**
* 申请售后
* @author 01368384 
*/
var constants = require('../../../../utils/constants');
var util = require('../../../../utils/util');
var sendRequest = require('../../../../utils/sendRequest');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
var receiveWords = [{ str: '商品质量问题' }, { str: '物流/商品包装破损' }, { str: '商品与描述不符' }, { str: '少件/漏发' }, { str: '卖家发错货' }, { str: '假冒商品' }, { str: '物流配送服务差' }, { str: '不好吃' }, { str: '其他' }]; //已收到货
var notReceiveWords = [{ str: '物流无跟踪记录' }, { str: '物流时间太久' }, { str: '快件遗失/没收到货' }, { str: '商品问题拒收' }, { str: '其他' }]; //未收到货
var refundWords = [{ str: '不想买了' }, { str: '拍错/多拍' }, { str: '发货慢' }, { str: '未按约定发货' }, { str: '收货信息有误' }, { str: '收货地址不到' }, { str: '活动降价' }, { str: '缺货' }, { str: '不方便收货' }, { str: '其他' }]; //申请退款
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageList: [],
    tap1: true,
    tap2: false,
    wordsList: notReceiveWords,
    isRefund: false,
    maxMoney: '',
    refundAmount: '',
    description: '',
    orderId: '',
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl,
    cannotSubmit: false, //用来防止重复点申请的标识
    phoneNumber: '',
    loadComplete: false,
    loadFail: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.data.isRefund = options.isRefund == 'true';
    that.data.orderId = options.orderId;
    // 初始化要上传的图片变量
    that.setData({
      imageList: []
    })
    if (that.data.isRefund) {
      that.data.wordsList = refundWords;

    }

    for(var i = 0; i < that.data.wordsList.length; i++){
      that.data.wordsList[i].taped = false;
    }

    that.setData({
      isRefund: that.data.isRefund,
      wordsList: that.data.wordsList
    });

    // util.getNetworkType(that);

    sendRequest.send(constants.InterfaceUrl.GET_REFUND_MONEYV2, { orderId: that.data.orderId }, function (res) {

      if (that.data.isRefund) {
        that.data.refundAmount = res.data.result.maxRefundPrice;
      }
      // 购物返现和余额抵扣只接受全额退款
      if (res.data.result.balanceDeduction || res.data.result.cashback) {
        that.setData({
          allBack: true,
          refundAmount: res.data.result.maxRefundPrice
        });
      }
      that.setData({
        maxMoney: res.data.result.maxRefundPrice,
        loadComplete: true,
        loadFail: false
      });
    }, function (res) {
      that.setData({
        loadFail: false
      })
    });
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
    }, function (res) { });
  },
  switchStatus: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    that.data.tap1 = index == 0;
    that.data.tap2 = index == 1;
    if (that.data.tap1) {
      that.data.wordsList = notReceiveWords;
    } else {
      that.data.wordsList = receiveWords;
    }
    that.setData({
      tap1: that.data.tap1,
      tap2: that.data.tap2,
      wordsList: that.data.wordsList
    });
  },

  submitTap: function (e) {
    var formId = e.detail.formId;
    var that = this;
    var gooodsStatus = '';
    that.setData({
      cannotSubmit: true
    });
    if (!that.data.isRefund) {
      gooodsStatus = that.data.tap1 ? '未收到商品' : '已收到商品';
    } else {
      gooodsStatus = '未收到商品';
    }
    var applyCause = '';
    that.data.wordsList.forEach(function (v, i, arr) {
      if (v.taped) {
        applyCause = v.str;
      }
    });
    if (!applyCause) {
      my.showToast({
        content: '请选择申请原因',
        complete: function () {
          that.setData({
            cannotSubmit: false
          });
        }
      });
      return;
    }
    if (!that.data.refundAmount) {
      my.showToast({
        content: '请输入金额',
        complete: function () {
          that.setData({
            cannotSubmit: false
          });
        }
      });
      return;
    }
    if (!that.data.refundAmount) {
      my.showToast({
        content: '金额不能为空',
        complete: function () {
          that.setData({
            cannotSubmit: false
          });
        }
      });
      return;
    }
    if (that.data.phoneNumber.length != 11) {
      my.showToast({
        content: '手机号需要11位',
        complete: function () {
          that.setData({
            cannotSubmit: false
          });
        }
      });
      return;
    }

    if (that.data.description.length < 10 || that.data.description.length > 200) {
      my.showToast({
        content: '请输入10-200字描述',
        complete: function () {
          that.setData({
            cannotSubmit: false
          });
        }
      });

      return;
    }

    my.showLoading({
      content: '加载中'
    });
    // 处理上传图片数据，只能转为字符串
    var imageList = that.data.imageList;
    imageList = imageList.join(',');
    var data = {
      orderId: that.data.orderId,
      goodsStatus: gooodsStatus,
      applyCause: applyCause,
      contactNumber: that.data.phoneNumber,
      description: that.data.description,
      isRefund: that.data.isRefund,
      fileCode: imageList,
      refundAmount: that.data.refundAmount,
      formId: formId
    };
    sendRequest.send(constants.InterfaceUrl.AFTER_SALE, data, function (res) {
      my.hideLoading();

      that.setData({
        cannotSubmit: false
      });
      my.showToast({
        content: '申请成功'
      });
      my.navigateBack({});
    }, function (res) {
      my.hideLoading();

      that.setData({
        cannotSubmit: false
      });
      // wx.showToast({
      //   title: res,
      // })
      that.setData({
        showToast: true,
        showToastMes: res
      });
      setTimeout(function () {
        that.setData({
          showToast: false
        });
      }, 2000);

      // wx.hideLoading()
    });
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
  phoneInput: function (e) {
    this.data.phoneNumber = e.detail.value;
  },
  phoneBlur: function (e) {
    var that = this;
    if (e.detail.value.length != 11) {
      my.showToast({
        content: '手机号需要11位',

        complete() { }

      });
      // }else {
      //   that.setData({
      //     cannotSubmit: false
      //   })
    }
  },
  refundInput: function (e) {
    this.data.refundAmount = e.detail.value;
  },
  // refundBlur: function (e) {
  //   if (e.detail.value * 1 > this.data.maxMoney * 1) {
  //     my.showToast({
  //       content: '输入的金额过大',
  //     }) 
  //   }
  // },
  descInput: function (e) {
    this.data.description = e.detail.value;
  },
  descBlur: function (e) {
    var that = this;
    if (e.detail.value.length < 10 || e.detail.value.length > 200) {
      my.showToast({
        content: '请输入10-200字'
      });
      // }else {
      //   that.setData({
      //     cannotSubmit: false
      //   })
    }
  }

});