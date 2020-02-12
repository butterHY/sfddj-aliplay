// var _myShim = require('....my.shim');
/**
* 通用工具类
* @author 01368384，854638
*/
var constants = require('./constants');
var CryptoJS = require('./crypto-js');

const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('-');
};

const pointFormatTime = millSec => {
  var date = new Date(millSec);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var date = date.getDate();
  var monthStr = month < 10 ? '0' + month : month;
  var dateStr = date < 10 ? '0' + date : date;
  return year + '.' + monthStr + '.' + dateStr;
}

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const px2Rpx = px => {
  var screenWidth = getApp().globalData.systemInfo.screenWidth;
  var factor = 750 / screenWidth;
  return factor * px;
};
/**
 * 鉴权方法封装
 */
function login(suc, fail) {
  // 登录
  my.getAuthCode({
    scopes: 'auth_base',
    success: res => {
      ;
      var jsCode = res.authCode;
      my.httpRequest({
        url: constants.UrlConstants.baseUrl + constants.InterfaceUrl.ALI_LOGIN_AUTH,
        method: 'POST',
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "client-channel": "alipay-miniprogram"
        },
        data: {
          authCode: jsCode
        },
        success: function(res) {
          if (res.data.errorCode == '0001') {
            my.setStorageSync({ key: constants.StorageConstants.tokenKey, data: res.data.result.loginToken });

            my.setStorageSync({ key: 'user_memId', data: res.data.result.memberId });
            if (suc) {
              suc();
            }
          } else {
            if (fail) {
              fail(res.data.errorCode);
            }
          }
        }
      });
    },
    fail: err => {
      my.switchTab({
        url: '/pages/home/home', // 跳转的 tabBar 页面的路径（需在 app.json 的 tabBar 字段定义的页面）。注意：路径后不能带参数
        success: (res) => {

        },
      });
    }
  });
}

function tapToAuthorize() {
  //再授权
  my.opensetting({
    success: res => {
      if (res.authSetting["scope.userInfo"] === true) {
        var that = this;
        app.getUserInfo(function(userInfo) {
          that.setData({
            userInfo: userInfo,
            noAuthorized: false
          });
        });
      } else {
        my.confirm({
          title: '用户未授权',
          content: '如需正常使用小程序，请点击授权按钮，勾选用户信息并点击确定。',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
            }
          }
        });
      }
    }
  });
}
/**
 * 上传图片功能
 * @param pathType  2：闪赔preRefund ，1：普通售后workOrderVoucher， 0：评价晒图commentVoucher
 * @param suc
 * @param fail
 */
function uploadImage(pathType, suc, fail) {
  var that = this;
  my.chooseImage({
    count: 1,
    success: function(res) {
      var imageArr = res.apFilePaths;

      _upLoadImage(imageArr[0], pathType, suc, fail);
    },
    fail: function(res) {
      if (fail) fail('取消上传');
    }
  });
}

function _upLoadImage(image, pathType, suc, fail) {
  try {
    var token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data;
    var path = '';
    switch (pathType) {
      default:
      case 0:
        path = 'commentVoucher';
        break;
      case 1:
        path = 'workOrderVoucher';
        break;
      case 2:
        path = 'preRefund';
        break;
    }
    my.showLoading({
      content: '上传中',
      mask: true
    });
    my.uploadFile({
      url: constants.UrlConstants.baseUrl + constants.InterfaceUrl.UPLOAD_IMG,
      filePath: image,
      fileType: 'image',
      fileName: 'file',
      header: {
        "logintoken": token
      },
      formData: {
        "path": path
      },
      name: 'file',
      success: function(res) {

        my.hideLoading();

        var data = JSON.parse(res.data);

        if (data.errorCode == '0001') {
          if (suc) suc(data.result.imageUrl);
        } else {
          if (fail) fail('上传失败');
        }
      },
      fail: function(res) {

        my.hideLoading();

        fail('上传失败');
      }
    });
  } catch (e) { }
}

const rpx2Px = rpx => {
  var screenWidth = getApp().globalData.systemInfo.screenWidth;
  var factor = screenWidth / 750;
  return factor * rpx;
};

/**
 * 设置界面广告data
 */
function setAdInfo(opitons) {
  try {
    const app = getApp();
    app.globalData.adInfo.gdt_vid = opitons.gdt_vid ? opitons.gdt_vid : '';
    app.globalData.adInfo.weixinadinfo = opitons.weixinadinfo ? opitons.weixinadinfo : '';
    // if()
    app.globalData.adInfo.aid = opitons.aid ? opitons.aid : '';
  } catch (e) {
  }
}

function setAdInfoAll(options) {
  // try {
  const app = getApp();
  if (!app.globalData.adInfo.gdt_vid && !app.globalData.adInfo.weixinadinfo) {
    app.globalData.adInfo.gdt_vid = options.gdt_vid ? options.gdt_vid : '';
    app.globalData.adInfo.weixinadinfo = options.weixinadinfo ? options.weixinadinfo : '';
    if (options.weixinadinfo) {
      var weixinadinfoArr = options.weixinadinfo.split('.');
      var aid = weixinadinfoArr[0];
    }
    app.globalData.adInfo.aid = aid ? aid : '';
  } else {
    return;
  }

  // } catch (e) {
  // }
}

/**
 * 加密身份证
 * */
function Encrypt(word) {
  var strInfo = "0102030405060708";
  var key = CryptoJS.enc.Utf8.parse(strInfo);
  var iv = CryptoJS.enc.Utf8.parse(strInfo);
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC
  });
  return encrypted.toString();
}

// 通过正则验证邮箱是否有效
function validateEmail(email) {
  // var reg = new RegExp('^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$')
  var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //正则表达式
  return reg.test(email);
}

function getNetworkType(obj) {
  my.getNetworkType({
    success: (res) => {
      obj.setData({
        wifiAvailable: res.networkAvailable
      })
    }
  });
}

// 上报达观数据
function uploadClickData_da(actionType, otherData) {
  let uploadData = { data: [] };
  uploadData.data = Object.assign(uploadData.data, da_upload_data(actionType, otherData))
  uploadData.data = typeof uploadData.data != 'string' ? JSON.stringify(uploadData.data) : uploadData.data

  // console.log('daguan_upload---' + actionType, uploadData);

  my.request({
    url: constants.UrlConstants.baseUrlOnly + constants.InterfaceUrl.da_collect.useraction_collect,
    method: 'GET',
    data: uploadData,
    success: (res) => {
    },
    fail: (err) => { }
  });
}

// 返回上报的数据的数据
function da_upload_data(actionType, otherData) {
  // let oneDataObj = {
  //   cmd: 'add',
  //   fields: {}
  // }
  let allData_da = [];
  let fields = Object.assign({}, { timestamp: new Date().getTime(), actionType: actionType, channelSource: 'ALI_MINI_APP' });
  let getGuid, memberId, openId = ''
  try {
    getGuid = my.getStorageSync({ key: 'ddj_guid' }).data;
    memberId = my.getStorageSync({ key: 'ddj_memId' }).data;
    openId = my.getStorageSync({ key: 'ddj_opId' }).data
  } catch (e) { }
  // 获取cid
  if (!getGuid || getGuid == undefined) {
    fields.cid = guid();
    try {
      my.setStorage({ key: 'ddj_guid', data: fields.cid });
    } catch (e) { }
  } else {
    fields = Object.assign(fields, { cid: getGuid })
  }

  // 获取memberId
  if (!memberId || memberId == undefined) {
    // memberId = ''
  }
  else {
    fields = Object.assign(fields, { memberId: memberId })
  }

  // 获取openid
  if (!openId || openId == undefined) {
    // openId = ''
  }
  else {
    fields = Object.assign(fields, { openId: openId })
  }

  for (let i = 0; i < otherData.length; i++) {
    // allData_da.push()
    let newFields = Object.assign({}, fields, otherData[i])
    let oneDataObj = Object.assign({}, { cmd: 'add' }, { fields: newFields })
    allData_da.push(oneDataObj)
  }

  // oneDataObj.fields = Object.assign({
  //   actionType: actionType,
  //   cid: getGuid,
  //   timestamp: new Date().getTime()
  // }, oneDataObj.fields, otherData)

  return allData_da
}

function getCid() {
  let getGuid = ''
  try {
    getGuid = my.getStorageSync({ key: 'ddj_guid' }).data;
  } catch (e) { }
  // 获取cid
  if (!getGuid || getGuid == undefined) {
    getGuid = guid();
    try {
      my.setStorage({ key: 'ddj_guid', data: getGuid });
    } catch (e) { }
  } 
  return getGuid
}

function da_upload_dataOld(actionType, otherData) {
  let oneDataObj = { cmd: 'add', fields: {} }
  let getGuid = my.getStorageSync({ key: 'ddj_guid' }).data;
  // 获取cid
  if (!getGuid || getGuid == undefined) {
    oneDataObj.fields.cid = guid();
    try {
      my.setStorage({
        key: 'ddj_guid',
        data: oneDataObj.fields.cid
      });
    } catch (e) { }
  }
  else {
    oneDataObj.fields.cid = getGuid
  }

  oneDataObj.fields = Object.assign({ actionType: actionType, cid: getGuid, timestamp: new Date().getTime() }, oneDataObj.fields, otherData)

  return oneDataObj
}

// guid 设置
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

module.exports = {
  formatTime: formatTime,
  pointFormatTime,
  px2Rpx: px2Rpx,
  rpx2Px: rpx2Px,
  login: login,
  uploadImage: uploadImage,
  setAdInfo: setAdInfo,
  setAdInfoAll: setAdInfoAll,
  Encrypt: Encrypt,
  validateEmail: validateEmail,
  getNetworkType: getNetworkType,
  uploadClickData_da,
  guid,
  da_upload_data,
  getCid
};