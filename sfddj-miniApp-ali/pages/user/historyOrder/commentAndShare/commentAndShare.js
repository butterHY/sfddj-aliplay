// var _myShim = require('..........my.shim');
// pages/user/historyOrder/commentAndShare/commentAndShare.js  
var util = require('../../../../utils/util');
var sendRequest = require('../../../../utils/sendRequest');
var constants = require('../../../../utils/constants');

import http from '../../../../api/http'
import api from '../../../../api/api'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    starList: [{
      select: true,
      starDesc: '非常差'
    }, {
      select: true,
      starDesc: '差'
    }, {
      select: true,
      starDesc: '一般'
    }, {
      select: true,
      starDesc: '好'
    }, {
      select: true,
      starDesc: '非常好'
    }],
    starList2: [{
      select: true,
      starDesc: '非常差'
    }, {
      select: true,
      starDesc: '差'
    }, {
      select: true,
      starDesc: '一般'
    }, {
      select: true,
      starDesc: '好'
    }, {
      select: true,
      starDesc: '非常好'
    }],
    starDesc: '非常好', //商品描述
    starLevel: 5, //商品描述星级
    starDesc2: '非常好', //服务态度描述
    starLevel2: 5, //服务态度描述星级
    imgList: [],
    noName: true,
    goodsDesc: '',
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl,
    loadComplete: false,
    loadFail: false,

    isShowTextarea: true,                                    // 多行文本框显示开关
    isShowRules: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let {goodsPic, orderId, supplierId, goodsSn} = options;
      // util.getNetworkType(this);
      this.getToken(orderId);
      this.getCommentRule();
      this.data.starList.forEach(value => value.select = true);
      this.data.starList2.forEach(value => value.select = true);

      this.setData({
        goodsPic,
        orderId,
        supplierId,
        baseImageUrl: constants.UrlConstants.baseImageUrl,
        goodsSn,
        imgList: [],
        starList: this.data.starList,
        starList2: this.data.starList2
    });
  },

  /*避免重复提交请求*/
  getToken: function (orderId) {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.GET_COMMENT_TOKEN, { orderId: orderId }, function (res) {
      that.setData({
        token: res.data.result.token,
        loadComplete: true,
        loadFail: false
      });
    }, function (res) {
      that.setData({
        loadFail: false
      })
    }, "GET");
  },

  /**
   * 评价内容
   */
  handleInput: function (event) {
    this.data.goodsDesc = event.detail.value;
  },

  /**
   * 选择描述评分
   */
  chooseStar: function (event) {
    var starList = this.data.starList;
    var index = event.currentTarget.dataset.index;
    for (var key in starList) {
      if (key <= index) {
        starList[key].select = true;
      } else {
        starList[key].select = false;
      }
    }
    this.setData({
      starList: starList,
      starDesc: starList[index].starDesc,
      starLevel: index + 1
    });
  },

  /**
   * 选择店铺评分
   */
  chooseStar2: function (event) {
    var starList = this.data.starList2;
    var index = event.currentTarget.dataset.index;
    for (var key in starList) {
      if (key <= index) {
        starList[key].select = true;
      } else {
        starList[key].select = false;
      }
    }
    this.setData({
      starList2: starList,
      starDesc2: starList[index].starDesc,
      starLevel2: index + 1
    });
  },

  /**
   * 上传图片
   */
  uploadImage: function (e) {
    var that = this;
    var imgList = this.data.imgList;
    util.uploadImage(0, function (res) {
      imgList[imgList.length] = res;
      that.setData({
        imgList: imgList,
        baseImageUrl: constants.UrlConstants.baseImageUrl
      });
    }, function (err) {
      my.showToast({
        content: '上传失败，' + err
      });
    });
  },

  /**
   * 删除图片
   */
  delPic: function (event) {
    var index = event.currentTarget.dataset.index;
    var that = this;
    var imgList = this.data.imgList;
    var url = imgList[index];
    my.confirm({
      title: '删除图片',
      content: '是否删除？',
      success: function (res) {
        if (res.confirm) {
          sendRequest.send(constants.InterfaceUrl.DELETE_IMAGE, {
            imgUrl: url
          }, function (res) {
            if (res.data.result.deleteResult) {
              my.showToast({
                content: '删除成功'
              });

              imgList.splice(index, 1);
              that.setData({
                imgList: imgList
              });
            } else {
              my.showToast({
                content: '删除失败，未找到图片'
              });
            }
          }, function (err) {
            my.showToast({
              content: '删除失败，' + err
            });
          });
        }
      }
    });
  },


  /**
   * 获取规则
   */
  getCommentRule() {
    let that = this;
    http.get(api.UPLOADCOMMENT.GETCOMMENTRULE, {}, function (res) {
      let resData = res.data.data;
      let resRet = res.data.ret;
      if (resRet.code == '0' && resRet.message == "SUCCESS" && resData) {
        that.setData({
          rule: resData,
        })
      }
    }, function (err) {
    })
  },

  // 查看规则
  checkRules(){
    this.setData({
      isShowRules: true,
      isShowTextarea: false
    })
  },

  // 关闭规则
  cancelRule(){
    this.setData({
      isShowRules: false,
      isShowTextarea: true
    })
  },

  
  /**
   * 选择是否匿名
   */
  chooseNoName: function () {
    this.setData({
      noName: !this.data.noName
    });
  },

  /**
   * 提交评价
   */
  // submit: function () {
  //   var that = this;
  //   var goodsDesc = that.data.goodsDesc;
  //   var imgList = that.data.imgList;
  //   // 要选将数组传成字符串，不能按数组传过去，只会识别到一张
  //   imgList = imgList.join(',');
  //   if (goodsDesc.trim().length < 5) {
  //     that.setData({
  //       showToast: true
  //     });
  //     setTimeout(function () {
  //       that.setData({
  //         showToast: false
  //       });
  //     }, 1500);
  //   } else {
  //     sendRequest.send(constants.InterfaceUrl.SAVE_COMMENTV2, {
  //       orderId: that.data.orderId,
  //       supplierId: that.data.supplierId,
  //       star: that.data.starLevel,
  //       serviceStar: that.data.starLevel2,
  //       fileCode: imgList,
  //       noName: that.data.noName,
  //       comment: that.data.goodsDesc,
  //       channelSource: 'MINIAPP',
  //       token: that.data.token
  //     }, function (res) {

	// 	//   达观上报
	// 	// util.uploadClickData_da('comment',[{goodsSn: that.data.goodsSn}])

  //       my.confirm({
  //         title: '评价成功',
  //         content: '您的评价已经提交成功，感谢您的反馈！',
  //         showCancel: false,
  //         success: function (res) {
  //           my.navigateBack({});
  //         }

  //       });
  //     }, function (err) {

  //     });
  //   }
  // },

  submit: function () {
    let that = this
    let goodsDesc = that.data.goodsDesc
    // let videoUrl = '';
    // let imgUrl = '';
    let data = {
      orderId: that.data.orderId,
      star: that.data.starLevel,
      serviceStar: that.data.starLevel2,
      noName: that.data.noName,
      comment: that.data.goodsDesc,
      type: 0
    };

    if (this.data.imgList.length == 0) {                  // 没有图片且没有视频
      data.type = 0;
    } else if  (this.data.imgList.length > 0) {            // 没有视频但有图片
      data.type = 1;
      data.voucher = this.data.imgList.join(',');
    }


    if (goodsDesc.trim().length < 5) {
      that.setData({
        showToast: true
      })
      setTimeout(function () {
        that.setData({
          showToast: false
        })
      }, 1500)
    } else {
      http.post(api.UPLOADCOMMENT.SAVECOMMENt, data, function (res) {
        my.confirm({
          title: '评价成功',
          content: '您的评价已经提交成功，感谢您的反馈！',
          showCancel: false,
          success: function (res) {
            my.navigateBack();
          }

        });
      }, function (err) {
      })
    }
  }


  
});