// var _myShim = require('........my.shim');
/**
* 绑定手机号
* @author 01368384
*/
var constants = require('../../../utils/constants');
var sendRequest = require('../../../utils/sendRequest');

Page({
	data: {
		phoneNumber: '',
		authNumber: '',
		disabled: false,
		sendCodeText: '发送验证码',
		baseImgLocUrl: constants.UrlConstants.baseImageLocUrl
	},
	onLoad: function(options) {
		var that = this;
		if (options.dataType == 'change') {
			that.setData({
				sendCodeUrl: constants.InterfaceUrl.USER_CHANGE_SENDCODE,
				bingPhoneUrl: constants.InterfaceUrl.USER_CHANGE_BINGMOBILE,
				showType: options.dataType
			});
		} else {
			that.setData({
				sendCodeUrl: constants.InterfaceUrl.USER_SEND_CODE,
				bingPhoneUrl: constants.InterfaceUrl.USER_BINGMOBILE2
			});
		}
	},

	phoneInput: function(e) {
		this.data.phoneNumber = e.detail.value;
	},
	authInput: function(e) {
		this.data.authNumber = e.detail.value;
	},
	sendCode: function(e) {
		if (this.data.phoneNumber.length != 11) {
			my.showToast({
				content: '请输入11位手机号'
			});
			return;
		}
		var time = 60;
		var that = this;
		// var interval = setInterval(function () {
		//   that.setData({
		//     sendCodeText: time + 's',
		//     disabled: true
		//   })
		//   if (time > 0) {
		//     time = time - 1;
		//   } else {
		//     clearInterval(interval)
		//     that.setData({
		//       sendCodeText: '发送验证码',
		//       disabled: false
		//     })
		//   }
		// }, 1000)
		sendRequest.send(that.data.sendCodeUrl, { mobile: this.data.phoneNumber }, function(res) {
			my.showToast({
				content: '验证码发送成功'
			});
			// 把倒计时放在里面，当已绑定过的手机号不进行倒计时
			var interval = setInterval(function() {
				that.setData({
					sendCodeText: time + 's',
					disabled: true
				});
				if (time > 0) {
					time = time - 1;
				} else {
					clearInterval(interval);
					that.setData({
						sendCodeText: '发送验证码',
						disabled: false
					});
				}
			}, 1000);
		}, function(res) {
			my.showToast({
				content: res
			});
		});
	},

	bindPhone: function(e) {
		var that = this;
		if (this.data.phoneNumber.length != 11) {
			my.showToast({
				content: '请输入11位手机号'
			});
			return;
		}
		if (this.data.authNumber.length != 6) {
			my.showToast({
				content: '请输入6位验证码'
			});
			return;
		}
		sendRequest.send(that.data.bingPhoneUrl, { mobile: this.data.phoneNumber, smsCode: this.data.authNumber }, function(res) {
			my.showToast({
				content: '绑定成功'
			});
			try {
				my.setStorageSync({
					key: constants.StorageConstants.tokenKey, // 缓存数据的key
					data: res.data.result.loginToken, // 要缓存的数据
				});
				my.setStorageSync({ key: 'user_memId', data: res.data.result.memberId });

				// my.setStorageSync({ key: 'ddj_memId', data: res.data.result.memberId });
				// my.setStorageSync({ key: 'ddj_opId', data: res.data.result.openId });

			} catch (e) {

				my.setStorage({ key: 'user_memId', data: res.data.result.memberId });
			}
			if (that.data.showType == 'change') {
				try {
					my.setStorageSync({
						key: constants.StorageConstants.myPhone, // 缓存数据的key
						data: res.data.result.mobile, // 要缓存的数据
					});
				} catch (e) { }
				my.navigateBack();
			} else {
				// if (res.data.result.couponSign) {
				//   that.getCouponListByCouponSign(res.data.result.couponSign);
				//   return;
				// }
				my.navigateBack();
			}
		}, function(res) {
			my.showToast({
				content: res
			});
		});
	},

	/**
	 * 通过兑换码兑换优惠券
	 */
	getCouponListByCouponSign: function(couponSign) {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.EXCHANGE_COUPON, {
			ruleSign: couponSign
		}, function(res) {
			// var couponList = res.data.result
			// couponList.forEach(function (item, index) {
			//   item.beginDateStr = that.formatTime(item.beginDate)
			//   item.endDateStr = that.formatTime(item.endDate)
			// })
			// that.setData({
			//   couponList: couponList,
			//   showDialog2: couponList.length > 1 ? false : true,
			//   showDialog3: couponList.length > 1 ? true : false
			// })
			that.setData({
				// showDialog3: false,
				showToast: true,
				showToastMes: res.data.result[0].errMsg ? res.data.result[0].errMsg : '领取成功！'
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
				my.navigateBack();
			}, 2000);
		}, function(err) {
			that.setData({
				// showDialog3: false,
				showToast: true,
				showToastMes: err
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
				my.navigateBack();
			}, 2000);

			// wx.showToast({
			//   title: err,
			// })
		});
	},

	/**
	 * 打开协议遮罩层
	 * */
	openMark: function() {
		this.setData({
			showToastDet: true
		});
	},

	/**
	 * 关闭协议遮罩层
	 * */
	closeMark: function() {
		this.setData({
			showToastDet: false
		});
	}

});