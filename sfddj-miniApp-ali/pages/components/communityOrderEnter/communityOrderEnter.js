import { api, post } from '/api/http';

Component({
	mixins: [],
	data: {
		communityOrderList: [
			{ text: '全部', imageUrl: 'https://img.sfddj.com/miniappImg/community/icon/icon_all_com.png' },
			{ text: '待付款', imageUrl: 'https://img.sfddj.com/miniappImg/community/icon/icon_noPay_com.png' },
			{ text: '付款成功', imageUrl: 'https://img.sfddj.com/miniappImg/community/icon/icon_paySuc_com.png' },
			{ text: '交易成功', imageUrl: 'https://img.sfddj.com/miniappImg/community/icon/icon_tradeSuc_com.png' },
			{ text: '退款/售后', imageUrl: 'https://img.sfddj.com/miniappImg/community/icon/icon_after_com.png' },
		],           //社区购订单入口
		// isMember: true,
		// orderNumList: [0, 0, 0, 0, 0],      //社区订单列表数量
		// hasList: false,
	},
	props: {
		isMember: true,
		orderNumList: [{count: 0, orderPageEnum: "ALL"}, {count: 0, orderPageEnum: "NOPAY"}, {count: 0, orderPageEnum: "PAYFINISH"}, {count: 0, orderPageEnum: "COMMENT"}, {count: 0, orderPageEnum: "AFTERSALE"}],      //社区订单列表数量
		// hasList: false,
	},
	didMount() {
		//   this.setData({
		// 	  isMember: this.props.isMember
		//   })
		//   this.isHasOrder();
	},
	didUpdate() {
		//   this.setData({
		// 	  isMember: this.props.isMember
		//   })
	},
	didUnmount() { },
	methods: {

		// 判断是否有订单
		isHasOrder() {
			let that = this;
			let data = {
				start: 0,
				limit: 10,
				otoOrderPageEnum: 'ALL'
			}
			if (!this.data.hasList) {

				post(api.O2O_ORDER.getOrderList, data, res => {
					if (res.data.data && Object.keys(res.data.data).length > 0) {
						that.setComOrderNum();
						that.setData({
							hasList: true
						})
					}
				}, err => {
					that.setData({
						hasList: false
					})
				})
			} else {
				this.setComOrderNum();
			}
		},

		// 设置会员状态
		setMemberStatus(isMember) {
			this.setData({
				isMember: isMember
			})
		},

		

		getPhoneNumber(e) {
			this.props.onGetPhoneNumber(e)
		},

		// 获取手机号失败
		onAuthError(res) {
			my.navigateTo({
				url: '/pages/user/bindPhone/bindPhone'
			});
		},

		// 跳转
		goToTargetPage(e) {
			let { url } = e.currentTarget.dataset;
			my.navigateTo({
				url
			});
		},
	},
});
