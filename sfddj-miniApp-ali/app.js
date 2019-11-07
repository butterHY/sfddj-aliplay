// var _myShim = require('..my.shim');
import uma from 'umtrack-alipay';
import {UrlConstants} from './utils/constants'


App({
	// data: {
	//     home_spikeTime: null,
	//     goodsDetail_spikeTime: null
	// },
	onLaunch: function(options) {
		uma.init(UrlConstants.umaAppKey, my);   // 务必填入已注册的appKey，不然将无法统计
		var that = this;
		my.getSystemInfo({
			success: (res) => {
				that.globalData.systemInfo = res;
			},
		});
		

	},
	onShow: function(options) {
		uma.resume();                      // 请务必引入
		var that = this;
		that.globalData.appOptions = options.referrerInfo ? options.referrerInfo.extraData : {};
		that.globalData.path = options.path;
		that.globalData.options = options;

		// 如果 App 点击退出,没有被销毁,只是被隐藏
		my.setStorageSync({
			key: 'isHotStart',
			data: 'isHotStart',
			success: (res) => {
			},
		});


	},

	onHide: function() {
		uma.pause();                       // 请务必引入
		clearTimeout(this.globalData.home_spikeTime);
		clearTimeout(this.globalData.goodsDetail_spikeTime);

	},
	globalData: {
		uma,                                // 请将uma模块绑定在gloabalData下，以便后续使用
		userInfo: null,
		systemInfo: null,
		comeFrom: null,
		home_spikeTime: null,
		goodsDetail_spikeTime: null,
		adInfo: {
			gdt_vid: '',
			weixinadinfo: '',
			aid: ''
		},
		SFmember: false, //判断是否是速运+那边跳过来的
		appOptions: {} //保存速运+跳过来带的参数

	},
	getNewUserInfoFn: function(fn) {
		var that = this;

		my.getSetting({
			success: function(res) {

				if (res.authSetting['scope.userInfo']) {
					my.getAuthUserInfo({
						withCredentials: true,
						success: function(res) {
							typeof fn == "function" && fn(res);
							that.globalData.userInfo = res.userInfo;

							try {
								my.setStorageSync({ key: 'userInfo', data: res.userInfo });
							} catch (e) { }
						},
						fail: function(res) {
							typeof fn == "function" && fn(res);
						}
					});
				} else {
					var res = {
						is: 'no'
					};
					typeof fn == "function" && fn(res);
				}
			}
		});
	},

	// 判断是否是一个空对象
	isEmptyObject: function(obj) {
		var boff = false;
		for (var key in obj) {
			boff = true;
		};
		return boff;
	},



});