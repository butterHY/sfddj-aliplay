


Page({
	data: {
		
	},

	onLoad: async function(options) {
	},

	onShow: function() {
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
		if(this.shopList) {
			this.shopList.loadMore();
		}
	},

	shopListSave(ref) {
		this.shopList = ref;
	}

});