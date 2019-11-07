// var _myShim = require("........my.shim");
// pages/user/historyOrder/historyOrder.js 
let sendRequest = require("../../../utils/sendRequest.js")
let constants = require("../../../utils/constants.js")
let utils = require("../../../utils/util.js")
let remainSecondArr = [], remainTimeArr1 = [], outOfTimeArr = [], intervalArr = [], searchRemainSecondArr = [], searchRemainTimeArr1 = [], searchOutOfTimeArr = [], searchIntervalArr = [], allInterval = ''; //保存倒计时的数组
// var remainSecondArr = []; //保存倒计时的数组
// var remainTimeArr1 = [];
// var outOfTimeArr = []; //保存过时的数组
// var intervalArr = [];
let app = getApp();

import http from '../../../api/http.js';
import api from '../../../api/api.js'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		selectItem: 0,
		orderType: 'all',
		start: 0,
		limit: 10,
		scrollTop: false,
		baseImageUrl: constants.UrlConstants.baseImageUrl,
		orderList: [],
		nopayCount: 0,
		payfinishCount: 0,
		shippedCount: 0,
		needRedirect: '',
		numToFixed: 0,
		outOfTimeArr: [],
		intervalArr: [],
		remainSecondArr: [], //倒计时时间记录
		remainTimeArr: [], //倒计时时间记录
		allInterval: null, //倒计时的定时器
		baseImgLocUrl: constants.UrlConstants.baseImageLocUrl, //静态图片的前缀
		scrollTopNum: 0, //记录滚动的数值

		searchStart: 0, //订单搜索的开始位置
		searchResult: [], //订单搜索结果数据
		orderSearching: false, //是否正在搜索订单
		searchStart: 0,
		searchRemainSecondArr: [],   //
		searchRemainTimeArr: [],
		searchOutOfTimeArr: [],
		searchIntervalArr: [],
		showCancleButton: false,
		searchValue: '',       //搜索的关键词
		// couponShow: false,     // 优惠券弹窗
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
		var pages = getCurrentPages();
		that.setData({
			needRedirect: pages.length == 5
		});
		var index = '0';
		if (options.index) {
			index = options.index;
			that.setData({
				index: index
			});
		}

		that.setIndex(index);


		// that.getMaterialPic()  //广告位轮播
	},

	onShow: function() {

	},

	onUnload() {
		// 页面被关闭
		clearInterval(this.data.allInterval)
		clearInterval(allInterval)
	},



	//0:全部 1:待支付 2:待发货 3:待收货 4:交易完成
	select: function(event) {
		var index = event.currentTarget.dataset.selectIndex;
		this.setIndex(index);
	},

	setIndex: function(index) {
		var that = this;
		var orderType = '';
		switch (index) {
			case '0':
				orderType = "all";
				break;
			case '1':
				orderType = "nopay";
				break;
			case '2':
				orderType = "payfinish";
				break;
			case '3':
				orderType = "shipped";
				break;
			case '4':
				orderType = 'finish';
				break;
			default:
				orderType = 'all';
				break;
		}
		this.setData({
			selectItem: index,
			orderType: orderType,
			start: 0,
			orderList: []
		});
		this.umaTrackEvent(orderType)
		this.getOrderList(orderType, 0);
		// var that = this;
		this.intervalStart()
		// if (this.data.allInterval) {
		// 	clearInterval(this.data.allInterval)
		// 	clearInterval(allInterval)
		// 	allInterval = setInterval(function() {
		// 		that.getLastTime();
		// 	}, 1000)
		// 	that.setData({
		// 		allInterval: allInterval
		// 	})

		// } else {
		// 	clearInterval(this.data.allInterval)
		// 	clearInterval(allInterval)
		// 	allInterval = setInterval(function() {
		// 		that.getLastTime();
		// 	}, 1000)
		// 	that.setData({
		// 		allInterval: allInterval
		// 	})
		// }

	},

	intervalStart() {
		let that = this;
		clearInterval(this.data.allInterval)
		clearInterval(allInterval)
		allInterval = setInterval(function() {
			that.getLastTime();
			that.setData({
				allInterval: allInterval
			})
		}, 1000)
		// that.setData({
		// 	allInterval: allInterval
		// })
	},


	onUnload: function() {
		var that = this;
		clearInterval(that.data.allInterval);
	},

	/**
	 * 获取轮播图图片
	 * */
	getMaterialPic: function() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.GET_MATERIALGROUP, { groupName: "个人订单轮播" }, function(res) {
			that.setData({
				material: res.data.result.material
			});
		}, function(err) {
		}, 'GET');
	},

	/**获取订单列表
	 * orderType: all-全部订单 nopay-待付款订单 payfinish-待发货订单 shipped-待收货订单 finish-交易完成订单
	 * type  0:刷新/1:加载更多
	 */
	getOrderList: function(orderType, type) {
		this.setData({
			isLoadMore: true,
			// orderList: this.data.orderListOld
		});
		var orderList = [];
		var result = [];
		var that = this;
		sendRequest.send(constants.InterfaceUrl.GET_ORDER_LIST, {
			type: orderType,
			start: this.data.selectItem == 1 ? 0 : this.data.start,
			limit: this.data.selectItem == 1 ? 1000 : this.data.limit
		}, function(res) {
			res.showType = 1;
			var hasMore = false;
			result = res.data.result;
			if (orderType == "nopay") {
				//待支付列表数据结构：[{orders:[],totalPay:100},{orders:[],totalPay:100}...]
				var temp1 = {};
				for (var key in result) {
					//temp1:   {payment1:[],payment2:[]...}
					if (!temp1.hasOwnProperty(result[key].paymentId + 'haha')) {
						//为什么要加'haha'?因为js会对对象的key按照数字大小进行排序，这会导致新单跑到后面去，不利于展示，加上'haha'可以避免排序。比较蠢的方法
						temp1[result[key].paymentId + 'haha'] = [];
					}
					temp1[result[key].paymentId + 'haha'].push(result[key]);
				}
				if (result && result.length == that.data.limit) {
					hasMore = true;
				}
				var temp2 = [];
				for (var key in temp1) {
					var totalPay = 0;
					for (var index in temp1[key]) {
						var order = temp1[key][index];
						totalPay += order.platformAmount;
					}
					var obj = {
						orders: temp1[key],
						totalPay: totalPay.toFixed(2),
						paymentId: key.substring(0, key.length - 4)
					};
					temp2.push(obj);
				}
				orderList = temp2;
			} else if (orderType == 'payfinish') {
				for (var key in result) {
					remainSecondArr.push({});
					remainTimeArr1.push({});
					outOfTimeArr.push({});
					intervalArr.push({});

					if (result[key].orderType == 'GIFT' && result[key].orderStatus == 9) {
						if (that.data.start != 0 && remainSecondArr.length >= that.data.start) {
							var index = that.data.start + parseInt(key);
							remainSecondArr[index].remainSecond = result[key].remainSecond;
							remainSecondArr[index].hasTime = 1;
							remainTimeArr1[index].remainSecond = that.getFormatTime(result[key].remainSecond);
							outOfTimeArr[index].outOfTime = false;
							intervalArr[index].interval = null;
						} else {
							remainSecondArr[key].remainSecond = result[key].remainSecond;
							remainSecondArr[key].hasTime = 1;
							remainTimeArr1[key].remainSecond = that.getFormatTime(result[key].remainSecond);
							outOfTimeArr[key].outOfTime = false;
							intervalArr[key].interval = null;
						}
						that.setData({
							remainSecondArr: remainSecondArr,
							remainTimeArr: remainTimeArr1,
							outOfTimeArr: outOfTimeArr,
							intervalArr: intervalArr
						});
					}
					if (result[key].showType == 2) {
						if (that.data.start != 0 && remainSecondArr.length >= that.data.start) {
							var index = that.data.start + parseInt(key);
							remainSecondArr[index].remainSecond = result[key].remainSecond;
							remainSecondArr[index].hasTime = 1;
							remainTimeArr1[index].remainSecond = that.getFormatTime(result[key].remainSecond);
							outOfTimeArr[index].outOfTime = false;
							intervalArr[index].interval = null;
						} else {
							remainSecondArr[key].remainSecond = result[key].remainSecond;
							remainSecondArr[key].hasTime = 1;
							remainTimeArr1[key].remainSecond = that.getFormatTime(result[key].remainSecond);
							outOfTimeArr[key].outOfTime = false;
							intervalArr[key].interval = null;
						}

						that.setData({
							remainSecondArr: remainSecondArr,
							remainTimeArr: remainTimeArr1,
							outOfTimeArr: outOfTimeArr,
							intervalArr: intervalArr
						});
					}
				}
				orderList = result;

				if (orderList && orderList.length == that.data.limit) {
					hasMore = true;
				}
			} else {
				for (var key in result) {
					remainSecondArr.push({});
					remainTimeArr1.push({});
					outOfTimeArr.push({});
					intervalArr.push({});

					if (result[key].orderType == 'GIFT' && result[key].orderStatus == 9) {
						if (that.data.start != 0 && remainSecondArr.length >= that.data.start) {
							var index = that.data.start + parseInt(key);
							remainSecondArr[index].remainSecond = result[key].remainSecond;
							remainSecondArr[index].hasTime = 1;
							remainTimeArr1[index].remainSecond = that.getFormatTime(result[key].remainSecond);
							outOfTimeArr[index].outOfTime = false;
							intervalArr[index].interval = null;
						} else {
							remainSecondArr[key].remainSecond = result[key].remainSecond;
							remainSecondArr[key].hasTime = 1;
							remainTimeArr1[key].remainSecond = that.getFormatTime(result[key].remainSecond);
							outOfTimeArr[key].outOfTime = false;
							intervalArr[key].interval = null;
						}
						that.setData({
							remainSecondArr: remainSecondArr,
							remainTimeArr: remainTimeArr1,
							outOfTimeArr: outOfTimeArr,
							intervalArr: intervalArr
						});
					}
					if (result[key].showType == 2) {
						if (that.data.start != 0 && remainSecondArr.length >= that.data.start) {
							var index = that.data.start + parseInt(key);
							remainSecondArr[index].remainSecond = result[key].remainSecond;
							remainSecondArr[index].hasTime = 1;
							remainTimeArr1[index].remainSecond = that.getFormatTime(result[key].remainSecond);
							outOfTimeArr[index].outOfTime = false;
							intervalArr[index].interval = null;
						} else {
							remainSecondArr[key].remainSecond = result[key].remainSecond;
							remainSecondArr[key].hasTime = 1;
							remainTimeArr1[key].remainSecond = that.getFormatTime(result[key].remainSecond);
							outOfTimeArr[key].outOfTime = false;
							intervalArr[key].interval = null;
						}
						that.setData({
							remainSecondArr: remainSecondArr,
							remainTimeArr: remainTimeArr1,
							outOfTimeArr: outOfTimeArr,
							intervalArr: intervalArr
						});
					}
				}
				orderList = result;
				if (orderList && orderList.length == that.data.limit) {
					hasMore = true;
				}
			}
			var orders = that.data.orderList;
			if (type == 1) {
				//上拉加载，需要把新数据并到原有数据后面
				orderList = orders.concat(orderList);
			}

			that.setData({
				orderType: orderType,
				orderList: orderList,
				hasMore: hasMore,
				isLoadMore: false

			});
			//如果是刷新页面，需要获取所有订单数
			if (type == 0) {

				sendRequest.send(constants.InterfaceUrl.ORDER_LIST_COUNT, {}, function(res) {
					my.stopPullDownRefresh();
					var result = res.data.result;
					if (result) {
						that.setData({
							nopayCount: result.nopayCount,
							payfinishCount: result.payfinishCount,
							shippedCount: result.shippedCount
						});
					}
				}, function(err) {
				});
			}
		}, function(err) {
			my.stopPullDownRefresh();
			that.setData({
				isLoadMore: false
			});
		});
	},

	/**
	 * 获取填地址倒计时
	 */
	getFormatTime(remainSecond) {
		if (remainSecond > 0) {
			var leftHour = parseInt(remainSecond / 3600);
			var leftMin = parseInt((remainSecond - leftHour * 3600) / 60);
			var leftSec = parseInt(remainSecond - leftHour * 3600 - leftMin * 60);
			var leftHourStr = leftHour < 10 ? '0' + leftHour : leftHour;
			var leftMinStr = leftMin < 10 ? '0' + leftMin : leftMin;
			var leftSecStr = leftSec < 10 ? '0' + leftSec : leftSec;
			return leftHourStr + ":" + leftMinStr + ":" + leftSecStr;
		} else {
			return "00:00:00";
		}
	},

	// 倒计时转换
	getLastTime: function() {
		let that = this;
		let { remainSecondArr, remainTimeArr, outOfTimeArr, searchRemainSecondArr, searchRemainTimeArr, searchOutOfTimeArr } = this.data;
		// let remainTimeArr = that.data.remainTimeArr;
		// let outOfTimeArr = that.data.outOfTimeArr;
		// let searchRemainSecondArr = that.data.searchRemainSecondArr;
		// let searchRemainTimeArr = that.data.searchRemainTimeArr;
		// let searchOutOfTimeArr = that.data.searchOutOfTimeArr;
		// var remainSecond = remainTime
		for (var key in remainSecondArr) {
			if (remainSecondArr[key].remainSecond > 0) {
				var leftHour = parseInt(remainSecondArr[key].remainSecond / 3600);
				var leftMin = parseInt((remainSecondArr[key].remainSecond - leftHour * 3600) / 60);
				var leftSec = remainSecondArr[key].remainSecond - leftHour * 3600 - leftMin * 60;

				leftHour = leftHour < 10 ? '0' + leftHour : leftHour;
				leftMin = leftMin < 10 ? '0' + leftMin : leftMin;
				leftSec = leftSec < 10 ? '0' + leftSec : leftSec;

				remainTimeArr[key].remainSecond = leftHour + ":" + leftMin + ":" + leftSec;
				remainSecondArr[key].remainSecond = that.data.remainSecondArr[key].remainSecond - 1;
			} else {
				clearInterval(that.data.intervalArr[key].interval);
				outOfTimeArr[key].outOfTime = true;
				that.setData({
					outOfTimeArr: outOfTimeArr
				});
			}
		}

		for (var key in searchRemainSecondArr) {
			if (searchRemainSecondArr[key].remainSecond > 0) {
				var leftHour = parseInt(searchRemainSecondArr[key].remainSecond / 3600);
				var leftMin = parseInt((searchRemainSecondArr[key].remainSecond - leftHour * 3600) / 60);
				var leftSec = searchRemainSecondArr[key].remainSecond - leftHour * 3600 - leftMin * 60;

				leftHour = leftHour < 10 ? '0' + leftHour : leftHour;
				leftMin = leftMin < 10 ? '0' + leftMin : leftMin;
				leftSec = leftSec < 10 ? '0' + leftSec : leftSec;

				searchRemainTimeArr[key].remainSecond = leftHour + ":" + leftMin + ":" + leftSec;
				searchRemainSecondArr[key].remainSecond = that.data.searchRemainSecondArr[key].remainSecond - 1;
			} else {
				clearInterval(that.data.searchIntervalArr[key].interval);
				searchOutOfTimeArr[key].outOfTime = true;
				that.setData({
					searchOutOfTimeArr: searchOutOfTimeArr
				});
			}
		}

		that.setData({
			remainTimeArr: remainTimeArr,
			remainSecondArr: remainSecondArr,
			searchRemainTimeArr: searchRemainTimeArr,
			searchRemainSecondArr: searchRemainSecondArr
		});

	},
	onPageScroll: function(obj) {
		var scrollTop = obj.scrollTop;
		if (utils.px2Rpx(scrollTop) >= 160) {
			this.setData({ scrollTop: true });
		} else {
			this.setData({
				scrollTop: false
			});
		}
		this.setData({
			scrollTopNum: obj.scrollTop
		});
	},

	//去支付
	payOrder: function(event) {
		var that = this;
		var paymentId = event.currentTarget.dataset.paymentId;
		var orderType = event.currentTarget.dataset.ordertype;
		sendRequest.send(constants.InterfaceUrl.COUNTINUE_PAY_ORDER, {
			paymentId: paymentId
		}, function(res) {
			var result = res.data.result;
			var orderStr = res.data.result.orderStr;
			var orderSn = res.data.result.orderSn
			if (orderStr.trade_no) {
				my.tradePay({
					tradeNO: orderStr.trade_no,
					success: function(res) {
						if (res.resultCode == '9000') {
							that.controllPayment(paymentId, 'success');
							my.showToast({
								content: '支付成功'
							});

							if (orderType == 'GIFT' || orderType == 'MULTIGIFT') {

								my.redirectTo({
									url: '/pages/user/sendGift/sendGift?paymentOrderId=' + paymentId
								});
							} else if (result.recordId) {
								if (result.tuangouType == 2) {
									my.redirectTo({
										url: '/pages/user/pintuanOrderDetailNew/pintuanOrderDetailNew?recordId=' + result.recordId
									});
								} else {
									my.redirectTo({
										url: '/pages/user/pintuanOrderDetail/pintuanOrderDetail?recordId=' + result.recordId
									});
								}
							} else {
								my.redirectTo({
									url: '/pages/shopping/paySucceed/paySucceed?orderSn=' + orderSn + '&paymentId=' + paymentId
								});
							}

						}
						else if (res.resultCode == '6001') {
							my.showToast({
								content: '已取消'
							})
						}
						else if (res.resultCode == '6002') {
							my.showToast({
								content: '网络连接出错'
							})
						}
						else {
							my.showToast({
								content: '支付失败'
							})
						}
					},
					fail: function(res) {
						that.controllPayment(paymentId, 'cancel');

						my.showToast({
							content: '调用支付失败'
						});
					}
				});
			} else {
				my.showToast({
					content: orderStr.message
				})
			}
		}, function(err) {
			that.setData({
				showToastPayFail: true,
				showToastPayFailMes: err
			});
			setTimeout(function() {
				that.setData({
					showToastPayFail: false
				});
			}, 2000);
			that.controllPayment(paymentId, 'sysBreak');
		});
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
	 * 点击分享的时候跳转的页面
	 */
	toShareOther: function(e) {
		var that = this;
		my.navigateTo({
			url: '/pages/user/sendGift/sendGift?paymentOrderId=' + e.currentTarget.dataset.set
		});
	},
	toGiftOrderDetail: function(e) {
		var that = this;
		my.navigateTo({
			url: '/pages/user/historyOrder/giftOrderDetail/giftOrderDetail?paymentOrderId=' + e.currentTarget.dataset.set
		});
	},
	//取消订单
	cancelOrder: function(event) {
		var paymentId = event.currentTarget.dataset.paymentId;
		// this.setData({
		//   dialogTitle: '确认要取消订单吗？',
		//   dialogParam: {
		//     paymentId: paymentId
		//   },
		//   dialogUrl: constants.InterfaceUrl.CNACEL_ORDER,
		//   dialogMethod: 'GET',
		//   showDialog: true,
		// })
		var that = this;
		var allInterval;
		my.confirm({
			title: '取消订单',
			content: '确认要取消订单吗？',
			success: function(res) {
				if (res.confirm) {
					sendRequest.send(constants.InterfaceUrl.CNACEL_ORDER, {
						paymentId: paymentId
					}, function(res) {
						that.getOrderList(that.data.orderType, 0);
						that.intervalStart()
						// if (that.data.allInterval) {
						// 	clearInterval(that.data.allInterval)
						// 	allInterval = setInterval(function() {
						// 		that.getLastTime();
						// 	}, 1000)
						// 	that.setData({
						// 		allInterval: allInterval
						// 	})

						// } else {
						// 	allInterval = setInterval(function() {
						// 		that.getLastTime();
						// 	}, 1000)
						// 	that.setData({
						// 		allInterval: allInterval
						// 	})
						// }

					}, function(err) {
						my.showToast({
							content: '取消失败, ' + err
						});
					});
				}
			}
		});
	},

	//删除订单
	deleteOrder: function(event) {
		var orderId = event.currentTarget.dataset.orderId;
		var that = this;
		var allInterval;
		my.confirm({
			title: '删除订单',
			content: '确认要删除订单吗？',
			success: function(res) {
				if (res.confirm) {
					sendRequest.send(constants.InterfaceUrl.ORDER_DELETE, {
						orderId: orderId
					}, function(res) {
						that.getOrderList(that.data.orderType, 0);

					}, function(err) {
						my.showToast({
							content: '删除失败, ' + err
						});
					}, 'GET');
				}
			}
		});
		// this.setData({
		//   dialogTitle: '确认要删除订单吗？',
		//   dialogParam: {
		//     orderId: orderId
		//   },
		//   dialogUrl: constants.InterfaceUrl.ORDER_DELETE,
		//   dialogMethod: 'GET',
		//   showDialog: true,
		// })
	},

	//提醒发货
	remindDelivery: function() {
		var that = this;
		setTimeout(function() {
			that.setData({
				showToast: true
			});
		}, 500);
		setTimeout(function() {
			that.setData({
				showToast: false
			});
		}, 2000);
	},

	/**
	 * 评价晒单
	 */
	gotoComment: function(event) {
		var that = this;
		var index = event.currentTarget.dataset.index;
		var order = that.data.orderList[index];
		// var goodsPic = order.goodsImg;
		// var orderId = order.orderId;
		// var supplierId = order.supplierId;
		let { goodsImg, orderId, supplierId, goodsSn } = that.data.orderList[index];
		sendRequest.send(constants.InterfaceUrl.FIND_GOODS_COMMENT, {
			oId: orderId
		}, function(res) {
			my.navigateTo({
				url: '/pages/user/historyOrder/commentAndShare/commentAndShare?orderId=' + orderId + '&goodsPic=' + goodsImg + '&supplierId=' + supplierId + '&goodsSn=' + goodsSn
			});
		}, function(err) {
			my.confirm({
				title: '评价晒单',
				content: '该商品您已评价过，请勿重复评价',
			});
		}, "GET");
	},
	/**
	 * 评价晒单
	 */
	gotoCommentJump: function(event) {
		var that = this;
		var order = that.data.orderList[event];
		// var goodsPic = order.goodsImg;
		// var orderId = order.orderId;
		// var supplierId = order.supplierId;
		let { goodsImg, orderId, supplierId, goodsSn } = that.data.orderList[event]
		sendRequest.send(constants.InterfaceUrl.FIND_GOODS_COMMENT, {
			oId: orderId
		}, function(res) {
			my.navigateTo({
				url: '/pages/user/historyOrder/commentAndShare/commentAndShare?orderId=' + orderId + '&goodsPic=' + goodsImg + '&supplierId=' + supplierId + '&goodsSn=' + goodsSn
			});
		}, function(err) {
			my.confirm({
				title: '评价晒单',
				content: '该商品您已评价过，请勿重复评价',
			});
		}, "GET");
	},

	/**
	 * 用户确认收货
	 */
	orderReceive: function(event) {
		var index = event.currentTarget.dataset.index;
		var order = this.data.orderList[index];
		var orderId = order.orderId;
		// this.setData({
		//   dialogTitle: '确认要收货吗？',
		//   dialogParam: {
		//     orderId: orderId
		//   },
		//   dialogUrl: constants.InterfaceUrl.ORDER_RECEIVE,
		//   dialogMethod: 'POST',
		//   showDialog: true,
		// })
		var that = this;
		var allInterval;
		my.confirm({
			title: '确认收货',
			content: '确认要收货吗？',
			success: function(res) {
				if (res.confirm) {
					sendRequest.send(constants.InterfaceUrl.ORDER_RECEIVE, {
						orderId: orderId
					}, function(res) {
						that.getOrderList(that.data.orderType, 0);
						that.gotoCommentJump(index);
						that.intervalStart()
						// if (that.data.allInterval) {
						// 	clearInterval(that.data.allInterval)
						// 	allInterval = setInterval(function() {
						// 		that.getLastTime();
						// 	}, 1000)
						// 	that.setData({
						// 		allInterval: allInterval
						// 	})

						// } else {
						// 	allInterval = setInterval(function() {
						// 		that.getLastTime();
						// 	}, 1000)
						// 	that.setData({
						// 		allInterval: allInterval
						// 	})
						// }

					}, function(err) {
						my.showToast({
							content: '确认收货失败, ' + err
						});
					});
				}
			}
		});
	},

	/**
	 * 下拉刷新
	 */
	onPullDownRefresh: function() {
		var that = this;
		var allInterval;
		this.setData({
			start: 0,
			orderList: []
		});
		var orderType = this.data.orderType;
		this.getOrderList(orderType, 0, true);
		this.intervalStart()

		// if (that.data.allInterval) {
		// 	clearInterval(this.data.allInterval)
		// 	allInterval = setInterval(function() {
		// 		that.getLastTime();
		// 	}, 1000)
		// 	that.setData({
		// 		allInterval: allInterval
		// 	})

		// } else {
		// 	allInterval = setInterval(function() {
		// 		that.getLastTime();
		// 	}, 1000)
		// 	that.setData({
		// 		allInterval: allInterval
		// 	})
		// }
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		// var that = this;
		// var allInterval;
		// if (this.data.hasMore && this.data.selectItem != 1) {
		//   this.setData({
		//     start: this.data.orderList.length,
		//     limit: this.data.limit
		//   });
		//   var orderType = this.data.orderType;
		//   this.getOrderList(orderType, 1, false);
		// }
	},

	scrollToLower() {
		var that = this;
		var allInterval;
		if (this.data.hasMore && this.data.selectItem != 1) {
			this.setData({
				start: this.data.orderList.length,
				limit: this.data.limit
			});
			var orderType = this.data.orderType;
			this.getOrderList(orderType, 1, false);
			this.intervalStart()
			// if (that.data.allInterval) {
			// 	clearInterval(this.data.allInterval)
			// 	allInterval = setInterval(function() {
			// 		that.getLastTime();
			// 	}, 1000)
			// 	that.setData({
			// 		allInterval: allInterval
			// 	})

			// } else {
			// 	allInterval = setInterval(function() {
			// 		that.getLastTime();
			// 	}, 1000)
			// 	that.setData({
			// 		allInterval: allInterval
			// 	})
			// }

		}
	},


	/**
	 * 对话框确认
	 */
	sure: function() {
		var param = this.data.dialogParam;
		var url = this.data.dialogUrl;
		var that = this;
		var allInterval;
		sendRequest.send(url, param, function(res) {
			that.setData({
				dialogParam: '',
				dialogUrl: '',
				dialogMethod: 'POST',
				showDialog: false
			});
			that.getOrderList(that.data.orderType, 0, false);
			that.intervalStart()
			// if (that.data.allInterval) {
			// 	clearInterval(this.data.allInterval)
			// 	allInterval = setInterval(function() {
			// 		that.getLastTime();
			// 	}, 1000)
			// 	that.setData({
			// 		allInterval: allInterval
			// 	})

			// } else {
			// 	allInterval = setInterval(function() {
			// 		that.getLastTime();
			// 	}, 1000)
			// 	that.setData({
			// 		allInterval: allInterval
			// 	})
			// }

		}, function(err) {
			that.setData({
				dialogParam: '',
				dialogUrl: '',
				showDialog: false,
				dialogMethod: 'POST'
			});
		});
	},

	/**
	 * 对话框取消
	 */
	cancel: function() {
		this.setData({
			showDialog: false
		});
	},

	/**
	 * 禁止滑动
	 */
	move: function() { },

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {
		var that = this;
		var showGift = this.data.selectIndex == 0 ? true : false;
		return {
			path: '/pages/user/sendGift/receiveGift/receiveGift?wishMessage=' + this.data.wishMessage + '&showGift=' + showGift + '&encryptStr=' + this.data.encryptStr + '&paymentOrderId=' + this.data.paymentOrderId,
			success: function(res) {
				// 转发成功
				sendRequest.send(constants.InterfaceUrl.SHOP_GIFT_SHARE, {
					showGift: that.data.selectIndex == 0 ? 1 : 0,
					wishMessage: that.data.wishMessage || '小小心意，送给特别的你',
					paymentOrderId: that.data.paymentOrderId
				}, function(res) {
				}, function(err) {
				});
			},
			fail: function(res) {
				// 转发失败
			}
		};
	},
	/**
	 * 
	 * 
	 */
	toHistory: function(e) {
		var that = this;
		my.navigateTo({
			url: e.currentTarget.dataset.taburl
		});
	},

	// 
	toGiftOrder: function(e) {
		// var paymentId = e.currentTarget.dataset.paymentid;
		// var orderSn = e.currentTarget.dataset.ordersn;
		// var orderType = e.currentTarget.dataset.ordertype;
		let { paymentid, ordersn, ordertype, showtype } = e.currentTarget.dataset

		if (ordertype == 'MULTIGIFT' || showtype == '2') {
			// my.navigateTo({
			// 	url: '/pages/user/historyOrder/giftOrderDetail/giftOrderDetail?paymentOrderId=' + paymentId
			// });
			return;
		} else {
			my.navigateTo({
				url: '/pages/user/historyOrder/orderDetail/orderDetail?orderSn=' + ordersn
			});
		}
	},

	// 轮播图改变
	swiperChange: function(e) {
		var current = e.detail.current;
		var that = this;
		// that.setData({
		//   currentIndex: current
		// })
		that.setCurrentIndexFn(current);
	},
	// 手动调currentIndex
	setCurrentIndexFn: function(index) {
		var that = this;
		that.setData({
			currentIndex: index
		});
	},

	/**
	 * 轮播图跳转
	 * */
	goToLink: function(e) {
		var isLink = e.currentTarget.dataset.islink;
		var url = e.currentTarget.dataset.url;
		var goodsSn = e.currentTarget.dataset.goodssn;

		if (isLink) {
			if (url) {
				if (url.indexOf('shop/goods/view') != -1) {
					var index = url.lastIndexOf("\/");
					goodsSn = url.substring(index + 1, index + 15);
					my.navigateTo({
						url: '/pages/shopping/goodsDetail/goodsDetail?goodsSn=' + goodsSn
					});
				} else if (url.indexOf('GroupBuying/goods') != -1) {
					var index = url.lastIndexOf("\/");
					goodsSn = url.substring(index + 1, index + 15);
					my.navigateTo({
						url: '/pages/home/pintuan/tuangouGoodsDetail?goodsSn=' + goodsSn
					});
				} else {
					try {
						my.setStorageSync({ key: 'swiperUrl', data: url });
					} catch (e) { }
					my.navigateTo({
						url: '/pages/user/webView/webView?link=' + url
					});
				}
			}
		}
	},



	// 搜索订单确认
	selectResult(e) {
		// console.log(';;;;;----',e)
		let value = e;
		value = value.trim()
		if (value) {
			this.setData({
				orderSearching: true,
				searchResult: [],
				searchStart: 0,
				searchRemainSecondArr: [],
				searchRemainTimeArr: [],
				searchOutOfTimeArr: [],
				searchIntervalArr: [],
				searchValue: value
			})
			this.getOrderSearchData(value)
		}
		else {
			my.showToast({
				content: '您未输入搜索内容哦~',
				type: 'fail'
			});
		}

	},

	// 取消搜索框的按钮
	cancelsearch() {
		// 回到初始化
		this.setData({
			orderSearching: false,
			showCancleButton: false,
			searchResult: [],
			searchStart: 0,
			searchValue: '',
			searchRemainSecondArr: [],
			searchRemainTimeArr: [],
			searchOutOfTimeArr: [],
			searchIntervalArr: []

		})
	},

	// 获取焦点时
	searchFocus() {
		this.setData({
			showCancleButton: true
		})
	},


	// 获取搜索订单数据
	getOrderSearchData(keyword, type) {
		let that = this;
		this.setData({
			isSearchLoadMore: true
		})

		http.post(api.ORDER.order_search, {
			keyword,
			start: this.data.searchStart,
			limit: this.data.limit
		}, res => {
			let searchResult = res.data.data ? res.data.data : [];
			let partSearchResult = this.data.searchResult;

			for (var key in searchResult) {
				searchRemainSecondArr.push({})
				searchRemainTimeArr1.push({})
				searchOutOfTimeArr.push({})
				searchIntervalArr.push({})

				if (searchResult[key].giftOrderShowType == '1' && searchResult[key].orderStatus == 'WAITING_FILL_ADDR') {
					if (that.data.searchStart != 0 && (remainSecondArr.length >= that.data.searchStart)) {
						var index = that.data.searchStart + parseInt(key)
						searchRemainSecondArr[index].remainSecond = searchResult[key].remainSecond
						searchRemainSecondArr[index].hasTime = 1
						searchRemainTimeArr1[index].remainSecond = that.getFormatTime(searchResult[key].remainSecond)
						searchOutOfTimeArr[index].outOfTime = false;
						searchIntervalArr[index].interval = null;
					} else {
						searchRemainSecondArr[key].remainSecond = searchResult[key].remainSecond
						searchRemainSecondArr[key].hasTime = 1
						searchRemainTimeArr1[key].remainSecond = that.getFormatTime(searchResult[key].remainSecond)
						searchOutOfTimeArr[key].outOfTime = false;
						searchIntervalArr[key].interval = null;
					}
					that.setData({
						searchRemainSecondArr: searchRemainSecondArr,
						searchRemainTimeArr: searchRemainTimeArr1,
						searchOutOfTimeArr: searchOutOfTimeArr,
						searchIntervalArr: searchIntervalArr
					})
				}
				if (searchResult[key].giftOrderShowType == '2') {
					if (that.data.searchStart != 0 && (searchRemainSecondArr.length >= that.data.searchStart)) {
						var index = that.data.searchStart + parseInt(key)
						searchRemainSecondArr[index].remainSecond = searchResult[key].remainSecond
						searchRemainSecondArr[index].hasTime = 1
						searchRemainTimeArr1[index].remainSecond = that.getFormatTime(searchResult[key].remainSecond)
						searchOutOfTimeArr[index].outOfTime = false;
						searchIntervalArr[index].interval = null;
					} else {
						searchRemainSecondArr[key].remainSecond = searchResult[key].remainSecond
						searchRemainSecondArr[key].hasTime = 1
						searchRemainTimeArr1[key].remainSecond = that.getFormatTime(searchResult[key].remainSecond)
						searchOutOfTimeArr[key].outOfTime = false;
						searchIntervalArr[key].interval = null;
					}
					that.setData({
						searchRemainSecondArr: searchRemainSecondArr,
						searchRemainTimeArr: searchRemainTimeArr1,
						searchOutOfTimeArr: searchOutOfTimeArr,
						searchIntervalArr: searchIntervalArr
					})
				}

			}





			// let hasMore = false
			// if (searchResult && (searchResult.length == that.data.limit)) {
			//   hasMore = true
			// }
			if (type == 1) { //上拉加载，需要把新数据并到原有数据后面
				searchResult = partSearchResult.concat(searchResult)
			}
			that.setData({
				searchResult,
				hasSearchMore: res.data.data ? res.data.data.length >= that.data.limit ? true : false : false,
				isSearchLoadMore: false
			})
		}, err => {
			that.setData({
				isSearchLoadMore: false,
				hasSearchMore: false
			})
		})
	},


	// 滚动加载更多的搜索结果
	loadMoreSearchResult(e) {
		if (this.data.hasSearchMore && !this.data.isSearchLoadMore) {
			this.setData({
				searchStart: this.data.searchResult.length,
			})
			this.getOrderSearchData(this.data.searchValue, 1)
			this.intervalStart()
		}

	},

	// 友盟+ 数据上报
	umaTrackEvent(type) {
		var orderTypeString = '全部'
		switch (type) {
			case 'all':
				orderTypeString = "全部";
				break;
			case 'nopay':
				orderTypeString = "待支付";
				break;
			case 'payfinish':
				orderTypeString = "待发货";
				break;
			case 'shipped':
				orderTypeString = "待收货";
				break;
			case 'finish':
				orderTypeString = "交易完成";
				break;
			default:
				orderTypeString = "全部";
				break;
		}

		getApp().globalData.uma.trackEvent('myOrderListView', {orderType: orderTypeString})
	},

	// closeCouponShow() {
	//   this.setData({
	//     couponShow: false
	//   })
	// },
});