import locAddr from '/community/service/locAddr.js';
const myApp = getApp();

Page({
	data: {
		title: '专属于你的附近之精彩',
		locInfo: {
			loading: false,
			longitude: '',
			latitude: '',
			city: '',
			addressAll: '',
			addressJson: {},
			pois: [],
			streetShow: '',
			streetLoc: ''
		}
	},

	onLoad: async function () {
		this.loadLoc();
	},

	onShow: function () {
		
	},

	goLocationCity() {
		my.navigateTo({ url: '../addressLoc/addressLoc' });
	},

	jsonNull(json) {
		let num = 0;
		for (let i in json) {
			num++;
		}
		return num;
	},

	onReady() {

		// 初始化模块滚动高度
		// this.setModuleScrollTop();

	},

	// 页面隐藏
	onHide() {
		clearTimeout(getApp().globalData.home_spikeTime);
		this.setData({
			isonLoad: false
		})
	},

	// 页面被关闭
	onUnload() {
	},

	onReachBottom() {
		if (this.shopList) {
			this.shopList.loadMore();
		}
	},

	shopListSave(ref) {
		this.shopList = ref;
	},

	onPullDownRefresh() {
		this.loadData(() => {
			my.stopPullDownRefresh();
		});
	},

  loadLoc(callbackFun) {
    const _this = this;
		let userLocInfo = myApp.globalData.userLocInfo;
		// console.log('onShow-index', userLocInfo)

		if (this.jsonNull(userLocInfo) == 0) {
			// console.log('重新定位')
			locAddr.location((res) => {
				_this.setData({
					locInfo: res
				});
				// 设置缓存并设置全部变量的值 globalData.userLocInfo 
				myApp.setLocStorage(_this.data.locInfo, () => {
					if(callbackFun) {
						callbackFun();
					}
				});
			});
		}
		else {
			_this.setData({
				locInfo: userLocInfo
			}, () => {
				if(callbackFun) {
          callbackFun();
        }
			});
		}
  },

	loadData(callbackFun) {
    this.loadLoc(() => {
      if(this.shopList) {
        this.shopList.reload(callbackFun);
      }
    });
	}

});