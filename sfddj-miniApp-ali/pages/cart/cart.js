// var _myShim = require('......my.shim');

/**
* 购物车tab页
* @author 01368384
*/
let sendRequest = require('../../utils/sendRequest');
let constants = require('../../utils/constants');
let baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
let utils = require("../../utils/util");
import http from '../../api/http'
import api from '../../api/api'
let result = [];
let AllFlag = false;
let cartIdArray = []; //选中的购物车id数组
let app = getApp();

let startX, startY, endX, endY, key;
// var startY;
// var endX;
// var endY;
// var key;
let maxRight = 120;

let {
	windowHeight,
	windowWidth
} = my.getSystemInfoSync();

import _ from 'underscore'

Page({
	data: {
		loadComplete: false,
		loadFail: false,
		errMsg: '',
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		baseImageUrl: baseImageUrl,
		showToast: false,
		result: [],
		wifiAvailable: true,
		smallImgArg: '?x-oss-process=style/goods_img_3',
		guessTop: 0,
		floatVal: 50,
		swipeIndex: null,
		slideButtons: { right: [{ type: 'delete', text: '删除' }] },
		user_memId: '默认是会员',         //是否存在memberId，判断是否绑定手机号
		isProhibitTap: false,                                     // 当点击数量输入框获取焦点的时候，则禁止数量左右的加减事件
		likeStart: 0, //猜你喜欢开始索引
		likeLimit: 20, //猜你喜欢每次请求的条数
		recommondList: [],    //猜你喜欢列表
		isLoadComplete: false,
		// isFocus: false,
	},

	/**
	 * 初始化，加载大当家推荐数据
	 */
	onLoad: function (options) {
		var that = this;


		// 静态增加
		result = that.data.result;
		cartIdArray = [];


		// 友盟+统计  ----购物车页浏览
		getApp().globalData.uma.trackEvent('myCartView');
		// 猜你喜欢
		this.getGuessLike(0)

	},

	/** 
	 * 每次进入页面刷新最新购物车数据
	 */
	onShow: function () {
		var that = this;
		// 初始化
		cartIdArray = [];
		// utils.getNetworkType(this);
		// this.setData({
		//   isFocus: false
		// })
		this.getCartData();

		that.getCartNumber();
	},

	/**
	 * 下拉刷新数据
	 */
	onPullDownRefresh: function () {
		// utils.getNetworkType(this);
		this.getCartData();
	},

	onSwipeStart(e) {
		this.setData({
			swipeIndex: e.index,
		});
	},

	// 滚动
	_onPageScroll: _.debounce(function (e) {
		let {
			scrollTop
		} = e;


		if (this.data.guessTop > 0 && scrollTop >= this.data.guessTop) {
			this.filter_da_data();
		}

	}, 300),

	// 筛选可上报的猜你喜欢的数据
	filter_da_data() {
		let da_upload = [];
		let { recommondList } = this.data;

		for (let i = 0; i < recommondList.length; i++) {
			let goodsClass = '.js_goodsList_' + i;

			if (!recommondList[i].isLoaded) {
				my.createSelectorQuery().select(goodsClass).boundingClientRect().exec(res => {
					let result = res[0];
					if (result && result != 'null' && result != 'undefined') {
						// for (let i = 0; i < result.length; i++) {
						// 	let item = result[i];

						// }
						if (result.top < windowHeight && result.bottom > this.data.floatVal && result.left >= 0 && (result.right - this.data.floatVal) < windowWidth) {
							let { goodsSn } = recommondList[i];
							let setLoadName = 'recommondList[' + i + '].isLoaded';
							this.setData({
								[setLoadName]: true
							})

							da_upload.push({
								goodsSn: goodsSn,
							});
							// 如果是最后一个数据，刚上报数据
							if (i == recommondList.length - 1) {
								if (da_upload && Object.keys(da_upload).length > 0) {
									utils.uploadClickData_da('rec_show', da_upload)
								}
							}

						} else {
							// 如果是最后一个数据，刚上报数据
							if (i == recommondList.length - 1) {
								if (da_upload && Object.keys(da_upload).length > 0) {
									utils.uploadClickData_da('rec_show', da_upload)
								}
							}
						}
					}
					else {
						// 如果是最后一个数据，刚上报数据
						if (i == recommondList.length - 1) {
							if (da_upload && Object.keys(da_upload).length > 0) {
								utils.uploadClickData_da('rec_show', da_upload)
							}
						}
					}
				})
			}
			else {
				// 如果是最后一个数据，刚上报数据
				if (i == recommondList.length - 1) {
					if (da_upload && Object.keys(da_upload).length > 0) {
						utils.uploadClickData_da('rec_show', da_upload)
					}
				}
			}


		}


	},

	// 获取猜你喜欢的数据 ---旧的
	getGuessLikeOld() {
		var that = this

		sendRequest.send(constants.InterfaceUrl.SHOP_FIND_GROUP, {

			groupName: '大当家推荐'
		}, function (res) {
			that.setData({
				recommondList: res.data.result,
				baseImageUrl: baseImageUrl,
				// loadComplete: true
			})





		}, function (err) {
			that.setData({
				// loadComplete: true,
				// loadFail: true,
				// errMsg: err
				recommondList: []

			})



		})
	},

	// 新的猜你喜欢
	getGuessLike(type) {
		let that = this;
		let data = {
			start: this.data.likeStart,
			limit: this.data.likeLimit,
			groupName: '支付宝小程序猜你喜欢'
		}
		http.get(api.GOODS.LISTGOODSBYNAME, data, res => {
			let result = res.data.data ? res.data.data : []
			let lastRecommentList = that.data.recommondList
			let recommondList = []
			let isLoadComplete = false
			if (result.length < that.data.likeLimit) {
				isLoadComplete = true
			}
			if (type == 1) {
				recommondList = lastRecommentList.concat(result)
			}
			else {
				recommondList = result
			}
			that.setData({
				recommondList: recommondList,
				isLoadComplete
			})
		}, err => {
			that.setData({
				recommondList: []
			})
		})
	},

	// 设置滚动到猜你喜欢的时候的高度
	setGuessTop() {
		if (this.data.recommondList && Object.keys(this.data.recommondList).length > 0) {
			my.createSelectorQuery().select('.js_guessLike').boundingClientRect().exec(res => {
				let result = res[0];
				if (result && result != 'null' && result != 'undefined') {
					let guessTop = result.top - windowHeight - 40 - utils.rpx2Px(100);
					this.setData({
						guessTop: guessTop
					})
				}
			})
		}
	},

	getCartDataOld: function () {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.SHOW_CART, {}, function (res) {
			// 获取猜你喜欢
			// that.getCartData();
			result = res.data.result;
			// 初始化每个商品的位置
			for (var i = 0; i < result.length; i++) {
				var resultItem = result[i].productList;
				result[i].shelves = result[i].productList.every(item => item.shelves == 2) ? 2 : 0
				// for (var j = 0; j < resultItem.length; j++) {
				// 	resultItem[j].right = 0;
				// 	resultItem[j].taped = false;
				// }
			}
			that.setData({
				result: result,
				baseImageUrl: baseImageUrl,
				count: 0,
				totalPrice: '0.00',
				AllFlag: false,
				loadComplete: true,
				loadFail: false
			});
			my.hideLoading();
			my.stopPullDownRefresh();

			// that.setGuessTop()

		}, function (res) {
			// 获取猜你喜欢
			// that.getGuessGroup();
			that.setData({
				loadFail: true,
				errMsg: res
			});
			my.hideLoading();
			my.stopPullDownRefresh();
		}, "GET");
	},


	getCartData: function (findex, index) {
		var that = this
		http.get(api.CART.SHOW_CART, {}, function (res) {

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


			// that.getGuessLike();

			result = res.data.data ? res.data.data : []

			for (var i = 0; i < result.length; i++) {
				result[i].shelves = !result[i].showCarts.every(item => item.shelves == false || item.sellout == 1);
				result[i].showCarts.forEach(function (value) {
					value.copyQuantity = value.quantity;
				})
			}
			that.setData({
				result: result,
				baseImageUrl: baseImageUrl,
				count: 0,
				totalPrice: '0.00',
				AllFlag: false,
				loadComplete: true,
				loadFail: false,
			})
			my.hideLoading();
			my.stopPullDownRefresh()

		}, function (res) {
			that.setData({
				loadFail: true,
				errMsg: res,
				loadComplete: true
			})
			my.hideLoading();
			my.stopPullDownRefresh()
		})
	},

	/**
	 * 点击商店全选或反选，更改商店下商品选择态
	 */
	shopSelectTap: function (e) {
		var findex = e.currentTarget.dataset.findex;
		result[findex].taped = !result[findex].taped;
		var productList = result[findex].showCarts;
		productList.forEach(function (value, index, arr) {
			if (value.shelves && value.sellout == 0) {
				value.taped = result[findex].taped
			}
		});
		this.setAll();
	},

	/**
	 * 点击商品选择或反选，更改选择态
	 */
	productSelectTap: function (e) {
		var findex = e.currentTarget.dataset.findex;
		var index = e.currentTarget.dataset.index;
		var product = result[findex].showCarts[index];
		product.taped = !product.taped;
		this.setShopSelect(findex);
	},

	/**
	 * 点击全选或反选，更改全部商品的选择态
	 */
	allSelectedTap: function (e) {
		AllFlag = !AllFlag;
		result.forEach(function (v1, i1, arr1) {
			if (v1.shelves) {
				var productList = v1.showCarts
				v1.taped = AllFlag
				productList.forEach(function (v, i, arr) {
					if (v.shelves && v.sellout == 0) {
						v.taped = AllFlag
					}
				})
			}
		});
		this.setAll();
	},

	/**
	 * 选择单个商品后，更改商店列表的选择态
	 */
	setShopSelect: function (findex) {
		var flag = true;
		var productList = result[findex].showCarts;
		for (var i = 0; i < productList.length; i++) {
			if (!productList[i].taped && productList[i].shelves && productList[i].sellout == 0) {
				flag = false;
				break;
			}
		}
		result[findex].taped = flag;
		this.setAll();
	},

	/**
	 * 商品选择态更新后，更改全选按钮状态，更新结算数量和总价格
	 */
	setAll: function () {
		AllFlag = true;
		var count = 0;
		var totalPrice = 0;
		cartIdArray = [];
		result.forEach(function (v1, i1, arr1) {
			var productList = v1.showCarts;
			if (v1.shelves) {
				productList.forEach(function (v, i, arr) {
					if (v.shelves && v.sellout == 0) {
						if (v.taped) {
							count++
							totalPrice += v.salePrice * v.quantity
							cartIdArray.push(v.cartId)
						} else {
							AllFlag = false
						}
					}

				})
			}
		});
		totalPrice = totalPrice.toFixed(2);
		this.setData({
			result: result,
			count: count,
			totalPrice: totalPrice,
			AllFlag: AllFlag
		});
	},
	/**
	 * 点击去结算
	 */
	toPayTap: function (e) {
		if (cartIdArray.length > 0) {

			my.navigateTo({
				url: '/pages/shopping/confirmOrder/confirmOrder?&cartIdArray=' + cartIdArray + '&fromPage=cart'
			});
		} else {
			my.showToast({
				content: '请选择商品'
			});
		}
	},

	/**
	 * 添加到购物车
	 */
	addCart: function (e) {
		let that = this;
		let productId = e.currentTarget.dataset.pid;
		// my.showLoading({
		// 	content: '加载中'
		// });


		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: productId, quantity: '1' }, function (res) {

			// 达观数据上报
			// utils.uploadClickData_da('cart', [{ productId, actionNum: '1' }])

			// my.hideLoading();
			my.showToast({
				content: '添加购物车成功'
			});
			// wx.showLoading({
			//   title: '加载中',
			// })
			that.getCartData(); //更新购物车
			that.getCartNumber();
		}, function (res) {
			my.hideLoading();
			// wx.showToast({
			//   title: res,
			// })
			that.setData({
				// showDialog3: false,
				showToast: true,
				showToastMes: res
			});
			setTimeout(function () {
				that.setData({
					showToast: false
				});
			}, 2000);
		});
	},

	/**
	* 减数量，不能小于0
	*/
	subtractTap: function (e) {
		var that = this;
		if (that.data.isProhibitTap) {
			return;
		}

		var findex = e.currentTarget.dataset.findex;
		var index = e.currentTarget.dataset.index;
		var quantity = parseInt(e.currentTarget.dataset.quantity);
		var cartId = e.currentTarget.dataset.cartid;
		if (quantity == 1) {
			my.showToast({
				content: '不能少于1'
			});
			return;
		}
		quantity--;

		that.updateCart(cartId, quantity, findex, index);
	},

	/**
	 * 修改购物车数量
	 */
	updateCart: function (cartId, quantity, findex, index, isOnnBlur) {
		var that = this;
		// my.showLoading({
		// 	content: '加载中'
		// });
		sendRequest.send(constants.InterfaceUrl.SHOP_UPDATE_CART, { cartId: cartId, quantity: quantity }, function (res) {
			result[findex].showCarts[index].quantity = quantity;
			result[findex].showCarts[index].copyQuantity = quantity;
			// result[findex].productList[index].totalPrice = (quantity * that.data.result[findex].productList[index].salePrice).toFixed(2);
			// my.hideLoading();
			my.showToast({
				content: '修改成功'
			});

			that.setData({
				result: result
			});

			that.setAll();

			if (isOnnBlur) {
				that.setData({
					isProhibitTap: false
				})
			}
			that.getCartNumber();
		}, function (res) {
			// my.hideLoading();
			my.showToast({
				content: res
			});
			if (isOnnBlur) {
				result[findex].showCarts[index].copyQuantity = result[findex].showCarts[index].quantity;
				that.setData({
					isProhibitTap: false,
					result: result
				})
			}
		});
	},

	/**
	 * 加数量，不能大于99
	 */
	addTap: function (e) {
		var that = this;
		if (that.data.isProhibitTap) {
			return;
		}

		var findex = e.currentTarget.dataset.findex;
		var index = e.currentTarget.dataset.index;
		var quantity = parseInt(e.currentTarget.dataset.quantity);
		var cartId = e.currentTarget.dataset.cartid;
		if (quantity == 99) {
			my.showToast({
				content: '不能大于99'
			});
			return;
		}
		quantity++;
		// 更新价格
		// that.data.result[findex].productList[index].totalPrice = quantity * that.data.result[findex].productList[index].salePrice

		// that.setData({
		//   result: that.data.result
		// })

		that.updateCart(cartId, quantity, findex, index);
	},

  /**
	* 点击数据输入数量（手动输入数量，如果数量大于最大数量，则让默认规格的各个价格和积分按照最大数量来计算，如果没有大于最大数量则还是按照输入的数量来计算）
	* */
	changeQuantity: function (e) {
		var that = this;
		var findex = e.currentTarget.dataset.findex;
		var index = e.currentTarget.dataset.index;
		// var quantity = parseInt(e.currentTarget.dataset.quantity);1
		var copyQuantity = Number(e.detail.value);
		var cartId = e.currentTarget.dataset.cartid;

		if (copyQuantity > 99) {
			my.showToast({
				content: '不能大于99'
			});
			copyQuantity = 99;
		}

		that.data.result[findex].showCarts[index].copyQuantity = copyQuantity;

		that.setData({
			result: that.data.result
		})

	},

	/**
 *输入数量失去焦点（失去焦点的时候如果数量小于最小数量或者等于 ‘’ , 那就把默认规格的各个价格和积分按照最低数量来计算）       
 * 
*/
	inputBlur: function (e) {
		var that = this;
		var findex = e.currentTarget.dataset.findex;
		var index = e.currentTarget.dataset.index;
		var quantity = that.data.result[findex].showCarts[index].quantity;
		var copyQuantity = Number(e.detail.value);
		var cartId = e.currentTarget.dataset.cartid;

		// 所有 Number(e.detail.value)  == NaN 的情况在 input 组件中返回都会转化为 0；
		if (copyQuantity == quantity) {
			that.setData({
				isProhibitTap: false
			})
			return;
		} else if (copyQuantity < 1 || copyQuantity == '') {
			my.showToast({
				content: '不能少于1'
			});
			copyQuantity = 1;
		} else if (!copyQuantity) {
			my.showToast({
				content: '请输入正确的数字'
			});
			that.setData({
				isProhibitTap: false
			})
			return;
		}

		that.updateCart(cartId, copyQuantity, findex, index, 'onBlur');
	},

	prohibitTap: function () {
		this.setData({
			isProhibitTap: true
		})
	},

	//---------------滑动删除逻辑开始---------------//
	drawStart: function (e) {
		var touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		for (var i in result) {
			var dataList = result[i].productList;
			for (var j in dataList) {
				var data = dataList[j];
				if (data.right == undefined || data.right == null) {
					data.right = 0;
				}
				data.startRight = data.right;
			}
		}
		key = true;
	},

	drawEnd: function (e) {
		var dataList = [];
		for (var i in result) {
			var dataList = result[i].productList;
			for (var j in dataList) {
				var data = dataList[j];
				if (data.right >= 120 / 2) {
					data.right = maxRight;
				} else {
					data.right = 0;
				}
			}
		}
		this.setData({
			result: result
		});
	},

	drawMove: function (e) {
		var self = this;
		var findex = e.currentTarget.dataset.findex;
		var index = e.currentTarget.dataset.index;
		if (key) {
			var touch = e.touches[0];
			endX = touch.clientX;
			endY = touch.clientY;
			if (endX - startX == 0) return;

			if (endX - startX < 0) {
				//从右往左
				var data = result[findex].productList[index];
				var startRight = data.startRight;
				var change = startX - endX;
				startRight += change;
				if (startRight > maxRight) startRight = maxRight;
				data.right = startRight;
			} else {
				//从左往右
				var data = result[findex].productList[index];
				var startRight = data.startRight;
				var change = endX - startX;
				startRight -= change;
				if (startRight < 0) startRight = 0;
				data.right = startRight;
			}
			this.setData({
				result: result
			});
		}
	},

	removeItem: function (e) {
		var that = this;
		var cartId = e.extra;

		this.setData({
			swipeIndex: null
		})
		my.confirm({
			content: '确定要删除该商品么?',
			confirmColor: '#FF5353',
			success: function (res) {
				if (res.confirm) {
					var removeCartAsync = async (cartId) => {
						var isSuccess = await that.removeCart(cartId);
						if (isSuccess.type == 'SUCCESS') {
							e.done()
						}
					}
					var isSuccess = removeCartAsync(cartId);

				} else { }

			}
		});
	},

	removeCart: function (cartId) {
		var that = this;
		return new Promise((reslove, reject) => {
			my.showLoading({
				content: '加载中'
			});
			sendRequest.send(constants.InterfaceUrl.SHOP_REMOVE_CART + cartId, { cartId: cartId }, function (res) {
				if (res.data.errorCode == '0001') {
					that.getCartData();
					that.getCartNumber();
					reslove({
						type: 'SUCCESS'
					})
				}
			}, function (res) {
				reject({
					type: 'FAIL'
				})
			});
		})
	},

	getNetworkType() {
		my.getNetworkType({
			success: (res) => {
				this.setData({
					wifiAvailable: res.networkAvailable
				})
			}
		});

	},


	//---------------滑动删除逻辑结束---------------//



	// 获取手机号
	getPhoneNumber: function (e) {
		var that = this;

		my.getPhoneNumber({
			success: (res) => {
				let response = res.response
				sendRequest.send(constants.InterfaceUrl.USER_BINGMOBILEV4, {
					response: response,
				}, function (res) {
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
				}, function (res, resData) {
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
* 获取购物车数量
*/
	getCartNumber: function () {
		var app = getApp();
		app.getCartNumber();
	},

	// 下拉刷新
	onReachBottom() {
		let that = this;
		if (!that.data.isLoadComplete) {
			that.setData({
				likeStart: that.data.recommondList.length
			})
			that.getGuessLike(1)
		}
	},


	// 跳转页面
	goToPage(e) {
		let { index, type, url } = e.currentTarget.dataset
		let {recommondList} = this.data

		if (type == 'recommond') {
			let data = {channel_source: 'mini_alipay', supplierName: recommondList[index].supplierNickName, supplierId: recommondList[index].supplierId, goodsName: recommondList[index].goodsName, goodsSn: recommondList[index].goodsSn, goodsCategoryId: recommondList[index].goodsCategoryId}
			// shopCart_guessLikeGoods
			getApp().globalData.uma.trackEvent('shopCart_guessLikeGoods', data);
		}
		if (url.indexOf('http') > -1) {
			my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
		}
		else {

			my.navigateTo({
				url: url
			});
		}
	},

});