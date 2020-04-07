// var _myShim = require('..my.shim');
// import uma from 'umtrack-alipay';
import 'umtrack-alipay';
import {UrlConstants} from './utils/constants';
let sendRequest = require('./utils/sendRequest');
let constants = require('./utils/constants');



App({
  umengConfig: {
    appKey: UrlConstants.umaAppKey, //由友盟分配的APP_KEY
    debug: false //是否打开调试模式
  },

	onLaunch: function(options) {
		// uma.init(UrlConstants.umaAppKey, my);   // 务必填入已注册的appKey，不然将无法统计	（友盟小程序应用引入不需要此操作）
    console.log(UrlConstants.umaAppKey)
		if (options.query) {
			this.globalData.query = options.query
		}
		var that = this;
		my.getSystemInfo({
			success: (res) => {
				that.globalData.systemInfo = res;
			},
		});
	},

	onShow: function(options) {
		// uma.resume();                      // 请务必引入	（友盟小程序应用引入不需要此操作）
		if (options.query) {
			this.globalData.query = options.query
		}
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
		// uma.pause();                       // 请务必引入（友盟小程序应用引入不需要此操作）
		clearTimeout(this.globalData.home_spikeTime);
		clearTimeout(this.globalData.goodsDetail_spikeTime);
	},

	globalData: {
		// uma,                                // 请将uma模块绑定在gloabalData下，以便后续使用 （友盟小程序应用引入不需要此操作）
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
		appOptions: {}, //保存速运+跳过来带的参数
		query: {},
		NowAddrId: null,   //用于保存临时选中的地址
		detailNowAddrId: null,	// 用于商详页保存用户选择的地址；

		communalAddr: {},      //社区购选择的地址

		editSelectAddr: {}, 	// 选择编辑的地址
		userLocInfo: {},			// 用户定位信息


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

  getCartNumber: function() {
    var that = this;
    var canUsesetTab = my.canIUse('setTabBarBadge');
		var canUsesremoveTab = my.canIUse('removeTabBarBadge');
    if(canUsesetTab && canUsesremoveTab) {
      sendRequest.send(constants.InterfaceUrl.SHOP_GET_COUNT, {}, function(res) {
        if(res.data.result.count) {
          my.setTabBarBadge({
            index: 2,
            text: (res.data.result.count).toString()
          },function success(res) {
					},function fail(res) {
					})
        } else {
					my.removeTabBarBadge({
						index: 2
					})
				}
      }, function(res) { });
    }
  },

	// 设置定位数据缓存并设置全局数据
	setLocStorage(data, fn) {
		const _this = this;
		// console.log('locAddr-setLocStorage', data )
		my.setStorage({
			key: 'locationInfo',
			data: data,
			success: function (res) {
				_this.globalData.userLocInfo = data;
				if (fn) fn();
			},
			fail: function(err) {
				console.log('定位缓存失败了', err)
			}
		});
	},
});