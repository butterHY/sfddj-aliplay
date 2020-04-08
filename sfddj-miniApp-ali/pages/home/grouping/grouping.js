// var _myShim = require('........my.shim');
/**
* 二级分类页面
* @author 01368384
*  
*/
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var util = require('../../../utils/util');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀

Page({

	data: {
		// 原先的头部分类数组
		// childrenCategoryTags: [],

		// 原先请求商品的 id
		categoryId: '',
		// 是否有父级的 id
		isFatherCategory: false,
		start: 0,
		limit: 10,
		goodsList: [],
		hasMore: true,
		isLoadMore: false,
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		baseImageUrl: constants.UrlConstants.baseImageUrl,
		showToast: false,
		loadComplete: false,
		loadFail: false,
		groupName: '',
		pageFrom: '',   //判断是否从优惠券页面来的参数
		couponId: '',   //判断从优惠券页面来时带来的优惠券id
	},

	onLoad: function(options) {
		// 如果是从优惠券页面来的
		if (options.pageFrom == 'coupon') {
			this.setData({
				pageFrom: options.pageFrom,
				couponId: options.couponId
			})

			// 获取可使用的商品
			this.getCouponGoods(0);
		}
		else {
			this.setData({
				groupName: options.groupName
			})
			var that = this;
			var fatherCategory = {};

			that.getGoodsData(0);
		}


	},


	/**
	 * 根据子类 categoryId 查询商品列表 ， 请求商品分组数据
	 * type 0:刷新 1:加载更多
	 */
	getGoodsData: function(type) {
		var that = this;
		this.setData({
			isLoadMore: true
		});

		// var url = constants.InterfaceUrl.GET_GROUP_DATA;
		var groupName = this.data.groupName;
		var token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data ? my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data : '';
		my.httpRequest({
			url: constants.UrlConstants.baseUrlOnly + constants.InterfaceUrl.GET_GROUP_DATA,
			method: 'GET',
			data: {
				groupName: groupName,
				start: this.data.start,
				limit: this.data.limit
			},
			headers: {
				// "loginToken": token,
				// "content-type": "application/x-www-form-urlencoded"
				"client-channel": "alipay-miniprogram"
			},
			success: function(res) {
				var isLoadMore = false;
				var result = res.data.data;
				var hasMore = false;
				var goodsList = that.data.goodsList;

				if (!result || result.length == 0) {
					that.setData({
						isLoadMore: false,
						loadFail: true
					});
					return;
				}
				if (result && result.length == that.data.limit) {   // 如果返回的数据长度等于请求条数说明还有更多数据
					hasMore = true;
				}
				if (type == 0) {
					goodsList = result;
				} else {
					goodsList = goodsList.concat(result);
				}
				that.setData({
					goodsList: goodsList,   // 每次加载拼接进去的数据
					hasMore: hasMore,       // 是否还有更多
					isLoadMore: isLoadMore, // 正在加载中的加载进度条
					loadComplete: true, // 加载完成
					loadFail: false    //  加载失败
				});
			},
			fail: function(res) {
				that.setData({
					isLoadMore: false,
					loadFail: true
				});
			},
			complete: function(res) {
			}
		});

	},




	/**
	 * 获取优惠券去使用的商品列表
	 * */
	getCouponGoods(type = 0) {
		let that = this;
		this.setData({
			isLoadMore: true
		});
		sendRequest.send(constants.InterfaceUrl.USE_COUPON_SUITABLE, { couponId: that.data.couponId, start: that.data.start, limit: that.data.limit }, res => {
			let isLoadMore = false;
			let result = res.data.result;
			let hasMore = false;
			let goodsList = that.data.goodsList;

			if (!result || Object.keys(result).length == 0) {
				that.setData({
					isLoadMore: false,
					loadFail: this.data.goodsList && Object.keys(this.data.goodsList).length > 0 ? false : true,
					hasMore: hasMore
				});
				return;
			}
			if (result && result.length == that.data.limit) {   // 如果返回的数据长度等于请求条数说明还有更多数据
				hasMore = true;
			}
			if (type == 0) {
				goodsList = result;
			} else {
				goodsList = goodsList.concat(result);
			}
			that.setData({
				goodsList: goodsList,   // 每次加载拼接进去的数据
				baseImageUrl: baseImageUrl,
				hasMore: hasMore,       // 是否还有更多
				isLoadMore: isLoadMore, // 正在加载中的加载进度条
				loadComplete: true, // 加载完成
				loadFail: false    //  加载失败
			});
		}, err => {
			that.setData({
				isLoadMore: false,
				loadFail: true
			});
		}, 'GET')
	},





	/**
	 * 点击tag 分类，重新请求数据，更新商品列表显示
	 * @param e 点击参数
	 */

	// tagViewTap: function (e) {
	//   var that = this;
	//   var id = e.currentTarget.id;
	//   that.data.childrenCategoryTags.forEach(function (value, index, array) {

	//     if (index == id) {
	//       value.taped = true;
	//       that.data.categoryId = value.id ? value.id : that.data.categoryId;
	//       that.data.isFatherCategory = id == 0;
	//     } else {
	//       value.taped = false;
	//     }
	//   });
	//   that.setData({
	//     childrenCategoryTags: that.data.childrenCategoryTags,
	//     goodsList: []
	//   });
	//   that.data.start = 0;
	//   that.getGoodsData(0);

	//   //滚动到屏幕顶部
	//   my.pageScrollTo({
	//     scrollTop: 0
	//   });
	//   that.setData({
	//     scrollTop: 0
	//   })
	// },


	/**
	* 页面上拉触底事件的处理函数
	*/
	lowLoadMore: function() {
		// if (this.data.hasMore) {
		//   this.data.start = this.data.goodsList.length
		//   this.getGoodsData(1)
		// } else {
		//   wx.showToast({
		//     title: '没有更多了',
		//   })
		// }
		if (this.data.hasMore) {
			this.setData({
				start: this.data.goodsList.length
			});
			if (this.data.pageFrom == 'coupon') {
				this.getCouponGoods(1);
			}
			else {
				this.getGoodsData(1);
			}

		}
	},


	/**
	 * 监听屏幕滚动事件，调整tagView显示, 顶部分类导航模块的 ‘吸顶效果’
	 * @param e 滑动参数
	 */
	scrollingFn: function(e) {
		var height = util.px2Rpx(e.detail.scrollTop);
		this.setData({
			sticky: height >= 120
		});
	},

	/**
	 * 添加购物车
	 */
	addCart: function(e) {
		let that = this;
		let productId = e.currentTarget.dataset.pid;
		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: productId, quantity: '1' }, function(res) {

			// 达观数据上报
			// util.uploadClickData_da('cart', [{ productId, actionNum: '1' }])

			my.showToast({
				content: '添加购物车成功'
			});
		}, function(res) {
			// wx.showToast({
			//   title: res
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

	// 点击跳转的商品详情页
	goToPage(e){
		let { url} = e.currentTarget.dataset

		my.navigateTo({
			url: url
		});
	},

	//-------搜索相关代码开始--------//
	// handleFocus: function () {
	//   var that = this;
	//   sendRequest.send(constants.InterfaceUrl.HOT_WORD, {}, function (res) {
	//     that.setData({
	//       hotWords: res.data.result
	//     });
	//   }, function (err) {
	//   }, 'GET');
	//   try {
	//     var searchWords = my.getStorageSync({
	//       key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
	//     }).data;
	//     that.setData({
	//       searchWords: searchWords,
	//       show: true
	//     });
	//   } catch (e) { }
	// },
	// handleBlur: function (e) {
	//   this.setData({
	//     show: false
	//   });
	// },
	// handleConfirm: function (event) {
	//   this.goToSearchPage(event.detail.value);
	// },
	// chooseWord: function (event) {
	//   this.goToSearchPage(event.currentTarget.dataset.word);
	// },
	// goToSearchPage(keyWord) {
	//   if (keyWord && keyWord.trim()) {
	//     my.navigateTo({
	//       url: '/pages/home/searchResult/searchResult?keyWord=' + keyWord
	//     });
	//   }
	// },
	// clearHist: function () {
	//   try { } catch (e) {
	//     my.setStorageSync({
	//       key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
	//       data: [], // 要缓存的数据
	//     });
	//   }
	// }
	//-------搜索相关代码结束--------//

});
