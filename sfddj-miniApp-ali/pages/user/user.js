// var _myShim = require('......my.shim');
// pages/user/user.js
var constants = require('../../utils/constants');
var sendRequest = require('../../utils/sendRequest');
var utils = require('../../utils/util');
var app = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		nopayCount: 0,
		payfinishCount: 0,
		shippedCount: 0,
		baseImgUrl: constants.UrlConstants.baseImageUrl,
		myAvatarUrl: '',
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		needGetUserInfo: false,
		isMember: false,
		balance: 0,
		memberPoint: 0,
		loadComplete: false,
		loadFail: false,
		myInfoData: {},
		// circular: true,  //广告位轮播
		// autoplay: true,
		// duration: 500,
		// currentIndex: 0,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
		// this.getMemberInfo();

		// that.judgeAuthorize();

		// 友盟+统计  ----个人中心页浏览
		my.uma.trackEvent('myInfoView');
	},

	bindPhone: function(e) {
		my.navigateTo({
			url: '/pages/user/bindPhone/bindPhone'
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() { },

	// 判断有无授过权
	judgeAuthorize() {
		var that = this;
		my.getSetting({
			success(res) {

				if (res.authSetting["scope.userInfo"] == true) {
					that.setData({
						authorized: true
					});
				}
			},

			fail(err) {
				that.setData({
					authorized: false
				});
			}

		});
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		var that = this;
		// utils.getNetworkType(this);
		that.getMemberInfo();

		// my.getAuthCode({
		//   scopes: 'auth_user',
		//   success: res => {
		//   }
		// })

		that.getCartNumber();
	},

	getMemberInfo: function() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.USER_USERINFO, {}, function(res) {
			// that.getMaterialPic()  //广告位轮播

			that.getMemberWebCall();
			var isMember = true;

			if ('不是会员' == res.data.result.message) {
				isMember = false;
			}
      console.log(isMember)
			try {
				my.setStorageSync({ key: constants.StorageConstants.isMember, data: isMember });
			} catch (e) { }

			// 判断头像图片是否是完整的路径
			var avatarUrl = res.data.result.avatarUrl;
			var httpStr = '';
			if (avatarUrl) {
				avatarUrl = avatarUrl + '';
				httpStr = avatarUrl.substring(0, 4);
			}
			if (httpStr == 'http') {
				avatarUrl = res.data.result.avatarUrl;
			} else if (!avatarUrl) {
				avatarUrl = '';
			} else {
				avatarUrl = that.data.baseImgUrl + res.data.result.avatarUrl;
			}

			that.setData({
				userName: res.data.result.userName ? res.data.result.userName : '',
				mobile: res.data.result.mobile,
				avatarUrl: avatarUrl,
				isMember: isMember,
				memberPoint: res.data.result.memberPoint,
				memberLevel: res.data.result.memberLevel,
				returnQuantity: res.data.result.returnQuantity ? res.data.result.returnQuantity : 0,
				balance: res.data.result.balance ? res.data.result.balance : 0.00,
				loadComplete: true,
				loadFail: false
			});
			if (isMember) {
				sendRequest.send(constants.InterfaceUrl.ORDER_LIST_COUNT, {}, function(res) {
					var result = res.data.result;
					if (result) {
						that.setData({
							nopayCount: result.nopayCount,
							payfinishCount: result.payfinishCount,
							shippedCount: result.shippedCount,
							noCommentCount: result.noCommentCount
						});
					}
				}, function(err) {

				});
			}
		}, function(err) {
			that.setData({
				loadFail: true
			})
		}, "GET");
	},

	/**
	* 获取轮播图资源
	*/
	getMaterialPic: function() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.GET_MATERIALGROUP, { groupName: '个人中心轮播' }, function(res) {
			that.setData({
				material: res.data.result.material
			});
		}, function(err) {
		}, 'GET');
	},

	/**
	 * 获取个人资料接口获取联系客服
	 * */
	getMemberWebCall: function() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.POST_MEMBER_INFOLIST, {}, function(res) {
			let myInfoData = res.data.result ? res.data.result : {}
			that.setData({
				webCallParam: res.data.result.webCallParam ? res.data.result.webCallParam : '',
				myInfoData: myInfoData
			});
		}, function(err) { }, 'POST');
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() { },

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() { },

	/**
	 * 用户点击右上角分享
	 */
	// onShareAppMessage: function () {

	// },

	/**
	 * 去我的账号，可更换号码
	 * */
	goToMyAccount: function(e) {
		var phoneNum = e.currentTarget.dataset.myphone;
		my.navigateTo({
			url: '/pages/user/bindPhone/changePhoneNum/changePhoneNum?myPhone=' + phoneNum
		});
	},

	goToTargetPage: function(e) {
		var that = this;
		var type = e.currentTarget.dataset.type;
      console.log('coupon')
		if (e.currentTarget.dataset.url == '/pages/user/myCoupon/myCoupon') {
			// 友盟+统计--签到页浏览
			this.umaTrackEvent('coupon')
		}

		this.setData({
			goToUrl: e.currentTarget.dataset.url
		});
		if (that.data.isMember || type == 'rightHere') {
			if (that.data.goToUrl != 'pages/user/user') {
				my.navigateTo({
					// url: that.data.goToUrl
          url: `${that.data.goToUrl}?webCallParam=${that.data.webCallParam}`
				});
			} else {
				return;
			}
		}
	},

	// 跳转去h5的优惠券页
	// goToH5Coupon() {
	// 	let url = constants.UrlConstants.baseUrlOnly + '/coupon/couponList'
	// 	let chInfo = constants.UrlConstants.chInfo
	// 	my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
	// },
  
	// 跳转去原生的优惠券页
  goToCoupon() {
    my.navigateTo({ url: './myCoupon/myCoupon' })
  },

	// 获取手机号
	getPhoneNumber: function(e) {
		var that = this;

		my.getPhoneNumber({
			success: (res) => {
				let response = res.response
				sendRequest.send(constants.InterfaceUrl.USER_BINGMOBILEV4, {
					response: response,
				}, function(res) {
					try {
						my.setStorageSync({ key: constants.StorageConstants.tokenKey, data: res.data.result.loginToken });
						my.setStorageSync({ key: 'user_memId', data: res.data.result.memberId });

					} catch (e) {

						my.setStorage({ key: 'user_memId', data: res.data.result.memberId });
					}


					my.showToast({
						content: '绑定成功'
					})
					that.getMemberInfo();
					if (that.data.goToUrl == 'pages/user/user') {
						my.navigateTo({
							url: 'pages/user/user',
							success: function(res) {
								that.getMemberInfo();
							},
							fail: function(res) { }
						});
					} else {
						my.navigateTo({
							url: that.data.goToUrl
						});
					}
				}, function(res) {
					my.showToast({
						content: res
					})

				});
			},
			fail: (res) => {
				my.navigateTo({
					url: '/pages/user/bindPhone/bindPhone'
				});
			},
		});

	},

	// 获取手机号失败
	onAuthError(res) {
		my.navigateTo({
			url: '/pages/user/bindPhone/bindPhone'
		});
	},

	// 获取用户信息，授权 
	getUserInfo: function(e) {
		var detail = e.detail;
		var that = this;
		if (e.detail.errMsg == "getUserInfo:ok") {

			that.setData({
				authorized: true
			});
			my.getAuthCode({
				success: (res) => {

					my.httpRequest({
						url: constants.UrlConstants.baseUrl + constants.InterfaceUrl.LOGIN_AUTH2,
						method: 'POST',
						header: {
							"content-type": "application/x-www-form-urlencoded",
							"client-channel": "alipay-miniprogram"
						},
						data: {
							jscode: res.code,
							rawData: detail.rawData,
							gdt_vid: getApp().globalData.adInfo.gdt_vid,
							weixinadinfo: getApp().globalData.adInfo.weixinadinfo,
							aid: getApp().globalData.adInfo.aid,
							encryptedData: detail.encryptedData,
							iv: detail.iv,
							signature: detail.signature
						},
						success: function(res) {
							if (res.data.errorCode == '0001') {
								try {
									my.setStorageSync({ key: constants.StorageConstants.tokenKey, data: res.data.result.loginToken });
									my.setStorageSync({ key: 'user_memId', data: res.data.result.memberId });
								} catch (e) {

									my.setStorage({ key: 'user_memId', data: res.data.result.memberId });
								}
							} else { }
						}
					});
				}

			});
		}
	},

	// 轮播图改变
	swiperChange: function(e) {
		var current = e.detail.current;
		var that = this;
		// that.setData({
		//   currentIndex: current
		// })
		that.setCurrentIndexFn(current);
	},
	// 手动调currentIndex
	setCurrentIndexFn: function(index) {
		var that = this;
		that.setData({
			currentIndex: index
		});
	},

	/**
	 * 轮播图跳转
	 * */
	goToLink: function(e) {
		var isLink = e.currentTarget.dataset.islink;
		var url = e.currentTarget.dataset.url;
		var goodsSn = e.currentTarget.dataset.goodssn;
		var urlInclude = ["shop/goods/view", "GroupBuying/goods"];

		if (isLink) {
			if (url) {
				if (url.indexOf(urlInclude[0]) != -1) {
					// goodsSn = 
					var index = url.lastIndexOf("\/");
					goodsSn = url.substring(index + 1, index + 15);
					my.navigateTo({
						url: '/pages/shopping/goodsDetail/goodsDetail?goodsSn=' + goodsSn
					});
				} else if (url.indexOf(urlInclude[1]) != -1) {
					var index = url.lastIndexOf("\/");
					goodsSn = url.substring(index + 1, index + 15);
					my.navigateTo({
						url: '/pages/home/pintuan/tuangouGoodsDetail?goodsSn=' + goodsSn
					});
				} else {
					try {
						my.setStorageSync({ key: 'swiperUrl', data: url });
					} catch (e) { }
					my.navigateTo({
						url: '/pages/user/webView/webView?link=' + url
					});
				}
			}
		}
	},

	// 跳去客服网页版
	goToWebCall: function() {
		var that = this;
		var webCallLink = that.data.webCallParam;
		// 友盟+统计--签到页浏览
		this.umaTrackEvent('webViewCall')

		try {
			my.setStorageSync({
				key: 'webCallLink', // 缓存数据的key
				data: webCallLink, // 要缓存的数据
			});
		} catch (e) { }
		my.navigateTo({
			url: '/pages/user/webCallView/webCallView?link=' + webCallLink + '&newMethod=new'
		});
	},

	// 跳转去h5的签到页
	goToH5SignIn() {
    my.navigateTo({
			url: '/pages/activities/signIn/signIn'
		});
		// let signInUrl = constants.UrlConstants.baseUrlOnly + '/h/personal/signIn'
		// let chInfo = constants.UrlConstants.chInfo;

		// // 友盟+统计--签到页浏览
		this.umaTrackEvent('signIn')

		// my.call('startApp', { appId: '20000067', param: { url: signInUrl, chInfo: chInfo } })

	},

	// 友盟+埋点
	umaTrackEvent(type) {
		if (type == 'signIn') {
			// 友盟+统计--签到页浏览
			my.uma.trackEvent('signInView');
		}
		else if (type == 'coupon') {
			// 友盟+统计--签到页浏览
			my.uma.trackEvent('myCouponView');
		}
		else if (type == 'webViewCall') {
			// 友盟+统计--签到页浏览
			my.uma.trackEvent('customerServiceView');
		}
	},


	// goToWebView(){},

	/**
   * 获取购物车数量
   */
	getCartNumber: function() {
		var app = getApp();
		app.getCartNumber();
	},


});