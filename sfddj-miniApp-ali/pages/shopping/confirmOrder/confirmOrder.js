// var _myShim = require('........my.shim');
/**
* 确认订单页面
* @author 01368384
* 
* 跳转确认订单页面入口如下：
* 1.普通商品立即购买
* 2.普通商品送TA
* 3.购物车购买 
* 4.团购商品立即开团
* 5.团购商品团长免单
* 6.团购商品单独购买
* 7.参团下单 
* 
*/
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var utils = require('../../../utils/util');
var app = getApp();
// var 
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
var showType = "";
var invoiceHeadType = [{
	name: '个人',
	taped: true
}, {
	name: '公司'
}];
// var invoiceConType = [{
// 	name: '明细',
// 	taped: true
// }, {
// 	name: '办公用品(附购物清单)'
// }, {
// 	name: '电脑配件'
// }, {
// 	name: '耗材'
// }];
var invoiceConType = [{
	name: '明细',
	taped: true
}]
var invoiceData = {
	itype: 0,
	ihead: 0,
	icontent: "明细" //使用
}; var addressName = '';
Page({
	data: {
		isGiftOrder: false, //是否是送礼订单
		isTuangou: false, //是否团购
		fromPage: '',
		totalPrice: 0,          // 应付金额
		groupBuyActivityId: '', //团购活动id
		groupBuyRecordId: '', //团购记录id
		groupBuyType: '', //团购类型
		result: '',
		isTuanZhang: false, //是否团长免费
		couponId: '',
		needLoad: true,
		showType: 1,
		scrollView: true,
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		invoiceHeadType: invoiceHeadType, //发票抬头
		invoiceConType: invoiceConType, //发票内容
		invoiceMes: '添加发票信息',
		showToast: false,
		lotPintuan: false,
		isJifen: false,
		isSpike: false,       // 是否时秒杀商品
		isGiftOrder: false,
		showInvoiceView: true, //默认显示可选发票,
		itype: 0, //发票类型，0为普通发票 1为电子发票,
		eMailShow: false,
		idSave: false, //是否显示输入身份证还是已经保存后的身份证
		idCanSave: false, //能不能保存身份证
		canBuyGlobal: true, //全球购商品用户须知默认勾选
		globalGoods: false, //是否是全球购商品
		invoiceData: invoiceData, //设默认的发票信息
		timeOut: null,
		lessPay: 0.01, //余额抵扣最少要付0.01  
		SFmember: false,
		bbsData: [],
		botBtnH: 102,
		loadComplete: false,
		loadFail: false,
		iconSize: my.getSystemInfoSync().windowWidth * 34 / 750,  //icon勾选的大小
		da_upload_data: [],        //购买场景的达观上报的数据
		actionType: 'buy',         //达观上报场景类型
		invoiceOff: 'noInvoice',    //可开发票的类型， noInvoice--不可开发票, normal---只可开普通发票， electronic--只可开电子发票， multi---可开普通/电子发票
		initMobile: '',     //用来保存最原始的电话
		nowAddrId: null,     //当前选择的地址id
		// couponShow: false   // 优惠券弹窗
		isShowStoreCouponList: [],  //是否展示各个商家优惠券
		maxDeductPrice: 0,
    maxDeductPoint: 0,
    firstMaxDeductPoint: 0,
    firstMaxDeductPrice: 0,
    isDikou: false,
    userCouponId: 0, //
    canUseCouponCount: 0, //可用的平台优惠券数量
    totalCouponValue: 0, //总的优惠金额
    useSupplierCouponList: [], //使用商家券对应商家的id列表
	},

	onLoad: function(options) {
		var that = this;
		that.calcH();
		// 页面重新进来，重置发票信息
		invoiceData = {
			itype: 0,
			ihead: 0,
			icontent: "明细"

			// 判断是否是团长
		}; var isTuanZhang = options.isTuanZhang;
		if (options.isTuanZhang == 'true' || options.isTuanZhang == true) {
			isTuanZhang = true;
		} else {
			isTuanZhang = '';
		}

		// 判断是否上一级是从速运过来的
		var SFmember = options.SFmember;
		if (options.SFmember == 'true' || options.SFmember == true) {
			SFmember = true;
		} else {
			SFmember = false;
		}

		// 有没有带留言信息
		var bbsData = []
    bbsData = options.bbsData ? options.bbsData : [];

		that.setData({
			isTuanZhang: isTuanZhang,
			SFmember: SFmember,
			bbsData: bbsData,
			fromPage: options.fromPage ? options.fromPage : ''
		});

		// that.data.invoiceHeadType[0].taped = true;
		// that.data.invoiceConType[0].taped = true;

		// 进来要初始化发票抬头等信息
		for (var i = 0; i < that.data.invoiceHeadType.length; i++) {
			that.data.invoiceHeadType[i].taped = false;
			invoiceHeadType[i].taped = false;
			if (i == 0) {
				that.data.invoiceHeadType[i].taped = true;
				invoiceHeadType[i].taped = true;
			}
		}
		// 进来要初始化发票明细等信息
		// for (var j = 0; j < that.data.invoiceConType.length; j++) {
		// 	that.data.invoiceConType[j].taped = false;
		// 	invoiceConType[j].taped = false;
		// 	if (j == 0) {
		// 		that.data.invoiceConType[j].taped = true;
		// 		invoiceConType[j].taped = true;
		// 	}
		// }

		// that.data.fromPage = options.fromPage;

		// 拼团抽奖的标识

		// if (options.isGiftOrder) {
		that.data.isGiftOrder = options.isGiftOrder == 'true' || options.isGiftOrder == true ? true : false;
		// }
		// 是否是拼团抽奖产品带过来的
		// if (options.lotPintuan) {
		that.data.lotPintuan = options.lotPintuan == 'true' || options.lotPintuan == true ? true : false;
		// }


		if (that.data.fromPage == 'cart') {
			//从购物车进入
			// that.getCartData(options.cartIdArray)
			that.data.cartIdArray = options.cartIdArray;
		} else {
			//从其他方式购买进入
			that.data.isTuangou = options.isTuangou ? true : false;
			that.data.groupBuyType = options.groupBuyType ? options.groupBuyType : '';
			that.data.groupBuyActivityId = options.groupBuyActivityId ? options.groupBuyActivityId : '';
			that.data.groupBuyRecordId = options.groupBuyRecordId ? options.groupBuyRecordId : '';
			that.data.isTuanZhang = isTuanZhang ? true : false;
			that.data.productId = options.productId;
			that.data.quantity = options.quantity;
			that.setData({
				productId: that.data.productId,
				quantity: that.data.quantity
			});
			if (options.showType != undefined) {
				that.setData({
					showType: options.showType
				});
			}
			//that.getNowPayData(options.productId, options.quantity)
		}

		this.setData({
			isGiftOrder: that.data.isGiftOrder,
			isTuangou: that.data.isTuangou
		});
	},
	onShow: function() {
		var that = this;
		my.hideLoading();
		var nowAddrId = getApp().globalData.NowAddrId ? getApp().globalData.NowAddrId : that.data.NowAddrId;
		that.setData({
			nowAddrId: getApp().globalData.NowAddrId ? getApp().globalData.NowAddrId : that.data.nowAddrId
		})
		// 重置当前选择的地址id
		getApp().globalData.NowAddrId = null;
		// utils.getNetworkType(that);
		if (that.data.needLoad) {
			if (that.data.fromPage == 'cart') {
				//从购物车进入
				that.getCartData(that.data.cartIdArray,nowAddrId);
			} else {
				//从其他方式购买进入
				that.getNowPayData(that.data.productId, that.data.quantity,nowAddrId);
			}
			that.data.needLoad = false;
		}
	},

	onUnload() {
		clearTimeout(this.data.timeOut);
		// 重置全局缓存的地址
		getApp().globalData.NowAddrId = null
		console.log(';;------0000',getApp().globalData.NowAddrId);
	},

	// 计算中间内容的高度
	calcH() {
		var that = this;
		var sysInfo = my.getSystemInfoSync();
		var windowHeight = sysInfo.windowHeight;
		var screenWidth = sysInfo.screenWidth;
		var calcH = windowHeight - (screenWidth * that.data.botBtnH) / 750;
		that.setData({
			calcH: calcH
		})
	},

	addressManage: function(e) {
		var that = this;
		that.data.needLoad = true;
		// if(getApp().globalData.comeFrom == 'fengxian'){

		// }
		my.navigateTo({
			url: '/pages/user/addressManage/addressManage?comeFrom=confirmOrder'
		});
	},
	/**
	 * 获取购物车订单数据
	 */
	getCartData: function(cartIdArray,nowAddrId) {
		var that = this;
		var data = {
			cartIdArray: cartIdArray
		}
		if(nowAddrId) {
			data.addressId = nowAddrId
		}
		sendRequest.send(constants.InterfaceUrl.PAY_TO_CART_PAY, data, function(res) {
			var result = res.data.result;
			var da_upload_data = [];   //达观上报

			// 友盟+统计--确认订单页浏览
			let myDefaultAddress = result.defaultAddress ? result.defaultAddress : {}
			getApp().globalData.uma.trackEvent('orderConfirmView', { channel_source: 'mini_alipay', order_city: myDefaultAddress.city, order_province: myDefaultAddress.province });

			// 判断电子发票显不显示
			var invoiceOff = 'noInvoice';
			if (result.invoiceTypes != 'null' && result.invoiceTypes != 'undefined' && result.invoiceTypes != null && result.invoiceTypes != undefined) {
				var invoiceTypesArr = JSON.parse(result.invoiceTypes) ? JSON.parse(result.invoiceTypes) : [];

				if (invoiceTypesArr && Object.keys(invoiceTypesArr).length > 0) {
					// 如果只能开普通发票的情况
					if (invoiceTypesArr.length <= 1) {
						if (invoiceTypesArr.includes(0)) {
							invoiceOff = 'normal'
						} else if (invoiceTypesArr.includes(1)) {
							invoiceOff = 'electronic'
							invoiceData.itype = 1
							if (result.defaultAddress) {
								// var imobile = result.defaultAddress.shipMobile && result.defaultAddress.shipMobile.length >= 11 ? result.defaultAddress.shipMobile.substr(0, 4) + '****' + result.defaultAddress.shipMobile.substr(8, 12) : ""
								let shipMobile = result.defaultAddress.shipMobile;
								let firstMo = shipMobile && shipMobile.length >= 11 ? shipMobile.substr(3, 4) : '';
								let imobile = shipMobile && shipMobile.length >= 11 ? shipMobile.replace(firstMo, "****") : "";
								that.setData({
									imobile: imobile,
									phoneRight: true,
									defaultMobile: imobile ? true : false,
									initMobile: imobile ? result.defaultAddress.shipMobile : ''
								})
							}
						}

					} else {
						invoiceOff = 'multi'
						if (result.defaultAddress) {
							// var imobile = result.defaultAddress.shipMobile && result.defaultAddress.shipMobile.length >= 11 ? result.defaultAddress.shipMobile.substr(0, 4) + '****' + result.defaultAddress.shipMobile.substr(8, 12) : ""
							let shipMobile = result.defaultAddress.shipMobile;
							let firstMo = shipMobile && shipMobile.length >= 11 ? shipMobile.substr(3, 4) : '';
							let imobile = shipMobile && shipMobile.length >= 11 ? shipMobile.replace(firstMo, "****") : "";
							that.setData({
								imobile: imobile,
								phoneRight: true,
								defaultMobile: imobile ? true : false,
								initMobile: imobile ? result.defaultAddress.shipMobile : ''
							})
						}
					}


				}
			}

			if (res.data.result.globalGoods == '0') {
				// 判断是非进口（0）、海外直邮（1）、国内保税仓（2）
				if (result.globalCross == '0') {
					that.setData({
						globalGoods: true,
						globalCross: 0
					});
				} else if (result.globalCross == '1') {
					that.setData({
						globalGoods: true,
						globalCross: 1
					});
				} else if (result.globalCross == '2') {
					that.setData({
						globalGoods: true,
						globalCross: 2
					});
				}
			} else if (res.data.result.globalGoods == '2') {
				that.setData({
					globalGoods: false
				});
				// 判断是非进口（0）、海外直邮（1）、国内保税仓（2）
				if (result.globalCross == '0') {
					that.setData({
						hasGlobalGoods: true,
						globalCross: 0
					});
				} else if (result.globalCross == '1') {
					that.setData({
						hasGlobalGoods: true,
						globalCross: 1
					});
				} else if (result.globalCross == '2') {
					that.setData({
						hasGlobalGoods: true,
						globalCross: 2
					});
				}
			}

			// 保存有多少个商品，如果是用余额抵扣可能会用到
			// var goodsAmount = 0;
			// for (var k in result.supplierList) {
			// 	goodsAmount += result.supplierList[k].orderGoodsList.length;
			// }
			// that.data.goodsAmount = goodsAmount;

			// 如果要验证身份证名与号码的，重新选择地址时，如果不是同一个人就要重新验证身份证
			// 如果要验证身份证名与号码的，重新选择地址时，如果不是同一个人就要重新验证身份证
			if (res.data.result.defaultAddress) {
				if (addressName != res.data.result.defaultAddress.shipName) {
					addressName = res.data.result.defaultAddress.shipName;
					that.setData({
						idSave: false, //如果是重选地址身份验证要重新填写
						idNum: "", //重置内容
						idCanSave: false //保存变灰，不能保存
					});
				}
			} else {
				that.setData({
					idSave: false, //如果是重选地址身份验证要重新填写
					idNum: "", //重置内容
					idCanSave: false //保存变灰，不能保存
				});
			}



      // =================================================


			var goodsAmount = 0;
			that.data.result = res.data.result;
			that.data.totalPrice = 0;
			that.data.result.supplierList.forEach(function(v1, i1, arr1) {
				v1.leftCount = '60';
				// 多少个商家则有多少个留言信息
        goodsAmount += v1.orderGoodsList.length
        that.data.bbsData.push('');
				// var supplierCount = 0;
				// var supplierPrice = 0;
				// var orderGoodsList = v1.orderGoodsList;
				// orderGoodsList.forEach(function(value, index, arr) {
				// 	supplierCount += value.quantity;
				// 	supplierPrice += value.quantity * value.salePrice;

				// 	// 达观数据保存 --start
				// 	da_upload_data.push({ productId: value.productId, actionNum: value.quantity })
				// 	// 达观数据保存 --end

				// });
				// v1.supplierCount = supplierCount;
				// that.data.totalPrice += supplierPrice;
				// v1.supplierPrice = supplierPrice.toFixed(2);
			});
			// that.data.originalTotalPrice = that.data.totalPrice; //记录原始总额，用于后续计算（优惠券等）
			// that.data.totalPrice = that.data.totalPrice.toFixed(2); //用于显示的总额

			// 判断是否可用余额
			// if (result.canUseBalance) {
			// 	// 如果可使用余额大于零且现总价要大于0.01*n个商品
			// 	if (result.availableBalance > 0 && that.data.totalPrice > that.data.lessPay * that.data.goodsAmount) {
			// 		that.setData({
			// 			canClick: true,
			// 			canFirstClick: true,
			// 			isUseBalance: true
			// 		});
			// 		// 判断是否用完余额
			// 		if (result.availableBalance >= that.data.totalPrice) {
			// 			that.data.balanceAmount = that.data.totalPrice - that.data.lessPay * that.data.goodsAmount;
			// 			that.data.totalPrice = that.data.lessPay * that.data.goodsAmount;
			// 		} else {
			// 			that.data.balanceAmount = result.availableBalance;
			// 			that.data.totalPrice = (that.data.totalPrice - result.availableBalance * 1).toFixed(2);
			// 		}
			// 	} else {
			// 		that.setData({
			// 			canClick: false,
			// 			canFirstClick: false,
			// 			isUseBalance: false
			// 		});
			// 	}
			// 	// that.data.totalPrice = ((goodsInfo.salePrice * goodsInfo.quantity).toFixed(2) - result.availableBalance * 1).toFixed(2);
			// 	// that.data.totalPrice
			// }

			// that.setCoupon(that.data.result);
			that.setData({
				result: that.data.result,
				baseImageUrl: baseImageUrl,
				// totalPrice: that.data.totalPrice,
				// originalTotalPrice: that.data.originalTotalPrice, // 保留原始价格
				defaultAddress: that.data.result.defaultAddress,
				invoiceOff: invoiceOff,
				itype: invoiceOff == 'electronic' ? 1 : 0,
				loadComplete: true,
				loadFail: false,
				totalPostFee: result.totalPostFee ? result.totalPostFee * 1 : 0,
				bbsData: that.data.bbsData,
				// da_upload_data: da_upload_data,
				knockActivityDescribe: result.knockActivityDescribe && result.knockActivityDescribe != 'null' && result.knockActivityDescribe != 'undefined' ? result.knockActivityDescribe : '',
				isShowStoreCouponList: new Array(result.supplierList.length).fill(false),
				goodsAmount:goodsAmount
			});

			that.resetTotalPrice('', 'init')
		}, function(res) {
			// wx.showToast({
			//   title: res,
			// })
			that.setData({
				showToast: true,
				showToastMes: res,
				loadFail: true
			});
			that.data.timeOut = setTimeout(function() {
				that.setData({
					showToast: false
				});
				my.navigateBack();
			}, 2000);
		});
	},

	onUnload: function() {
		var that = this;
		clearTimeout(that.data.timeOut);
	},

	/**
	 * 获取立即购买订单数据
	 * 
	 * 积分商品下单的接口要加上版本2.0
	 */
	getNowPayData: function(productId, quantity,nowAddrId) {
		my.showLoading({
			content: '加载中',
		});
		var that = this;
		var data = {
			productId: productId,
			quantity: quantity,
			isGroupBuy: that.data.isTuangou,
			version: "2.0"
		}
		if(nowAddrId) {
			data.addressId = nowAddrId
		}
		sendRequest.send(constants.InterfaceUrl.PAY_TO_BUY_NOW, data, function(res) {
			my.hideLoading();
			console.log(res)
			var result = res.data.result;

      // =================================================================
      
			that.data.result = res.data.result;

			// 友盟+统计--确认订单页浏览
			let myDefaultAddress = result.defaultAddress ? result.defaultAddress : {}
			getApp().globalData.uma.trackEvent('orderConfirmView', { channel_source: 'mini_alipay', order_city: myDefaultAddress.city, order_province: myDefaultAddress.province });

			// 判断电子发票显不显示
			var invoiceOff = 'noInvoice';
			if (result.invoiceTypes != 'null' && result.invoiceTypes != 'undefined' && result.invoiceTypes != null && result.invoiceTypes != undefined) {
				var invoiceTypesArr = JSON.parse(result.invoiceTypes) ? JSON.parse(result.invoiceTypes) : [];

				if (invoiceTypesArr && Object.keys(invoiceTypesArr).length > 0) {
					// 如果只能开普通发票的情况
					if (invoiceTypesArr.length <= 1) {
						if (invoiceTypesArr.includes(0)) {
							invoiceOff = 'normal'
						} else if (invoiceTypesArr.includes(1)) {
							invoiceOff = 'electronic'
							invoiceData.itype = 1
							if (result.defaultAddress) {
								// var imobile = result.defaultAddress.shipMobile && result.defaultAddress.shipMobile.length >= 11 ? result.defaultAddress.shipMobile.substr(0, 4) + '****' + result.defaultAddress.shipMobile.substr(8, 12) : ""
								let shipMobile = result.defaultAddress.shipMobile;
								let firstMo = shipMobile && shipMobile.length >= 11 ? shipMobile.substr(3, 4) : '';
								let imobile = shipMobile && shipMobile.length >= 11 ? shipMobile.replace(firstMo, "****") : "";
								that.setData({
									imobile: imobile,
									phoneRight: true,
									defaultMobile: imobile ? true : false,
									initMobile: imobile ? result.defaultAddress.shipMobile : ''
								})
							}
						}

					} else {
						invoiceOff = 'multi'
						if (result.defaultAddress) {
							// var imobile = result.defaultAddress.shipMobile && result.defaultAddress.shipMobile.length >= 11 ? result.defaultAddress.shipMobile.substr(0, 4) + '****' + result.defaultAddress.shipMobile.substr(8, 12) : "" 
							let shipMobile = result.defaultAddress.shipMobile;
							let firstMo = shipMobile && shipMobile.length >= 11 ? shipMobile.substr(3, 4) : '';
							let imobile = shipMobile && shipMobile.length >= 11 ? shipMobile.replace(firstMo, "****") : "";
							that.setData({
								imobile: imobile,
								phoneRight: true,
								defaultMobile: imobile ? true : false,
								initMobile: imobile ? result.defaultAddress.shipMobile : ''
							})
						}
					}


				}
			}
			// 如果要验证身份证名与号码的，重新选择地址时，如果不是同一个人就要重新验证身份证
			if (res.data.result.defaultAddress) {
				if (addressName != res.data.result.defaultAddress.shipName) {
					addressName = res.data.result.defaultAddress.shipName;
					that.setData({
						idSave: false, //如果是重选地址身份验证要重新填写
						idNum: "", //重置内容
						idCanSave: false //保存变灰，不能保存
					});
				}
			} else {
				that.setData({
					idSave: false, //如果是重选地址身份验证要重新填写
					idNum: "", //重置内容
					idCanSave: false //保存变灰，不能保存
				});
			}

			var goodsInfo = res.data.result.goodsInfo;
			var supplierList = [];
			var supplierListItem = {};
			var orderGoodsList = [];
			var isDikou = res.data.result.goodsInfo.isDikou;
			that.data.isDikou = isDikou;

			// 达观数据保存 --start
			// let da_upload_data = []
			// da_upload_data.push({
			// 	productId: goodsInfo.productId,
			// 	actionNum: goodsInfo.quantity
			// })
			that.setData({
				da_upload_data: Object.assign([], [{
					productId: goodsInfo.productId,
					actionNum: goodsInfo.quantity
				}])
			})
			// 达观数据保存 --end

			// 以下是用来保存当前商品的店铺与商品消息
			orderGoodsList.push(goodsInfo);
			supplierListItem.leftCount = '60'; //初始化剩余字数
			// 如果是会员商品，跳去速运那边选地址了，并跳前留言了，这个剩余字数也要跟着变
			supplierListItem.leftCount = that.data.bbsData[0] ? (60 - that.data.bbsData[0].length) + '' : '60';
			supplierListItem.orderGoodsList = orderGoodsList;
			supplierListItem.supplierName = that.data.result.supplierName;
			supplierListItem.supplierHeadImg = that.data.result.supplierHeadImg;
			supplierListItem.supplierCount = goodsInfo.quantity;
			supplierListItem.supplierPrice = (goodsInfo.salePrice * goodsInfo.quantity).toFixed(2);
			supplierListItem.supplierCoupon = result.supplierCoupon ? result.supplierCoupon : []
			supplierListItem.memo = '';
			supplierList.push(supplierListItem);
			that.data.result.supplierList = supplierList;

			// that.data.originalTotalPrice = goodsInfo.salePrice * goodsInfo.quantity; //记录原始总额，用于后续计算（优惠券等）
			// that.data.totalPrice = (goodsInfo.salePrice * goodsInfo.quantity).toFixed(2); //用于显示的总额
			// 积分抵扣商品 且 不是秒杀商品
			// if (isDikou && !that.data.result.isActivitys) {
			// 	// 如果所拥有的积分少于用户积分能使用的最小值
			// 	if (result.memberPoint < result.memberPointRule.minPoint) {
			// 		that.setData({
			// 			canFirstClick: false,
			// 			canClick: false
			// 		});
			// 	} else {

			// 		that.setData({
			// 			canFirstClick: true,
			// 			canClick: true
			// 		});
			// 		// 当如果可以使用积分，但现在的价格比可抵扣的积分用的价格低就直接不能用
			// 		if (goodsInfo.salePrice * that.data.quantity < result.maxDeductPrice) {
			// 			that.setData({
			// 				canFirstClick: false,
			// 				noUseJifen: true,
			// 				maxDeductPoint: 0,
			// 				maxDeductPrice: 0
			// 			});
			// 		} else {
			// 			that.data.maxDeductPoint = result.maxDeductPoint;
			// 			that.data.maxDeductPrice = result.maxDeductPrice;
			// 			that.data.totalPrice = ((goodsInfo.salePrice * goodsInfo.quantity).toFixed(2) - result.maxDeductPrice).toFixed(2);
			// 		}
			// 	}
			// }

			// 保存有多少个商品，如果是用余额抵扣可能会用到
			var goodsAmount = 0;
			for (var k in result.supplierList) {
				goodsAmount += result.supplierList[k].orderGoodsList.length;
			}
			that.data.goodsAmount = goodsAmount;

			// 判断是否可用余额 且 不是秒杀商品
			// if (result.canUseBalance && !that.data.isGiftOrder && !that.data.SFmember && !that.data.result.isActivitys) {
			// 	// 如果可使用余额大于零且现总价要大于0.01
			// 	if (result.availableBalance > 0 && that.data.totalPrice > that.data.lessPay * that.data.goodsAmount) {
			// 		that.setData({
			// 			canClick: true,
			// 			canFirstClick: true,
			// 			isUseBalance: true
			// 		});
			// 		// 判断是否用完余额
			// 		if (result.availableBalance >= that.data.totalPrice) {
			// 			that.data.balanceAmount = that.data.totalPrice - that.data.lessPay * that.data.goodsAmount;
			// 			that.data.totalPrice = that.data.lessPay * that.data.goodsAmount;
			// 		} else {
			// 			that.data.balanceAmount = result.availableBalance;
			// 			that.data.totalPrice = (that.data.totalPrice - result.availableBalance * 1).toFixed(2);
			// 		}
			// 	} else {
			// 		that.setData({
			// 			canClick: false,
			// 			canFirstClick: false,
			// 			isUseBalance: false
			// 		});
			// 	}
			// 	// that.data.totalPrice = ((goodsInfo.salePrice * goodsInfo.quantity).toFixed(2) - result.availableBalance * 1).toFixed(2);
			// 	// that.data.totalPrice
			// }

			// 判断是否是全球购商品
			if (result.judgeGlobalGoods == '0') {
				// 判断是非进口（0）、海外直邮（1）、国内保税仓（2）
				if (result.globalCross == '0') {
					that.setData({
						globalGoods: true,
						globalCross: 0
					});
				} else if (result.globalCross == '1') {
					that.setData({
						globalGoods: true,
						globalCross: 1
					});
				} else if (result.globalCross == '2') {
					that.setData({
						globalGoods: true,
						globalCross: 2
					});
				}

				// that.setData({
				//   globalGoods: true
				// })
			}

			// 积分商品优惠商品不能用优惠券
			// if (!goodsInfo.isJifen) {
			// 	that.setCoupon(that.data.result);
			// }

			that.setData({
				isTuanZhang: that.data.isTuanZhang,
				result: that.data.result,
				baseImageUrl: baseImageUrl,
				totalPostFee: goodsInfo.postFee ? goodsInfo.postFee * 1 : 0,     //运费价格
				// totalPrice: that.data.totalPrice,                 // 取2位小数的总价
				// originalTotalPrice: that.data.originalTotalPrice, //保留原始总价，用于后续计算（优惠券等）
				isJifen: goodsInfo.isJifen,
				isSpike: that.data.result.isActivitys,            // 是否是秒杀商品，如果是秒杀商品则不显示使用优惠券和余额抵扣；
				canBuy: res.data.result.goodsInfo.canBuy,
				isDikou: that.data.isDikou,
				// maxDeductPoint: that.data.noUseJifen ? that.data.maxDeductPoint : result.maxDeductPoint,
				// // maxDeductPrice: that.data.noUseJifen ? that.data.maxDeductPrice: result.maxDeductPrice,
				// maxDeductPoint: that.data.maxDeductPoint ? that.data.maxDeductPoint : 0,
				// maxDeductPrice: that.data.maxDeductPrice ? that.data.maxDeductPrice : 0,
				// firstMaxDeductPoint: that.data.maxDeductPoint ? that.data.maxDeductPoint : 0,
				// firstMaxDeductPrice: that.data.maxDeductPrice ? that.data.maxDeductPrice : 0,
				defaultAddress: that.data.result.defaultAddress,
				// isSFProduct: goodsInfo.isSFProduct ? goodsInfo.isSFProduct : false,
				isShowSFScore: goodsInfo.isSFProduct && goodsInfo.isShow ? true : false,
				invoiceOff: invoiceOff, //用来判断显不显示电子发票
				itype: invoiceOff == 'electronic' ? 1 : 0,
				loadComplete: true,
				loadFail: false,
				knockActivityDescribe: result.knockActivityDescribe && result.knockActivityDescribe != 'null' && result.knockActivityDescribe != 'undefined' ? result.knockActivityDescribe : '',
				bbsData: ['']
			});

			that.resetTotalPrice('', 'init')

			// 如果是从顺丰速运+那里过来
			if (app.globalData.addUpdate) {
				var defaultAddress = {};
				defaultAddress.shipName = app.globalData.defaultAddress.contactName;
				defaultAddress.shipMobile = app.globalData.defaultAddress.contactTel;
				defaultAddress.province = app.globalData.defaultAddress.province;
				defaultAddress.city = app.globalData.defaultAddress.city;
				defaultAddress.area = app.globalData.defaultAddress.county;
				defaultAddress.addr = app.globalData.defaultAddress.address;
				that.setData({
					defaultAddress: defaultAddress,
					SFmember: true
				});
				var data = app.globalData.defaultAddress.contactName + '|' + app.globalData.defaultAddress.contactTel + '|1|' + app.globalData.defaultAddress.province + '|' + app.globalData.defaultAddress.city + '|' + app.globalData.defaultAddress.county + '|' + app.globalData.defaultAddress.address;
				sendRequest.send(constants.InterfaceUrl.SAVE_ADDRESS_SF, {
					data: data
				}, function(res) {
				}, function(err) {
				});
			} else {
				that.data.defaultAddress = that.data.result.defaultAddress;
			}

			if (that.data.isJifen && !that.data.canBuy && !that.data.isDikou) {
				that.setData({
					showToast: true,
					showToastMes: '抱歉，该商品兑换须' + result.goodsInfo.pointCost + '分，您的积分暂未达到兑换条件，请继续努力哦！'
				});
				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				that.setData({
					timeOut: timeOut
				});
			}
			// 判断是否显示发票
			if (that.data.isGiftOrder || that.data.isJifen || that.data.lotPintuan) {
				that.setData({
					showInvoiceView: false
				});
			}
		}, function(res) {
			my.hideLoading();
			// wx.showToast({
			//   title: res,
			// })
			that.setData({
				showToast: true,
				showToastMes: res,
				loadFail: true
			});
			clearTimeout(that.data.timeOut);
			var timeOut = setTimeout(function() {
				that.setData({
					showToast: false
				});
				my.navigateBack();
			}, 2000);
			that.setData({
				timeOut: timeOut
			});
		});
	},

	chooseImg(e) {
		var that = this;
		var index = e.currentTarget.dataset.type * 1;

		my.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: function(res) {

				my.showLoading({
					content: '上传中'
				});

				try {
					var token = my.getStorageSync({
						key: constants.StorageConstants.tokenKey, // 缓存数据的key
					}).data;
				} catch (e) { }

				if (index == 0) {
					my.uploadFile({
						url: constants.UrlConstants.baseUrl + constants.InterfaceUrl.UPLOAD_IDCARDIMG, // 开发者服务器地址
						filePath: res.apFilePaths[0], // 要上传文件资源的本地定位符
						fileName: 'file', // 文件名，即对应的 key, 开发者在服务器端通过这个 key 可以获取到文件二进制内容
						fileType: 'image', // 文件类型，image / video / audio
						header: {
							"loginToken": token
						},
						success: (res) => {
							var result = JSON.parse(res.data);

							my.hideLoading();

							if (result.status == 'success') {
								that.setData({
									idCardImgFront: result.message
								});
							} else {
								that.setData({
									showToastMes: '上传身份证正面失败',
									showToast: true
								});
								that.data.timeOut = setTimeout(function() {
									that.setData({
										showToast: false
									});
								}, 2000);
							}
						},
						fail(err) {
						}
					});
				} else {
					my.uploadFile({
						url: constants.UrlConstants.baseUrl + constants.InterfaceUrl.UPLOAD_IDCARDIMG,
						filePath: res.apFilePaths[0],
						fileName: 'file', // 文件名，即对应的 key, 开发者在服务器端通过这个 key 可以获取到文件二进制内容
						fileType: 'image', // 文件类型，image / video / audio
						header: {
							"loginToken": token
						},
						name: 'file',

						success(res) {
							var result = JSON.parse(res.data);

							my.hideLoading();


							if (result.status == 'success') {
								that.setData({
									idCardImgBack: result.message
								});
							} else {
								that.setData({
									showToastMes: '上传身份证反面失败',
									showToast: true
								});
								that.data.timeOut = setTimeout(function() {
									that.setData({
										showToast: false
									});
								}, 2000);
							}
						},

						fail(err) {
						}

					});
				}
			},

			fail(err) {
				my.hideLoading();

			},

			complete(res) { }

		});
	},

	loadImg(e) {
		var that = this;

		var $width = e.detail.width,
			$height = e.detail.height,
			ratio = $width / $height,
			imgWidth = 117 * ratio;
		imgWidth = imgWidth > 185 ? 185 : imgWidth;
		if (e.target.dataset.index == 0) {
			that.setData({
				imgWidth0: imgWidth
			});
		} else {
			that.setData({
				imgWidth1: imgWidth
			});
		}
	},

	/**
	 * 初始化优惠券参数
	 */
	setCoupon: function(result) {
		var that = this;
		// 且不是秒杀商品
		if (!that.data.result.isActivitys && result.availableCoupon && result.availableCoupon.length > 0) {
			var max = result.availableCoupon[0].costPrice;
			var index = 0;
			var endDateStr = new Date(result.availableCoupon[0].endDate);
			result.availableCoupon.forEach(function(item, i, arr) {
				item.beginDateStr = that.formatTime(item.beginDate);
				item.endDateStr = that.formatTime(item.endDate);
				item.taped = false;
				item.platformCoupon = true
				if (max < item.costPrice) {
					max = item.costPrice;
					index = i;
					endDateStr = new Date(item.endDate);
					// 如果有两张一样的金额的优惠券，就选择最快过期的
				} else if (max == item.costPrice) {
					if (endDateStr.getTime() > new Date(item.endDate).getTime()) {
						max = item.costPrice;
						index = i;
						endDateStr = new Date(item.endDate);
					}
				}
			});
			result.availableCoupon[index].taped = true;
			that.data.userCouponId = result.availableCoupon[index].userCouponId;
			// result.couponStr = result.availableCoupon.length + '张优惠券可用'
			// result.couponStr = '-' + result.availableCoupon[index].costPrice;
			that.data.result.couponStr = '-￥' + result.availableCoupon[index].costPrice.toFixed(2);
			that.data.result.couponValue = '￥' + result.availableCoupon[index].costPrice.toFixed(2);
			that.data.totalPrice = that.data.originalTotalPrice * 1 - result.availableCoupon[index].costPrice;
			// 如果是积分抵扣商品且能用积分抵扣
			if (that.data.isDikou && that.data.canFirstClick) {
				if (that.data.totalPrice < result.maxDeductPrice) {
					that.data.maxDeductPrice = Math.floor(that.data.totalPrice);
					that.data.maxDeductPoint = that.data.maxDeductPrice * that.data.result.memberPointRule.payRate;
					that.data.firstMaxDeductPrice = Math.floor(that.data.totalPrice);
					that.data.firstMaxDeductPoint = that.data.maxDeductPrice * that.data.result.memberPointRule.payRate;
					if (that.data.canClick) {
						that.data.totalPrice = ((that.data.originalTotalPrice * 1 - result.availableCoupon[index].costPrice).toFixed(2) - that.data.maxDeductPrice).toFixed(2);
					}
					that.setData({
						maxDeductPrice: that.data.maxDeductPrice,
						maxDeductPoint: that.data.maxDeductPoint,
						firstMaxDeductPrice: that.data.firstMaxDeductPrice,
						firstMaxDeductPoint: that.data.firstMaxDeductPoint
					});
				} else {
					that.data.totalPrice = ((that.data.originalTotalPrice * 1 - result.availableCoupon[index].costPrice).toFixed(2) - result.maxDeductPrice).toFixed(2);
				}
			}

			// 如果可用余额抵扣
			if (that.data.result.canUseBalance && that.data.result.availableBalance > 0) {
				// 判断用了优惠券后余额不能少于0.01
				if (that.data.totalPrice > that.data.lessPay * that.data.goodsAmount && that.data.isUseBalance) {
					// 判断是可用余额是否大于用了优惠券总价
					if (that.data.result.availableBalance >= that.data.totalPrice) {
						// 所用了的余额
						that.data.balanceAmount = that.data.totalPrice - that.data.lessPay * that.data.goodsAmount;
						// 用余额抵扣最低需支付0.01
						that.data.totalPrice = that.data.lessPay * that.data.goodsAmount;
					} else {
						that.data.balanceAmount = that.data.result.availableBalance;
						that.data.totalPrice = (that.data.totalPrice - that.data.result.availableBalance).toFixed(2);
					}
				} else if (that.data.totalPrice > that.data.lessPay * that.data.goodsAmount && !that.data.isUseBalance) {
					that.data.totalPrice = that.data.totalPrice;
					// that.data.balanceAmount = 0;
					if (that.data.result.availableBalance >= that.data.totalPrice) {
						// 所用了的余额
						that.data.balanceAmount = that.data.totalPrice - that.data.lessPay * that.data.goodsAmount;
						// 用余额抵扣最低需支付0.01
						// that.data.totalPrice = (that.data.lessPay * that.data.goodsAmount);
					} else {
						that.data.balanceAmount = that.data.result.availableBalance;
						// that.data.totalPrice = (that.data.totalPrice - that.data.result.availableBalance).toFixed(2);
					}
				} else {
					// 如果用了优惠券后价格低于等于0.01，则不能用余额抵扣&& that.data.isUseBalance

					that.setData({
						canFirstClick: false,
						canClick: false,
						isUseBalance: false
					});
				}
			}
		}
		result.couponValue = '￥0.00';

    console.log(result.availableCoupon)
	},
	/**
	 * 拼团订单支付成功后，通过订单sn查询recordId跳转拼团成功页面
	 */
	getRecordId: function(orderSn) {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.ORDER_DETAIL, {
			orderSn: orderSn
		}, function(res) {
			var recordId = res.data.result.order.recordId;
			if (that.data.lotPintuan) {
				my.redirectTo({
					url: '/pages/user/pintuanOrderDetailNew/pintuanOrderDetailNew?recordId=' + recordId
				});
			} else {
				my.redirectTo({
					url: '/pages/user/pintuanOrderDetail/pintuanOrderDetail?recordId=' + recordId
				});
			}
		}, function(res) {
			my.showToast({
				content: res
			});
		}, "GET");
	},

	/**
	 * 调起支付
	 */
	showWxPayment: function(res) {
		var that = this;
		if (res.data.errorCode = "0001") {
			// conso
			var orderSn = res.data.result.orderSn;
			var orderStr = res.data.result.orderStr;
			var paymentOrderId = res.data.result.paymentOrderId;
			my.tradePay({
				tradeNO: res.data.result.orderStr.trade_no,
				success: function(res) {
					that.controllPayment(paymentOrderId, 'success');

					if (res.resultCode == '9000') {
						that.controllPayment(paymentOrderId, 'success');

						// 友盟+统计--支付成功后订单的总价
						let totalPrice = that.data.totalPostFee ? (that.data.totalPrice * 1 + that.data.totalPostFee).toFixed(2) : that.data.totalPrice
						getApp().globalData.uma.trackEvent('orderSuccessAmount', { order_totalPrice: totalPrice, order_city: that.data.defaultAddress.city, order_province: that.data.defaultAddress.province, order_sn: orderSn });
						let isTrackDone = false
						// 友盟+统计--支付成功后单个商品的总价
						if (that.data.fromPage == 'cart') {
							let supplierList = that.data.result.supplierList
							for (var i = 0; i < supplierList.length; i++) {
								let orderGoodsList = supplierList[i].orderGoodsList
								for (var j = 0; j < orderGoodsList.length; j++) {
									let goodsItem = orderGoodsList[j]
									// 友盟+统计--支付成功后单个商品的总价
									getApp().globalData.uma.trackEvent('orderSuccessAmountByProduct', { order_goods_quantity: goodsItem.quantity, order_city: that.data.defaultAddress.city, order_province: that.data.defaultAddress.province, order_sn: orderSn, order_goods_totalPrice: goodsItem.salePrice * goodsItem.quantity, order_goods_price: goodsItem.salePrice, order_goods_name: goodsItem.goodsName, order_goods_id: goodsItem.goodsSn, order_goods_productName: goodsItem.productName });
									// 如果已上报完成则跳转页面
									if (i == (supplierList.length - 1) && j == (orderGoodsList.length - 1)) {
										if (that.data.isGiftOrder) {
											if (showType == 2) {

												my.redirectTo({
													url: '/pages/user/sendGift/sendGift?paymentOrderId=' + paymentOrderId
												});
											} else {

												my.redirectTo({
													url: '/pages/user/sendGift/sendGift?paymentOrderId=' + paymentOrderId
												});
											}
										} else if (that.data.isTuangou) {
											that.getRecordId(orderSn);
										} else {

											my.redirectTo({
												url: '/pages/shopping/paySucceed/paySucceed?orderSn=' + orderSn + '&paymentId=' + paymentOrderId
											});
										}
									}
								}
							}
						}
						else {
							if (that.data.isGiftOrder) {
								if (showType == 2) {

									my.redirectTo({
										url: '/pages/user/sendGift/sendGift?paymentOrderId=' + paymentOrderId
									});
								} else {

									my.redirectTo({
										url: '/pages/user/sendGift/sendGift?paymentOrderId=' + paymentOrderId
									});
								}
							} else if (that.data.isTuangou) {
								that.getRecordId(orderSn);
							} else {

								my.redirectTo({
									url: '/pages/shopping/paySucceed/paySucceed?orderSn=' + orderSn + '&paymentId=' + paymentOrderId
								});
							}
						}

						my.showToast({
							content: '支付成功'
						});


					}
					else if (res.resultCode == '6001') {
						my.showToast({
							content: '已取消'
						})
						my.redirectTo({
							url: '/pages/user/historyOrder/historyOrder?index=1', // 需要跳转的应用内非 tabBar 的目标页面路径 ,路径后可以带参数。参数规则如下：路径与参数之间使用
						});
					}
					else if (res.resultCode == '6002') {
						my.showToast({
							content: '网络连接出错'
						})
						my.redirectTo({
							url: '/pages/user/historyOrder/historyOrder?index=1', // 需要跳转的应用内非 tabBar 的目标页面路径 ,路径后可以带参数。参数规则如下：路径与参数之间使用
						});
					}
					else {
						my.showToast({
							content: '支付失败'
						})
						my.redirectTo({
							url: '/pages/user/historyOrder/historyOrder?index=1', // 需要跳转的应用内非 tabBar 的目标页面路径 ,路径后可以带参数。参数规则如下：路径与参数之间使用
						});
					}


				},
				fail: function(res) {
					that.controllPayment(paymentOrderId, 'cancel');

					if (res.errMsg == 'requestPayment:fail cancel') { }

					my.redirectTo({
						url: '/pages/user/historyOrder/historyOrder?index=1'
					});
				}
			});
		}
	},

	/**
	 * 监控用户付款行为 success(成功)/cancel（取消）/sysBreak（异常）
	 */
	controllPayment: function(paymentId, type) {
		sendRequest.send(constants.InterfaceUrl.CONTROL_PAYMENT, {
			paymentId: paymentId,
			type: type
		}, function(res) {
		}, function(err) {
		});
	},

	/**
	 * 跳转地址管理选择地址
	 */
	chooseAddress: function(e) {
		my.navigateTo({
			url: '/pages/user/addressManage/addressManage?comeFrom=confirmOrder'
		});
	},
	/**
	 * 立即下单购买
	 */
	buyNow: function(formId) {
		my.showLoading({
			content: '下单中'
		});

		var that = this;
		var deductPrice = 0;
		// 积分抵扣
		if (that.data.isDikou && that.data.canClick) {
			deductPrice = that.data.maxDeductPrice;
		}

		// 可用余额
		// if (that.data.result.canUseBalance && that.data.isUseBalance) {
		// }

		var data = {
			token: that.data.result.token,
			memos: that.data.result.supplierList[0].memo,
			productId: that.data.result.goodsInfo.productId,
			quantity: that.data.result.goodsInfo.quantity,
			payType: "MINI_ALIPAY",
			channelSource: "ALI_MINI_APP",
			giftOrder: that.data.isGiftOrder ? 1 : 0,
			isGroupBuy: that.data.isTuangou,
			groupBuyType: that.data.groupBuyType,
			groupBuyActivityId: that.data.groupBuyActivityId,
			groupBuyRecordId: that.data.groupBuyRecordId,
			// couponId: that.data.couponId,
			deductPrice: deductPrice,
			formId: formId,
			isUseBalance: that.data.isUseBalance ? that.data.isUseBalance : false,
			balanceAmount: that.data.balanceAmount ? that.data.balanceAmount : 0,
			gdt_vid: app.globalData.adInfo.gdt_vid,
			aid: app.globalData.adInfo.aid,
			sfMemberBuy: that.data.isShowSFScore
			// invoiceJson: ''
		};

		that.invoiceToData(data, 0);
		// 多人抢礼start

		// 送礼订单要传的数据
		var data2 = {
			token: that.data.result.token,
			memos: that.data.result.supplierList[0].memo,
			productId: that.data.result.goodsInfo.productId,
			quantity: that.data.result.goodsInfo.quantity,
			payType: "MINI_ALIPAY",
			channelSource: "ALI_MINI_APP",
			giftOrder: that.data.showType,
			// couponId: that.data.couponId

			//多人抢礼end


			// 如果非送礼单要传收件地址信息
		}; 

		// 判断是否使用平台优惠券
    if(that.data.userCouponId && that.data.userCouponId != '0'){
      data.couponId = that.data.userCouponId
			if(!that.data.isGiftOrder) {
				data2.couponId = that.data.userCouponId
			}
    }

		 // 如果有使用商家优惠券的
    // let supplierCoupon = []
    if (that.data.useSupplierCouponList && that.data.useSupplierCouponList.length > 0) {
      if (that.data.useSupplierCouponList[0] && that.data.useSupplierCouponList[0] != "") {
        let couponObj = {}
        let couponKey = that.data.result.supplierCoupon[0].supplierId + ""
        let couponValue = that.data.useSupplierCouponList[0]
        couponObj = Object.assign({},{[couponKey]: couponValue})
        data.supplierCoupon = JSON.stringify(couponObj)
				if(that.data.isGiftOrder){
					data2.supplierCoupon = JSON.stringify(couponObj)
				}
      }

    }

		if (!that.data.isGiftOrder) {

			data.shipName = that.data.defaultAddress.shipName;
			data.shipMobile = that.data.defaultAddress.shipMobile;
			data.province = that.data.defaultAddress.province;
			data.city = that.data.defaultAddress.city;
			data.area = that.data.defaultAddress.area;
			data.addr = that.data.defaultAddress.addr;
			memos: that.data.result.supplierList[0].memo;
		}
		// 如果是全球购商品，但是是非进口商品
		data.globalCross = that.data.globalGoods && that.data.globalCross == 0 ? 0 : '';

		// 全球购商品要多传身份证信息
		if (that.data.globalGoods || that.data.hasGlobalGoods) {

			if (that.data.globalCross != 0) {
				// 判断有没有做身份验证
				if (!that.data.idSave) {
					my.hideLoading();
					that.setData({
						showToast: true,
						showToastMes: '请先填写并保存收货人的身份证信息'
					});
					clearTimeout(that.data.timeOut);
					var timeOut = setTimeout(function() {
						that.setData({
							showToast: false
						});
					}, 2000);
					that.setData({
						timeOut: timeOut
					});
					return;
				}
				data.idCardNo = that.data.idCardNo;
				data.globalCross = that.data.globalCross;

				// 如果是海外直邮商品还要上传身份证图片
				if (that.data.globalCross == 1) {
					if (!that.data.idCardImgFront || !that.data.idCardImgBack) {
						my.hideLoading();
						that.setData({
							showToast: true,
							showToastMes: '请您重新上传身份证正反面照片!'
						});
						setTimeout(function() {
							that.setData({
								showToast: false
							});
						}, 2000);
						return;
					}
					data.idCardImgPath = that.data.idCardImgFront + ',' + that.data.idCardImgBack;
				}
			}

			// 判断有没有勾选用户须知
			if (!that.data.canBuyGlobal) {
				my.hideLoading();
				that.setData({
					globalData: data,
					showChooseAndPay: true
				});
				return;
			}
		}

		if (that.data.isGiftOrder) {
			sendRequest.send(constants.InterfaceUrl.PAY_GIFT_PAY, data2, function(res) {
				that.showWxPayment(res);
			}, function(res) {
				my.hideLoading();
				that.setData({
					showToast: true,
					showToastMes: res
				});
				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				that.setData({
					timeOut: timeOut
				});
			});
		} else {
			sendRequest.send(constants.InterfaceUrl.PAY_BUY_NOW_2, data, function(res) {
				my.hideLoading();
				var result = res.data.result;
				if (result.orderStr) {
					if (result.orderStr.trade_no) {
						that.showWxPayment(res);
					} else {
						that.setData({
							showToast: true,
							showToastMes: result.orderStr.message
						})
						setTimeout(function() {
							that.setData({
								showToast: false
							})
						}, 2000)

					}


				} else {
					if (res.data.message == 'success' && result.orderSn && result.totalPrice == 0) {
						my.redirectTo({
							url: '/pages/shopping/paySucceed/paySucceed?orderSn=' + res.data.result.orderSn,
						})
					} else {
						that.setData({
							showToast: true,
							showToastMes: result.orderStr.message
						})
						setTimeout(function() {
							that.setData({
								showToast: false
							})
						}, 2000)
					}
				}
				// if()
				// if (res.data.result.recordId && res.data.result.type == 1) {
				//   //团长免单返回recordId
				//   my.redirectTo({
				//     url: '/pages/user/pintuanOrderDetail/pintuanOrderDetail?recordId=' + res.data.result.recordId
				//   });
				// } else {
				//   if (res.data.message == 'success' && res.data.result.orderSn && res.data.result.totalPrice == 0) {
				//     my.redirectTo({
				//       url: '/pages/shopping/paySucceed/paySucceed?orderSn=' + res.data.result.orderSn
				//     });
				//   } else if(result.orderStr.trade_no) {
				//     that.showWxPayment(res);
				//   }
				// }
			}, function(res) {
				my.hideLoading();
				// wx.showToast({
				//   title: res,
				// })
				that.setData({
					showToast: true,
					showToastMes: res
				});
				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 1500);
				that.setData({
					timeOut: timeOut
				});
			});
		}
	},

	/**
	 * 购物车购买 
	 */
	cartBuy: function(formId) {
		my.showLoading({
			content: '下单中'
		});
		var that = this;
		var cartArray = [];
		that.data.result.supplierList.forEach(function(v1, i1, arr1) {
			var orderGoodsList = v1.orderGoodsList;
			orderGoodsList.forEach(function(value, index, arr) {
				var item = {};
				item.cartId = value.cartId;
				item.memo = v1.memo;
				cartArray.push(item);
			});
		});
		var data = {
			cartArray: cartArray,
			token: that.data.result.token,
			shipName: that.data.defaultAddress.shipName,
			shipMobile: that.data.defaultAddress.shipMobile,
			province: that.data.defaultAddress.province,
			city: that.data.defaultAddress.city,
			area: that.data.defaultAddress.area,
			addr: that.data.defaultAddress.addr,
			payType: "MINI_ALIPAY",
			channelSource: "ALI_MINI_APP",
			// couponId: that.data.couponId,
			formId: formId,
			isUseBalance: that.data.isUseBalance,
			balanceAmount: that.data.balanceAmount ? that.data.balanceAmount : 0
		};
		that.invoiceToData(data, 1);
		
		// 判断是否使用平台优惠券
    if (that.data.userCouponId && that.data.userCouponId != '0') {
      data.couponId = that.data.userCouponId
    }

    // 如果有使用商家优惠券的
    if (that.data.useSupplierCouponList && that.data.useSupplierCouponList.length > 0) {
      let couponObj = {}
      for (let j = 0; j < that.data.useSupplierCouponList.length; j++) {
        // data.supplierCoupon.push({ that.data.result.supplierList[j].supplierId})
        if (that.data.useSupplierCouponList[j]) {
          let couponKey = that.data.result.supplierList[j].supplierId + ''
          let couponValue = that.data.useSupplierCouponList[j]
          couponObj = Object.assign(couponObj,{[couponKey]: couponValue})
        }
      }
      if(Object.keys(couponObj).length > 0){
        data.supplierCoupon = JSON.stringify(couponObj)
      }
    }

		// 全球购商品要多传身份证信息
		if ((that.data.globalGoods || that.data.hasGlobalGoods) && that.data.globalCross != 0) {
			// 判断有没有做身份验证
			if (!that.data.idSave) {
				my.hideLoading();
				that.setData({
					showToast: true,
					showToastMes: '请先填写并保存收货人的身份证信息'
				});
				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				that.setData({
					timeOut: timeOut
				});
				return;
			}
			data.idCardNo = that.data.idCardNo;

			// 如果是海外直邮商品还要上传身份证图片
			if (that.data.globalCross == 1) {
				if (!that.data.idCardImgFront || !that.data.idCardImgBack) {
					my.hideLoading();
					that.setData({
						showToast: true,
						showToastMes: '请您重新上传身份证正反面照片!'
					});
					setTimeout(function() {
						that.setData({
							showToast: false
						});
					}, 2000);
					return;
				}
				data.idCardImgPath = that.data.idCardImgFront + ',' + that.data.idCardImgBack;
			}

			// 判断有没有勾选用户须知
			if (!that.data.canBuyGlobal) {
				my.hideLoading();
				that.setData({
					globalData: data,
					showChooseAndPay: true
				});
				return;
			}
		}

		sendRequest.send(constants.InterfaceUrl.PAY_CART_PAY, data, function(res) {
			my.hideLoading();
			var result = res.data.result;
			// that.showWxPayment(res);
			if (result.orderStr.trade_no) {
				that.showWxPayment(res);
			} else {
				that.setData({
					showToast: true,
					showToastMes: result.orderStr.message
				})
				setTimeout(function() {
					that.setData({
						showToast: false
					})
				}, 2000)
			}
		}, function(res) {
			my.hideLoading();
			// wx.showToast({
			//   title: res,
			// })
			that.setData({
				showToast: true,
				showToastMes: res
			});
			clearTimeout(that.data.timeOut);
			var timeOut = setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 2000);
			that.setData({
				timeOut: timeOut
			});
		}, 'POST', false, 'application/json');
	},

	/**
	 * 点击去付款，根据入口页面（fromPage）调用立即购买（buyNow）或购物车购买
	 */
	buyNowTap: function(e) {
		var formId = e.detail.formId;
		var that = this;
		if (!that.data.isGiftOrder && !that.data.defaultAddress) {
			my.showToast({
				content: '请选择地址'
			});
			return;
		}
		that.setData({
			isSubmit: true
		});
		this.useractionAdd();

		// 达观数据上报
		// utils.uploadClickData_da(this.data.actionType, this.data.da_upload_data);

		if (that.data.fromPage == 'cart') {
			this.cartBuy(formId);
		} else {
			this.buyNow(formId);
		}
	},

	/**
	 * 输入身份证号
	 * */
	idInputFn: function(e) {
		var that = this;
		that.setData({
			idNum: e.detail.value
		});
		if (e.detail.value.length == 18) {
			that.setData({
				idCanSave: true
			});
		} else {
			that.setData({
				idCanSave: false
			});
		}
	},

	/**
	 * 输入身份证离开焦点，判断是否够18位
	 * */
	idPassFn: function(e) {
		// var that = this
		// if(e.detail.value.length < 18){
		//   that.setData({
		//     showToast: true,
		//     showToastMes: '您所输入的身份证不正确，请重新输入！'
		//   })
		//   setTimeout(function(){
		//     that.setData({
		//       showToast: false
		//     })
		//   },1500)
		// }
	},

	/**
	 * 清空身份证号
	 * */
	clearIdNumFn: function() {
		var that = this;
		that.setData({
			idNum: '',
			idCanSave: false,
			idCardNo: ''
		});
	},

	/**
	 * 全球购商品需要填的身份证
	 * 点保存身份证号
	 * */
	saveIdFn: function() {
		var that = this;
		var idNumFront = that.data.idNum.substring(0, 5);
		var idNumEnd = that.data.idNum.substring(14, 18);

		// 转化身份证号
		var idCardNo = utils.Encrypt(that.data.idNum);
		var name = that.data.defaultAddress ? that.data.defaultAddress.shipName : "";
		sendRequest.send(constants.InterfaceUrl.GET_ORDER_IDENTIFY, {
			name: name,
			idCardNo: idCardNo
		}, function(res) {
			if (res.data.message == 'success') {
				that.setData({
					idSave: true,
					idNumFront: idNumFront,
					idNumEnd: idNumEnd,
					idCardNo: idCardNo //请求成功后保存加密后的身份证密码        
				});
			} else {
			}
		}, function(err) {

			that.setData({
				showToast: true,
				showToastMes: err
			});
			clearTimeout(that.data.timeOut);
			var timeOut = setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 2000);
			that.setData({
				timeOut: timeOut
			});
		}, 'POST');
	},

	/**
	 * 修改id
	 * */
	editIdNumFn: function(e) {
		var that = this;
		that.setData({
			idSave: false
		});
	},

	/**
	 * 选择勾选用户须知
	 * */
	chooseNotice: function() {
		var that = this;

		that.setData({
			canBuyGlobal: !that.data.canBuyGlobal
		});
	},

	/**
	 * 打开全球购用户须知
	 * */
	openGlobalNotice: function() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.GET_GLOBAL_NOTICE, {
			name: "购买须知App"
		}, function(res) {
			that.setData({
				globalNotice: res.data.result.content,
				showGlobalNotice: true
			});
		}, function(err) {
		});
	},

	/**
	 * 关闭全球购用户须知
	 * */
	closeGlobalNotice: function(e) {
		var that = this;
		if (e.currentTarget.dataset.autosel) {
			that.setData({
				showGlobalNotice: false,
				canBuyGlobal: true
			});
		} else {
			that.setData({
				showGlobalNotice: false
			});
		}
	},

	/**
	 * 同意用户须知并立即下单
	 * */
	confirmAndPay: function() {
		var that = this;

		that.setData({
			canBuyGlobal: true,
			showChooseAndPay: false
		});

		if (that.data.fromPage == 'cart') {
			sendRequest.send(constants.InterfaceUrl.PAY_CART_PAY, that.data.globalData, function(res) {
				my.hideLoading();
				that.showWxPayment(res);
			}, function(res) {
				my.hideLoading();
				// wx.showToast({
				//   title: res,
				// })
				that.setData({
					showToast: true,
					showToastMes: res
				});
				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				that.setData({
					timeOut: timeOut
				});
			}, 'POST',false, 'application/json');
		} else {
			sendRequest.send(constants.InterfaceUrl.PAY_BUY_NOW_2, that.data.globalData, function(res) {
				my.hideLoading();
				if (res.data.result.recordId) {
					//团长免单返回recordId
					my.redirectTo({
						url: '/pages/user/pintuanOrderDetail/pintuanOrderDetail?recordId=' + res.data.result.recordId
					});
				} else {
					if (res.data.message == 'success' && res.data.result.orderSn && that.data.totalPrice == 0) {
						my.redirectTo({
							url: '/pages/shopping/paySucceed/paySucceed?orderSn=' + res.data.result.orderSn
						});
					} else {
						that.showWxPayment(res);
					}
				}
			}, function(res) {
				my.hideLoading();
				// wx.showToast({
				//   title: res,
				// })
				that.setData({
					showToast: true,
					showToastMes: res
				});
				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 1500);
				that.setData({
					timeOut: timeOut
				});
			});
		}
	},

	/**
	 * 关闭必须同意用户须知弹窗
	 * */
	closeChooseAndPay: function() {
		var that = this;
		that.setData({
			showChooseAndPay: false
		});
	},

	/**
	 * 广告行为转化上报
	 * */
	useractionAdd: function() {
		var that = this;
		var now = Math.floor(new Date().getTime() / 1000);
		var app = getApp();


		if (app.globalData.adInfo.gdt_vid) {
			my.httpRequest({
				url: constants.UrlConstants.baseUrl + constants.InterfaceUrl.USERACTION_ADD,
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					"client-channel": "alipay-miniprogram"
				},
				data: {
					"actions": [{
						"user_action_set_id": "1106867132",
						"url": "https://m.sfddj.com/",
						"action_time": now,
						"action_type": "COMPLETE_ORDER",
						"trace": {
							"click_id": app.globalData.adInfo.gdt_vid
						},
						"action_param": {
							"value": Math.floor(that.data.totalPrice * 100)
						}
					}]
				},
				success: function(res) {
				},
				fail: function(err) {
				}
			});
		} else {
			return;
		}
	},
	/**
	 * 选择要不要用积分抵扣
	 * */
	useDikou: function() {
		var that = this;
		var maxDeductPoint = that.data.maxDeductPoint;
		var maxDeductPrice = that.data.maxDeductPrice;
		// 转成number类型
		var totalPrice = that.data.totalPrice * 1;

		if (maxDeductPoint > 0) {
			totalPrice = (totalPrice + that.data.firstMaxDeductPrice).toFixed(2);
			maxDeductPoint = 0;
			maxDeductPrice = 0;
		} else {
			totalPrice = (totalPrice - that.data.firstMaxDeductPrice).toFixed(2);
			maxDeductPoint = that.data.firstMaxDeductPoint;
			maxDeductPrice = that.data.firstMaxDeductPrice;
		}
		that.setData({
			canClick: !that.data.canClick,
			maxDeductPoint: maxDeductPoint,
			maxDeductPrice: maxDeductPrice,
			totalPrice: totalPrice
		});
	},

	/**
	 * 选择要不要用余额抵扣
	 * */
	useBalanceFn() {
		let that = this;
    let availableBalance = that.data.result.availableBalance * 1;
    let totalPrice = that.data.totalPrice * 1
    let balanceAmount = that.data.balanceAmount;
    let {
      lessPay,
      goodsAmount
    } = this.data
    that.data.isUseBalance = !that.data.isUseBalance
    if (that.data.isUseBalance) {
      if (availableBalance >= totalPrice) {
        balanceAmount = totalPrice - (lessPay * goodsAmount);
        totalPrice = lessPay * goodsAmount;
      } else {
        balanceAmount = result.availableBalance;
        totalPrice = totalPrice - result.availableBalance * 1;
      }

    } else {
      totalPrice = (totalPrice + balanceAmount).toFixed(2);
      balanceAmount = 0
    }

    that.setData({
      totalPrice: totalPrice,
      canClick: that.data.canClick,
      isUseBalance: that.data.isUseBalance,
      balanceAmount
    })
	},

	/**
	 * 输入备注信息
	 */
	memoInput: function(e) {
		var that = this;
		var value = e.detail.value;
		var index = e.currentTarget.dataset.index;
		var supplier = that.data.result.supplierList[index];
		var bbsData = that.data.bbsData;
		supplier.memo = value;
		supplier.leftCount = 60 - value.length + '';
		bbsData[index] = e.detail.value
    that.setData({
      result: that.data.result,
      bbsData: bbsData
    })
	},
	/**
	 * 点击显示平台优惠券
	 */
	availableCouponTap: function(e) {
		var that = this;
		that.setData({
			showDialogCoupon: true,
			scrollView: false
		});
	},
	/**
   * 点击显示商家优惠券
   * */
  selectSupplierCoupon(e) {
    let {
      index
    } = e.currentTarget.dataset
    let setShowListName = 'isShowStoreCouponList[' + index + ']'
    this.setData({
      [setShowListName]: true
    })
  },

	/**
	 * 隐藏优惠券dialog
	 */
	closeCouponDialog: function(e) {
		var that = this;
		that.setData({
			showDialogCoupon: false,
			showInvoice: false,
			scrollView: true,
			isShowStoreCouponList: new Array(this.data.isShowStoreCouponList.length).fill(false)
		});
	},

	// 不使用发票
	uselessInvoice: function() {
		var that = this;
		that.setData({
			showInvoice: false,
			invoiceMes: '添加发票信息',
			useInvoiceBoff: false
		});
	},

	// 发票传值  obj为要传的data , type用来判断是从哪里进来的，0为普通下单，1为购物车
	invoiceToData: function(obj, type) {
		var that = this;
		if (that.data.useInvoiceBoff) {
			if (invoiceData.ihead == 0) {
				delete invoiceData.companyName;
				delete invoiceData.taxCode;
			}
			// 如果不是选电子发票，要删除收票人手机号和邮箱
			if (invoiceData.itype == 0) {
				delete invoiceData.imobile;
				delete invoiceData.iemail;
			}
			var invoiceDataJson = JSON.stringify(invoiceData);

			if (type == 0) {
				obj.invoiceJson = invoiceDataJson;
			} else if (type == 1) {
				obj.invoice = invoiceDataJson;
			}
		}
	},
	/**
	 * 点击选中优惠券
	 */
	couponTap: function(e) {
		var that = this
    let {
      couponId,
      type,
      fatherIndex,
      index
    } = e.currentTarget.dataset

    if (type == 'platform') {
      this.platformCouponTap(couponId)
    } else {
      this.supplierCouponTap(fatherIndex, index)
    }
	},

	platformCouponTap(couponId) {
    let that = this;
    let {
      result
    } = this.data
    let userCouponId = this.data.userCouponId
    result.availableCoupon.forEach(function(v, i, arr) {
      if (v.userCouponId == couponId) {
        v.taped = !v.taped
        if (v.taped) {
          userCouponId = v.userCouponId
          result.couponStr = '-￥' + v.costPrice.toFixed(2)
          result.couponValue = '￥' + v.costPrice.toFixed(2)
          result.couponPrice = v.costPrice
          // that.data.totalPrice = (that.data.originalTotalPrice * 1 - v.costPrice).toFixed(2)
          that.setData({
            userCouponId,
            result
          })

          that.resetTotalPrice('platform')

        } else {
          userCouponId = ''
          // result.couponStr = that.data.result.availableCoupon.length + '张优惠券可用'
          result.couponValue = '￥0.00'
          result.couponPrice = 0;
          // that.data.totalPrice = that.data.originalTotalPrice.toFixed(2)
          that.setData({
            userCouponId,
            result
          })
          that.resetTotalPrice('platform')
        }
      } else {
        v.taped = false
      }
    })
    that.setData({
      result,
    })
  },

	supplierCouponTap(fatherIndex, index) {
    let that = this;
    let supplierCouponList = that.data.fromPage == 'cart' ? Object.assign([], that.data.result.supplierList[fatherIndex].supplierCoupon) : Object.assign([], that.data.result.supplierCoupon)
    let supplierList = this.data.result.supplierList
    let setSupplerName = 'result.supplierList[' + fatherIndex + '].supplierCoupon'

    for (let i = 0; i < supplierCouponList.length; i++) {
      let item = supplierCouponList[i]
      if (i == index) {
        item.taped = !item.taped
        // 点击前是未选中状态时
        if (item.taped) {
          supplierList[fatherIndex].couponId = item.userCouponId
          supplierList[fatherIndex].couponStr = '-￥' + item.costPrice.toFixed(2)
          supplierList[fatherIndex].couponValue = '￥' + item.costPrice.toFixed(2)
          supplierList[fatherIndex].supplierCouponPrice = item.costPrice
          supplierList[fatherIndex].selectIndex = i
          // that.data.totalPrice = (that.data.originalTotalPrice * 1 - v.costPrice).toFixed(2)
          that.resetTotalPrice('supplier');
        } else {
          supplierList[fatherIndex].couponId = 0
          supplierList[fatherIndex].couponStr = supplierCouponList.length + '张优惠券可用'
          supplierList[fatherIndex].couponValue = '￥0.00'
          supplierList[fatherIndex].supplierCouponPrice = 0
          supplierList[fatherIndex].selectIndex = null
          // that.data.totalPrice = (that.data.originalTotalPrice * 1 - v.costPrice).toFixed(2)
          that.resetTotalPrice('supplier');
        }

      } else {
        item.taped = false
      }
    }

    this.setData({
      [setSupplerName]: supplierCouponList
    })

  },

	// 重新算一次总价
  resetTotalPrice(tapType, setType) {
    // 先算商家优惠券
    let that = this;
    let totalPrice = 0;
    let totalCouponValue = 0;
    let {
      result,
      maxDeductPrice,
      maxDeductPoint,
      firstMaxDeductPrice,
      firstMaxDeductPoint,
      isDikou,
      canFirstClick,
      canClick,
      lessPay,
      goodsAmount,
      isUseBalance,
      balanceAmount,
      userCouponId,
      canUseCouponCount,
      isJifen,
    } = this.data;

    // 计算原始价格和商家优惠券使用情况
    let supplierList = result.supplierList
    let useSupplierCouponList = [] //每次重置选中的商家券的id列表

    // 初始化使用商家券id列表
    if (setType == 'init') {
      useSupplierCouponList = new Array(supplierList).fill("")
    }

    for (let i = 0; i < supplierList.length; i++) {
      let supplierItem = supplierList[i]
      let supplierTotalPrice = 0;
      supplierItem.supplierPrice = 0;

      for (let k = 0; k < supplierItem.orderGoodsList.length; k++) {
        let goodsItem = supplierItem.orderGoodsList[k]
        supplierTotalPrice += goodsItem.salePrice * goodsItem.quantity
        supplierItem.supplierPrice += goodsItem.salePrice * goodsItem.quantity
        if (k == (supplierItem.orderGoodsList.length - 1)) {
          // 当是优惠券点击的时候
          if (tapType == 'supplier' || tapType == 'platform') {
            if (supplierItem.supplierCoupon) {
              // 如果有当前选中的价格才计算
              if (supplierItem.supplierCouponPrice) {
                supplierTotalPrice -= supplierItem.supplierCouponPrice
                supplierItem.supplierPrice -= supplierItem.supplierCouponPrice
                totalCouponValue += supplierItem.supplierCouponPrice
                useSupplierCouponList[i] = supplierItem.supplierCoupon[supplierItem.selectIndex].userCouponId
              }

            }
          } else { //商家优惠券初始化， 选择最大金额那张券
            if (supplierItem.supplierCoupon && supplierItem.supplierCoupon.length > 0) {
              var max = supplierItem.supplierCoupon[0].costPrice;
              var index = 0;
              var endDateStr = new Date(supplierItem.supplierCoupon[0].endDate);
              supplierItem.supplierCoupon.forEach(function(couponItem, couponIndex, arr) {

                couponItem.beginDateStr = that.formatTime(couponItem.beginDate)
                couponItem.endDateStr = that.formatTime(couponItem.endDate)
                couponItem.taped = false
                if (max < couponItem.costPrice) {
                  max = couponItem.costPrice;
                  index = couponIndex;
                  endDateStr = new Date(couponItem.endDate);
                  // 如果有两张一样的金额的优惠券，就选择最快过期的
                } else if (max == couponItem.costPrice) {
                  if (endDateStr.getTime() > new Date(couponItem.endDate).getTime()) {
                    max = couponItem.costPrice;
                    index = couponIndex;
                    endDateStr = new Date(couponItem.endDate);
                  }
                }

              })
              supplierItem.supplierCoupon[index].taped = true; //更新优惠券选中状态
              supplierItem.selectIndex = index; //更新已选择优惠券的索引
              supplierItem.couponId = supplierItem.supplierCoupon[index].userCouponId; //更新已选中的优惠券id
              // result.couponStr = result.availableCoupon.length + '张优惠券可用'
              // result.couponStr = '-' + result.availableCoupon[index].costPrice;
              supplierItem.couponStr = '-￥' + supplierItem.supplierCoupon[index].costPrice.toFixed(2) //更新选中优惠券价格字符串
              supplierItem.couponValue = '￥' + supplierItem.supplierCoupon[index].costPrice.toFixed(2) //更新 -- 可不要
              supplierItem.supplierCouponPrice = supplierItem.supplierCoupon[index].costPrice //更新选中优惠券的价格
              supplierTotalPrice -= supplierItem.supplierCouponPrice //更新这个商家的总价格
              supplierItem.supplierPrice -= supplierItem.supplierCoupon[index].costPrice //更新在列表中商家的总价
              totalCouponValue += supplierItem.supplierCoupon[index].costPrice //更新总的优惠金额
              useSupplierCouponList[i] = supplierItem.supplierCoupon[index].userCouponId //更新使用商家券id列表
            }
          }


        }
      }
      totalPrice += supplierTotalPrice
    }


    // 计算平台优惠券
    if (result.availableCoupon && result.availableCoupon.length > 0 && !isJifen) {
      if (tapType == 'platform') { //如果是点击某个券时调用 
        if (userCouponId) { //如果之前没选中，现在选中的时候
          totalPrice -= result.couponPrice
          totalCouponValue += result.couponPrice
        } else {
          //看看有无可用优惠券
          result.couponStr = that.filterPlatCouponList(totalPrice).length > 0 ? that.filterPlatCouponList(totalPrice).length + '张优惠券可用' : '暂无可用优惠券'
          canUseCouponCount = that.filterPlatCouponList(totalPrice).length //更新可用平台优惠券的数量
          totalPrice -= 0
        }
      } else {
        // 先筛选一遍可用的平台券，如果有
        let nowAvailableList = this.filterPlatCouponList(totalPrice)
        if (nowAvailableList.length > 0) {
          let max = nowAvailableList[0].costPrice;
          let index = nowAvailableList[0].couponIndex;
          let endDateStr = new Date(nowAvailableList[0].endDate);
          for (let m = 0; m < nowAvailableList.length; m++) {
            let item = nowAvailableList[m]
            // item.beginDateStr = that.formatTime(item.beginDate)
            // item.endDateStr = that.formatTime(item.endDate)
            item.taped = false
            if (max < item.costPrice) {
              max = item.costPrice;
              index = item.couponIndex;
              endDateStr = new Date(item.endDate);
              // result.availableCoupon[item.couponIndex].taped = true
              // 如果有两张一样的金额的优惠券，就选择最快过期的
            } else if (max == item.costPrice) {
              if (endDateStr.getTime() > new Date(item.endDate).getTime()) {
                max = item.costPrice;
                index = item.couponIndex;
                endDateStr = new Date(item.endDate);
                // result.availableCoupon[item.couponIndex].taped = true
              }
            }

          }
          result.availableCoupon[index].taped = true
          userCouponId = result.availableCoupon[index].userCouponId
          result.couponStr = '-￥' + result.availableCoupon[index].costPrice.toFixed(2)
          result.couponValue = '￥' + result.availableCoupon[index].costPrice.toFixed(2)
          result.couponPrice = result.availableCoupon[index].costPrice
          totalCouponValue += result.availableCoupon[index].costPrice
          canUseCouponCount = nowAvailableList.length

          // 更新总价
          totalPrice -= max;
        } else { //如果不可用平台优惠券，则不用打开平台优惠券弹窗
          result.couponStr = '暂无可用优惠券'
          canUseCouponCount = 0
        }
      }

    } else {
      result.couponStr = '暂无可用优惠券'
      canUseCouponCount = 0
    }

    // 如果是积分抵扣商品且能用积分抵扣
    if (isDikou && canFirstClick) {
      if (totalPrice.toFixed(2) < result.maxDeductPrice) {
        maxDeductPrice = Math.floor(totalPrice)
        maxDeductPoint = maxDeductPrice * result.memberPointRule.payRate
        firstMaxDeductPrice = Math.floor(totalPrice)
        firstMaxDeductPoint = maxDeductPrice * result.memberPointRule.payRate
        if (canClick) {
          totalPrice = totalPrice - maxDeductPrice
        }
      } else {
        if (maxDeductPoint < result.maxDeductPoint) {
          maxDeductPoint = result.maxDeductPoint;
          maxDeductPrice = result.maxDeductPrice;
        }
        totalPrice = totalPrice - maxDeductPrice
      }
    }

    // 判断是否可用余额
    if (result.canUseBalance && !that.data.isGiftOrder && !isJifen) {
      // 如果可使用余额大于零且现总价要大于0.01*n个商品

      if (result.availableBalance > 0 && (totalPrice.toFixed(2) > (lessPay * goodsAmount))) {
        canClick = true
        canFirstClick = true
        // 初始化，默认如果可用余额且自动选上用余额
        if (setType == 'init') {
          isUseBalance = true
          // 判断是否用完余额
          if (result.availableBalance >= totalPrice) {
            balanceAmount = totalPrice - (lessPay * goodsAmount);
            totalPrice = lessPay * goodsAmount;
          } else {
            balanceAmount = result.availableBalance;
            totalPrice = totalPrice - result.availableBalance * 1;
          }
        } else {
          // 如果用户确认用余额时，更新总价
          if (isUseBalance) {
            // 判断是否用完余额
            if (result.availableBalance >= totalPrice) {
              balanceAmount = totalPrice - (lessPay * goodsAmount);
              totalPrice = lessPay * goodsAmount;
            } else {
              balanceAmount = result.availableBalance;
              totalPrice = totalPrice - result.availableBalance * 1;
            }
          }
        }

      } else {
        canClick = false
        canFirstClick = false
        isUseBalance = false
      }
    } else {
      canClick = false
      canFirstClick = false
      isUseBalance = false
    }

    that.data.result = result
    // 更新数据
    this.setData({
      result: that.data.result,
      maxDeductPrice,
      maxDeductPoint,
      firstMaxDeductPrice,
      firstMaxDeductPoint,
      isDikou,
      canFirstClick,
      canClick,
      lessPay,
      goodsAmount,
      isUseBalance,
      balanceAmount,
      totalPrice,
      userCouponId,
      canUseCouponCount,
      totalCouponValue,
      useSupplierCouponList
    })


  },

	filterPlatCouponList(totalPrice) {
    let result = Object.assign([], this.data.result)
    let availableCouponList = []
    for (let i = 0; i < result.availableCoupon.length; i++) {
      result.availableCoupon[i].platformCoupon = true
      result.availableCoupon[i].couponIndex = i
      result.availableCoupon[i].showCoupon = true
      if (result.availableCoupon[i].needPrice <= totalPrice) {
        result.availableCoupon[i].showCoupon = false
        availableCouponList.push(result.availableCoupon[i])
      }
    }
    this.setData({
      result
    })
    return availableCouponList
  },

	// 添加发票信息
	showInvoiceFn: function() {
		var that = this;
		that.setData({
			showInvoice: true
			// scrollView: false
		});
	},

	/**
	 * 切换发票类型
	 * */
	chooseInvoiceType: function(e) {
		var index = parseInt(e.currentTarget.dataset.index);
		invoiceData.itype = index;
		this.setData({
			itype: index,
			eMailShow: false
		});
		if (index == 1) {
			this.setData({
				eMailShow: true
			});
		}
	},

	/**
	 * 切换发票抬头
	 */
	invoiceTaped: function(e) {
		var that = this;
		var index = e.currentTarget.dataset.index;
		var myType = e.currentTarget.dataset.mytype;
		var passData = {};
		if (myType == 'invoiceHead') {
			invoiceData.ihead = index;
			that.data.invoiceHeadType.forEach(function(v, i, arr) {
				if (index == i) {
					v.taped = true;
					if (index == 1) {
						that.setData({
							companyInvoice: true
						});
						invoiceData.companyName = '';
						invoiceData.taxCode = '';
					} else {
						that.setData({
							companyInvoice: false
						});
					}
				} else {
					v.taped = false;
				}
			});

			this.setData({
				invoiceHeadType: that.data.invoiceHeadType
			});
		} else if (myType == 'invoiceCon') {
			that.data.invoiceConType.forEach(function(v, i, arr) {
				if (index == i) {
					v.taped = true;
				} else {
					v.taped = false;
				}
			});
			this.setData({
				invoiceConType: that.data.invoiceConType
			});

			if (index == 0) {
				invoiceData.icontent = '明细';
			} else if (index == 1) {
				invoiceData.icontent = '办公用品';
			} else if (index == 2) {
				invoiceData.icontent = '电脑配件';
			} else if (index == 3) {
				invoiceData.icontent = '耗材';
			}
		} else {
			return;
		}
	},

	/**
	 * 收票人手机号验证
	 * */

	//  输入时事件
	checkTakerMoInput: function(e) {
		var that = this;
		var phone = e.detail.value;
		if (that.data.result.defaultAddress) {
			var defaultMobile = phone == that.data.result.defaultAddress.shipMobile ? true : false;
		} else {
			var defaultMobile = false;
		}

		if (!this.checkPhoneNumber(phone) && !(this.HidePhone(this.data.initMobile) == phone)) {
			that.setData({
				phoneRight: false
			});
		} else {
			if (this.HidePhone(this.data.initMobile) == phone) {
				defaultMobile = true;
			}
			that.setData({
				phoneRight: true
			});
		}
		that.setData({
			imobile: e.detail.value,
			defaultMobile: defaultMobile
		});
		invoiceData.imobile = e.detail.value;
	},

	// 离开焦点后事件
	checkTakerMoFn: function(e) {
		var that = this;
		var phone = e.detail.value;
		if (!this.checkPhoneNumber(phone) && !(this.HidePhone(this.data.initMobile) == phone)) {

			// this.setData({
			//   showToast: true,
			//   showToastMes: '请输入正确的手机号'
			// })
			that.setData({
				showToast: true,
				showToastMes: '请输入正确的手机号'
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 1500);
			if (phone.length > 11) {
				my.showToast({
					content: '手机号有误'
				});
			}
		} else {
		}
	},

	// 邮箱输入离开焦点时
	checkTakerMailFn(e) {
		var that = this;
		var email = e.detail.value;
		if (!utils.validateEmail(email)) {
			that.setData({
				showToast: true,
				showToastMes: '请输入正确的邮箱'
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 1500);
		}
	},

	// 邮箱输入时验证是否正确，显示框框线提示
	checkTakerMailInput: function(e) {
		var that = this;
		var email = e.detail.value;
		if (!utils.validateEmail(email)) {
			that.setData({
				mailRight: false
			});
		} else {
			that.setData({
				mailRight: true
			});
		}

		that.setData({
			iemail: e.detail.value
		});
		invoiceData.iemail = e.detail.value;
	},

	// 发票--公司名称
	companyInput: function(e) {
		var that = this;
		// var invoiceData = tha
		that.setData({
			companyName: e.detail.value
		});
		invoiceData.companyName = e.detail.value;
	},

	// 纳税人识别码
	taxCodeInput: function(e) {
		var that = this;
		that.setData({
			taxCode: e.detail.value
		});
		invoiceData.taxCode = e.detail.value;
	},

	// 使用发票
	useInvoice: function(e) {
		var that = this;
		// 如果选了电子发票时，收票人手机号和收票人邮箱要是正确的
		if (invoiceData.itype == 1) {
			// 是否正确填写收票人手机号
			if (!that.data.imobile || !that.data.phoneRight) {
				that.setData({
					showToast: true,
					showToastMes: '请输入正确的收票人手机号！'
				});
				setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				return;
			}
			// 是否正确填写收票人邮箱
			if (!that.data.iemail || !that.data.mailRight) {
				that.setData({
					showToast: true,
					showToastMes: '请输入正确的收票人邮箱！'
				});
				setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				return;
			}

			// 如果选了电子发票，且输入过手机号与邮箱，要重新赋值
			invoiceData.imobile = that.data.defaultMobile ? that.data.result.defaultAddress.shipMobile : that.data.imobile;
			invoiceData.iemail = that.data.iemail;
		} else {
			// 如果选的不是电子发票，要删掉收票人的手机号和邮箱信息
			delete invoiceData.imobile;
			delete invoiceData.iemail;
		}
		if (invoiceData.ihead == 1) {
			if (that.data.companyName == '' || !that.data.companyName) {
				that.setData({
					showToast: true,
					showToastMes: '请输入公司名称！'
				});

				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				that.setData({
					timeOut: timeOut
				});
			} else if (that.data.taxCode == '' || !that.data.taxCode) {
				that.setData({
					showToast: true,
					showToastMes: '请输入纳税人识别码！'
				});

				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				that.setData({
					timeOut: timeOut
				});
			} else {
				that.setData({
					invoiceMes: that.data.itype == 1 ? '公司电子发票' : '公司普通发票',
					showInvoice: false,
					useInvoiceBoff: true
				});
				invoiceData.companyName = that.data.companyName;
				invoiceData.taxCode = that.data.taxCode;
			}
		} else {
			// 如果是个人开发票，先清除公司名称和纳税人识别码
			delete invoiceData.companyName;
			delete invoiceData.taxCode;
			that.setData({
				invoiceMes: that.data.itype == 1 ? '个人电子发票' : '个人普通发票',
				showInvoice: false,
				useInvoiceBoff: true
			});
		}

	},

	// 判断总
	judgeEmpty() {
		var that = this;
		if (invoiceData.ihead == 1) {
			if (invoiceData.companyName == '' || !invoiceData.companyName) {
				that.setData({
					showToast: true,
					showToastMes: '请输入公司名称！'
				});

				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				that.setData({
					timeOut: timeOut
				});
			} else if (invoiceData.taxCode == '' || !invoiceData.taxCode) {
				that.setData({
					showToast: true,
					showToastMes: '请输入纳税人识别码！'
				});

				clearTimeout(that.data.timeOut);
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					});
				}, 2000);
				that.setData({
					timeOut: timeOut
				});
			} else {
				that.setData({
					invoiceMes: that.data.itype == 1 ? '公司电子发票' : '公司普通发票',
					showInvoice: false,
					useInvoiceBoff: true
				});
			}
		} else {
			that.setData({
				invoiceMes: that.data.itype == 1 ? '个人电子发票' : '个人普通发票',
				showInvoice: false,
				useInvoiceBoff: true
			});
		}
	},

	/**
	 * 积分使用规则显示
	 * */
	showUseRule: function() {
		var that = this;
		that.setData({
			showUseRule: true
		});
	},

	// 关闭积分使用规则
	closeUseRule: function() {
		var that = this;
		that.setData({
			showUseRule: false
		});
	},
	/**
	 * format time
	 * 将 millionSeconnd转化为yyyy.mm.dd的形式
	 */
	formatTime(millSec) {
		var date = new Date(millSec);
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var date = date.getDate();
		var monthStr = month < 10 ? '0' + month : month;
		var dateStr = date < 10 ? '0' + date : date;
		return year + '.' + monthStr + '.' + dateStr;
	},

	/**
	 * 阻止事件冒泡
	 * */
	preventTouch: function(e) {
		return;
	},

	// 校验手机号码
	checkPhoneNumber(val) {
		let regMobile = /^1[3|4|5|6|7|8|9][\d]{9}$/;    //验证手机号
		let regPhone = /^(^0\d{2}-?\d{8}$)|(^0\d{3}-?\d{7}$)|(^\(0\d{2}\)-?\d{8}$)|(^\(0\d{3}\)-?\d{7}$)$/;   //验证固定电话
		if (regMobile.test(val) || regPhone.test(val)) {
			return true;
		}
		return false;
	},


	// 判断是否跟加密时一样
	HidePhone(phone) {
		var mphone = phone.substr(3, 4);
		var lphone = phone.replace(mphone, "****");
		return lphone;
	},

	// closeCouponShow() {
	//   this.setData({
	//     couponShow: false
	//   })
	// }

});