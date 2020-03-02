// var _myShim = require('........my.shim');
// pages/home/searchResult/searchResult.js 
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
// var baseImageUrl = constants.UrlConstants.baseImageUrl;
var stringUtils = require('../../../utils/stringUtils');
var utils = require('../../../utils/util');

import api from '../../../api/api';
import http from '../../../api/http';

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		priceHigher: false, 				// 价格升序降序开关
		sortIndex: 0,							// 默认综合排序
		scrollTop: false,
		show: false,
		inputVal: '',							// 搜索框输入值；
		goodsList: [],						// 搜索返回商品列表；
		storeList: [],
		hotWords: [],
		searchWords: [],
		goodsStart: 0,						// 搜索商品起始位置
		storeStart: 0,						// 搜索店铺起始位置
		limit: 10,								// 搜索商品条数或店铺条数
		hasMore: true,						// 搜索商品
		isloadMore: false,
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		baseImageUrl: constants.UrlConstants.baseImageUrl,
		defaultImage: 'miniappImg/icon/icon_default_head.jpeg',
		loadComplete: false,
		goodsLoadFail: false,

		activity: false,			 							// 两列切换开关
		showChannel: 0,											// 显示渠道,0为主站,1为地区管
		goodsOrStore: '0',									// '0' 代表是商品类型，'1' 代表是店铺类型；

		searchShow: false,									// 智能搜索模版显示开关
		smartSearchList: [],								// 智能搜索数据

		isShowSearch: false,								// 新版搜索组件显示开关
		isFocus: false,											// 新版搜索组件焦点开关
		searchComponent: null,							// 新版搜索组件实例

    // 猜你喜欢数据
    guessLikeGoods: [],
    youLikeStart: 0,
    youLikeLimit: 3,
    youLikeHasMore: true,
    youLikeIsLoadMore: false,
    youLikeLoadComplete: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			inputVal: options.keyWord,
      pageType: options.pageType
		});
		// utils.getNetworkType(this);
    // console.log(getCurrentPages());
    console.log(options.pageType);
    console.log(options);
		this.searchProduct(options.keyWord, 0);
	},

	onShow: function() {
		// 关闭键盘，有些苹果手机会出现输入搜索去到搜索页返回初始页面时，初始页的键盘没有关闭的问题；
		my.hideKeyboard();
		this.setData({
			placeholder: my.getStorageSync({key: 'searchTextMax'}).data
		})
  
		if( this.searchComponent ) {
    
			this.searchComponent.data.pageType = 'showSearchPage';
		}
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

	/**
	 * 	滚动页面距离 >= 120 的时候排序导航栏 “吸顶效果”，但有问题，没有做节流开关，>= 120 的时候会一直赋值 scrollTop
	 */
	scrollPage: function(e) {
		// 因为添加了 “商品”和“店铺”的导航栏 ，所以页面滚动距离得由原来的 120 ，变为 198
		if ( utils.px2Rpx(e.detail.scrollTop) > 198 && !this.data.scrollTop ) {
			this.data.scrollTop = true;							
			this.setData({ scrollTop: this.data.scrollTop });
		} else if (utils.px2Rpx(e.detail.scrollTop) <= 198 && this.data.scrollTop){
			this.data.scrollTop = false;
			this.setData({
				scrollTop: this.data.scrollTop
			});
		}
	},

	/**
	 * 选择筛选排序条件
	 */
	chooseSort: function(event) {
		let that = this;
		var sortIndex = event.currentTarget.dataset.sortType;
		var priceHigher = this.data.priceHigher;
		// 点击同类会改变升降序，priceHigher 为 true 为升序
		if (parseInt(sortIndex) == that.data.sortIndex) {
			priceHigher = !priceHigher;
		} else {
			priceHigher = false;
		}
		this.setData({
			scrollTop: false,							// 点击排序导航栏的时候，goodsList: [], 这时排序导航栏还是“吸顶”着，返回数据重新渲染 scroll-view 里的 view ，高度变化了，防止导航栏响应不及时还 “吸顶”；
			sortIndex: sortIndex,
			priceHigher: priceHigher,
			goodsStart: 0,
			goodsList: [],
			hasMore: true,
      youLikeStart: 0,
		});
		
		this.searchProduct(this.data.inputVal, 0);
		this.data.hasMore = false;									// scroll-view 滚动时，如果有滚动高度的时，即有 scroll-Top 的时候，点击导航栏的时候会触发上拉触底加载的事件；
	},

	// 点击 “商品” 和 “店铺” 切换类型
	setGoodsOrStore: function(e) {
		let that = this;
		if(that.data.goodsOrStore == e.currentTarget.dataset.goodsOrStore) {
			return;
		} else {	
			that.setData({
				goodsOrStore: e.currentTarget.dataset.goodsOrStore,
				scrollTop: false,							
				sortIndex: 0,
				goodsStart: 0,
				storeStart: 0,
				goodsList: [],
				storeList: [],
				hasMore: true,
        youLikeStart: 0,
			});
			that.searchProduct(this.data.inputVal, 0);
			// that.data.hasMore = false;
		}
	},

	/**
	 * 输入框聚焦时弹出搜索历史、推荐词	   ------  搜索改版
	 */
	// handleFocus: function(event) {
	// 	var that = this;
	// 	console.log('输入框聚焦')
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
	// 		this.setData({
	// 			searchWords: searchWords.reverse(),
	// 			show: true
	// 		});
	// 	} catch (e) { }
	// },


	/**
	 * 输入框失焦时隐藏热词模块提示			-------   搜索改版
	 */
	// handleBlur: function(event) {
	// 	console.log('输入框失焦')
	// 	this.setData({
	// 		show: false
	// 	});
	// },

	/**
	 * 键盘输入事件			------- 		搜索改版
	 */
	// handleInput: function(event) {
	// 	console.log(event.detail.value.replace(/\s*/g,''))
	// 	let inputVal = event.detail.value.replace(/\s*/g,'');
	// 	let hotWordShow = true;
	// 	let searchShow = true;
	// 	if( inputVal ) {
	// 		this.smartSearch(inputVal);
	// 		hotWordShow = false;
	// 	} else {
	// 		searchShow = false;
	// 	}
	// 	this.setData({
	// 		show: hotWordShow,
	// 		searchShow,
	// 		inputVal: event.detail.value
	// 	});
	// },

	/**
	 * 键盘确认时搜索，默认排序类型是 0；			------- 		搜索改版
	 */
	// handleConfirm: function(event) {
	// 	// 达观数据上报
	// 	// utils.uploadClickData_da('search', [{ keyword: event.detail.value }])
	// 	// 先关闭热门推荐和搜索记录模块以及智能搜索模块
	// 	this.data.goodsOrStore == '0' ? this.setData({goodsStart: 0, show: false, searchShow: false}) : this.setData({storeStart: 0, show: false, searchShow: false});
	// 	console.log(event.detail.value)
	// 	this.searchProduct(event.detail.value, 0);
	// },

	/**
	 * 选择搜索热词 或者 选择智能搜索词			 ---------		搜索改版
	 */
	// chooseWord: function(event) {
	// 	let that = this;
	// 	this.setData({
	// 		inputVal: event.currentTarget.dataset.word,
	// 		show: false,
	// 		searchShow: false,
	// 	});
	// 	// 达观数据上报
	// 	// utils.uploadClickData_da('search', [{ keyword: event.currentTarget.dataset.word }])
	// 	this.data.goodsOrStore == '0' ? this.setData({goodsStart: 0}) : this.setData({storeStart: 0});
	// 	this.searchProduct(event.currentTarget.dataset.word, 0);
	// },


	/**
	 * 搜索组件 ‘选择’ 热词/历史记录/智能搜索词 或 ‘回车’ 时，重新请求数据；
	 * 
	 */
	selectOrEnter(word, noGetHistory) {
		this.setData({
			inputVal: word,
		})
		this.showSearch(noGetHistory);
		this.data.goodsOrStore == '0' ? this.setData({goodsStart: 0, goodsList: [] }) : this.setData({storeStart: 0, storeList: [] });
		this.searchProduct(word, 0);
	},


	/**
	 * 搜索商品
	 * type 0:刷新 1:加载更多
	 */
	searchProduct: function(keyWord, type) {
		let that = this;
		that.setData({
			isLoadMore: true
		});

		// 友盟+统计  ----搜索页面浏览
		getApp().globalData.uma.trackEvent('searchResPageView', {keyWord: keyWord});

		// 先缓存搜索记录；排序字段,综合排序:order_list,价格排序:sale_price,销量排序:sales_count,好评排序:praise_rate
		that.saveSearchHist(keyWord);

		 
		var sortBy = 'order_list';															// 原有字段综合排序  ZONGHEPAIXU
		var sortDir = 'desc';
		var start = that.data.goodsStart;
		var url = api.search.GOODSSEARCH;
		if(that.data.goodsOrStore == '0' ) {
			if (that.data.sortIndex == 0) {
				sortBy = 'order_list';															// 原有字段综合排序  ZONGHEPAIXU
			} else if (that.data.sortIndex == 1) {
				sortBy = 'sales_count';															// 原有字段销量  XIAOLIANGYOUXIAN
			} else if (that.data.sortIndex == 2) {
				sortBy = 'sale_price';															// 原有字段价格  JIAGE
			} else if (that.data.sortIndex == 3) {
				sortBy = 'praise_rate';															// 原有字段好评  JIAGE
			}
			sortDir = that.data.priceHigher ? 'asc' : 'desc';			//  asc 升序， desc 降序
		} else if (that.data.goodsOrStore == '1') {
			sortBy = 'supplier_sell_count';
			start = that.data.storeStart;
			url = api.search.SUPPLIERSEARCH;
		}


		// sendRequest.send(constants.InterfaceUrl.SEARCH, {
		http.post(url, {
			keyword: keyWord,
			showChannel: that.data.showChannel,
			sortBy: sortBy,
			sortDir: sortDir,
			start: start,
			limit: that.data.limit
		}, function(res) {
			if (!res.data.data || (that.data.goodsOrStore == '0' && !res.data.data.goodsList) || (that.data.goodsOrStore == '1' && !res.data.data.supplierDTO) ) {
				that.setData({
					loadComplete: true,
					isLoadMore: false,
					hasMore: false 
				})
				// that.searchProduct(options.keyWord, 0);
        that.getGuessLike('0');
				return;
			}

			my.stopPullDownRefresh();
			if(that.data.goodsOrStore == '0' ) {
				var result = res.data.data.goodsList;
				var list = that.data.goodsList;
			} else if (that.data.goodsOrStore == '1') {
				var result = res.data.data.supplierDTO;
				var list = that.data.storeList;
			}

			var hasMore = result && result.length == that.data.limit ? true : false;

			type == 0 ? list = result : list = list.concat(result);

			let upData = {
				hasMore: hasMore,
				isLoadMore: false,
				loadComplete: true,
				loadFail: false,
			};

			that.data.goodsOrStore == '0' ? upData.goodsList = list : upData.storeList = list;														// 搜索商品
			// that.data.goodsOrStore == '1' && upData.storeList && upData.storeList.length > 0  ? upData.storeList.forEach( value => value.star = Math.round(value.star) ) : '';

			// groupList: res.data.result.groupList,		// 推荐商品,新接口没有 "推荐商品"
      list && list.length <= 3 ? that.getGuessLike('0') : that.setData({guessLikeGoods: [], youLikeStart: 0});


			that.setData(upData);
			
		}, function(err) {
			my.stopPullDownRefresh();
			that.setData({
				isLoadMore: false,
				loadFail: true
			});
		});
	},

  // 获取达观推荐的商品---猜你喜欢
  getGuessLike(type) {
    console.log('请求猜你喜欢 type', type)
    let that = this;
    let data = {
      groupName: '支付宝小程序猜你喜欢',
      start: that.data.youLikeStart,
      limit: that.data.youLikeLimit
    }
    that.setData({ youLikeIsLoadMore: true });

    http.get(api.GOODSDETAIL.lISTGOODSBYNAME, data, (res) => {
      if (res.data.ret.code == '0' && res.data.ret.message == "SUCCESS") {
        let resData = res.data.data;
        // 如果返回的数据长度等于请求条数说明还有更多数据
        resData && resData.length == that.data.youLikeLimit ? that.data.youLikeHasMore = true : that.data.youLikeHasMore = false;  

        // 0: 初始化; 1: 每次加载拼接进去的数据;
        type == '0' ? that.data.guessLikeGoods = resData : that.data.guessLikeGoods = that.data.guessLikeGoods.concat(resData);  

        that.setData({
          guessLikeGoods: that.data.guessLikeGoods,
          youLikeHasMore: that.data.youLikeHasMore,           // 是否还有更多                  
        });
      }
      that.setData({ youLikeIsLoadMore: false })								// 正在加载中的加载进度条
    }, (err) => { that.setData({ youLikeIsLoadMore: false }) })
  },


		/**
	 * 智能搜索数据		--------  搜索改版
	 * 
	 */
	// smartSearch(inputVal) {
	// 	let that = this;
	// 	console.log(inputVal);
	// 	let data = {
	// 		suggestStr: inputVal,
	// 		showChannel: 0
	// 	}
	// 	http.post( api.search.GOODSSUGGEST, data ,(res) => {
	// 		console.log(res);
	// 		let resData = res.data.data;
	// 		let retData = res.data.ret;
	// 		// let hotWordShow = true;
	// 		// let searchShow = true;

	// 		if( retData.code == '0' && retData.message == "SUCCESS" ) {
	// 			that.setData({
	// 				// show: hotWordShow,
	// 				// searchShow,

	// 				// .concat(resData)
	// 				smartSearchList: resData
	// 			})
	// 		} else {
	// 			that.setData({
	// 				// show: hotWordShow,
	// 				// searchShow,
	// 				smartSearchList: []
	// 			})
	// 		}
	// 	}, (err) => {
	// 		that.setData({
	// 			// show: hotWordShow,
	// 			// searchShow,
	// 			smartSearchList: []
	// 		})
	// 		console.log(err)
	// 	})
	// },


	/**
	 * 点击切换商品展示单列排序还是两列排序
	 * 
	*/
	isTwoColumns() {
		let that = this;
		that.setData({ activity: !that.data.activity })
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


	// 这个事件没有被触发
	scrollToTop: function() {
		my.pageScrollTo({
			scrollTop: 0
		});
	},

	/**
	 * 保存搜索词
	 */
	saveSearchHist: function(keyWord) {
		if ( stringUtils.isNotEmpty(keyWord) ) {
			try {
				var searchWords = my.getStorageSync({ key: constants.StorageConstants.searchWordsKey }).data || [];
				// 搜索记录去重
				let keyWordIndex = searchWords.findIndex(val => keyWord == val);
				if( keyWordIndex != -1 ) {
					searchWords.splice(keyWordIndex, 1);
					searchWords.push(keyWord);
				} else {
					// 小于 8 个则直接插入，大于 8 个则删除时间最远的一个，然后按照时间从远到近排序同时插入最新的一个词；
					if (searchWords.length < 5) {
						searchWords.push(keyWord);
					} else {
						searchWords.reverse().pop();
						searchWords.reverse().push(keyWord);
					}
				}
				my.setStorageSync({
					key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
					data: searchWords, // 要缓存的数据
				});
			} catch (e) { }
		}
	},

	/**
	 * 清除搜索历史				---- 搜索改版
	 */
	// clearHist: function() {
	// 	try {
	// 		my.setStorageSync({
	// 			key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
	// 			data: [], // 要缓存的数据
	// 		});
	// 	} catch (e) { }
	// },

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
		let that = this;
		that.data.goodsOrStore == '0' ? that.setData({goodsStart: 0, goodsList: []}) : that.setData({storeStart: 0, storeList: []});
		// utils.getNetworkType(this);
		that.searchProduct(that.data.inputVal, 0);
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
	
  /**
	 * 页面滚动到底部触发
	 */
	scrollToLower: function() {
    let that = this;
		if (this.data.hasMore) {
			this.data.goodsOrStore == '0' ? this.setData({goodsStart: this.data.goodsList.length, limit: this.data.limit}) : this.setData({storeStart: this.data.storeList.length, limit: this.data.limit});
		  this.data.hasMore = false;
			this.searchProduct(this.data.inputVal, 1);
		} else if( ((this.data.goodsOrStore == '0' && that.data.goodsList.length <= 3) || (this.data.goodsOrStore == '1' && that.data.storeList.length <= 3)) && that.data.youLikeHasMore ) {
      that.setData({
        youLikeStart: that.data.guessLikeGoods.length
      });
      that.data.youLikeHasMore = false;
      that.getGuessLike('1');
    }
	},


	/**
	  * 存储新版搜索组件实例（但只在页面初始化是挂载，页面重显取不到）
	*/
	saveRef(ref) {
		this.searchComponent = ref;
  },
	
	/**
	  * 新版搜索组件开关
	*/
	showSearch: function(noGetHistory) {
		// this.searchComponent.getHistory()
		noGetHistory == 'noGetHistory' ? '' : 	this.searchComponent.getHistory();
		this.setData({
			isShowSearch: !this.data.isShowSearch,
			isFocus: !this.data.isFocus,
		})
	}
});