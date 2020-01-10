// var _myShim = require('..........my.shim');
// pages/user/historyOrder/commentAndShare/commentAndShare.js  
var util = require('../../../../utils/util');
var sendRequest = require('../../../../utils/sendRequest');
var constants = require('../../../../utils/constants');
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
    loadFail: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var goodsPic = options.goodsPic;
    // var orderId = options.orderId;
    // var supplierId = options.supplierId;
	let {goodsPic, orderId, supplierId, goodsSn} = options;
    // util.getNetworkType(this);
    this.getToken(orderId);
    this.setData({
      goodsPic: goodsPic,
      orderId: orderId,
      supplierId: supplierId,
      baseImageUrl: constants.UrlConstants.baseImageUrl,
	  goodsSn: goodsSn,
      imgList: [],       //初始化图片列表
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
    console.log(this.data.goodsDesc)
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
  submit: function () {
    var that = this;
    var goodsDesc = that.data.goodsDesc;
    var imgList = that.data.imgList;
    // 要选将数组传成字符串，不能按数组传过去，只会识别到一张
    imgList = imgList.join(',');
    if (goodsDesc.trim().length < 5) {
      that.setData({
        showToast: true
      });
      setTimeout(function () {
        that.setData({
          showToast: false
        });
      }, 1500);
    } else {
      sendRequest.send(constants.InterfaceUrl.SAVE_COMMENTV2, {
        orderId: that.data.orderId,
        supplierId: that.data.supplierId,
        star: that.data.starLevel,
        serviceStar: that.data.starLevel2,
        fileCode: imgList,
        noName: that.data.noName,
        comment: that.data.goodsDesc,
        channelSource: 'MINIAPP',
        token: that.data.token
      }, function (res) {

		//   达观上报
		// util.uploadClickData_da('comment',[{goodsSn: that.data.goodsSn}])

        my.confirm({
          title: '评价成功',
          content: '您的评价已经提交成功，感谢您的反馈！',
          showCancel: false,
          success: function (res) {
            my.navigateBack({});
          }

        });
      }, function (err) {

      });
    }
  },

  checkRules(){
    let screenWidth = getApp().globalData.systemInfo.screenWidth;
    console.log(screenWidth)
  },


  
});