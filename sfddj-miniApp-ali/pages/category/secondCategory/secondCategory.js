// var _myShim = require('........my.shim');
/**
* 二级分类页面
* @author 01368384
*  
*/
let sendRequest = require('../../../utils/sendRequest');
let constants = require('../../../utils/constants');
let util = require('../../../utils/util');
let baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
let { windowHeight, windowWidth } = my.getSystemInfoSync();

import _ from 'underscore'


Page({

	data: {
		// 头部分类数组
		childrenCategoryTags: [],
		// 请求商品数据的 id
		categoryId: '',
		// 是否有父级的 id
		isFatherCategory: false,
		start: 0,
		limit: 10,
		goodsList: [],
		hasMore: true,
		isLoadMore: false,
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		showToast: false,
		loadComplete: false,
		loadFail: false,
		floatVal: 50,
		cateHeight: 100,
		user_memId: '默认是会员',         //是否存在memberId，判断是否绑定手机号


		isShowSearch: false,								// 新版搜索组件显示开关
		isFocus: false,											// 新版搜索组件焦点开关
		searchComponent: null,							// 新版搜索组件实例
	},

	onLoad: async function(options) {
		var that = this;
		console.log(options)
		//获取父分类信息
		var fatherCategory = {};
		    fatherCategory = my.getStorageSync({ key: constants.StorageConstants.fatherCategoryId }).data ? my.getStorageSync({ key: constants.StorageConstants.fatherCategoryId }).data : {}; //获取父分类信息
		var detfatherCategory = my.getStorageSync({ key: constants.StorageConstants.detfatherCategory }).data ? my.getStorageSync({ key: constants.StorageConstants.detfatherCategory }).data : {}; //获取商详页分类信息
		if(Object.keys(detfatherCategory).length != 0) {
			fatherCategory = detfatherCategory
		}
		var name = '';
		// if(fatherCategory){
		//   name = fatherCategory.name
		// }
		// 设置页面头部的 title 
		my.setNavigationBar({
			title: fatherCategory.name ? fatherCategory.name : "顺丰大当家",
			success: (res) => {
			},
		});
		fatherCategory.name = '精选'; //更改父分类信息为精选

		// 获取子类的 id+name 列表,父类id+name， 拼接组成头部分类数组：newChildrenCateTags；
		try {
			this.data.childrenCategoryTags = my.getStorageSync({
				key: constants.StorageConstants.childrenCategoryKey, // 缓存数据的key
			}).data ? my.getStorageSync({
				key: constants.StorageConstants.childrenCategoryKey,
			}).data : {};
		} catch (e) { };



		// 有商详页缓存的父类 id 则请求父类分类数据使用该父类的数据，，没有就说明是从父页分类进来的，那走原来的逻辑;
		if( detfatherCategory.id ){
				// 获取如果缓存中有父类的 id 则请求父类分类数据使用该父类的数据, 但不缓存子类数据，为了和分类页用户的行为保持一致；
				let send = await that.getChildCategoryTags(fatherCategory.id);
				if( send.type == 'success' && send.data && send.data.children && send.data.children.length > 0 ) {
					this.data.childrenCategoryTags = send.data.children;
				}
		}

		console.log('开始合并父类和子类的数据')
		var newChildrenCateTags = [];
		newChildrenCateTags = newChildrenCateTags.concat(fatherCategory, this.data.childrenCategoryTags);
		this.data.childrenCategoryTags = newChildrenCateTags;

		// 携带过来的子类 id 与 全部子类 id 匹配，如果相等，则给这个子类对象添加一个新的属性：value.taped = true;
		// this.data.childrenCategoryTags.unshift(fatherCategory);
		this.data.childrenCategoryTags.forEach(function(value, index, arr) {
			if (options.categoryId && options.categoryId == value.id) {
				value.taped = true;
			}
		});
		this.setData({
			childrenCategoryTags: this.data.childrenCategoryTags
		});
		// util.getNetworkType(this);

		// 原有的构想是如果有传过来的子类 id 则请求这个子类的商品数据；
		if (options.categoryId) {
			this.data.categoryId = options.categoryId;
			that.getGoodsData(0);
		}
	},

	onShow() {
		// 回到页面关闭搜索组件
		console.log('关闭搜索组件');
		console.log(this.searchComponent);
		this.setData({
			isFocus: false,
			isShowSearch: false,
		});
		if( this.searchComponent ) {
			this.searchComponent.setData({inputVal: ''});
			this.searchComponent.getHistory();
			this.searchComponent.data.pageType = 'secondCategory';
			console.log(this.searchComponent)
		}
	},

	getChildCategoryTags(id) {
		let that = this;
		return new Promise( (reslove, reject) => {
			sendRequest.send(constants.InterfaceUrl.HOME_ALL_CATEGORY, {}, function(res) {
				let categoryTags = res.data.result.dtoList;
				if ( categoryTags.length > 0 ) {
					let fatherCategory = categoryTags.find(value => value.id == id);
					console.log(categoryTags);
					console.log(fatherCategory);
					reslove({
						type: 'success',
						data: fatherCategory
					})
				} else {
					reject({
						type: 'fail'
					})
				}
			},function(err) {
				reject({
					type: 'fail'
				})
			})
		})
	},

	/**
	 * 根据categoryId查询商品列表
	 * type 0:刷新 1:加载更多
	 */
	getGoodsData: function(type) {
		var that = this;
		// 开启进度条
		this.setData({
			isLoadMore: true
		});
		// 一开始进入页面，isFatherCategory 为 false, 请求的数据是从进入页面的携带过来的子类的 id 的数据，接口是子类接口，如果为 true 则请求的是父类的接口
		var url = this.data.isFatherCategory ? constants.InterfaceUrl.CATEGORY_LOAD_ALL : constants.InterfaceUrl.CATEGORY_LOAD_ONE;
		sendRequest.send(url, {
			categoryId: this.data.categoryId,
			start: this.data.start,
			limit: this.data.limit
		}, function(res) {
			// if (res.data.errorCode == '0001') {
			//   if (that.data.start == 0) {
			//     that.data.goodsList = res.data.result
			//   } else {
			//     that.data.goodsList = that.data.goodsList.concat(res.data.result)
			//   }
			// } else {
			//   if (that.data.start == 0) {
			//     that.data.goodsList = []
			//   }
			// }

			if (type == 0) {
				// 判断是否绑定了手机
				try {
					let user_memId = my.getStorageSync({
						key: "user_memId",
					}).data;
					that.setData({
						user_memId: user_memId == 'null' || user_memId == null || user_memId == 'undefined' || user_memId == undefined ? '默认是会员' : user_memId
					})
				} catch (e) {
				}
			}

			var isLoadMore = false;
			var result = res.data.result;
			var hasMore = false;
			var goodsList = that.data.goodsList;

			// 如果返回的数据长度等于请求条数说明还有更多数据
			if (result && result.length == that.data.limit) {
				hasMore = true;
			}
			if (type == 0) {
				goodsList = result;
			} else {
				goodsList = goodsList.concat(result);   // 每次加载拼接进去的数据
			}
			that.setData({
				goodsList: goodsList,
				baseImageUrl: baseImageUrl,
				hasMore: hasMore,         // 是否还有更多
				isLoadMore: isLoadMore,   // 正在加载中的加载进度条
				loadComplete: true,       // 加载完成
				loadFail: false           //  加载失败
			});

			// 获取达观可上报数据
			// if (type == 0) {
			// 	that.getUploadData_da();
			// }

		}, function(err) {
			that.setData({
				isLoadMore: false,
				loadFail: true
			});
		});
	},

	/**
	 * 点击tag更新商品列表显示，重新请求数据，更新商品列表显示
	 * @param e 点击参数
	 */
	tagViewTap: function(e) {
		var that = this;
		var id = e.currentTarget.id;
		that.data.childrenCategoryTags.forEach(function(value, index, array) {
			if (index == id) {
				value.taped = true;
				that.data.categoryId = value.id ? value.id : that.data.categoryId;
				that.data.isFatherCategory = id == 0;
			} else {
				value.taped = false;
			}
		});
		that.setData({
			childrenCategoryTags: that.data.childrenCategoryTags,
			goodsList: []
		});
		that.data.start = 0;
		that.getGoodsData(0);

		//滚动到屏幕顶部
		// my.pageScrollTo({
		//   scrollTop: 0
		// });
		that.setData({
			scrollTop: 0
		})
	},

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
			this.getGoodsData(1);
		}
	},

	/**
	 * 监听屏幕滚动事件，调整tagView显示， 顶部分类导航模块的 ‘吸顶效果’
	 * @param e 滑动参数
	 */
	scrollingFn: _.debounce(function(e) {
		var height = util.px2Rpx(e.detail.scrollTop);
		this.setData({
			sticky: height >= 120
		});

		// 获取可上报的数据
		// this.getUploadData_da();

	}, 300),


	// 获取达观上报数据
	getUploadData_da() {
		let uploadData = [];
		// 循环获取达观上报的数据
		for (let i = 0; i < this.data.goodsList.length; i++) {
			let goodsClass = '.js_goodsList_' + i;
			let item = this.data.goodsList[i];
			if (!item.isLoaded) {
				my.createSelectorQuery().select(goodsClass).boundingClientRect().exec(res => {
					let result = res[0];
					// 如果查询到有结果才能进行位置判断 
					if (result && result != 'null') {
						// 如果符合此判断的商品数据才能上报jsxClosingElement
						if (result.top < (windowHeight - util.rpx2Px(this.data.cateHeight)) && result.bottom > this.data.floatVal && result.left >= 0 && (result.right - this.data.floatVal) < windowWidth) {
							// 截取商品编码
							let goodsSn = item.goodsSn;
							let setAdsLoad = "goodsList[" + i + "].isLoaded";   //更新此元素已加载完
							uploadData.push({ goodsSn: goodsSn });      //保存能上报的数据
							this.setData({
								[setAdsLoad]: true
							})

							// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
							if (i == (this.data.goodsList.length - 1)) {
								if (uploadData && Object.keys(uploadData).length > 0) {
									util.uploadClickData_da('rec_show', uploadData)
								}

							}

						}
						else {
							// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
							if (i == (this.data.goodsList.length - 1)) {
								if (uploadData && Object.keys(uploadData).length > 0) {
									util.uploadClickData_da('rec_show', uploadData)
								}
							}
						}
					}
					else {
						// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
						if (i == (this.data.goodsList.length - 1)) {
							if (uploadData && Object.keys(uploadData).length > 0) {
								util.uploadClickData_da('rec_show', uploadData)
							}
						}
					}
				});
			}
			else {
				if (i == (this.data.goodsList.length - 1)) {
					if (uploadData && Object.keys(uploadData).length > 0) {
						util.uploadClickData_da('rec_show', uploadData)
					}
				}
			}

		}
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
	// handleBlur: function(e) {
	// 	this.setData({
	// 		show: false
	// 	});
	// },
	// handleConfirm: function(event) {
	// 	this.goToSearchPage(event.detail.value);
	// },
	// chooseWord: function(event) {
	// 	this.goToSearchPage(event.currentTarget.dataset.word);
	// },
	// goToSearchPage(keyWord) {
	// 	if (keyWord && keyWord.trim()) {
	// 		// util.uploadClickData_da('search', [{ keyword: keyWord }])

	// 		my.navigateTo({
	// 			url: '/pages/home/searchResult/searchResult?keyWord=' + keyWord
	// 		});
	// 	}
	// },
	// clearHist: function() {
	// 	try {
	// 		my.setStorageSync({
	// 			key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
	// 			data: [], // 要缓存的数据
	// 		});
	// 	} catch (e) {

	// 	}
	// },
	//-------搜索相关代码结束--------//


	// 获取手机号
	getPhoneNumber: function(e) {
		var that = this;

		my.getPhoneNumber({
			success: (res) => {
				let response = res.response
				sendRequest.send(constants.InterfaceUrl.USER_BINGMOBILEV4, {
					response: response,
				}, function(res) {
					console.log(res)
					if (res.data.result) {
						try {
							my.setStorageSync({ key: constants.StorageConstants.tokenKey, data: res.data.result.loginToken });
							my.setStorageSync({ key: 'user_memId', data: res.data.result.memberId });
						} catch (e) {
							my.setStorage({ key: 'user_memId', data: res.data.result.memberId });
						}
					}
					else {
					}

					my.showToast({
						content: '绑定成功'
					})
					that.setData({
						user_memId: res.data.result ? res.data.result.memberId : '默认会员'
					})
				}, function(res, resData) {
					var resData = resData ? resData : {}
					if (resData.errorCode == '1013') {
						that.setData({
							user_memId: '默认会员'
						})
						my.setStorage({ key: 'user_memId', data: '默认会员' });
					}
					else {
						my.showToast({
							content: res
						})
					}
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
		return
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
		console.log(noGetHistory);
		this.searchComponent.getHistory()
		// noGetHistory == 'noGetHistory' ? '' : 	this.searchComponent.getHistory();
		this.setData({
			isShowSearch: !this.data.isShowSearch,
			isFocus: !this.data.isFocus,
		})
	}

});