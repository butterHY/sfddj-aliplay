// var _myShim = require('......my.shim');
/**
* 分类tap页面
* @author 01368384
*
*/

var sendRequest = require('../../utils/sendRequest');
var constants = require('../../utils/constants');
var utils = require('../../utils/util');

var categoryTags = []; //分类list
var childrenCategoryTags = []; //子分类list
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀

Page({
	data: {
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		loadComplete: false,
		loadFail: false,

		isShowSearch: false,								// 新版搜索组件显示开关
		isFocus: false,											// 新版搜索组件焦点开关
		searchComponent: null,							// 新版搜索组件实例
	},

	/**
	 * 页面初始化，访问接口'/home/allCategory'获取分类数据
	 * @param options 初始化参数
	 */
	onLoad: function(options) {

		// 友盟+统计  ----分类页浏览
		getApp().globalData.uma.trackEvent('categoryView');
		this.getCateData();
		
	},

	onShow: function(options) {
		var that = this;
		// my.showLoading({
		//   title: '加载中',
		//   mask: true
		// });
		// utils.getNetworkType(that);
		
		// that.getCateData();
			// 一进入到页面，获取购物车数据；
      that.getCartNumber();
			// 一进入到父分类页时，先删除掉商详页缓存的子分类数据；
			try {
				my.removeStorageSync({ key: constants.StorageConstants.detfatherCategory });
			} catch (e) {}
			// 回到页面关闭搜索组件
			console.log('关闭搜索组件');
			console.log(this.searchComponent);
			this.setData({
				placeholder: my.getStorageSync({key: 'searchTextMax'}).data,
				isFocus: false,
				isShowSearch: false,
			});
			console.log(this.data.placeholder)
			if( this.searchComponent ) {
				this.searchComponent.setData({inputVal: ''});
				this.searchComponent.getHistory();
				// that.searchComponent.data.pageType = 'category';
				console.log(that.searchComponent)
			}
	},

	getCateData() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.HOME_ALL_CATEGORY, {}, function(res) {
			my.hideLoading();
			if (res.data.result.dtoList) {
				categoryTags = res.data.result.dtoList;

				if (categoryTags.length > 0) {
					childrenCategoryTags = categoryTags[0].children;
					categoryTags[0].taped = true;
					my.setStorageSync({
						key: constants.StorageConstants.fatherCategoryId, // 缓存数据的key
						data: {
							id: categoryTags[0].id,
							name: categoryTags[0].name
						}, // 要缓存的数据
					});
					my.setStorageSync({
						key: constants.StorageConstants.childrenCategoryKey, // 缓存数据的key
						data: childrenCategoryTags, // 要缓存的数据
					});
				}

				that.setViewData();
			}
			that.setData({
				loadComplete: true,
				loadFail: false
			})
		}, function(res) {
			my.hideLoading();
			that.setData({
				loadFail: true,
			})
		});
	},


	//报错页手动刷新按钮
	onRefreshPage(data){
		this.getCateData()
	},

	/**
	 *  拼装二级分类页面数据，采用三列瀑布流形式展示数据
	 */
	setViewData: function() {
		var arr1 = [],
			arr2 = [],
			arr3 = [];
		childrenCategoryTags.forEach(function(t, number, ts) {
			switch ((number + 1) % 3) {//根据数组角标+1再模3的结果，拼装三列数组
				case 1:
					arr1.push(t);
					break;
				case 2:
					arr2.push(t);
					break;
				case 0:
					arr3.push(t);
					break;
			}
		});
		this.setData({
			categoryTags: categoryTags,
			childrenCategoryTags: childrenCategoryTags,
			childrenArr1: arr1,
			childrenArr2: arr2,
			childrenArr3: arr3,
			baseImageUrl: baseImageUrl
		});
	},

	/**
	 * 点击顶级分类tag标签，更新二级分类显示
	 * @param e 点击参数
	 */
	tagViewTap: function(e) {
		var that = this;
		var id = e.currentTarget.id;
		categoryTags.forEach(function(value, index, array) {
			if (index == id) {
				value.taped = true;
				childrenCategoryTags = value.children;
				try {
					//存储顶级分类数据
					my.setStorageSync({
						key: constants.StorageConstants.fatherCategoryId, // 缓存数据的key
						data: {
							id: value.id,
							name: value.name
						}, // 要缓存的数据
					});
					//存储childrenCategoryTags，二级分类页面读取
					my.setStorageSync({
						key: constants.StorageConstants.childrenCategoryKey, // 缓存数据的key
						data: childrenCategoryTags, // 要缓存的数据
					});
				} catch (e) { }
			} else {
				value.taped = false;
			}
		});
		that.setViewData();
	},

	//-------搜索相关代码开始--------//
	// handleFocus: function() {
	// 	var that = this;
	// 	sendRequest.send(constants.InterfaceUrl.HOT_WORD, {}, function(res) {
	// 		that.setData({
	// 			hotWords: res.data.result
	// 		});
	// 	}, function(err) {
	// 	}, 'GET');
	// 	try {
	// 		var searchWords = my.getStorageSync({
	// 			key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
	// 		}).data;
	// 		that.setData({
	// 			searchWords: searchWords,
	// 			show: true
	// 		});
	// 	} catch (e) { }
	// },

	// chooseWord: function(event) {
	// 	this.goToSearchPage(event.currentTarget.dataset.word);
	// },
	// goToSearchPage(keyWord) {
	// 	if (keyWord && keyWord.trim()) {
	// 		// 达观数据上报
	// 		// utils.uploadClickData_da('search', [{ keyword: keyWord }])
	// 		my.navigateTo({
	// 			url: '/pages/home/searchResult/searchResult?keyWord=' + keyWord
	// 		});
	// 	}
	// },

	// handleBlur: function(e) {
	// 	this.setData({
	// 		show: false
	// 	});
	// },
	// handleConfirm: function(event) {
	// 	this.goToSearchPage(event.detail.value);
	// },
	// clearHist: function() {
	// 	try {
	// 		my.setStorageSync({
	// 			key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
	// 			data: [], // 要缓存的数据
	// 		});
	// 	} catch (e) { }
	// },
	//-------搜索相关代码介绍--------//


    /**
	 * 获取购物车数量
	 */
	getCartNumber: function() {
    var app = getApp();
    app.getCartNumber();
	},

	/**
	  * 存储新版搜索组件实例（但只在页面初始化是挂载，页面重显取不到）
	*/
	saveRef(ref) {
		this.searchComponent = ref;
		console.log(this.searchComponent);
  },
	
	/**
	  * 新版搜索组件开关
	*/
	showSearch: function(noGetHistory) {
		console.log(noGetHistory)
		// this.searchComponent.getHistory()
		noGetHistory == 'noGetHistory' ? '' : 	this.searchComponent.getHistory();
		this.setData({
			isShowSearch: !this.data.isShowSearch,
			isFocus: !this.data.isFocus,
		})
	}

});