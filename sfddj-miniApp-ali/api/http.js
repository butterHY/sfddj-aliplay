// var _myShim = require('....my.shim');
/** 
* 网络请求基类
* @author 01368384
*/
import api from '/api/api';
let stringUtils = require('../utils/stringUtils');
let constants = require('../utils/constants');
let util = require('../utils/util');
let baseUrl = api.baseUrl;

// let ERR_CODE = constants.errorCode;
let ERR_CODE = {
	SUCCESS: '0', //成功
	RE_LOGIN: '00100', //需要登录
	BIND_PHONE: '00128', //绑定手机 
};


let version1 = "2.0"; //每一版的版本号
function post(url, data, sucFunc, errFunc, header = {}) {
	let token = ''
	try {
		token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data ? my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data : '';

	} catch (e) { }

	let headers = {
		"token": token,
		"content-type": "application/x-www-form-urlencoded",
		"client-channel": "alipay-miniprogram"
	}
	headers = Object.assign(headers, header);
	let options = {
		url: url.indexOf('https:') == 0 ? url : constants.UrlConstants.baseUrlOnly + url,
		method: 'POST',
		data: data,
		headers: headers,
		success: function (res) {
			if (res.status == 200) {
				let retCode = res.data.ret ? res.data.ret.code : '';  

				if (retCode == ERR_CODE.SUCCESS) {
					sucFunc(res);
				} else if (retCode == ERR_CODE.RE_LOGIN) {

					// my.showLoading({
					//   content: '登录中',
					//   mask: true
					// });

					util.login(function () {
						my.hideLoading();

						post(url, data, sucFunc, errFunc, header);
					}, function () {
						my.hideLoading();

						// my.showToast({
						//   content: '登录失败'
						// });
					});
				} else if (retCode == ERR_CODE.BIND_PHONE) {
					// errFunc(res.data.ret.message);
					if (errFunc) {
						let _msg = '';
						res.data.ret ? _msg = res.data.ret.message : _msg = res;
						errFunc(_msg);
					}

					if (url != '/coupon/exchangeCoupon') {
						my.redirectTo({
							url: '/pages/user/bindPhone/bindPhone'
						});
					} else {
						return;
					}
				} 
				// 高德地图 
				else if (res.data.infocode == '10000') {
					sucFunc(res);
				}
				else {
					// errFunc(res.data.ret.message);
					if (errFunc) {
						let _msg = '';
						res.data.ret ? _msg = res.data.ret.message : _msg = res;
						errFunc(_msg);
					}
				}
			} else {
				if (errFunc) errFunc('请求错误，请重试');
			}
		},
		fail: function (err) {
			switch (err.status) {
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
				default: if (errFunc) errFunc('请求错误，请重试');
			}
		}
	}
	if (my.canIUse('request')) {
		my.request(options);
	}
	else {
		my.httpRequest(options);
	};
}


function get(url, data, sucFunc, errFunc, header = {}) {
	let token = ''
	try {
		token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data ? my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data : '';
	} catch (e) { }

	let headers = {
		"token": token,
		"content-type": "application/x-www-form-urlencoded",
		"client-channel": "alipay-miniprogram"
	}
	headers = Object.assign(headers, header);
	let options = {
		url: url.indexOf('https:') == 0 ? url : constants.UrlConstants.baseUrlOnly + url,
		method: 'GET',
		data: data,
		headers: headers,
		success: function (res) { 
			if (res.status == 200) {
				let retCode = res.data.ret ? res.data.ret.code : ''
				if (retCode == ERR_CODE.SUCCESS) {
					sucFunc(res);
				} else if (retCode == ERR_CODE.RE_LOGIN) {
					// my.showLoading({
					//   content: '登录中',
					//   mask: true
					// });

					util.login(function () {
						my.hideLoading();

						get(url, data, sucFunc, errFunc, header);
					}, function () {
						my.hideLoading();

						// my.showToast({
						//   content: '登录失败'
						// });
					});
				} else if (retCode == ERR_CODE.BIND_PHONE) {
					if (errFunc) {
						let _msg = '';
						res.data.ret ? _msg = res.data.ret.message : _msg = res;
						errFunc(_msg);
					}

					if (url != '/coupon/exchangeCoupon') {
						my.redirectTo({
							url: '/pages/user/bindPhone/bindPhone'
						});
					} else {
						return;
					}
				}
				// 高德地图 
				else if (res.data.infocode == '10000') {
					sucFunc(res);
				}
				else {
					if (errFunc) {
						let _msg = '';
						res.data.ret ? _msg = res.data.ret.message : _msg = res;
						errFunc(_msg);
					}
				}
			} else {
				if (errFunc) errFunc('请求错误，请重试');
			}
		},
		fail: function (err) {
			switch (err.status) {
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
				default: if (errFunc) errFunc('请求错误，请重试');
			}
		}
	}
	if (my.canIUse('request')) {
		my.request(options);
	}
	else {
		my.httpRequest(options);
	};
}

module.exports = {
	post: post,
	get: get,
	api
};