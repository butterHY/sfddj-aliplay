// var _myShim = require('........my.shim');
// pages/home/searchResult/searchResult.js 
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var baseImageUrl = constants.UrlConstants.baseImageUrl;
var stringUtils = require('../../../utils/stringUtils');
var utils = require('../../../utils/util');
// loadComplete
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		priceHigher: true, //价格升序
		sortIndex: 0,
		scrollTop: false,
		show: false,
		inputVal: '',
		goodsList: [],
		hotWords: [],
		searchWords: [],
		start: 0,
		limit: 10,
		hasMore: true,
		isLoadMore: false,
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		loadComplete: false,
		loadFail: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			inputVal: options.keyWord
		});
		// utils.getNetworkType(this);
		this.searchProduct(options.keyWord, 0);
	},

	// onPageScroll: function (obj) {
	//   var scrollTop = obj.scrollTop
	//   if (utils.px2Rpx(scrollTop) >= 120) {
	//     this.setData({ scrollTop: true })
	//   } else {
	//     this.setData({
	//       scrollTop: false
	//     })
	//   }
	// },
	scrollPage: function(e) {
		var scrollTop = e.detail.scrollTop;
		if (utils.px2Rpx(scrollTop) >= 120) {
			this.setData({ scrollTop: true });
		} else {
			this.setData({
				scrollTop: false
			});
		}
	},

	/**
	 * 选择筛选排序条件
	 */
	chooseSort: function(event) {
		var sortIndex = event.currentTarget.dataset.sortType;
		var priceHigher = this.data.priceHigher;
		if (sortIndex == 2) {
			priceHigher = !priceHigher;
		}
		this.setData({
			sortIndex: sortIndex,
			priceHigher: priceHigher,
			start: 0,
			goodsList: [],
			hasMore: true
		});
		this.searchProduct(this.data.inputVal, 0);
	},

	/**
	 * 输入框聚焦时弹出搜索历史、推荐词
	 */
	handleFocus: function(event) {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.HOT_WORD, {}, function(res) {
			that.setData({
				hotWords: res.data.result
			});
		}, function(err) {
		}, 'GET');
		try {
			var searchWords = my.getStorageSync({
				key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
			}).data;
			this.setData({
				searchWords: searchWords,
				show: true
			});
		} catch (e) { }
	},

	/**
	 * 输入框失焦时隐藏热词提示
	 */
	handleBlur: function(event) {
		this.setData({
			show: false
		});
	},

	/**
	 * 键盘输入事件
	 */
	handleInput: function(event) {
		this.setData({
			inputVal: event.detail.value
		});
	},

	/**
	 * 键盘确认时搜索
	 */
	handleConfirm: function(event) {
		this.setData({
			start: 0,
			show: false
		})

		// 达观数据上报
		// utils.uploadClickData_da('search', [{ keyword: event.detail.value }])

		this.searchProduct(event.detail.value, 0);
	},

	/**
	 * 选择搜索词
	 */
	chooseWord: function(event) {
		this.setData({
			inputVal: event.currentTarget.dataset.word,
			show: false

		});


		// 达观数据上报
		// utils.uploadClickData_da('search', [{ keyword: event.currentTarget.dataset.word }])

		this.searchProduct(event.currentTarget.dataset.word, 0);
	},

	/**
	 * 搜索商品
	 * type 0:刷新 1:加载更多
	 */
	searchProduct: function(keyWord, type) {
		this.setData({
			isLoadMore: true
		});

		// 友盟+统计  ----搜索页面浏览
		getApp().globalData.uma.trackEvent('searchResPageView', {keyWord: keyWord});

		this.saveSearchHist(keyWord);
		var that = this;
		var sortBy = 'ZONGHEPAIXU';
		var sortDir = 'desc';
		if (this.data.sortIndex == 0) {
			sortBy = 'ZONGHEPAIXU';
		} else if (this.data.sortIndex == 1) {
			sortBy = 'XIAOLIANGYOUXIAN';
		} else if (this.data.sortIndex == 2) {
			sortBy = 'JIAGE';
			sortDir = this.data.priceHigher ? 'asc' : 'desc';
		}
		sendRequest.send(constants.InterfaceUrl.SEARCH, {
			keyword: keyWord,
			sortBy: sortBy,
			sortDir: sortDir,
			start: this.data.start,
			limit: this.data.limit
		}, function(res) {
			if (!res.data.result) {
				that.setData({
					loadComplete: true,
					isLoadMore: false,
					hasMore: false
				})

				// this.searchProduct(options.keyWord, 0);
				return;
			}

			my.stopPullDownRefresh();
			var result = res.data.result.goodsList;
			var goodsList = that.data.goodsList;

			var hasMore = false;
			if (result && result.length == that.data.limit) {
				hasMore = true;
			}
			if (type == 0) {
				goodsList = result;
			} else {
				goodsList = goodsList.concat(result);
			}
			that.setData({
				goodsList: goodsList,
				groupList: res.data.result.groupList,
				baseImageUrl: baseImageUrl,
				hasMore: hasMore,
				isLoadMore: false,
				loadComplete: true,
				loadFail: false
			});
		}, function(err) {
			my.stopPullDownRefresh();
			that.setData({
				isLoadMore: false,
				loadFail: true
			});
		});
	},

	// 点击搜索结果的商品
	searchResultClick(e){
		let { url, index} = e.currentTarget.dataset
		let goodsList = this.data.goodsList

		// 友盟+统计  ----搜索页面浏览
		getApp().globalData.uma.trackEvent('searchResListClck', {keyWord: this.data.inputVal, goodsName: goodsList[index].name, goodsId: goodsList[index].id, goodsSn: goodsList[index].goodsSn, goodsCategoryId: goodsList[index].goodsCategoryId});

		my.navigateTo({
			url: url
		});

	},

	scrollToTop: function() {
		my.pageScrollTo({
			scrollTop: 0
		});
	},

	/**
	 * 保存搜索词
	 */
	saveSearchHist: function(keyWord) {
		if (stringUtils.isNotEmpty(keyWord)) {
			try {
				var searchWords = my.getStorageSync({ key: constants.StorageConstants.searchWordsKey }).data || [];
				for (var key in searchWords) {
					if (searchWords[key] == keyWord) {
						return;
					}
				}
				if (searchWords.length < 8) {
					searchWords.push(keyWord);
				} else {
					searchWords.reverse().pop();
					searchWords.reverse().push(keyWord);
				}
				my.setStorageSync({
					key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
					data: searchWords, // 要缓存的数据
				});
			} catch (e) { }
		}
	},

	/**
	 * 清除搜索历史
	 */
	clearHist: function() {
		try {
			my.setStorageSync({
				key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
				data: [], // 要缓存的数据
			});
		} catch (e) { }
	},

	/**
	 * 添加购物车
	 */
	addCart: function(e) {
		let that = this;
		let productId = e.currentTarget.dataset.pid;

		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: productId, quantity: '1' }, function(res) {

			// 达观数据上报
			// utils.uploadClickData_da('cart', [{ productId, actionNum: '1' }])

			my.showToast({
				content: '添加购物车成功'
			});
		}, function(res) {
			// wx.showToast({
			//   title: res,
			// })
			that.setData({
				// showDialog3: false,
				showToast: true,
				showToastMes: res
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 2000);
		});
	},

	/**
	 * 下拉刷新
	 */
	onPullDownRefresh: function() {
		this.setData({
			start: 0,
			goodsList: []
		});
		var keyWord = this.data.inputVal;
		// utils.getNetworkType(this);
		this.searchProduct(keyWord, 0);
	},
	// onPullDownRefresh:function(){
	//   return;
	// },
	// scrollToUpper: function () {
	//   this.setData({
	//     start: 0,
	//     goodsList: []
	//   });
	//   var keyWord = this.data.inputVal;
	//   this.searchProduct(keyWord, 0);
	// },

	/**
	 * 页面上拉触底事件的处理函数
	 */
	// onReachBottom: function () {
	//   if (this.data.hasMore) {
	//     this.setData({
	//       start: this.data.goodsList.length,
	//       limit: this.data.limit
	//     })
	//     var keyWord = this.data.inputVal
	//     this.searchProduct(keyWord, 1);
	//   }
	// },
	scrollToLower: function() {
		if (this.data.hasMore) {
			this.setData({
				start: this.data.goodsList.length,
				limit: this.data.limit
			});
			var keyWord = this.data.inputVal;
			this.searchProduct(keyWord, 1);
		}
	}
});