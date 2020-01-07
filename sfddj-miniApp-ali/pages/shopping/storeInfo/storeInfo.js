// var _myShim = require('........my.shim');
/**
* 店铺简介页面
* @author 01368384
* 
*/

var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var utils = require('../../../utils/util');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀

Page({
	data: {
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		smallImgArg: '?x-oss-process=style/goods_img_3',
		cantScroll: false,
		start: 0,
		limit: 10,
		goodsList: [],
		loadComplete: false,
		loadFail: false
	},
	onLoad: function(options) {
		// utils.getNetworkType(this);
		if (options.supplierId) {
			this.getSupplierDetail(options.supplierId);
			this.getSupplierGoods(options.supplierId, 0);
			this.setData({
				supplierId: options.supplierId
			})
		}
	},

	/**
	 * 获取商家详情
	 * @param supplierId 商家Id
	 */
	getSupplierDetail: function(supplierId) {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.SUPPLIER_DETAIL + supplierId, { supplierId: supplierId }, function(res) {
			if (res.data.result) {
				that.setData({
					baseImageUrl: baseImageUrl,
					supplierDetail: res.data.result,
					loadComplete: true,
					loadFail: false
				});
			}
		}, function(res) {
			that.setData({
				loadFail: true
			})
		});
	},

	/**
	 * 获取商家所有商品
	 * @param supplierId
	 */
	getSupplierGoods: function(supplierId, type) {
		var that = this;
		my.showLoading({
			content: '加载中'
		});
		this.setData({
			isLoadMore: true
		});
		sendRequest.send(constants.InterfaceUrl.GET_SUPPLIER_GOODS_VO + supplierId, { supplierId: supplierId, start: that.data.start, limit: that.data.limit }, function(res) {
			// that.setData({
			//   goodslist: res.data.result,
			//   baseImageUrl: baseImageUrl
			// });
			var isLoadMore = false;
			var result = res.data.result;
			var hasMore = false;
			var goodsList = that.data.goodsList;
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
				hasMore: hasMore,
				isLoadMore: isLoadMore,
				baseImageUrl: baseImageUrl
			});
			my.hideLoading();
		}, function(res) {
			my.hideLoading();
			that.setData({
				isLoadMore: false
			});
		});
	},

	/**
	* 添加到购物车
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
	 * 显示商家介绍
	 */
	showStoreDesc: function(e) {
		this.setData({
			showStoreDesc: true,
			cantScroll: true
		});
	},
	/**
	 * 关闭商家介绍
	 */
	dismiss: function(e) {
		this.setData({
			showStoreDesc: false,
			cantScroll: false
		});
	},

	// 跳去客服网页版
	goToWebCall: function() {
		var that = this;
		var webCallLink = that.data.supplierDetail.webCallParam;
		try {
			my.setStorageSync({
				key: 'webCallLink', // 缓存数据的key
				data: webCallLink, // 要缓存的数据
			});
		} catch (e) { }
		my.navigateTo({
			url: '/pages/user/webCallView/webCallView?link=' + webCallLink
		});
	},


	// 滚动到底部加载
	onReachBottom() {
		if (this.data.hasMore) {
			this.setData({
				start: this.data.goodsList.length
			});
			this.getSupplierGoods(this.data.supplierId, 1);
		}
	}

});