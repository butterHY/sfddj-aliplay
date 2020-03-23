// var _myShim = require('........my.shim');
// pages/home/recommend/recommend.js
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var utils = require('../../../utils/util');
import http from '../../../api/http'
import api from '../../../api/api'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		couponList: [],
		isLoadMore: false,
		tapIndex: null,
		token: null,
		showToast: false,
		errMsg: '',
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		baseImageUrl: constants.UrlConstants.baseImageUrl,
		smallImgArg: '?x-oss-process=style/goods_img_3',
		likeStart: 0,
		end: 0,
		likeLimit: 10,
		isLoadComplete: false,
		loadIndex: 1 //加载的次数
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// utils.getNetworkType(this)

		// 友盟+统计  ----领券中心浏览
		my.uma.trackEvent('couponCenterView');

		this.getCouponList();
		this.getGuessLike(0);
	},

	onShow: function () {
		// 友盟+统计  ----领券中心浏览
		my.uma.trackEvent('couponCenterView');
	},

	/**
	 * 获取优惠券列表
	 */
	getCouponList: function () {
		var that = this;
		this.setData({
			isLoadMore: true
		});
		sendRequest.send(constants.InterfaceUrl.CAN_RECEIVE_COUPON2, {}, function (res) {
			let couponList = res.data.result.couponDTOS;
			// var resOff = []
			that.setData({
				isBing: res.data.result.isBing
			});
			if (couponList || Object.keys(couponList).length > 0) {
				couponList.forEach(function (item, index) {
					item.beginDateStr = that.formatTime(item.beginDate);
					item.endDateStr = that.formatTime(item.endDate);

					item.drawPercent = Math.round(item.drawNum / item.couponNum * 100);
					// if (errorCode == constants.errorCode.BIND_PHONE){
					//   resOff[index]=true
					// }
				});
			}

			that.setData({
				couponList: couponList,
				isLoadMore: false,
				loadComplete: true
			});
		}, function (err) {
			that.setData({
				isLoadMore: false,
				loadComplete: true
			});
			my.showToast({
				content: err
			});
		});
	},

	/**
	 * 领取优惠券
	 */
	exchangeCoupon: function (event) {
		var that = this;
		// wx.showLoading({
		//   title: 'loading..',
		// })
		let formId = event.detail.formId;
		let index = event.buttonTarget.dataset.index;
		let expireType = event.buttonTarget.dataset.expiretype;
		let validDay = event.buttonTarget.dataset.validday;
		let useLink = event.buttonTarget.dataset.useUrl;
		let limitType = event.buttonTarget.dataset.limittype;


		that.setData({
			tapIndex: index
		});

		var couponList = this.data.couponList;

		// 友盟+统计  ----领券中心点击
		my.uma.trackEvent('couponCenterClick', { codeSign: couponList[index].codeSign });

		if (that.data.isBing) {
			//兑换优惠券
			sendRequest.send(constants.InterfaceUrl.EXCHANGE_COUPON, {
				ruleSign: couponList[index].codeSign,
				formId: formId
			}, function (res) {

				let { result } = res.data;

				if (result[0].drawStatus == 1) {
					my.confirm({
						title: '',
						content: result[0].errMsg,
						confirmButtonText: '去使用',
						success: res => {
							if (res.confirm == true) {

								if (useLink && useLink != 'undefined' && useLink != 'null') {
									my.navigateTo({
										url: useLink,
									})
								} else {
									//  如果是这些类型就跳去首页，否则就跳去分组页
									if (limitType == 0 || limitType == 4 || limitType == 5 || limitType == 6) {
										my.switchTab({
											url: '/pages/home/home',
										})
									} else {
										my.navigateTo({
											url: '/pages/home/grouping/grouping?pageFrom=coupon&couponId=' + couponList[index].id
										});
									}
								}
							}
						}
					})
				}
				else {
					if (res.data.result[0].errMsg) {
						var errMsg = res.data.result[0].errMsg;
					} else {
						if (expireType == '1') {

							var errMsg = validDay ? '领取成功后' + validDay + '天有效' : '优惠券领取成功!';
						}
						else {
							var errMsg = '优惠券领取成功!'
						}
					}
					// wx.hideLoading()
					that.setData({
						showToast: true,
						errMsg: errMsg
					});
					setTimeout(function () {
						that.setData({
							showToast: false
						});
					}, 1000);

					that.getCouponList();
				}


			}, function (err) {
				my.hideLoading();
				my.showToast({
					content: err,
				})
				if (!that.data.isBing) {
					that.getPhoneNumber();
				}

			});
		}

	},

	// 新的猜你喜欢
	getGuessLike(type) {
		let that = this;
		let data = {
			start: this.data.likeStart,
			limit: this.data.likeLimit,
			groupName: '支付宝小程序猜你喜欢'
		}
		if (type == 0) {
			data.isFirst = 1
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
			} else {
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

	// 获取销量前100的商品
	getTop100: function () {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.GET_TOP100, {}, function (res) {
			that.setData({
				allGoodsList: res.data.result.goodsVos,
				loadComplete: true,
				loadFail: false
			});
			that.handMakePaging();
		}, function (err) {
			that.setData({
				loadFail: true
			})
		}, 'GET');
	},

	// 手动分页
	handMakePaging: function () {
		var that = this;
		var loadIndex = that.data.loadIndex;
		var start = that.data.start;
		var end = that.data.end;
		var limit = that.data.limit;
		var recommondList = [];

		if (end >= that.data.allGoodsList.length) {
			that.setData({
				downPage: true
			});
		} else {
			start = end;
			end = end + limit;
			if (that.data.allGoodsList.length > end) {
				recommondList = that.data.allGoodsList.slice(0, end);
				loadIndex++;
			} else if (that.data.allGoodsList.length <= end) {
				end = that.data.allGoodsList.length;
				recommondList = that.data.allGoodsList.slice(0, end);
				loadIndex++;
			}

			that.setData({
				recommondList: recommondList,
				start: start,
				end: end,
				loadIndex: loadIndex
			});
		}
	},

	/**
	 * 添加购物车
	 */
	addCart: function (e) {
		let that = this;
		let productId = e.currentTarget.dataset.pid;

		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: productId, quantity: '1' }, function (res) {

			// 达观数据上报
			// utils.uploadClickData_da('cart', [{ productId, actionNum: '1' }])

			my.showToast({
				content: '添加购物车成功'
			});
		}, function (res) {
			// wx.showToast({
			//   title: res,
			// })
			that.setData({
				// showDialog3: false,
				showToast: true,
				errMsg: res
			});
			setTimeout(function () {
				that.setData({
					showToast: false
				});
			}, 2000);
		});
	},

	getPhoneNumber: function (e) {
		var that = this;

		my.getPhoneNumber({
			success: (res) => {
				let response = res.response
				sendRequest.send(constants.InterfaceUrl.USER_BINGMOBILEV4, {
					response: response,
				}, function (res) {
					try {
						my.setStorageSync({ key: constants.StorageConstants.tokenKey, data: res.data.result.loginToken });
						my.setStorageSync({ key: 'user_memId', data: res.data.result.memberId });

					} catch (e) {

						my.setStorage({ key: 'user_memId', data: res.data.result.memberId });
					}
					sendRequest.send(constants.InterfaceUrl.EXCHANGE_COUPON, {
						ruleSign: that.data.couponList[that.data.tapIndex].codeSign
					}, function (res) {
						if (res.data.result[0].errMsg) {
							var errMsg = res.data.result[0].errMsg;
						} else {
							var errMsg = '优惠券领取成功!';
						}
						my.hideLoading();
						that.setData({
							showToast: true,
							errMsg: errMsg
						});
						setTimeout(function () {
							that.setData({
								showToast: false
							});
						}, 1000);

						that.getCouponList();
					}, function (err) {
						my.hideLoading();
						// wx.showToast({
						//   title: '优惠券领取失败',
						// })
						that.getPhoneNumber();
					});
					// that.getCouponList()
				}, function (res) {
				});
			},
			fail: function () {
				return;
			}
		})


	},

	/**
	 * 点去使用按钮
	 * */
	toUseCoupon(e) {
		let useLink = e.currentTarget.dataset.useUrl;
		let couponId = e.currentTarget.dataset.id;
		let limitType = e.currentTarget.dataset.limittype;

		// let navigateUrl = useLink ? useLink : '/pages/home/grouping/grouping?from=coupon&couponId=' + couponId;

		// my.navigateTo({ url: navigateUrl });

		if (useLink && useLink != 'undefined' && useLink != 'null') {
			my.navigateTo({
				url: useLink,
			})
		} else {
			//  如果是这些类型就跳去首页，否则就跳去分组页
			if (limitType == 0 || limitType == 4 || limitType == 5 || limitType == 6) {
				my.switchTab({
					url: '/pages/home/home',
				})
			} else {
				my.navigateTo({
					url: '/pages/home/grouping/grouping?pageFrom=coupon&couponId=' + couponId
				});
			}
		}

	},

	//滚动加载
	onReachBottom: function (e) {
		var that = this;
		// that.handMakePaging();
		if (!this.data.isLoadComplete) {
			this.setData({
				likeStart: this.data.recommondList.length
			})
			this.getGuessLike(1)
		}
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
	// 分享页面
	onShareAppMessage: function (e) {
		return {
			title: '顺丰大当家-顺丰旗下电商平台',
			path: '/pages/home/getCoupon/getCoupon'
		};
	}
});