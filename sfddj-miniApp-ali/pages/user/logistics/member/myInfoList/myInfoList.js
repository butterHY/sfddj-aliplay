// var _myShim = require("..........my.shim");
// import WeCropper from '../../../we-cropper/we-cropper.js'
// const device = wx.getSystemInfoSync()
// const width = device.windowWidth
// const height = device.windowHeight - 50
var sendRequest = require("../../../../utils/sendRequest");
var constants = require("../../../../utils/constants");
var utils = require("../../../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadComplete: false,
    baseImgUrl: constants.UrlConstants.baseImageUrl,
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl,
    nickName: '',
    sexual: 0,
    loadComplete: false,
    loadFail: false
    // cropperOpt: {
    //   id: 'cropper',
    //   width,
    //   height,
    //   scale: 2.5,
    //   zoom: 8,
    //   cut: {
    //     x: (width - 300) / 2,
    //     y: (height - 300) / 2,
    //     width: 300,
    //     height: 300
    //   }
    // },
    // newCanvas: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // utils.getNetworkType(that)
    that.getMemberInfo();
    // const { cropperOpt } = this.data
    // that.newCropper(cropperOpt)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  // 获取客户信息
  getMemberInfo: function () {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.POST_MEMBER_INFOLIST, {}, function (res) {
      that.setData({
        loadComplete: true,
        result: res.data.result,
        gender: res.data.result.gender,
        userName: res.data.result.userName,
        nickName: res.data.result.userName,
        birthday: res.data.result.birthday,
        loadComplete: true,
        loadFail: false
      });
    }, function (err) {
      that.setData({
        loadFail: false
      })
    }, 'POST');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 清除输入框文字
   */
  clearInput: function () {
    var that = this;
    var nickName = that.data.nickName;
    nickName = '';
    that.setData({
      nickName: nickName
    });
  },

  // 输入昵称改变变量
  changeNickNameFn: function (e) {
    var that = this;
    var nickName = that.data.nickName;
    nickName = e.detail.value;
    that.setData({
      nickName: nickName
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },

  changeFn: function (e) {
    var that = this;
    var showName = e.currentTarget.dataset.showname;
    if (showName == 'showChangeNickName') {
      that.setData({
        showChangeNickName: true
      });
    } else if (showName == 'showChangeSexual') {
      that.setData({
        showChangeSexual: true
      });
    }
  },

  // 点击改变性别的确定按钮
  closeSexualChoose: function () {
    var that = this;
    sendRequest.send(constants.InterfaceUrl.POST_SAVEGENDER, { gender: that.data.gender }, function (res) {
      that.setData({
        showChangeSexual: false
      });
      that.getMemberInfo();
    }, function (err) {});
  },

  // 修改昵称时取消按钮
  closeNickNameChoose: function () {
    var that = this;
    // that.getMemberInfo()
    that.setData({
      showChangeNickName: false,
      nickName: that.data.userName
    });
  },

  // 修改昵称时保存按钮
  saveUserName: function () {
    var that = this;
    if (!that.data.nickName) {
      that.setData({
        showToast: true,
        showToastMes: '请输入昵称！'
      });
      setTimeout(function () {
        that.setData({
          showToast: false
        });
      }, 1500);
    } else {
      sendRequest.send(constants.InterfaceUrl.POST_SAVEUSERNAME, { userName: that.data.nickName }, function (res) {
        that.getMemberInfo();
        that.setData({
          showChangeNickName: false
        });
      }, function (err) {}, 'POST');
    }
  },

  // 点击性别
  changeSexual: function (e) {
    var that = this;
    var gender = e.currentTarget.dataset.gender;
    that.setData({
      gender: gender
    });
  },

  // 选择生日
  chooseDate: function (e) {
    // sendRequest.send()
    var that = this;
    var birthday = that.data.birthday;
    birthday = e.detail.value;
    that.setData({
      birthday: birthday
    });

    sendRequest.send(constants.InterfaceUrl.POST_SAVEBIRTHDAY, { birthday: that.data.birthday }, function (res) {
    }, function (err) {}, 'POST');
  },

  /**
   * 裁剪图片的
   * */
  touchStart(e) {
    this.wecropper.touchStart(e);
  },
  touchMove(e) {
    this.wecropper.touchMove(e);
  },
  touchEnd(e) {
    this.wecropper.touchEnd(e);
  },
  getCropperImage() {
    this.wecropper.getCropperImage(src => {
      if (src) {
        my.previewImage({
          current: '',
          urls: [src]
        });
      } else {
      }
    });
  },
  uploadTap() {
    const self = this;

    my.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],

      success(res) {
        const src = res.tempFilePaths[0];
        self.wecropper.pushOrign(src);
        self.setData({
          newCanvas: true
        });
      }

    });
  },

  newCropper: function (cropperOpt) {
    var that = this;
    new WeCropper(cropperOpt).on('ready', ctx => {
    }).on('beforeImageLoad', ctx => {
      my.showToast({
        content: '上传中',
        icon: 'loading',
        duration: 20000
      });
    }).on('imageLoad', ctx => {
      my.hideToast();
    }).on('beforeDraw', (ctx, instance) => {
    }).updateCanvas();
  }

});