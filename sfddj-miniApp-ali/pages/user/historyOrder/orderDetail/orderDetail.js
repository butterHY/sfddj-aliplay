// var _myShim = require("..........my.shim");
// pages/user/historyOrder/orderDetail/orderDetail.js
var sendRequest = require("../../../../utils/sendRequest");
var constants = require("../../../../utils/constants");
var utils = require("../../../../utils/util");
var dateformat = require("../../../../utils/dateformat");
import http from '../../../../api/http.js'
import api from '../../../../api/api.js'
var invoiceHeadType = [{
	name: '个人',
	taped: true
}, {
	name: '公司'
}]
var invoiceConType = [{
	name: '明细',
	taped: true
}]
var invoiceData = {
	itype: 1,
	ihead: 0,
	icontent: "明细"
}
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		payType: '',
		// showDialog: false,
		// dialogParam: '',
		// dialogUrl: '',
		// dialogMethod: 'POST',
		loadComplete: false,
		loadFail: false,
		errMsg: '',
		orderTime: '',
		needRedirect: '',
		baseImgLocUrl: constants.UrlConstants.baseImageLocUrl,
		showInvoice: false,
		itype: 1,
		invoiceOff: 'electronic',
		invoiceHeadType: invoiceHeadType, //发票抬头
		invoiceConType: invoiceConType, //发票内容
		invoiceMes: '添加发票信息',
		iemail: '',
		invoiceData: invoiceData, //设默认的发票信息
		mailRight: false,
		initMobile: '',     //用来保存最原始的电话
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
		if (pages.length == 3 && pages[1].route == "pages/user/historyOrder/historyOrder") {
			try {
				my.setStorageSync({ 'toHistory': '1' });
			} catch (e) { }
		}
		var orderSn = options.orderSn;
		this.setData({
			orderSn: orderSn
		});
	},

	onShow: function() {
		// utils.getNetworkType(this);
		this.getOrderDetail();
	},

	/**
	 * 页面卸载时清除倒计时
	 */
	onUnload: function() {
		var that = this;
		clearInterval(that.data.interval);
	},

	/**
	 * 获取订单详情
	 */
	getOrderDetail() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.ORDER_DETAIL, {
			orderSn: this.data.orderSn
		}, function(res) {
			var payType = '';
			switch (res.data.result.order.payType) {
				case 'ALIPAY':
					payType = '支付宝';
					break;
				case 'WEIXIN':
					payType = '微信';
					break;
				case 'QQQB':
					payType = 'QQ钱包';
					break;
				case 'SFPAY':
					payType = '顺手付';
					break;
				case 'GIFTCODE':
					payType = '礼品码支付';
					break;
				case 'MINI_WEIXIN':
					payType = '小程序微信支付';
					break;
				case 'APP_ALIPAY':
					payType = 'APP支付宝支付';
					break;
				case 'APP_WEIXIN':
					payType = 'APP微信支付';
					break;
				case 'WEIXIN_H5':
					payType = '微信H5';
					break;
				case 'APP_QQQB':
					payType = 'APPQQ钱包支付';
					break;
				case 'CMBBANKPAY':
					payType = '一网通支付';
					break;
				case 'APP_CMBBANKPAY':
					payType = '一网通app支付';
					break;
				case 'MINI_ALIPAY':
					payType = '支付宝小程序';
					break;
			}
			var result = res.data.result;
			var remainSecond = res.data.result.remainSecond;
			var imobile = ''

			// 用于电子发票的选择
			if (result.order) {
				// imobile = result.order.shipMobile && result.order.shipMobile.length >= 11 ? result.order.shipMobile.substr(0, 4) + '****' + result.order.shipMobile.substr(8, 12) : ""
				let shipMobile = result.order.shipMobile;
				let firstMo = shipMobile && shipMobile.length >= 11 ? shipMobile.substr(3, 4) : '';
				imobile = shipMobile && shipMobile.length >= 11 ? shipMobile.replace(firstMo, "****") : "";
			}

			that.countLeftTime(remainSecond);
      
			that.setData({
				result: res.data.result,
				goods: res.data.result.goods,
				hasComment: res.data.result.hasCommnet ? res.data.result.hasCommnet : '',
				order: res.data.result.order,
				supplier: res.data.result.supplier,
				totalPrice: res.data.result.totalPrice,
				expressInfo: res.data.result.expressInfo ? res.data.result.expressInfo : '',
				payType: payType,
				baseImageUrl: constants.UrlConstants.baseImageUrl,
				receiverNickName: res.data.result.receiverNickName ? res.data.result.receiverNickName : '',
				orderTime: dateformat.DateFormat.format(new Date(res.data.result.order.createDate), 'yyyyMMdd hh:mm:ss'),
				loadComplete: true,
				loadFail: false,
				workOrder: res.data.result.workOrder,
				isJifen: res.data.result.order.orderItemList[0].isJifen,
				imobile: imobile,
				phoneRight: imobile ? true : false,
				defaultMobile: imobile ? true : false,
				initMobile: result.order.shipMobile
			});
      console.log(res.data.result.expressInfo);
      console.log(res.data.result.order.type);
		}, function(err) {
			that.setData({
				loadComplete: true,
				loadFail: true,
				errMsg: err
			});
		}, "GET");
	},

	/**
	 * 获取下单时间
	 */
	getOrderTime(createTime) {
		var date = new Date(createTime);
		var year = date.getFullYear();
		var month = date.getMonth() + 1 < 10;
		var day = date.getDate();
		var hour = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		return year + "" + month + day + " " + hour + ":" + min + ":" + sec;
	},

	/**
	 * 获取剩余时间
	 */
	countLeftTime(remainSecond) {
		var that = this;
		var interval = setInterval(function() {
			if (remainSecond > 0) {
				var leftHour = parseInt(remainSecond / 3600);
				var leftMin = parseInt((remainSecond - leftHour * 3600) / 60);
				var leftSec = remainSecond - leftHour * 3600 - leftMin * 60;
				var leftHourStr = leftHour < 10 ? '0' + leftHour : leftHour;
				var leftMinStr = leftMin < 10 ? '0' + leftMin : leftMin;
				var leftSecStr = leftSec < 10 ? '0' + leftSec : leftSec;
				remainSecond = remainSecond - 1;
				that.setData({
					leftTime: leftHourStr + ":" + leftMinStr + ":" + leftSecStr
				});
			} else {
				clearInterval(interval);
			}
		}, 1000);
		this.setData({
			interval: interval
		});
	},

	//删除订单
	deleteOrder: function(event) {
		// var orderId = event.currentTarget.dataset.orderId
		// this.setData({
		//   dialogTitle: '确认要删除订单吗？',
		//   dialogParam: {
		//     orderId: orderId
		//   },
		//   dialogUrl: constants.InterfaceUrl.ORDER_DELETE,
		//   dialogMethod: 'GET',
		//   showDialog: true,
		// })

		var orderId = event.currentTarget.dataset.orderId;
		var that = this;
		my.confirm({
			title: '删除订单',
			content: '确认要删除订单吗？',
			success: function(res) {
				if (res.confirm) {
					sendRequest.send(constants.InterfaceUrl.ORDER_DELETE, {
						orderId: orderId
					}, function(res) {
						my.navigateBack({});
					}, function(err) {
						my.showToast({
							content: '删除失败, ' + err
						});
					}, 'GET');
				}
			}
		});
	},

	/**
	 * 用户确认收货
	 */
	orderReceive: function(event) {
		// var orderId = event.currentTarget.dataset.orderId
		// this.setData({
		//   dialogTitle: '确认要收货吗？',
		//   dialogParam: {
		//     orderId: orderId
		//   },
		//   dialogUrl: constants.InterfaceUrl.ORDER_RECEIVE,
		//   dialogMethod: 'POST',
		//   showDialog: true,
		// })
		var orderId = event.currentTarget.dataset.orderId;
		var that = this;
		my.confirm({
			title: '确认收货',
			content: '确认要收货吗？',
			success: function(res) {
				if (res.confirm) {
					sendRequest.send(constants.InterfaceUrl.ORDER_RECEIVE, {
						orderId: orderId
					}, function(res) {
						that.getOrderDetail();
						that.gotoComment();
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
	 * 评价晒单
	 */
	gotoComment(event) {
		var order = this.data.order;
		var goodsPic = order.orderItemList[0].goodsImage;
		// var orderId = order.id;
		// var supplierId = order.supplierId;
		let { id, supplierId } = this.data.order
		let { goodsSn } = this.data.goods
		var that = this;
		sendRequest.send(constants.InterfaceUrl.FIND_GOODS_COMMENT, {
			oId: id
		}, function(res) {
			if (that.data.needRedirect) {
				my.redirectTo({
					url: '/pages/user/historyOrder/commentAndShare/commentAndShare?orderId=' + id + '&goodsPic=' + goodsPic + '&supplierId=' + supplierId + '&goodsSn=' + goodsSn
				});
			} else {
				my.navigateTo({
					url: '/pages/user/historyOrder/commentAndShare/commentAndShare?orderId=' + id + '&goodsPic=' + goodsPic + '&supplierId=' + supplierId + '&goodsSn=' + goodsSn
				});
			}
		}, function(err) {
			my.confirm({
				title: '评价晒单',
				content: '该商品您已评价过，请勿重复评价',
			});
		}, "GET");
	},

	/**
	 * 复制订单号
	 * */
	clipText: function() {
		var that = this;
		my.setClipboard({
			text: that.data.order.orderSn,
			success: function(res) {
				my.getClipboard({
					success: ({ text }) => {
						// that.setData({
						//   showToast: true,
						//   showToastMes: ''
						// })
						my.showToast({
							content: '订单号复制成功',
							type: 'success'
						})
					}
				});
			}
		});
	},

	// 跳去客服网页版
	goToWebCall: function() {
		var that = this;
		var webCallLink = that.data.supplier.webCallParam;
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

	/**
	 * 对话框确认
	 */
	checkInvPic() {
		var that = this;
		try {
			getApp().invUrl = that.data.result.invUrl;
			// getApp().invUrl = "http://img.sfddj.com/miniappImg/more/topic_litTit.png";
		} catch (e) { }
		my.navigateTo({
			url: '/pages/user/historyOrder/orderDetail/showInvoice/showInvoice'
		});
	},

	// 点击开票
	showInvoice() {
		this.setData({
			showInvoice: true
		})
	},

	/**
	 * 隐藏优惠券dialog
	 */
	colseCouponDialog: function(e) {
		var that = this
		that.setData({
			showInvoice: false
		})
	},

	/**
	 * 切换发票类型
	 * */
	chooseInvoiceType: function(e) {
		var index = parseInt(e.currentTarget.dataset.index)
		invoiceData.itype = index
		this.setData({
			itype: index,
			eMailShow: false
		})
		if (index == 1) {
			this.setData({
				eMailShow: true
			})
		}
	},


	/**
	 * 切换发票抬头
	 */
	invoiceTaped: function(e) {
		var that = this
		var index = e.currentTarget.dataset.index
		var myType = e.currentTarget.dataset.myType
		var passData = {}
		if (myType == 'invoiceHead') {
			invoiceData.ihead = index;
			that.data.invoiceHeadType.forEach(function(v, i, arr) {
				if (index == i) {
					v.taped = true
					if (index == 1) {
						that.setData({
							companyInvoice: true
						})
						invoiceData.companyName = ''
						invoiceData.taxCode = ''
					} else {
						that.setData({
							companyInvoice: false
						})
					}
				} else {
					v.taped = false
				}
			})

			this.setData({
				invoiceHeadType: that.data.invoiceHeadType,
			})
		} else if (myType == 'invoiceCon') {
			that.data.invoiceConType.forEach(function(v, i, arr) {
				if (index == i) {
					v.taped = true
				} else {
					v.taped = false
				}
			})
			this.setData({
				invoiceConType: that.data.invoiceConType,
			})

			if (index == 0) {
				invoiceData.icontent = '明细'
			} else if (index == 1) {
				invoiceData.icontent = '办公用品'
			} else if (index == 2) {
				invoiceData.icontent = '电脑配件'
			} else if (index == 3) {
				invoiceData.icontent = '耗材'
			}
		} else {
			return;
		}

	},

	// 使用发票
	useInvoice: function(e) {
		var that = this;
		// 如果选了电子发票时，收票人手机号和收票人邮箱要是正确的
		// if (invoiceData.itype == 1) {
		// 是否正确填写收票人手机号
		if (!that.data.imobile || !that.data.phoneRight) {
			that.setData({
				showToast: true,
				showToastMes: '请输入正确的收票人手机号！'
			})
			setTimeout(function() {
				that.setData({
					showToast: false
				})
			}, 2000)
			return
		}
		// 是否正确填写收票人邮箱
		if (!that.data.iemail || !that.data.mailRight) {
			that.setData({
				showToast: true,
				showToastMes: '请输入正确的收票人邮箱！'
			})
			setTimeout(function() {
				that.setData({
					showToast: false
				})
			}, 2000)
			return
		}

		// 如果选了电子发票，且输入过手机号与邮箱，要重新赋值
		invoiceData.imobile = that.data.defaultMobile ? that.data.result.order.shipMobile : that.data.imobile;
		invoiceData.iemail = that.data.iemail;


		// } 
		if (invoiceData.ihead == 1) {
			if (that.data.companyName == '' || !that.data.companyName) {
				that.setData({
					showToast: true,
					showToastMes: '请输入公司名称！'
				})

				clearTimeout(that.data.timeOut)
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					})

				}, 2000)
				that.setData({
					timeOut: timeOut
				})
				return
			} else if (that.data.taxCode == '' || !that.data.taxCode) {
				that.setData({
					showToast: true,
					showToastMes: '请输入纳税人识别码！'
				})

				clearTimeout(that.data.timeOut)
				var timeOut = setTimeout(function() {
					that.setData({
						showToast: false
					})
				}, 2000)
				that.setData({
					timeOut: timeOut
				})
				return
			} else {
				that.setData({
					invoiceMes: that.data.itype == 1 ? '公司电子发票' : '公司普通发票',
					showInvoice: false,
					useInvoiceBoff: true
				})
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
			})
		}

		// 开票确认
		that.patchInvoice(invoiceData);


	},


	/**
	 * 收票人手机号验证
	 * */

	//  输入时事件
	checkTakerMoInput: function(e) {
		var that = this
		var phone = e.detail.value
		if (that.data.result.order) {
			var defaultMobile = phone == that.data.result.order.shipMobile ? true : false;
		} else {
			var defaultMobile = false;
		}

		if (!this.checkPhoneNumber(phone) && !(this.HidePhone(this.data.initMobile) == phone)) {
			that.setData({
				phoneRight: false
			})
		} else {
			if (this.HidePhone(this.data.initMobile) == phone) {
				defaultMobile = true;
			}
			that.setData({
				phoneRight: true
			})
		}
		that.setData({
			imobile: e.detail.value,
			defaultMobile: defaultMobile
		})
		invoiceData.imobile = e.detail.value;
	},

	// 离开焦点后事件
	checkTakerMoFn: function(e) {
		var that = this
		var phone = e.detail.value;
		if (!(/^1[3|4|5|6|7|8|9][\d]{9}$/.test(phone))) {

			// this.setData({
			//   showToast: true,
			//   showToastMes: '请输入正确的手机号'
			// })
			that.setData({
				showToast: true,
				showToastMes: '请输入正确的手机号',
			})
			setTimeout(function() {
				that.setData({
					showToast: false
				})
			}, 1500)
			if (phone.length > 11) {
				wx.showToast({
					title: '手机号有误',
					icon: 'success',
					duration: 2000
				})
			}
		} else {


		}
	},

	// 邮箱输入离开焦点时
	checkTakerMailFn(e) {
		var that = this
		var email = e.detail.value
		if (!utils.validateEmail(email)) {
			that.setData({
				showToast: true,
				showToastMes: '请输入正确的邮箱',
			})
			setTimeout(function() {
				that.setData({
					showToast: false
				})
			}, 1500)
		}
	},

	// 邮箱输入时验证是否正确，显示框框线提示
	checkTakerMailInput: function(e) {
		var that = this
		var email = e.detail.value
		if (!utils.validateEmail(email)) {
			that.setData({
				mailRight: false
			})
		} else {
			that.setData({
				mailRight: true
			})
		}

		that.setData({
			iemail: e.detail.value
		})
		invoiceData.iemail = e.detail.value;
	},



	// 发票--公司名称
	companyInput: function(e) {
		var that = this
		// var invoiceData = tha
		that.setData({
			companyName: e.detail.value
		})
		invoiceData.companyName = e.detail.value
	},

	// 纳税人识别码
	taxCodeInput: function(e) {
		var that = this
		that.setData({
			taxCode: e.detail.value
		})
		invoiceData.taxCode = e.detail.value
	},

	// 开票提交
	patchInvoice(data) {
		let that = this;
		let options = { orderSn: this.data.orderSn }
		options = Object.assign(options, data)
		http.post(api.ORDER.order_invoice, options, res => {
			that.setData({
				showToast: true,
				showToastMes: '开票成功'
			})

			setTimeout(function() {
				that.setData({
					showToast: false
				})
			}, 2000)

			// 刷新当前页面数据
			that.getOrderDetail()

		}, err => {
			let errMsg = err ? (err.ret ? err.ret.message : '订单开票失败') : '订单开票失败'
			that.setData({
				showToast: true,
				showToastMes: errMsg
			})

			setTimeout(function() {
				that.setData({
					showToast: false
				})
			}, 2000)
		})
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
	}

});