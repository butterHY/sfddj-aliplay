// var _myShim = require('....my.shim');
/** 
* 网络请求基类
* @author 01368384
*/
var stringUtils = require('../utils/stringUtils');
var constants = require('../utils/constants');
var util = require('../utils/util');
var baseUrl = constants.UrlConstants.baseUrl;
var ERR_CODE = constants.errorCode;
var version1 = "2.0"; //每一版的版本号
function send(url, data, sucFunc, errFunc, method, preType, contentType, loginToken) {
  baseUrl = preType == true || preType == 'true' ? constants.UrlConstants.baseUrlApp : constants.UrlConstants.baseUrl;
  try {
    var token = my.getStorageSync({key: constants.StorageConstants.tokenKey}).data ? my.getStorageSync({key: constants.StorageConstants.tokenKey}).data : '';
    my.httpRequest({
      url: baseUrl + url,
      method: method ? method : 'POST',
      data: data,
      headers: {
        "loginToken": token,
        "content-type": contentType ? contentType : "application/x-www-form-urlencoded",
        "client-channel": "alipay-miniprogram"
      },
      success: function (res) {
        if (res.status == 200) {
          var errorCode = res.data.errorCode;

          if (errorCode == ERR_CODE.SUCCESS || errorCode == ERR_CODE.NEED_SHOW_DIALOG || errorCode == ERR_CODE.NOT_SHOW_DIALOG) {
            sucFunc(res);
          } else if (errorCode == ERR_CODE.RE_LOGIN) {

            // my.showLoading({
            //   content: '登录中',
            //   mask: true
            // });

            util.login(function () {
              my.hideLoading();

              send(url, data, sucFunc, errFunc, method, contentType);
            }, function () {
              my.hideLoading();

              // my.showToast({
              //   content: '登录失败'
              // });
            });
          } else if (errorCode == ERR_CODE.BIND_PHONE) {
            errFunc(res.data.message);

            if (url != '/coupon/exchangeCoupon') {
              my.redirectTo({
                url: '/pages/user/bindPhone/bindPhone'
              });
            } else {
              return;
            }
          } else {
            errFunc(res.data.message,res.data);
          }
        } else {
          errFunc('请求错误，请重试');
        }
      },
      fail: function (err) {
        switch(err.status){
          case 429://服务器限流
            my.redirectTo({
              url: '/pages/limit/limit'
            })
          break;
          case 504:
            my.redirectTo({
              url: '/pages/overTime/overTime'
            })
            
          break;
          default:errFunc('请求错误，请重试');
        }
      }
    });
  } catch (e) {}
}

module.exports = {
  send: send
};