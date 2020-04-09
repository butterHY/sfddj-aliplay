// pages/user/historyOrder/orderDetail/reUploadId/reUploadId.js

var constants = require('../../../../../utils/constants.js');
var sendRequest = require('../../../../../utils/sendRequest.js');
var utils = require('../../../../../utils/util.js');
import http from '../../../../../api/http.js';
import api from '../../../../../api/api.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: constants.UrlConstants.baseImageUrl,
    exampleImgArr: ['https://img.sfddj.com/miniappImg/more/photo_opposite_large.png', 'https://img.sfddj.com/miniappImg/more/photo_positive_large.png'], //身份证示例大图
    timeOut: null,
    width: 317, //宽度
    height: 200, //高度
    idNum: '',
    idCardNo: '',
    idCardImgPath: '',
    idCardImgPathArr: [],
    orderSn: '',
    idCardImgFront: '',
    idCardImgBack: '',
    idCardImgArr: [],
    userName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    let idCardImgPathArr = options.idCardImgPath.split(',');
    let idCardImgPath = options.idCardImgPath ? options.idCardImgPath : '';
    // that.data.orderSn = options.orderSn;
    let idCardImgArr = ['', ''];
    for (var i = 0; i < idCardImgPathArr.length; i++) {
      var item = idCardImgPathArr[i];
      idCardImgArr[i] = that.data.baseImageUrl + item;
    }
    that.setData({
      idNum: options.idCardNo ? options.idCardNo : '',
      idCardNo: options.idCardNo ? options.idCardNo : '',
      idCardImgPath: idCardImgPath,
      idCardImgPathArr: idCardImgPathArr,
      orderSn: options.orderSn ? options.orderSn : '',
      idCardImgFront: idCardImgPathArr[0],
      idCardImgBack: idCardImgPathArr[1],
      idCardImgArr: idCardImgArr,
      userName: options.userName ? options.userName : ''
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  // 点击预览示例图
  previewExample(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    my.previewImage({
      current: index,
      urls: that.data.exampleImgArr
    })
  },

  // 组件
  loadImg(e) {
    var that = this;
    var $width = e.detail.width,
      $height = e.detail.height,
      ratio = $width / $height,
      imgWidth = 117 * ratio
    imgWidth = imgWidth > 185 ? 185 : imgWidth;
    if (e.target.dataset.index == 0) {
      that.setData({
        imgWidth0: imgWidth
      })
    } else {
      that.setData({
        imgWidth1: imgWidth
      })
    }


  },

  // 上传图片
  chooseImg(e) {
    var that = this;
    var index = e.currentTarget.dataset.type * 1;
    that.setData({
      idCardIndex: index
    })
    my.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var result = res;
        my.showLoading({
          title: '上传中'
        })

        let tempFile = res.tempFilePaths[0];
        let category = index == 0 ? 'front' : 'reverse';
        my.showLoading({
          title: '图片上传中...',
        })

        that.upLoadImg(res, index);

        // that.cropper.pushOrign(result.tempFilePaths[0]);

        // that.setData({
        //   uploadIdPic: true,
        //   src: result.tempFilePaths[0]
        // })

        // //获取到image-cropper对象
        // that.cropper = that.selectComponent("#image-cropper");

      },
      fail(err) {
        my.hideLoading()
        // that.setData({
        //   showToastMes: index == 0 ? '上传身份证正面失败' : '上传身份证反面失败',
        //   showToast: true
        // })
        // setTimeout(function() {
        //   that.setData({
        //     showToast: false
        //   })
        // }, 2000)
      },
      complete(res) {
        // my.showLoading({
        //   title: '上传中'
        // })
      }
    })


  },

   // 上传图片
  upLoadImg(res, index) {
    let that = this;
    let token = ''
    // let category = index == 0 ? 'front' : 'reverse';

    try {
      token = my.getStorageSync({
        key: constants.StorageConstants.tokenKey, // 缓存数据的key
      }).data;
    } catch (e) { }
    let data = {
      category: index == 0 ? 'front' : 'reverse',
      idCardNo: that.data.idNum,
      name: that.data.userName
    }
    my.uploadFile({
      url: constants.UrlConstants.baseUrl + constants.InterfaceUrl.UPLOAD_IDCARDIMGV3, // 开发者服务器地址
      filePath: res.apFilePaths[0], // 要上传文件资源的本地定位符
      fileName: 'file', // 文件名，即对应的 key, 开发者在服务器端通过这个 key 可以获取到文件二进制内容
      fileType: 'image', // 文件类型，image / video / audio
      formData: data,
      header: {
        "loginToken": token
      },
      success: (res) => {
        let data = res.data ? JSON.parse(res.data) : {};
        let showToastMes = index == 0 ? '上传身份证正面失败' : '上传身份证反面失败';
        let setImgName = index == 0 ? 'idCardImgFront' : 'idCardImgBack';
        let setIdImgArr = 'idCardImgArr[' + index + ']';
        // my.hideLoading();

        if (data.errorCode == '0001' && data.result && Object.keys(data.result).length > 0) {
          that.setData({
            [setImgName]: data.result.picUrl,
            [setIdImgArr]: that.data.baseImageUrl + data.result.picUrl
          });
        } else {
          my.showToast({
            content: data.message ? data.message : showToastMes
          })
        }
      },
      fail(err) {
        my.showToast({
          content: err
        })
      }
    })
  },

  // 预览上传的身份证
  preIdCardImg(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    if (that.data.idCardImgArr[index]) {
      my.previewImage({
        current: index,
        urls: that.data.idCardImgArr
      })
    } else {
      var mes = index * 1 == 0 ? '请先上传身份证正面图' : '请先上传身份证反面图';
      that.setData({
        showToast: true,
        showToastMes: mes
      })
      clearTimeout(that.data.timeOut);
      that.data.timeOut = setTimeout(function() {
        that.setData({
          showToast: false
        })
      }, 2000)
      that.setData({
        timeOut: that.data.timeOut
      })
    }

  },
  // 删除上传的身份证图片
  deleteIdCardImg(e) {
    var that = this;
    var index = e.currentTarget.dataset.index * 1;
    that.data.idCardImgArr[index] = '';
    if (index == 0) {
      that.setData({
        idCardImgFront: '',
        idCardImgArr: that.data.idCardImgArr
      })
    } else {
      that.setData({
        idCardImgBack: '',
        idCardImgArr: that.data.idCardImgArr
      })
    }
  },


  /**
   * 阻止事件冒泡
   * */
  preventTouch: function(e) {
    return
  },
  cropperload(e) {},
  loadimage(e) {
    my.hideLoading();
    //重置图片角度、缩放、位置
    this.cropper.imgReset();
  },
  clickcut(e) {
    var tempFile = e.detail.url;
    var that = this;
    var token = '';
    that.setData({
      uploadIdPic: false
    })
    try {
      token = my.getStorageSync(constants.StorageConstants.tokenKey);

    } catch (e) {}
    my.showLoading({
      title: '图片上传中...',
    })
    if (that.data.idCardIndex == 0) {
      my.uploadFile({
        url: constants.UrlConstants.baseUrl + constants.InterfaceUrl.UPLOAD_IDCARDIMG,
        filePath: tempFile,
        header: {
          "loginToken": token,
        },
        name: 'file',
        success(res) {
          var result = JSON.parse(res.data);
          my.hideLoading()
          if (result.status == 'success') {
            that.data.idCardImgArr[that.data.idCardIndex] = that.data.baseImageUrl + result.message;
            that.setData({
              idCardImgFront: result.message,
              idCardImgArr: that.data.idCardImgArr
            })
          } else {
            that.setData({
              showToastMes: '上传身份证正面失败',
              showToast: true
            })
            setTimeout(function() {
              that.setData({
                showToast: false
              })
            }, 2000)
          }
        },
        fail(err) {}
      })
    } else {
      my.uploadFile({
        url: constants.UrlConstants.baseUrl + constants.InterfaceUrl.UPLOAD_IDCARDIMG,
        filePath: tempFile,
        header: {
          "loginToken": token,
        },
        name: 'file',
        success(res) {
          var result = JSON.parse(res.data);
          my.hideLoading()
          if (result.status == 'success') {
            that.data.idCardImgArr[that.data.idCardIndex] = that.data.baseImageUrl + result.message;
            that.setData({
              idCardImgBack: result.message,
              idCardImgPatidCardImgArrhArr: that.data.idCardImgArr
            })
          } else {
            that.setData({
              showToastMes: '上传身份证反面失败',
              showToast: true
            })
            setTimeout(function() {
              that.setData({
                showToast: false
              })
            }, 2000)
          }
        },
        fail(err) {}
      })
    }
    //点击裁剪框阅览图片
    // my.previewImage({
    //   current: e.detail.url, // 当前显示图片的http链接
    //   urls: [e.detail.url] // 需要预览的图片http链接列表
    // })
  },
  cancleCut(e) {
    var that = this;
    that.setData({
      uploadIdPic: e.detail.uploadIdPic
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearTimeout(this.data.timeOut);
  },

  // 取消
  cancleReUpload() {
    var that = this;
    my.navigateBack({})
  },

  // 立即上传
  reUploadFn() {
    var that = this;
    // var token = '';
    // try {
    //   token = my.getStorageSync(constants.StorageConstants.tokenKey);
    // } catch (e) {}

    if (!that.data.idCardImgFront) {
      that.setData({
        showToast: true,
        showToastMes: '请上传身份证正面照'
      })
      clearTimeout(that.data.timeOut);
      that.data.timeOut = setTimeout(function() {
        that.setData({
          showToast: false
        })
        return;
      }, 2000)
    } else if (!that.data.idCardImgBack) {
      that.setData({
        showToast: true,
        showToastMes: '请上传身份证反面照'
      })
      clearTimeout(that.data.timeOut);
      that.data.timeOut = setTimeout(function() {
        that.setData({
          showToast: false
        })
        return;
      }, 2000)
    } else {
      var imagePath = that.data.idCardImgFront + ',' + that.data.idCardImgBack;
      // var data= { orderSn: that.data.orderSn + '', imagePath: imagePath};
      var orderSn = that.data.orderSn.toString();
      // + that.data.orderSn + '&imagePath=' + imagePath
      http.post(api.ORDER.reupload_global_img + '?orderSn=' + orderSn + '&imagePath=' + imagePath, {}, res => {
        that.setData({
          showToast: true,
          showToastMes: '上传成功'
        })
        clearTimeout(that.data.timeOut);
        that.data.timeOut = setTimeout(function() {
          that.setData({
            showToast: false
          })
          my.navigateBack({})
        }, 2000);
      }, err => {
        that.setData({
          showToast: true,
          showToastMes: err
        })
        clearTimeout(that.data.timeOut);
        that.data.timeOut = setTimeout(function () {
          that.setData({
            showToast: false
          })
        }, 2000)
      })
    }



  },

})