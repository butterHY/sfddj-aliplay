// import 'regenerator';
import _ from 'underscore'

//获取应用实例
let app = getApp();
let sendRequest = require('../../utils/sendRequest');
let constants = require('../../utils/constants');
let baseImageUrl = constants.UrlConstants.baseImageUrl;
let stringUtils = require('../../utils/stringUtils');
let utils = require('../../utils/util');
let windowWidth = my.getSystemInfoSync().windowWidth;
let windowHeight = my.getSystemInfoSync().windowHeight;

import api from '../../api/api';
import http from '../../api/http';


Page({
	data: {
		homeGoodsList: [],
		show: false,
		hotWords: [],
		placeholder: '',
		scrollTop: false,
		start: 0, //分页查询起点
		limit: 10, //分页大小
		hasMore: true,
		isLoadMore: false,
		showDialog1: false,
		showDialog2: false,
		showDialog3: false,
		sendCodeText: '发送验证码',
		disabled: false,
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		ossImgStyle: '?x-oss-process=style/goods_img',
		ossImgStyle3: '?x-oss-process=style/goods_img_3',
		hasCoupon: false,
		isBind: false,
		baseImageUrl: baseImageUrl,
		current: 1,
		materialArr: [],
		advertsArr: [],
		searValue: '',
		hours: '00',
		minute: '00',
		second: '00',
		nowTime: null,
		startTime: null,
		endTime: null,
		isonLoad: false,
		secondKillActivityId: null,     // 请求活动的 id 
		isLastActivitys: false,         // 是否是最后一场活动
		isActivitysStart: null,         // 活动是否开始了
		timeDifferences: null,           // 现在时间和活动开始时间的时间差
		showToast: false,                //弹窗控制按钮
		popImgData: {},                //弹窗广告数据
		isHotStart: false,               //小程序是否是“热启动”
		adsShowParam: [],                     //广告模块上报数据纪录
		bannerShowParam: [],                  //banner部分上报数据纪录
		groupShowParam: [],                 //商品组部分上报数据纪录
		floatVal: 50,                     //上报范围的误差数
		searchHeight: 0,                 //搜索部分的高度
		bannerHeight: 0,                 //banner部分的高度
		bannerNonGoods: false,            //判断banner列表中是否没有要上报的数据
		pageScrollTop: 0,                    //页面滚动高度
		windowHeight: windowHeight,         //页面高度
		isCollected: false,
		canUseLife: my.canIUse('lifestyle'),
		hideLifeStyle: false,             //隐藏关注生活号组件
		hotWordTop: (windowWidth * 120 / 750) + 56,

		isShowSearch: false,								// 新版搜索组件显示开关
		isFocus: false,											// 新版搜索组件焦点开关
		searchComponent: null,							// 新版搜索组件实例
	},

	onLoad: async function(options) {
		var pageOptions = options
		// 如果从推文或者其他方进来并且带广告参数时
		var globalQuery = Object.assign({}, app.globalData.query)

		if (Object.keys(globalQuery).length > 0) {
			pageOptions = Object.assign(options, globalQuery)
		}
		// 友盟+统计--首页浏览
		getApp().globalData.uma.trackEvent('homepage_show', pageOptions);

		var that = this;


		var materialArr = my.getStorageSync({
			key: 'homeMaterial', // 缓存数据的key
		}).data;

		var advertsArr = my.getStorageSync({
			key: 'homeAdvertsArr', // 缓存数据的key
		}).data;

		var homeGoodsList = my.getStorageSync({
			key: 'homeGoodsList', // 缓存数据的key
		}).data;




		that.setData({
			materialArr: materialArr ? materialArr : [],
			advertsArr: advertsArr ? advertsArr : [],
			homeGoodsList: homeGoodsList ? homeGoodsList : [],
			isonLoad: true
		})

		that.getMaterial();
		// that.getAllPintuanProduct(0);
		that.data.isonLoad = await that.getAdvertsModule();

		if (that.data.isonLoad.type) {
			// 请求成功并结束而且创建了页面，开始倒计时   , 发版需要，注释了
			this.getTimes('isFirstTime');
		}

		
		that.getSearchTextMax()
	},

	onShow: function() {
		var that = this;
		// 每次页面显示判断是否是热启动，如果是就请求数据；
		var isHotStart = my.getStorageSync({
			key: 'isHotStart',
		}).data;
		if (isHotStart) {
			this.getPop();
		};

		// 只是显示并不是创建页面，计算时间并开始倒计时  , 发版需要，注释了
		// if (!this.data.isonLoad) {
		// 	this.getTimes('isFirstTime');
		// }

		// 获取购物车数量
		that.getCartNumber();
		// 关闭键盘，有些苹果手机会出现输入搜索去到搜索页返回初始页面时，初始页的键盘没有关闭的问题；
		my.hideKeyboard();

		// 回到页面关闭搜索组件
		this.setData({
			placeholder: my.getStorageSync({key: 'searchTextMax'}).data,
			isFocus: false,
			isShowSearch: false,
		});
		if( that.searchComponent ) {
			that.searchComponent.setData({inputVal: ''});
			// that.searchComponent.getHistory();
			// that.searchComponent.data.pageType = 'home';
		}
	},

	onReady() {

		// 初始化模块滚动高度
		// this.setModuleScrollTop();

	},

	// 页面隐藏
	onHide() {
		clearTimeout(getApp().globalData.home_spikeTime);
		this.setData({
			isonLoad: false
		})
	},

	// 页面被关闭
	onUnload() {
		clearTimeout(getApp().globalData.home_spikeTime)
	},

	// 初始化模块广告的滚动高度
	setModuleScrollTop(result) {
		let that = this;
		let { materialArr, advertsArr, homeGoodsList } = this.data;
		let initTopHeight = materialArr.length > 0 ? this.toPx(300) : 0;    //搜索+banner的高度
		let uploadOnceData = [];
		// 保存搜索框的高度
		my.createSelectorQuery().select('.js_homeSearch').boundingClientRect().exec(res => {
			if (res[0]) {
				that.setData({
					searchHeight: res[0].height
				})
			}

		})
		// 保存banner的高度
		my.createSelectorQuery().select('.js_banner').boundingClientRect().exec(res => {
			if (res[0]) {
				that.setData({
					bannerHeight: res[0].height
				})
			}

		})


		// 判断模块广告有没有数据
		if (advertsArr && Object.keys(advertsArr).length > 0) {
			for (let i = 0; i < advertsArr.length; i++) {
				let item = advertsArr[i];
				let lastTop = initTopHeight;   //保存上面部分的高度
				// 如果是第一个广告模块，所需要的滚动高度只是上面搜索+banner部分的高度
				if (i == 0) {
					lastTop = initTopHeight;
					advertsArr[i].scrollTop = lastTop;
					let advertsArrSet = "advertsArr[" + i + "].scrollTop";   //更新数据
					that.setData({
						[advertsArrSet]: lastTop
					})
					// 筛选有没有可上报的数据
					uploadOnceData.push({ isLoadComplete: false, loadIndex: i });
				}
				else {
					let lastItem = advertsArr[i - 1];
					lastTop = (lastItem.scrollTop && lastItem.scrollTop) > 0 ? lastItem.scrollTop : lastTop;

					let className = '.advertsIndex' + (i - 1);    //获取模块类名
					// let goodsClass = '.js_goodsBox' + i;
					let navHeight = 0;   //用来保存上一个模块的滚动高度

					my.createSelectorQuery().select(className).boundingClientRect().exec(res => {
						navHeight = res[0].height + lastItem.scrollTop;
						advertsArr[i].scrollTop = advertsArr[i - 1].spacing == 1 ? this.toPx(20) + navHeight : navHeight; //设置此模块的滚动高度

						// 保存最后一个广告模块的滚动高度+高度
						if (i == advertsArr.length - 1) {
							let lastModuleClass = '.advertsIndex' + i;
							my.createSelectorQuery().select(lastModuleClass).boundingClientRect().exec(res => {
								that.setData({
									lastModuleScrollTop: (res[0].height + advertsArr[i].scrollTop - 40)
								})
							})
						}

						let advertsArrSet = "advertsArr[" + i + "].scrollTop";     //更新数据
						that.setData({
							[advertsArrSet]: advertsArr[i].scrollTop
						})
						// 如果在可视区域内则筛选可上报的数据
						if (advertsArr[i].scrollTop < my.getSystemInfoSync().windowHeight) {
							uploadOnceData.push({ isLoadComplete: false, loadIndex: i });
						}
						else {
							if (i == (advertsArr.length - 1)) {
								that.uploadOnce(uploadOnceData, 1);
							}
						}
					});
				}
			}
		}
		else {
			let homeGoodsListData = [];
			// 如果banner的第一张图跳转的是商品详情的，要上报数据
			if (this.data.materialArr && Object.keys(this.data.materialArr).length > 0) {
				if (this.data.materialArr[0].url.includes('/shopping/goodsDetail/goodsDetail')) {
					let goodsSn = this.data.materialArr[0].url.split('=')[1];
					homeGoodsListData.push({ goodsSn: goodsSn })
				}
			}
			// 如果广告模块没有数据，则一开始显示的是商品列表的数据，需要上报
			if (homeGoodsList && Object.keys(homeGoodsList).length > 0) {
				for (let i = 0; i < homeGoodsList.length; i++) {
					let goodsClass = '.js_goodsListGood_' + i;
					if (!homeGoodsList[i].isLoaded) {
						my.createSelectorQuery().select(goodsClass).boundingClientRect().exec(res => {
							let result = res[0];
							if (result && result != 'null' && result != 'undefined') {
								if (result.top < (windowHeight - that.data.searchHeight) && result.bottom > (that.data.searchHeight + that.data.floatVal) && result.left >= 0 && (result.right - that.data.floatVal) < windowWidth) {
									let goodsSn = homeGoodsList[i].goodsSn;
									let setAdsLoad = "homeGoodsList[" + i + "].isLoaded"; //更新此元素已加载完
									homeGoodsListData.push({ goodsSn: goodsSn });      //保存能上报的数据
									that.setData({
										[setAdsLoad]: true
									})

									// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
									if (i == (homeGoodsList.length - 1)) {
										if (homeGoodsListData && Object.keys(homeGoodsListData).length > 0) {
											utils.uploadClickData_da('rec_show', homeGoodsListData)
										}
									}
								}
								else {
									// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
									if (i == (homeGoodsList.length - 1)) {
										if (homeGoodsListData && Object.keys(homeGoodsListData).length > 0) {
											utils.uploadClickData_da('rec_show', homeGoodsListData)
										}
									}
								}
							}
							else {
								// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
								if (i == (homeGoodsList.length - 1)) {
									if (homeGoodsListData && Object.keys(homeGoodsListData).length > 0) {
										utils.uploadClickData_da('rec_show', homeGoodsListData)
									}
								}
							}
						});
					}
					else {
						// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
						if (i == (homeGoodsList.length - 1)) {
							if (homeGoodsListData && Object.keys(homeGoodsListData).length > 0) {
								utils.uploadClickData_da('rec_show', homeGoodsListData)
							}
						}
					}
				}
			}
			// 如果连商品列表都没有，也要看看有没有要上传的
			else {
				if (homeGoodsListData && Object.keys(homeGoodsListData).length > 0) {
					utils.uploadClickData_da('rec_show', homeGoodsListData)
				}
			}
		}
	},

	// rpx 转化 px
	toPx(rpx) {

		return rpx * my.getSystemInfoSync().windowWidth / 750;

	},


	//获取所有商品 type： 0:刷新 1:下拉加载
	getAllPintuanProduct(type) {
		this.setData({
			isLoadMore: true
		});
		var that = this;
		sendRequest.send(constants.InterfaceUrl.HOME_GROUPGOODS_LIST,
			// constants.InterfaceUrl.GET_ALL_GOODS,
			{
				groupName: 'H5首页-热销排行',
				start: this.data.start,
				limit: this.data.limit
			}, function(res) {
				var isLoadMore = false;
				my.stopPullDownRefresh();
				var result = res.data.result;
				var hasMore = false;
				var homeGoodsList = that.data.homeGoodsList;
				if (result && result.length == that.data.limit) {
					hasMore = true;
				}
				if (type == 0) {
					homeGoodsList = result;
				} else {
					homeGoodsList = homeGoodsList.concat(result);
				}
				// 缓存数据w
				my.setStorage({
					key: 'homeGoodsList', // 缓存数据的key
					data: homeGoodsList, // 要缓存的数据
					success: (res) => {

					},
				});
				that.setData({
					homeGoodsList: homeGoodsList,
					hasMore: hasMore,
					isLoadMore: isLoadMore
				});

			}, function(err) {
				my.stopPullDownRefresh();
				that.setData({
					isLoadMore: false
				});
			}, 'GET', true);
	},

	onPageScroll: _.debounce(function(e) {
		let { scrollTop } = e
		if (scrollTop > 56) {
			this.setData({
				hideLifeStyle: true
			})
		}
		else {
			this.setData({
				hideLifeStyle: false
			})
		}
	}, 300),



	_onPageScroll: _.debounce(function(obj) {

		let { scrollTop } = obj;
		let { advertsArr } = this.data;
		this.setData({
			stopBannerSwiper: scrollTop > (advertsArr && Object.keys(advertsArr).length > 0 ? advertsArr[0].scrollTop : 0) ? true : false,
			pageScrollTop: scrollTop
		})

		if (scrollTop < (this.data.lastModuleScrollTop - windowHeight / 2)) {
			let uploadIndex = []
			advertsArr.findIndex((item, index, arr) => {
				if (scrollTop < item.scrollTop && item.scrollTop < (windowHeight - this.data.searchHeight - 40 + scrollTop)) {
					uploadIndex.push({ isLoadComplete: false, loadIndex: index })
				}
			})
			// 上传达观数据
			this.uploadOnce(uploadIndex);

		}
		else {
			this.goodsListUpload();
		}



	}, 300),

	// 滚动一次统一上传一次上报的数据  adsArr--广告模块的数据，i---当前广告模块的索引， loadOnceArr---一次性可视区内的数据, uploadData---一次性要上传的商品数据, isLoadCompleteOnce -----一次性加载是否完成
	uploadOnce(loadIndexArr, type = 0) {
		// let loadIndexArr = loadIndexArr;
		let that = this;
		let adsArr = this.data.advertsArr;
		let uploadData = [];
		let isLoadCompleteOnce = false;

		// 如果type=1则是刚开始进来页面时，要算算banner中有没有要上报的数据
		if (type == 1) {
			// 如果banner的第一张图跳转的是商品详情的，要上报数据
			if (this.data.materialArr && Object.keys(this.data.materialArr).length > 0) {
				if (this.data.materialArr[0].url.includes('/shopping/goodsDetail/goodsDetail')) {
					let goodsSn = this.data.materialArr[0].url.split('=')[1];
					uploadData.push({ goodsSn: goodsSn })
				}
			}
		}

		for (let index = 0; index < loadIndexArr.length; index++) {
			let i = loadIndexArr[index].loadIndex;
			let groupGoodsVoList = adsArr[i].moduleType == 'SECONDKILL' ? (adsArr[i].secondKillModuleVO && adsArr[i].secondKillModuleVO != 'null' && adsArr[i].secondKillModuleVO != 'undefined' ? adsArr[i].secondKillModuleVO.secondKillGoods : []) : (adsArr[i].groupGoodsVoList && adsArr[i].groupGoodsVoList != 'null' && adsArr[i].groupGoodsVoList != 'undefined' ? adsArr[i].groupGoodsVoList : []);     //保存商品的列表 

			// 循环查找可上传的商品数据
			for (let [j, adsItem] of adsArr[i].items.entries()) {
				let newGoodsClass = '.js_adsGoods' + i + '_' + j;      //是跳商品详情的且不是商品列表中的

				if (!adsItem.isLoaded) {
					// 获取所在的区域模块内可上传商品数据
					my.createSelectorQuery().selectAll(newGoodsClass).boundingClientRect().exec(res => {
						let result = res[0];
						// 如果查询到有结果才能进行位置判断 
						if (result && result != 'null') {
							// 如果符合此判断的商品数据才能上报jsxClosingElement
							if (result[0].top < (windowHeight - that.data.searchHeight) && result[0].bottom > (that.data.searchHeight + that.data.floatVal) && result[0].left >= 0 && (result[0].right - that.data.floatVal) < windowWidth) {
								// 截取商品编码
								let goodsSn = adsItem.link.split('=')[1];
								let setAdsLoad = "advertsArr[" + i + "].items[" + j + "].isLoaded";   //更新此元素已加载完
								uploadData.push({ goodsSn: goodsSn });      //保存能上报的数据
								that.setData({
									[setAdsLoad]: true
								})

								// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
								if (i == loadIndexArr[loadIndexArr.length - 1].loadIndex && j == (adsArr[i].items.length - 1) && groupGoodsVoList.length == 0) {
									if (uploadData && Object.keys(uploadData).length > 0) {
										utils.uploadClickData_da('rec_show', uploadData)
									}
								}

							}
							else {
								// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
								if (i == loadIndexArr[loadIndexArr.length - 1].loadIndex && j == (adsArr[i].items.length - 1) && groupGoodsVoList.length == 0) {
									if (uploadData && Object.keys(uploadData).length > 0) {
										utils.uploadClickData_da('rec_show', uploadData)
									}
								}
							}
						}
						else {
							// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
							if (i == loadIndexArr[loadIndexArr.length - 1].loadIndex && j == (adsArr[i].items.length - 1) && groupGoodsVoList.length == 0) {
								if (uploadData && Object.keys(uploadData).length > 0) {
									utils.uploadClickData_da('rec_show', uploadData)
								}
							}
						}
					});
				}
				else {
					// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
					if (i == loadIndexArr[loadIndexArr.length - 1].loadIndex && j == (adsArr[i].items.length - 1) && groupGoodsVoList.length == 0) {
						if (uploadData && Object.keys(uploadData).length > 0) {
							utils.uploadClickData_da('rec_show', uploadData)
						}
					}
				}

			}

			// 如果有商品列表，则要查询
			if (groupGoodsVoList && groupGoodsVoList != 'null' && groupGoodsVoList != 'undefined') {
				// 循环查询符合条件的商品列表中的商品
				for (let [k, goodsItem] of groupGoodsVoList.entries()) {
					// 只有这个类名的商品才能上传
					let newGoodsClass = '.js_adsGoodsList' + i + '_' + k;

					if (!goodsItem.isLoaded) {
						my.createSelectorQuery().selectAll(newGoodsClass).boundingClientRect().exec(res => {
							let result = res[0];
							if (result && result != 'null') {
								// 如果符合此判断的商品数据才能上报
								if (result[0].top < (windowHeight - that.data.searchHeight) && result[0].bottom > (that.data.searchHeight + that.data.floatVal) && result[0].left >= 0 && (result[0].right - that.data.floatVal) < windowWidth) {
									let goodsSn = goodsItem.goodsSn;
									let setAdsLoad = adsArr[i].moduleType == 'SECONDKILL' ? "advertsArr[" + i + "].secondKillModuleVO.secondKillGoods.[" + k + "].isLoaded" : "advertsArr[" + i + "].groupGoodsVoList[" + k + "].isLoaded"; //更新此元素已加载完
									uploadData.push({ goodsSn: goodsSn });      //保存能上报的数据
									that.setData({
										[setAdsLoad]: true
									})

									// 如果一次性已加载完则上传数据
									if (i == loadIndexArr[loadIndexArr.length - 1].loadIndex && k == (groupGoodsVoList.length - 1)) {
										if (uploadData && Object.keys(uploadData).length > 0) {
											utils.uploadClickData_da('rec_show', uploadData)
										}
									}
								}
								else {
									// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
									if (i == loadIndexArr[loadIndexArr.length - 1].loadIndex && k == (groupGoodsVoList.length - 1)) {
										if (uploadData && Object.keys(uploadData).length > 0) {
											utils.uploadClickData_da('rec_show', uploadData)
										}
									}
								}
							}
							else {
								// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
								if (i == loadIndexArr[loadIndexArr.length - 1].loadIndex && k == (groupGoodsVoList.length - 1)) {
									if (uploadData && Object.keys(uploadData).length > 0) {
										utils.uploadClickData_da('rec_show', uploadData)
									}
								}
							}
						})
					}
					else {
						// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
						if (i == loadIndexArr[loadIndexArr.length - 1].loadIndex && k == (groupGoodsVoList.length - 1)) {
							if (uploadData && Object.keys(uploadData).length > 0) {
								utils.uploadClickData_da('rec_show', uploadData)
							}
						}
					}

				}
			}

		}

	},

	// 底部商品列表数据上报筛选
	goodsListUpload() {
		let that = this;
		let { homeGoodsList } = this.data;
		let goodsListLoadData = [];


		for (let i = 0; i < homeGoodsList.length; i++) {
			let goodsClass = '.js_goodsListGood_' + i;
			if (!homeGoodsList[i].isLoaded) {
				my.createSelectorQuery().select(goodsClass).boundingClientRect().exec(res => {
					let result = res[0];
					if (result && result != 'null' && result != 'undefined') {
						if (result.top < (windowHeight - that.data.searchHeight) && result.bottom > (that.data.searchHeight + that.data.floatVal) && result.left >= 0 && (result.right - that.data.floatVal) < windowWidth) {
							let goodsSn = homeGoodsList[i].goodsSn;
							let setAdsLoad = "homeGoodsList[" + i + "].isLoaded"; //更新此元素已加载完
							goodsListLoadData.push({ goodsSn: goodsSn });      //保存能上报的数据
							that.setData({
								[setAdsLoad]: true
							})

							// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
							if (i == (homeGoodsList.length - 1)) {
								if (goodsListLoadData && Object.keys(goodsListLoadData).length > 0) {
									utils.uploadClickData_da('rec_show', goodsListLoadData)
								}
							}
						}
						else {
							// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
							if (i == (homeGoodsList.length - 1)) {
								if (goodsListLoadData && Object.keys(goodsListLoadData).length > 0) {
									utils.uploadClickData_da('rec_show', goodsListLoadData)
								}
							}
						}
					}
					else {
						// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
						if (i == (homeGoodsList.length - 1)) {
							if (goodsListLoadData && Object.keys(goodsListLoadData).length > 0) {
								utils.uploadClickData_da('rec_show', goodsListLoadData)
							}
						}
					}
				});
			}
			else {
				// 如果一次性已加载完则上传数据,只能实时判断,如果先保存会造成混乱,有可能重复上传
				if (i == (homeGoodsList.length - 1)) {
					if (goodsListLoadData && Object.keys(goodsListLoadData).length > 0) {
						utils.uploadClickData_da('rec_show', goodsListLoadData)
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
			// utils.uploadClickData_da('cart', [{ productId, actionNum: '1' }])

			my.showToast({
				content: '添加购物车成功'
			});
			that.getCartNumber();
		}, function(res) {
			my.showToast({
				content: res
			})
		});
	},

	/**
	* 清除搜索历史    	-------		搜索改版
	*/
	// clearHist: function() {
	// 	try {
	// 		my.setStorageSync({ key: nstants.StorageConstants.searchWordsKey, data: [] });
	// 	} catch (e) { }
	// },
	

	/**
	* 下拉刷新
	*/
	onPullDownRefresh: function() {
		this.setData({
			start: 0
		});
		// 清除定时器
		getApp().globalData.home_spikeTime = null;
		this.getMaterial();
		this.getAdvertsModule();
		// this.getAllPintuanProduct(0);
	},


	bannerType2: function(e) {
		var that = this;
		var current = e.detail.current;

		that.setData({
			current: current
		})
		// that.set
	},

	/**
	* 页面上拉触底事件的处理函数
	*/
	onReachBottom: function() {
		// if (this.data.hasMore) {
		// 	this.setData({
		// 		start: this.data.homeGoodsList.length
		// 	});
		// 	this.getAllPintuanProduct(1);
		// }
	},
	//   scrollToLower: function() {
	//     if (this.data.hasMore) {
	//       this.setData({
	//         start: this.data.homeGoodsList.length
	//       });
	//       this.getAllPintuanProduct(1);
	//     }
	//   },

	// 分享页面
	onShareAppMessage: function(res) {
		return {
			title: '顺丰大当家-顺丰旗下电商平台',
			path: '/pages/home/home'
		};
	},

	/**
	 * 广告模块
	 * */
	getAdvertsModule() {
		var that = this;
		var urlPre = '/m/a';
		var url = urlPre + '/moduleAdvert/1.1/getModuleAdvert';
		var token = '';
		var contentType = '';
		var data = { showPage: 'HOMEPAGE' }

		// data: {
		// 			channel: 'ALIPAY_MINIAPP',
		// 			sceneName: 'HOME',
		// 			sceneParam: 'MINI_ALIPAY'
		// 		}

		try {
			token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data ? my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data : '';
		} catch (e) { }

		return new Promise((reslove, reject) => {

			my.httpRequest({
				url: constants.UrlConstants.baseUrlOnly + url,
				method: 'GET',
				data: data,

				headers: {
					'token': token ? token : '',
					"content-type": contentType ? contentType : "application/x-www-form-urlencoded",
					"client-channel": "alipay-miniprogram"
				},
				success: function(res) {
					var resData = res.data;
					if (resData.ret.code == '0') {
						let result = resData.data;
						let spliceArr = [];
						let newResult = [];

						for (var i = 0; i < result.length; i++) {
							result[i].items = JSON.parse(result[i].items);
							// 为了避免运营乱配，删除一些不能显示的
							if (result[i].moduleType != 'BANNER_TYPE_1' && result[i].moduleType != 'HEADLINE' && result[i].moduleType != 'TUANGOU') {
								if (result[i].moduleType == "SECONDKILL") {
									that.data.secondKillActivityId = result[i].items[0].secondKillActivityId;
								}
								newResult.push(result[i]);
							}
						}


						// 缓存数据
						my.setStorage({
							key: 'homeAdvertsArr', // 缓存数据的key
							data: newResult, // 要缓存的数据
							success: (res) => {

							},
						});
						that.setData({
							advertsArr: newResult,
							secondKillActivityId: that.data.secondKillActivityId

						})

						// that.setModuleScrollTop();

						reslove({
							'type': true,
							'result': result
						});

					}
					else {
						// that.setModuleScrollTop();
					}
				},

				fail: function(err) {
					// that.setModuleScrollTop();
					reject({
						'type': false,
						'result': err
					});
				}
			})

		})

	},



	/**
	 * 获取单独的秒杀广告数据
	 * */
	getSpikeModule() {
		var that = this;
		var urlPre = '/m/a';
		var url = urlPre + '/moduleAdvert/1.0/getSecKillAdvert';
		var token = '';
		var contentType = '';
		try {
			token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data ? my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data : '';
		} catch (e) { }

		return new Promise((reslove, reject) => {

			my.httpRequest({
				url: constants.UrlConstants.baseUrlOnly + url,
				method: 'GET',
				data: {
					// channel: 'ALIPAY_MINIAPP',
					activitysId: that.data.secondKillActivityId
				},

				headers: {
					'token': token ? token : '',
					"content-type": contentType ? contentType : "application/x-www-form-urlencoded",
					"client-channel": "alipay-miniprogram"
				},
				success: function(res) {
					var resData = res.data;
					if (resData.ret.code == '0') {
						var result = resData.data;

						var index = null;
						var spikeArr = [];
						for (var i = 0; i < that.data.advertsArr.length; i++) {
							if (that.data.advertsArr[i].moduleType == "SECONDKILL") {

								spikeArr = JSON.parse(JSON.stringify(that.data.advertsArr[i]));
								spikeArr.secondKillModuleVO = result;
								index = i;

								that.data.advertsArr[i] = spikeArr;


								var nowTime = new Date();
								var endTime = that.data.advertsArr[i].secondKillModuleVO.endDate;
								var startTime = that.data.advertsArr[i].secondKillModuleVO.startDate;
								nowTime = nowTime.getTime();
								startTime = new Date(startTime).getTime();
								endTime = new Date(endTime).getTime();
								var timeDifferences = (startTime - nowTime) / 1000;

								if (startTime > nowTime) {
									that.data.isActivitysStart = '活动还未开始';
								};

								that.setData({
									advertsArr: that.data.advertsArr,
									nowTime: nowTime,
									startTime: startTime,
									endTime: endTime,
									timeDifferences: timeDifferences,
									isActivitysStart: that.data.isActivitysStart
								})

							}
						}



						// 缓存数据
						my.setStorage({
							key: 'homeAdvertsArr', // 缓存数据的key
							data: that.data.advertsArr, // 要缓存的数据
							success: (res) => {

							},
						});


						reslove({
							'type': true,
							'result': result
						});

					}
				},

				fail: function(err) {
					reject({
						'type': false,
						'result': err
					});
				}
			})

		})
	},

	/**
   * 获取banner数据
   * */
	getMaterial() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.HOME_BANNER_LIST, { groupName: '支付宝小程序_首页轮播图' }, function(res) {
			// if(res.data.errorCode == '0001')
			var result = res.data.result;
			my.setStorage({
				key: 'homeMaterial', // 缓存数据的key
				data: result.material, // 要缓存的数据
				success: (res) => {

				},
			});
			that.setData({
				materialArr: result.material ? result.material : []
			})
		}, function(err) {
		}, 'GET', true)
	},

	getPop() {
		my.removeStorageSync({
			key: 'isHotStart',
		});
		var that = this;
		var urlPre = '/m/a';
		var url = urlPre + constants.InterfaceUrl.HOME_POP;
		var token = '';
		var contentType = '';
		try {
			token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data ? my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data : '';
		} catch (e) { }

		my.httpRequest({
			url: constants.UrlConstants.baseUrlOnly + url,
			method: 'GET',
			headers: {
				'token': token ? token : '',
				"content-type": contentType ? contentType : "application/x-www-form-urlencoded",
				"client-channel": "alipay-miniprogram"
			},
			success: function(res) {
				var resData = res.data;
				var result = resData.data;
				if (resData.ret.code == '0') {
					// 如果为收藏有礼的弹窗
					var canUseCollected = my.canIUse('isCollected');
					if (!canUseCollected) {
						my.showToast({
							content: '您的客户端版本过低，请升级你的客户端',
							success: (res) => {
								if (result) {
									that.setData({
										popImgData: result
									})
									that.judgePop();
								}
							},
						});
						return;
					}

					if (resData.data.appLink == 2) {
						my.isCollected({
							success: (res) => {
								// console.log('查询收藏成功');
								if (res.isCollected) {
									// console.log('收藏了',res.isCollected);
									return;
								} else {
									// console.log('没有收藏',res.isCollected);
									if (result) {
										that.setData({
											popImgData: result
										})
										that.judgePop();
									}
								}
							},
							fail: (error) => {
								// console.log('查询收藏失败');
								if (result) {
									that.setData({
										popImgData: result
									})
									that.judgePop();
								}
							}
						});
					} else {
						if (result) {
							that.setData({
								popImgData: result
							})
							that.judgePop();
						}
					}
				}
			},

			fail: function(err) {
			}
		})
	},

	goToPage: function(e) {
		let that = this;
		let url = e.currentTarget.dataset.url;
		let chInfo = constants.UrlConstants.chInfo;
		let { linkType, title, type, index, fatherIndex } = e.currentTarget.dataset
		// let { title, type, index } = e.currentTarget.dataset

		// linkType为2代表跳收藏有礼
		if (linkType == '2') {

			getApp().globalData.uma.trackEvent('homepage_popup_click')
			my.navigateToMiniProgram({
				appId: '2018122562686742',//收藏有礼小程序的appid，固定值请勿修改
				path: url,//收藏有礼跳转地址和参数
				success: (res) => {
					// 跳转成功
					// my.alert({ content: 'success' });
				},
				fail: (error) => {
					// 跳转失败
					// my.alert({ content: 'fail' });
				}
			});
		}
		else {


			// 友盟+统计--首页浏览
			// type = banner banner轮播 type = oneFour 1+4模块 type = oneTwo 1+2模块
			if (type == 'banner') {
				getApp().globalData.uma.trackEvent('homepage_banner_click', { title: title });
			}
			if (type == 'oneFour') {
				getApp().globalData.uma.trackEvent('homepage_oneFour_click', { index: index });
			}
			if (type == 'oneTwo') {
				getApp().globalData.uma.trackEvent('homepage_oneTwo_click', { index: index });
			}

			if (type == 'popup') {
				getApp().globalData.uma.trackEvent('homepage_popup_click')
			}

			// 如果是当家爆款、新品上架、原产好物的统计
			if(type == 'goodsCount') {
				let data = {
					channel_source: 'mini_alipay', supplierName: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].nickName, supplierId: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].supplierId, goodsName: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].goodsName, goodsSn: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].goodsSn, goodsCategoryId: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].goodsCategoryId
				}
				// homepage_ddjHotSale , homepage_ddjBestGoods, homepage_ddjNewGoods
				if (title.indexOf('爆款') > -1) {
					that.umaTrackEvent(type, 'homepage_ddjHotSale', data)
				}
				else if(title.indexOf('新品') > -1) {
					that.umaTrackEvent(type, 'homepage_ddjNewGoods', data)
				}
				else if(title.indexOf('原产') > -1) {
					that.umaTrackEvent(type, 'homepage_ddjBestGoods', data)
				}
			}

			if (url.indexOf('http') > -1) {
				my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
			}
			else {

				my.navigateTo({
					url: url
				});
			}
		}


		that.closePop();

	},


	// 搜索模块，敲击键盘完成去到搜索页  	-------		搜索改版
	// goToSearchPage(keyWord, type) {
	// 	if (keyWord && keyWord.trim()) {
	// 		// 达观数据上报
	// 		// utils.uploadClickData_da('search', [{ keyword: keyWord }])

	// 		// 友盟+ 统计  输入框输入探索
	// 		this.umaTrackEvent(type, keyWord)

	// 		my.navigateTo({
	// 			url: '/pages/home/searchResult/searchResult?keyWord=' + keyWord
	// 		});
	// 	}
	// },

	// 键盘输入回车后去到搜索页	-------		搜索改版
	// handleConfirm: function(event) {
	// 	this.goToSearchPage(event.detail.value, 'searchValue');
	// },

	// 失去焦点后保持现有的值为输入值，并且关闭热词	-------		搜索改版
	// changeValue: function(event) {
	// 	var that = this;
	// 	this.setData({
	// 		searchValue: event.detail.value
	// 	})

	// 	setTimeout(function() {
	// 		that.setData({
	// 			show: false
	// 		})
	// 	}, 500)
	// },

	// 点击放大镜进行搜索，	-------		搜索改版
	// searchGoods: function() {
	// 	this.goToSearchPage(this.data.searchValue, 'searchValue');
	// },

	// 选择搜索记录或热词  -------		搜索改版
	// chooseWord: function(event) {
	// 	let { type } = event.currentTarget.dataset
	// 	this.goToSearchPage(event.currentTarget.dataset.word, type);
	// },

	// 清除搜索记录		  	-------		搜索改版
	// clearHist: function() {
	// 	try {
	// 		my.setStorageSync({
	// 			key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
	// 			data: [], // 要缓存的数据
	// 		});
	// 	} catch (e) { }
	// },

	// 点击热词弹窗 == 关闭热词弹窗  -------		搜索改版
	// handleBlur: function(e) {
	// 	this.setData({
	// 		show: false
	// 	});
	// },

	// 阻止默认事件
	touchReturn() {
		return;
	},

	// 获取焦点事件，	-------		搜索改版
	// handleFocus: function() {
	// 	var that = this;
	// 	// 友盟+统计--首页搜索点击
	// 	getApp().globalData.uma.trackEvent('homepage_searchClick');

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

	// 友盟+ 统计 --搜索
	
	
	umaTrackEvent(type, keyWord, eventName,data) {

		var keyWord = keyWord

		if (type == 'searcHotWord') {
			// 友盟+统计--首页搜索热词点击
			getApp().globalData.uma.trackEvent('homepage_searchHotWord', { keyWord: keyWord });
		}
		else if (type == 'searchHist') {

			// 友盟+统计--首页搜索历史点击
			getApp().globalData.uma.trackEvent('homepage_searchHist', { keyWord: keyWord });
		}
		else if (type == 'searchValue') {
			// 友盟+统计--首页搜索输入
			getApp().globalData.uma.trackEvent('homepage_searchValue', { keyWord: keyWord });

		}
		else if (type == 'goodsCount'){
			// 友盟+统计--广告模块当家爆款/原产好物/新品上架  --- eventName = homepage_ddjHotSale , homepage_ddjBestGoods, homepage_ddjNewGoods
			getApp().globalData.uma.trackEvent(eventName, data);
		}

	},

	//---------- 获取倒计时时间 -----------
	getTimes: async function(isFirstTime) {
		var nowTime = new Date();
		var starTime = '';
		var endTime = '';
		var isLastActivitys = '';
		var index = '';

		for (var i = 0; i < this.data.advertsArr.length; i++) {
			if (this.data.advertsArr[i].moduleType == "SECONDKILL" && this.data.advertsArr[i].secondKillModuleVO) {
				index = i;
				starTime = this.data.advertsArr[i].secondKillModuleVO.startDate;
				endTime = this.data.advertsArr[i].secondKillModuleVO.endDate;
				isLastActivitys = this.data.advertsArr[i].secondKillModuleVO.isLastActivitys;
			}
		}
		if (!this.data.advertsArr[index] || !(this.data.advertsArr[index].secondKillModuleVO)) {
			return;
		}


		starTime = new Date(starTime).getTime();
		endTime = new Date(endTime).getTime();
		nowTime = nowTime.getTime();


		// (starTime - nowTime) / 1000 >= 1 这么判断会多出 几百毫秒，导致活动开始倒计时的时间差是以整数开始的, 如 07：00 而不是 06：59
		if (nowTime < starTime) {
			this.setData({
				isActivitysStart: '活动还未开始',
			})
			this.notYetStarted(starTime);
			return;
		};

		var timeDifference = endTime - nowTime;
		var s1 = (timeDifference / 1000) % 60;
		s1 = Math.floor((timeDifference / 1000) % 60);

		var m1 = Math.floor((timeDifference / 1000 / 60) % 60);
		var h1 = Math.floor((timeDifference / 1000 / 60 / 60));

		var s = s1 <= 0 ? '00' : (s1 < 10 ? '0' + s1 : s1);
		var m = m1 <= 0 ? '00' : (m1 < 10 ? '0' + m1 : m1);
		var h = h1 <= 0 ? '00' : (h1 < 10 ? '0' + h1 : h1);

		this.setData({
			hours: h,
			minute: m,
			second: s
		})


		// if (nowTime - endTime >= 0)，这样判断在活动的最后一秒里，零点几秒，页面已经显示为 00：00：00 了，但这时没有重新请求数据，而是在 1秒后，再计算一次，这一次是 -秒，才重新请求
		if ((timeDifference / 1000) < 1) {
			clearTimeout(getApp().globalData.home_spikeTime);
			this.setData({
				isLastActivitys: isLastActivitys
			});
			if (!isLastActivitys) {
				// 请求单独的秒杀广告模块的数据
				var sendRequest = await this.getSpikeModule();

				if (sendRequest.type && (this.data.startTime <= this.data.nowTime) && ((this.data.endTime - this.data.nowTime) / 1000 <= 1)) {
					this.getTimes();
				} else if (sendRequest.type && (this.data.startTime <= this.data.nowTime) && ((this.data.endTime - this.data.nowTime) / 1000 > 1)) { // this.data.timeDifferences < 1    这么判断有时会多出 几百毫秒，导致活动开始倒计时的时间差是以整数开始的, 如 07：00 而不是 06：59
					this.getTimes();
					this.countDown();
					// this.data.timeDifferences >= 1   
				} else if (sendRequest.type && (this.data.startTime > this.data.nowTime)) {
					// 如果是活动还未开始，创建倒计时但不 setData ，直到活动开始则开始渲染 DOM
					this.notYetStarted(this.data.startTime);
				}
			}
		} else if (isFirstTime) {
			this.countDown();
		}

	},

	// ---------- 倒计时 -------------
	countDown: function(starTime) {

		clearTimeout(getApp().globalData.home_spikeTime);
		var that = this;
		clearTimeout(getApp().globalData.home_spikeTime);
		getApp().globalData.home_spikeTime = setInterval(
			function() {
				that.getTimes()
			}, 1000);

	},

	notYetStarted: function(starTime) {
		clearTimeout(getApp().globalData.home_spikeTime);
		var that = this;
		if (starTime) {
			getApp().globalData.home_spikeTime = setInterval(
				function() {
					var nowTime = new Date();
					nowTime = nowTime.getTime();
					// (starTime - nowTime) / 1000 < 1 这么判断会多出 几百毫秒，导致活动开始倒计时的时间差是以整数开始的, 如 07：00 而不是 06：59
					if (starTime <= nowTime) {
						that.setData({
							isActivitysStart: null
						})
						that.getTimes('isFirstTime')
					};
				}, 1000);
		}
	},



	// 弹窗广告
	judgePop: function() {
		// console.log('显示弹窗')
		var popImgData = this.data.popImgData;
		var popId = popImgData.popId;                         // 广告 id ;
		var popType = popImgData.popAdvMemoryOpt;             // 广告类型 ;
		// var popDate = popImgData.popAdvCookieRemainSecond;   // 广告结束时间差 ;
		var popModify = popImgData.modifyDate;               // 广告修改时间 ;


		var storagePopImgData = my.getStorageSync({
			key: 'popImgData',
		}).data;



		var myDate = new Date()
		var month = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
		var day = myDate.getDate(); //获取当前日(1-31)
		popImgData.popMonthDay = month + '' + day;


		if (!storagePopImgData) {
			this.setData({
				showToast: true
			});


			// 友盟+统计--弹窗曝光
			getApp().globalData.uma.trackEvent('homepage_popup_visibility');

			my.setStorageSync({
				key: 'popImgData', // 缓存数据的key
				data: popImgData, // 要缓存的数据
				success: (res) => {
				},
			});

		} else {
			var localPopId = storagePopImgData.popId;                                     //本地缓存 广告id
			var localPopType = storagePopImgData.popAdvMemoryOpt;                         //本地缓存 广告类型
			// var localPopDate = new Date(storagePopImgData.popAdvCookieRemainSecond).getTime();
			var localPopModify = storagePopImgData.modifyDate;                            //本地缓存 广告修改时间 ;
			if ((popId != localPopId || popType != localPopType || popModify != localPopModify)) {
				this.setData({
					showToast: true
				});


				// 友盟+统计--弹窗曝光
				getApp().globalData.uma.trackEvent('homepage_popup_visibility');

				my.setStorageSync({
					key: 'popImgData', // 缓存数据的key
					data: popImgData, // 要缓存的数据
					success: (res) => {
					},
				});

			} else if (localPopType == 'EVERY_OPEN_ONCE_SHOW') {
				this.setData({
					showToast: true
				})


				// 友盟+统计--弹窗曝光
				getApp().globalData.uma.trackEvent('homepage_popup_visibility');


			} else if (localPopType == 'ONCE_DAY_SHOW') {
				var localMonthDay = storagePopImgData.popMonthDay;

				if (popImgData.popMonthDay != localMonthDay) {
					this.setData({
						showToast: true
					});


					// 友盟+统计--弹窗曝光
					getApp().globalData.uma.trackEvent('homepage_popup_visibility');

					my.setStorageSync({
						key: 'popImgData', // 缓存数据的key
						data: popImgData, // 要缓存的数据
						success: (res) => {
						},
					});
				}

			}
		}

	},

	closePop: function() {
		this.setData({
			showToast: false
		})
	},

	adSkipper: function() {
	},

	bannerSwiper(e) {
		// let that = this;
		// let { materialArr } = this.data;
		// let bannerUploadData = [];
		// let bannerNonGoods = true;

		// for (let i = 0; i < materialArr.length; i++) {
		// 	let goodsClass = '.js_bannerGoods_' + i;
		// 	if (!materialArr[i].isLoaded) {
		// 		my.createSelectorQuery().select(goodsClass).boundingClientRect().exec(res => {
		// 			let result = res[0];
		// 			if (result && result != 'null' && result != 'undefined') {

		// 				// 如果符合此判断的商品数据才能上报
		// 				if (result.top < (windowHeight - that.data.searchHeight) && result.bottom > (that.data.searchHeight + that.data.floatVal) && result.left >= 0 && (result.right - that.data.floatVal) < windowWidth) {
		// 					// bannerNonGoods = true;
		// 					let goodsSn = materialArr[i].url.split('=')[1];
		// 					let setAdsLoad = "materialArr[" + i + "].isLoaded"; //更新此元素已加载完
		// 					bannerUploadData.push({ goodsSn: goodsSn });      //保存能上报的数据
		// 					that.setData({
		// 						[setAdsLoad]: true
		// 					})

		// 					// 如果一次性已加载完则上传数据
		// 					if (i == (materialArr.length - 1)) {
		// 						if (bannerUploadData && Object.keys(bannerUploadData).length > 0) {
		// 							utils.uploadClickData_da('rec_show', bannerUploadData)
		// 						}
		// 						// bannerNonGoods = 

		// 					}
		// 				}

		// 				else {
		// 					bannerNonGoods = false;    //如果存在这个类名则认为是有上报的数据
		// 					// 如果一次性已加载完则上传数据
		// 					if (i == (materialArr.length - 1)) {
		// 						if (bannerUploadData && Object.keys(bannerUploadData).length > 0) {
		// 							utils.uploadClickData_da('rec_show', bannerUploadData)
		// 						}
		// 					}
		// 				}
		// 			}
		// 			else {
		// 				let setAdsLoad = "materialArr[" + i + "].isLoaded"; //更新此元素已加载完
		// 				that.setData({
		// 					[setAdsLoad]: true
		// 				})

		// 				// 如果一次性已加载完则上传数据
		// 				if (i == (materialArr.length - 1)) {
		// 					// 如果都没有可上报的数据，则不再执行swiper改变的方法
		// 					if (bannerNonGoods) {
		// 						that.setData({
		// 							bannerNonGoods: bannerNonGoods
		// 						})
		// 					}
		// 					if (bannerUploadData && Object.keys(bannerUploadData).length > 0) {
		// 						utils.uploadClickData_da('rec_show', bannerUploadData)
		// 					}
		// 				}
		// 			}
		// 		});
		// 	}
		// 	else {

		// 		// 如果一次性已加载完则上传数据
		// 		if (i == (materialArr.length - 1)) {
		// 			if (bannerUploadData && Object.keys(bannerUploadData).length > 0) {
		// 				utils.uploadClickData_da('rec_show', bannerUploadData)
		// 			}
		// 			// 如果都没有可上报的数据，则不再执行swiper改变的方法
		// 			if (bannerNonGoods) {
		// 				that.setData({
		// 					bannerNonGoods: bannerNonGoods
		// 				})
		// 			}
		// 		}
		// 	}
		// }


	},


	// 横向商品滚动方法,
	scrollGoods: _.debounce(function(e) {
		// let that = this;
		// let { fatherIndex } = e.currentTarget.dataset;
		// let adsArr = this.data.advertsArr[fatherIndex].moduleType == "SECONDKILL" ? (this.data.advertsArr[fatherIndex].secondKillModuleVO.secondKillGoods ? this.data.advertsArr[fatherIndex].secondKillModuleVO.secondKillGoods : []) : (this.data.advertsArr[fatherIndex].groupGoodsVoList ? this.data.advertsArr[fatherIndex].groupGoodsVoList : []);
		// let uploadData = [];

		// 需要筛选要上报的商品
		// let goodsClass
		// for (let i = 0; i < adsArr.length; i++) {
		// 	let items = adsArr[i];
		// 	let goodsClass = '.js_adsGoodsList' + fatherIndex + '_' + i;
		// 	if (!items.isLoaded) {
		// 		my.createSelectorQuery().selectAll(goodsClass).boundingClientRect().exec(res => {
		// 			let result = res[0];
		// 			if (result && result != 'null') {
		// 				// 如果符合此判断的商品数据才能上报
		// 				if (result[0].top < (windowHeight - that.data.searchHeight) && result[0].bottom > (that.data.searchHeight + that.data.floatVal) && result[0].left >= 0 && (result[0].right - that.data.floatVal) < windowWidth) {
		// 					let goodsSn = items.goodsSn;
		// 					let setAdsLoad = this.data.advertsArr[fatherIndex].moduleType == "SECONDKILL" ? "advertsArr[" + fatherIndex + "].secondKillModuleVO.secondKillGoods[" + i + "].isLoaded" : "advertsArr[" + fatherIndex + "].groupGoodsVoList[" + i + "].isLoaded"; //更新此元素已加载完
		// 					uploadData.push({ goodsSn: goodsSn });      //保存能上报的数据
		// 					that.setData({
		// 						[setAdsLoad]: true
		// 					})

		// 					// 如果一次性已加载完则上传数据
		// 					if (i == (adsArr.length - 1)) {
		// 						if (uploadData && Object.keys(uploadData).length > 0) {
		// 							utils.uploadClickData_da('rec_show', uploadData)
		// 						}
		// 					}
		// 				}
		// 				else {
		// 					// 如果一次性已加载完则上传数据
		// 					if (i == (adsArr.length - 1)) {
		// 						if (uploadData && Object.keys(uploadData).length > 0) {
		// 							utils.uploadClickData_da('rec_show', uploadData)
		// 						}
		// 					}
		// 				}
		// 			}
		// 			else {
		// 				// 如果一次性已加载完则上传数据
		// 				// 如果一次性已加载完则上传数据
		// 				if (i == (adsArr.length - 1)) {

		// 					if (uploadData && Object.keys(uploadData).length > 0) {
		// 						utils.uploadClickData_da('rec_show', uploadData)
		// 					}
		// 				}
		// 			}
		// 		})
		// 	}
		// 	else {
		// 		// 如果一次性已加载完则上传数据
		// 		if (i == (adsArr.length - 1)) {

		// 			if (uploadData && Object.keys(uploadData).length > 0) {
		// 				utils.uploadClickData_da('rec_show', uploadData)
		// 			}
		// 		}
		// 	}

		// 关闭弹窗
		// }


	}, 300),

	// 广告模块swiper
	adsSwiper(e) {
		// let that = this;
		// let { fatherIndex, type } = e.currentTarget.dataset;
		// let adsItem = this.data.advertsArr[fatherIndex].items;
		// let adsSwiperData = [];
		// let nonGoods = true;    //用于判断图片滚动轮播

		// for (let i = 0; i < adsItem.length; i++) {
		// 	let goodsClass = '.js_adsGoods' + fatherIndex + '_' + i;
		// 	if (!adsItem[i].isLoaded) {
		// 		my.createSelectorQuery().select(goodsClass).boundingClientRect().exec(res => {
		// 			let result = res[0];
		// 			if (result && result != 'null' && result != 'undefined') {

		// 				// 如果符合此判断的商品数据才能上报
		// 				if (result.top < (windowHeight - that.data.searchHeight) && result.bottom > (that.data.searchHeight + that.data.floatVal) && result.left >= 0 && (result.right - that.data.floatVal) < windowWidth) {
		// 					// bannerNonGoods = true;
		// 					let goodsSn = adsItem[i].link.split('=')[1];
		// 					let setAdsLoad = "advertsArr[" + fatherIndex + "].items[" + i + "].isLoaded"; //更新此元素已加载完
		// 					adsSwiperData.push({ goodsSn: goodsSn });      //保存能上报的数据
		// 					that.setData({
		// 						[setAdsLoad]: true
		// 					})

		// 					// 如果一次性已加载完则上传数据
		// 					if (i == (adsItem.length - 1)) {
		// 						if (adsSwiperData && Object.keys(adsSwiperData).length > 0) {
		// 							utils.uploadClickData_da('rec_show', adsSwiperData)
		// 						}
		// 						// bannerNonGoods = 

		// 					}
		// 				}

		// 				else {
		// 					nonGoods = false;    //如果存在这个类名则认为是有上报的数据
		// 					// 如果一次性已加载完则上传数据
		// 					if (i == (adsItem.length - 1)) {
		// 						if (adsSwiperData && Object.keys(adsSwiperData).length > 0) {
		// 							utils.uploadClickData_da('rec_show', adsSwiperData)
		// 						}
		// 					}
		// 				}
		// 			}
		// 			else {
		// 				let setAdsLoad = "advertsArr[" + fatherIndex + "].items[" + i + "].isLoaded"; //更新此元素已加载完
		// 				that.setData({
		// 					[setAdsLoad]: true
		// 				})
		// 				// 如果一次性已加载完则上传数据
		// 				if (i == (adsItem.length - 1)) {
		// 					// 如果都没有可上报的数据，则不再执行swiper改变的方法
		// 					if (nonGoods && type == 'autoplay') {
		// 						let setItem = "advertsArr[" + fatherIndex + "].nonGoods"
		// 						that.setData({
		// 							[setItem]: true
		// 						})
		// 					}
		// 					if (adsSwiperData && Object.keys(adsSwiperData).length > 0) {
		// 						utils.uploadClickData_da('rec_show', adsSwiperData)
		// 					}
		// 				}
		// 			}
		// 		});
		// 	}
		// 	else {
		// 		// 如果一次性已加载完则上传数据
		// 		if (i == (adsItem.length - 1)) {
		// 			// 如果都没有可上报的数据，则不再执行swiper改变的方法
		// 			if (nonGoods && type == 'autoplay') {
		// 				let setItem = "advertsArr[" + fatherIndex + "].nonGoods";
		// 				that.setData({
		// 					[setItem]: true
		// 				})
		// 			}
		// 			if (adsSwiperData && Object.keys(adsSwiperData).length > 0) {
		// 				utils.uploadClickData_da('rec_show', adsSwiperData)
		// 			}

		// 			// bannerNonGoods = 

		// 		}
		// 	}

		// }

	},

	/**
	   * 获取购物车数量
	*/
	getCartNumber: function() {
		var app = getApp();
		app.getCartNumber();
	},

	/**
	  * 获取 placeholder value
	*/
	getSearchTextMax() {
		let that = this;
		 http.get( api.search.SEARCHTEXTMAX, {}, (res) => {
			 let resData = res.data;
			if(resData.ret.code == '0' && resData.ret.message == "SUCCESS" && resData.data && resData.data.name) {
				try {
					my.setStorageSync({ key: constants.StorageConstants.searchTextMax, data: resData.data.name});
				} catch (e) { }
				that.setData({
					placeholder: resData.data.name
				})
			}
		 }, (err) => {
		 })
	},

	/**
	  * 存储新版搜索组件实例
	*/
	saveRef(ref) {
    this.searchComponent = ref;
  },
	
	/**
	  * 新版搜索组件开关
	*/
	showSearch: function(noGetHistory) {
		// this.searchComponent.getHistory();
		noGetHistory == 'noGetHistory' ? '' : 	this.searchComponent.getHistory();
		this.setData({
			isShowSearch: !this.data.isShowSearch,
			isFocus: !this.data.isFocus,
		})
		// this.searchComponent.setIsFocus();
	}

});