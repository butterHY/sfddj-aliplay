/**
 * 店铺简介页面
 * @author 01368384
 * 
 */

let sendRequest = require('../../../utils/sendRequest.js');
let constants = require('../../../utils/constants.js');
let utils = require('../../../utils/util.js')
let baseImageUrl = constants.UrlConstants.baseImageUrl //图片资源地址前缀
let app = getApp()

import http from '../../../api/http.js'
import api from '../../../api/api.js'

Page({
	data: {
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		baseImageUrl,
		smallImgArg: '?x-oss-process=style/goods_img_2',
		supplierId: null,
		tabIndex: 0, //当前选中的tab索引
		sortIndex: 0,   //商品排序索引
		sortPriceUp: false,  //价格排序是否是从低到高
		//新版搜索的数据
		placeholder: '',
		isShowSearch: false, // 新版搜索组件显示开关
		isFocus: false, // 新版搜索组件焦点开关

		categroyList: [],     //商家商品分类数据
		cateLeftIndex: 0,      //商家左边分类的索引

		supplierCouponList: [{}, {}, {}, {}, {}, {}, {}],

		sortNavOnTop: false,     //排序导航是否置顶 
		attentionStatus: false,   //是否关注店家
	},
	onLoad: function (options) {
		if (options.supplierId) {
			this.setData({
				supplierId: options.supplierId
			})
			this.getSupplierDetail(options.supplierId)
			this.getSupplierGoods(options.supplierId)
			this.getSupplierCateList();
			// 判断是否关注店铺
			this.getAttentionStatus()
		}
	},

	onShow() {
		let that = this
		// 回到页面关闭搜索组件
		this.setData({
			placeholder: my.getStorageSync({ key: 'searchTextMax' }).data,
			isFocus: false,
			isShowSearch: false,
		});
		if (that.searchComponent) {
			that.searchComponent.setData({ inputVal: '' });
		}
	},

	/**
		* 存储新版搜索组件实例
	  */
	saveRef(ref) {
		this.searchComponent = ref;
	},

	/**
	 * 获取商家详情
	 * @param supplierId 商家Id
	 */
	getSupplierDetail: function (supplierId) {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.SUPPLIER_DETAIL + supplierId, {
			supplierId: supplierId
		},
			function (res) {
				if (res.data.result) {
					that.setData({
						supplierDetail: res.data.result,
						loadComplete: true,
						loadFail:false
					})
				}

			},
			function (res) {

			})
	},

	/**
	 * 获取商家所有商品
	 * @param supplierId
	 */
	getSupplierGoods: function (supplierId) {
		var that = this
		my.showLoading({
			title: '加载中',
		})
		sendRequest.send(constants.InterfaceUrl.GET_SUPPLIER_GOODS_VO + supplierId, {
			supplierId: supplierId
		}, function (res) {
			that.setData({
				goodslist: res.data.result,
				baseImageUrl: baseImageUrl
			})
			my.hideLoading()
		}, function (res) {
			my.hideLoading()
		})
	},

	// 获取商家的分类
	getSupplierCateList() {
		let that = this;
		let data = {
			supplierId: this.data.supplierId
		}

		http.get(api.SUPPLIER.SUPPLIER_GOODS_CATE, data, res => {
			let result = res.data.data ? res.data.data : []
			that.setData({
				categroyList: result
			})
		}, err => { })
	},

	// 判断是否关注店铺
	getAttentionStatus() {
		let that = this
		let data = {
			supplierId: this.data.supplierId
		}
		http.get(api.SUPPLIER.ATTENTION_STATUS, data, res => {
			let status = res.data.data == 'true' || res.data.data == true ? true : false
			that.setData({
				attentionStatus: status
			})
		}, err => {

		})
	},

	/**
	 * 添加到购物车
	 */
	addCart: function (e) {
		var that = this
		var productId = e.currentTarget.dataset.pid
		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, {
			pId: productId,
			quantity: '1'
		}, function (res) {
			my.showToast({
				title: '添加购物车成功',
			})
		}, function (res) {
			// my.showToast({
			//   title: res,
			// })
			that.setData({
				// showDialog3: false,
				showToast: true,
				showToastMes: res
			})
			setTimeout(function () {
				that.setData({
					showToast: false
				})
			}, 2000)
		})
	},

	// 页面滚动处理
	onPageScroll(e) {
		let tabIndex = this.data.tabIndex
		let scrollTop = e.scrollTop
		let that = this
		let sortTopHeight = app.globalData.systemInfo.windowWidth * 232 / 750
		// 如果是全部商品时，滚动排序导航要置顶
		if (tabIndex == 1) {
			if (scrollTop > sortTopHeight) {
				that.setData({
					sortNavOnTop: true
				})
			}
			else {
				that.setData({
					sortNavOnTop: false
				})
			}
		}
	},

	// 点击关注店铺
	followStore() {
		let that = this
		// attentionStatus : false--取关， true -- 关注
		let data = {
			supplierId: this.data.supplierId,
			attention: !that.data.attentionStatus
		}
		http.get(api.SUPPLIER.ATTENT_STORE, data, res => {
			let toastMes = !that.data.attentionStatus ? '关注成功' : '取关成功'
			that.setData({
				attentionStatus: !that.data.attentionStatus
			})
			// utils.wxShowToast(toastMes, that, 2000)
			my.showToast({
				content: toastMes
			})
		}, err => {
			// utils.wxShowToast(err, that, 2000)
			my.showToast({
				content: err
			})
		})
	},

	// 切换底部tab栏
	switchTab(e) {
		let {
			index
		} = e.currentTarget.dataset
		//如果点击同一个则不做处理
		if (index != this.data.tabIndex) {
			my.pageScrollTo({ scrollTop: 0 })
		}

		this.setData({
			tabIndex: index * 1,
			sortNavOnTop: false,    //重置排序导航位置
		})
	},

	// 切换商品排序类型
	switchSortFn(e) {
		let { index } = e.currentTarget.dataset
		this.setData({
			sortIndex: index * 1
		})
	},

	// 切换商家商品的分类 -- 左边
	switchStoreCate(e) {
		let { index } = e.currentTarget.dataset
		this.setData({
			cateLeftIndex: index * 1
		})
	},

	/**
	* 新版搜索组件开关
	*/
	showSearch(noGetHistory) {
		noGetHistory == 'noGetHistory' ? '' : 	this.searchComponent.getHistory();
		this.setData({
			isShowSearch: !this.data.isShowSearch,
			isFocus: !this.data.isFocus,
		})
	},

	/**
	 * 显示商家介绍
	 */
	showStoreDesc: function (e) {
		this.setData({
			showStoreDesc: true
		})
	},
	/**
	 * 关闭商家介绍
	 */
	dismiss: function (e) {
		this.setData({
			showStoreDesc: false
		})
	},

	// 跳去客服网页版
	goToWebCall: function () {
		var that = this
		var webCallLink = that.data.supplierDetail.webCallParam
		try {
			my.setStorageSync('webCallLink', webCallLink)
		} catch (e) {

		}
		my.navigateTo({
			url: '/pages/user/webCallView/webCallView?link=' + webCallLink,
		})
	},

})