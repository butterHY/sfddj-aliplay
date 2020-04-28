import _ from 'underscore'
import locAddr from '/community/service/locAddr.js'

//获取应用实例不要写在页面外面，会出问题；

let sendRequest = require('../../utils/sendRequest');
let constants = require('../../utils/constants');
let stringUtils = require('../../utils/stringUtils');
let utils = require('../../utils/util');


import api from '../../api/api';
import env from '../../api/env';
import http from '../../api/http';


Page({
	data: {
		// 公共数据
		app: null,
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		baseImageUrl: constants.UrlConstants.baseImageUrl,
		baseUrlOnly: constants.UrlConstants.baseUrlOnly,
		smallImgArg: '?x-oss-process=style/goods_img_3',
		ossImgStyle: '?x-oss-process=style/goods_img',
		isShowGoTop: false,           // 是否要显示返回顶部按钮
    getWaterFallCount: 0,          // 滚动页面时计算获取多少次 getWaterFallSeat 的高度；

    // banner数据
    currentIndex: 0,             //banner的位置

		// 弹窗广告数据
		popImgData: {},              //弹窗广告数据
		advertsPop: false,          //弹窗广告开关


		// 瀑布流数据
		waterIndex: 0,                //瀑布流选中索引
		waterFallTitList: [],         //瀑布流标题列表
		waterStartList: [],           //瀑布流商品加载开始位置
		waterLimitList: [],           //瀑布流商品加载的条数
		waterFallTop: 10000,          //瀑布流所在的位置
		waterFallTopInit: 'init',     //判断 全部广告模块 + 顶部轮播 + 四大描述 有没有加载或者是否成功设置好位置
		waterFallGoodsList: [],       //瀑布流商品列表
		allMaterialList: [],          //瀑布流第一个导航商品列表的 banner 数据
		allMaterialIndex: -1,         //当前瀑布流第一个导航商品列表 第一个banner 的加载位置
		waterFallTitIsTop: false,     //是否置顶瀑布流导航
		isWaterFallLoaded: [],        //判断是否加载完
		isWaterFallLoading: [],       //判断是否在加载中
		isWaterFallFirst: [],         //是否是第一次加载
		waterFallListIndex: null,     //瀑布流导航所在的索引


		//新版搜索的数据
		placeholder: '',              // 搜索组件隐藏词
		isShowSearch: false,					// 新版搜索组件显示开关
		isFocus: false,								// 新版搜索组件焦点开关
		searchComponent: null,				// 新版搜索组件实例

		// 定位数据
		locInfo: {
			loading: false,
			longitude: '',
			latitude: '',
			city: '',
			addressAll: '',
			addressJson: {},
			pois: [],
			streetShow: '',
			streetLoc: '',
		},

		// 生活号
		canUseLife: my.canIUse('lifestyle'),

		// 秒杀广告模板数据
		isonLoad: false,

		o2oStore: {
			show: false,
			store: null,
		},
		isGetLocation: false,
		isLocationLoad: true,       //是否正在定位

	},

	onLoad: async function (options) {
		let that = this;
		that.data.app = getApp();
		that.allComponent = [];

		that.reportPageOption(options);

		let wheelPlantingArr = my.getStorageSync({ key: 'wheelPlantingArr', }).data;      // 获取缓存首页 banner 数据
		let advertsArr = my.getStorageSync({ key: 'homeAdvertsArr', }).data;             // 获取缓存 首页广告模板  数据			---- 移到组件
		let placeholder = my.getStorageSync({ key: 'searchTextMax', }).data;          // 获取缓存 首页商品  数据

		that.setData({
      // topContentHeight: (env == 'production' && that.data.canUseLife) ? (25 + 44 +56) * 750 / that.data.app.globalData.systemInfo.windowWidth  : (25 + 44) * 750 / that.data.app.globalData.systemInfo.windowWidth,  // 生产环境显示生活号；
      waterFallTitHeight: 130 * that.data.app.globalData.systemInfo.windowWidth / 750,   // 瀑布流导航高度；
     //如果在瀑布流导航置顶时，设置瀑布流商品的最低高度, 56: 生活号高度，27.6：定位高度；44：搜索导航高度；62：瀑布流导航高度；
      goodsBoxMinHeight: that.data.app.globalData.systemInfo.windowHeight - (that.data.canUseLife && env == 'production' ? 56 + 27.6 + 44 + 62 : 27.6 + 44 + 62),
      wheelPlantingArr: wheelPlantingArr ? wheelPlantingArr : [],
			advertsArr: advertsArr ? advertsArr : [],																																		// ---- 移到组件			
			placeholder: placeholder ? placeholder : '',
			isonLoad: true
		})

		that.getWheelPlanting();                                        // 获取 轮播banner 数据
		that.getSearchTextMax();                                        // 获取搜索 placeholder 数据
		that.getAllMaterialData();                                      // 获取第一导航  瀑布流的 banner 数据
		let isSuccess = await that.getAdvertsModule();                  // 获取广告模板数据											
		// isSuccess.type ? this.getTimes('isFirstTime') : '';          // 获取秒杀模板数据			---- 移到组件

		// 定位中判断
		let userLocInfo = getApp().globalData.userLocInfo;
		if( userLocInfo && Object.keys(userLocInfo).length > 0) {
			this.setData({
				isLocationLoad: false
			})
		}

	},

	onShow: function () {
		// console.log('页面显示')
		let that = this;
		my.getStorageSync({ key: 'isHotStart', }).data ? that.getPop() : '';  // 如果页面是热启动，就请求弹窗广告数据；
		that.getCartNumber();   // 获取购物车数量
		that.initLocation();    // 获取定位数据
		my.hideKeyboard();      // 关闭键盘，有些苹果手机会出现输入搜索去到搜索页返回初始页面时，初始页的键盘没有关闭的问题；

		that.searchComponent ? that.searchComponent.setData({ inputVal: '' }) : '';   					// 如果有搜索组件则清空搜索值

		that.checkAllComponent('start');                                  // 页面 onLoad 只会挂载一次组件
		// that.data.isCutTimer ? that.cutTimeStart() : '';              // 如果广告模板倒计时有则开始普通模板倒计时
		// !that.data.isonLoad ? that.getTimes('isFirstTime') : '';      // 只是显示并不是创建页面，计算时间并开始秒杀倒计时

		that.setData({         // 回到页面关闭搜索组件
			isFocus: false,
			isShowSearch: false,
		});
	},

  /**
	 * 页面隐藏
	 */
	onHide() {
		let that = this;
		// clearTimeout(this.data.app.globalData.home_spikeTime);     旧首页秒杀广告
		// this.data.isonLoad = false;

		that.checkAllComponent()
	},

	/**
	 *  页面被关闭
	 */
	onUnload() {
		let that = this;
		// clearTimeout(this.data.app.globalData.home_spikeTime)        旧首页秒杀广告

		that.checkAllComponent()
	},

	/**
	 *  定位初始化
	 */
	initLocation() {
		const _this = this;
		let app = getApp();
		let userLocInfo = app.globalData.userLocInfo;
		if (this.jsonNull(userLocInfo) == 0) {
			locAddr.location((res) => {
				_this.setData({
					locInfo: res,
					isGetLocation: true,
					isLocationLoad: false,
				});
				// 设置缓存并设置全部变量的值 globalData.userLocInfo 
				app.setLocStorage(_this.data.locInfo, function () {
					_this.locStoreShow();
				});

			}, () => {
				// 定位失败
				_this.setData({
					isGetLocation: false,
					isLocationLoad: false,
				});
			});
		}
		else {
			_this.setData({
				locInfo: userLocInfo,
				isGetLocation: true,
				isLocationLoad: false,
			})
			_this.locStoreShow();
		}
	},

	/**
	 * 跳转页面
	 */
	goLocationCity() {
		my.navigateTo({ url: '/community/pages/addressLoc/addressLoc' });
	},

  /**
	 * 检测json是否为空
	 */
	jsonNull(json) {
		let num = 0;
		for (let i in json) {
			num++;
		}
		return num;
	},



	// 定位显示小店
	locStoreShow() {
		const _this = this;
		let _locInfo = this.data.locInfo;

		http.get(api.Shop.SEARCH, {
			longitude: _locInfo.longitude,
			latitude: _locInfo.latitude,
			start: 0,
			limit: 1,
			goodsCount: 3,     //返回商店商品数量的，在首页的入口需要展示3个，最多只能传10
		}, (res) => {
			let _data = res.data.data;
			let _show = false;
			let _store = [];
			if (_data.length > 0) {
				_show = true;
				_store = Object.assign({}, _data[0]);
				// 友盟埋点--社区入口曝光量
				my.uma.trackEvent('homepage_O2O_enter', { shopName: _store.shopName, shopId: _store.id });
			}
			_this.setData({
				'o2oStore.show': _show,
				'o2oStore.store': _store
			})
			// 更新社区入口组件
			if (this.storeEnter) {

				this.storeEnter.setStoreData(_store, _show, _locInfo)
			}
		}, (err) => { });
	},
	storeEnterRef(ref) {
		this.storeEnter = ref;
	},

  	/**
	 * 页面滚动     onPageScroll
	 */
	// onPageScroll(e) {
	// 	let that = this;
	// 	let { scrollTop } = e;
	// 	let waterFallTopInit = this.data.waterFallTopInit;
	// 	let waterFallTop = this.data.waterFallTop;
	// 	//防止统计位置不准确，重新再算一次
	// 	if ( this.data.waterFallTitList.length > 0 && that.data.getWaterFallCount <= 12 ) {
	// 		this.checkElementHeight();
	// 	}
  //   // console.log(scrollTop,this.data.waterFallTop,that.data.waterFallTitHeight )

  //   // 显示返回顶部按钮
  //     this.setData({
  //       isShowGoTop: scrollTop >= that.data.app.globalData.systemInfo.windowHeight / 2 ? true : false
  //     })
      

	// 	if (waterFallTopInit == 'success') {
	// 		if (scrollTop >= (this.data.waterFallTop - that.data.waterFallTitHeight) && !this.data.waterFallTitIsTop) {
	// 			that.setData({
	// 				waterFallTitIsTop: true
	// 			})
	// 		} else if (scrollTop < (this.data.waterFallTop - that.data.waterFallTitHeight) && this.data.waterFallTitIsTop) {
	// 			that.setData({
	// 				waterFallTitIsTop: false
	// 			})
	// 		}
	// 	} else {
	// 		that.getWaterFallSeat()
	// 	}
	// },

	/**
	 * 页面滚动     onPageScroll
	 */
	onScroll(e) {
		let that = this;
		let { scrollTop } = e.detail;
    // console.log(scrollTop, that.data.waterFallTop, that.data.waterFallTitHeight)
		let waterFallTopInit = this.data.waterFallTopInit;
		let waterFallTop = this.data.waterFallTop;
		//防止统计位置不准确，重新再算一次
		if ( this.data.waterFallTitList.length > 0 && that.data.getWaterFallCount <= 10 ) {
			this.checkElementHeight();
		}
    // console.log(scrollTop,this.data.waterFallTop,that.data.waterFallTitHeight )

    // 显示返回顶部按钮
    if( scrollTop >= that.data.app.globalData.systemInfo.windowHeight / 2 && !that.data.isShowGoTop ) {
      this.setData({
        isShowGoTop: true,
      })
      
    } else if ( scrollTop < that.data.app.globalData.systemInfo.windowHeight / 2  && that.data.isShowGoTop ) {
      this.setData({
        isShowGoTop: false,
        pageScrollTop: null
      })
    }

      

		if (waterFallTopInit == 'success') {
			if (scrollTop >= (this.data.waterFallTop - that.data.waterFallTitHeight) && !this.data.waterFallTitIsTop) {
				that.setData({
					waterFallTitIsTop: true
				})
			} else if (scrollTop < (this.data.waterFallTop - that.data.waterFallTitHeight) && this.data.waterFallTitIsTop) {
				that.setData({
					waterFallTitIsTop: false
				})
			}
		} else {
			that.getWaterFallSeat()
		}
	},

	// 获取全部广告模块 + 顶部轮播 + 四大描述的高度
	getWaterFallSeat() {
		let that = this;
    // console.log(that.data.getWaterFallCount)
		my.createSelectorQuery().select('#js_advert_list').boundingClientRect().exec((res) => {
			let result = res[0] && res[0] != 'null' ? res[0].height ? res[0].height : 0 : ''
			if (that.data.waterFallTitList.length > 0 && result ) {
				that.setData({
					waterFallTop: Math.floor(result),
					waterFallTopInit: 'success'
				})
			}
		})
	},

	// 获取顶部，定位 + 生活号 + 搜索 的高度
  getTopContentHeight() {
    let that = this;
    my.createSelectorQuery().select('#js_topContent').boundingClientRect().exec((res) => {
      let result = res[0] && res[0] != 'null' ? res[0].height ? res[0].height : 0 : 0
        that.setData({
          topContentHeight: Math.floor(result) * (750 / that.data.app.globalData.systemInfo.windowWidth),
        })
    })
  },



    // 页面上拉加载更多瀑布流商品 loadWaterFallGoods       onReachBottom
  // onReachBottom() {
  //   let that = this;
  //   let { waterIndex, waterFallGoodsList, isWaterFallLoaded } = this.data
  //   // console.log('上拉加载', '此时的导航 index', waterIndex, '此时各个导航是否没有更多', isWaterFallLoaded, '此时各个瀑布流数据', waterFallGoodsList)
  //   if ( !isWaterFallLoaded[waterIndex] && isWaterFallLoaded.length > 0 ) {
  //     let setWaterFallStart = 'waterStartList[' + waterIndex + ']'
  //     this.setData({
  //       [setWaterFallStart]: waterFallGoodsList.length > 0 ? waterFallGoodsList[waterIndex].length : 0
  //     })
  //     this.getWaterFallGoodsList(1, waterIndex)
  //   }
  // },

    // 页面上拉加载更多瀑布流商品 loadWaterFallGoods       onReachBottom
  scrollToLower() {
    let that = this;
    let { waterIndex, waterFallGoodsList, isWaterFallLoaded } = this.data
    // console.log('上拉加载', '此时的导航 index', waterIndex, '此时各个导航是否没有更多', isWaterFallLoaded, '此时各个瀑布流数据', waterFallGoodsList)
    if ( !isWaterFallLoaded[waterIndex] && isWaterFallLoaded.length > 0 ) {
      let setWaterFallStart = 'waterStartList[' + waterIndex + ']'
      this.setData({
        [setWaterFallStart]: waterFallGoodsList.length > 0 ? waterFallGoodsList[waterIndex].length : 0
      })
      this.getWaterFallGoodsList(1, waterIndex)
    }
  },


  // 瀑布流导航点击
  waterFallChange(e) {
    let { index } = e.currentTarget.dataset
    this.setData({
      waterIndex: index
    })
    if (this.data.isWaterFallFirst[index]) {
      this.getWaterFallGoodsList(0, index)
    }
  },

  // 回到顶部
  goToTop() {
    // my.pageScrollTo({
    //   scrollTop: 0,
    //   duration: 300
    // })

    this.setData({
      pageScrollTop: 0.001
    })
  },

	/**
	 * 添加购物车
	 */
	addCart: function (e) {
		let that = this;
		let productId = e.currentTarget.dataset.pid;
		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: productId, quantity: '1' }, function (res) {
			my.showToast({
				content: '添加购物车成功'
			});
			that.getCartNumber();
		}, function (res) {
			my.showToast({
				content: res
			})
		});
	},

	/**
	* 下拉刷新
	*/
	onPullDownRefresh() {
		// console.log('下拉刷新重新请求数据')
		clearTimeout(this.data.app.globalData.home_spikeTime);	// 清除定时器    
		this.getAdvertsModule();   // 获取广告模块资源
		this.setData({
			allMaterialIndex: -1
		})
		let timer = setTimeout(function () {
			clearTimeout(timer)
			my.stopPullDownRefresh();
		}, 1000)
	},


  /**
	  *分享页面
	*/
	onShareAppMessage: function (res) {
		return {
			title: '顺丰大当家-顺丰旗下电商平台',
			path: '/pages/home/home'
		};
	},


  /**
	  *获取全部广告模块
	*/
	getAdvertsModule() {
		let that = this;
		let token = '';
		let contentType = '';
		let data = { showPage: 'HOMEPAGE' }
		try {
			token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data ? my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data : '';
		} catch (e) { }
		return new Promise((reslove, reject) => {
			my.httpRequest({
				url: constants.UrlConstants.baseUrlOnly + api.HOME.ADVERTS_MOUDULE,
				method: 'GET',
				data: data,
				headers: {
					'token': token ? token : '',
					"content-type": contentType ? contentType : "application/x-www-form-urlencoded",
					"client-channel": "alipay-miniprogram"
				},
				success: function (res) {
					let resRet = res.data.ret;
          let resData= res.data.data;
          
          // resData = that.setResult();
          // console.log(resData)

					if (resRet.code == '0' && resData && resData.length > 0) {
						let newResult = [];
						for (var i = 0; i < resData.length; i++) {
							resData[i].items = JSON.parse(resData[i].items);
							// 为了避免运营乱配，删除一些不能显示的
							if (resData[i].moduleType != 'BANNER_TYPE_1' && resData[i].moduleType != 'HEADLINE' && resData[i].moduleType != 'TUANGOU') {
								if (resData[i].moduleType == "SECONDKILL") {
									that.data.secondKillActivityId = resData[i].items[0].secondKillActivityId;
								}
								if (resData[i].moduleType == 'GOODS_WATERFALL') {
									that.setData({
										waterFallTitList: resData[i].items,
										waterFallGoodsList: new Array(resData[i].items.length).fill([]),
										isWaterFallLoaded: new Array(resData[i].items.length).fill(false),
										isWaterFallLoading: new Array(resData[i].items.length).fill(false),
										isWaterFallFirst: new Array(resData[i].items.length).fill(true),
										waterStartList: new Array(resData[i].items.length).fill(0),
										waterLimitList: new Array(resData[i].items.length).fill(10),
										waterFallListIndex: i
									})
									// console.log('全部广告模板请求成功，开始调用 getWaterFallGoodsList(0, 0)')
									that.getWaterFallGoodsList(0, 0)
								}

                if( resData[i].moduleType == "NAVIGATION" ) {
                  // console.log(resData[i]);
                  resData[i].items.push({
                    imageUrl:"user/admin/20200424/158772400863802553.jpg",
                    link:"/pages/activities/lightMember/lightMember",
                    linkType : "CUSTOM_LINK"
                  });
                }

								newResult.push(resData[i]);
							}
						}
						// 缓存广告模板数据
						my.setStorage({
							key: 'homeAdvertsArr',
							data: newResult,
							success: (res) => { },
						});
						that.setData({
							advertsArr: newResult,
							secondKillActivityId: that.data.secondKillActivityId
						})

            that.checkAllComponent('start');
            that.checkElementHeight();

						reslove({
							'type': true,
							'result': resData
						});
					}
					else {
						reject({
							'type': false,
							'result': err
						});
					}
				},
				fail: function(err) {
          // that.checkAllComponent('start')         // ----------------------------- 测试用，上线记得删除 -----------
					reject({
						'type': false,
						'result': err
					});
				}
			})
		})
	},

  // 获取瀑布流商品数据
  getWaterFallGoodsList(type, waterIndex) {
    let that = this;
    let setWaterLoadingName = 'isWaterFallLoading[' + waterIndex + ']'
    let setWaterLimitName = 'waterLimitList[' + waterIndex + ']'

    // 如果是第一个则需要加入banner资源
    if (waterIndex == 0) {
      that.setData({
        [setWaterLimitName]: (that.data.allMaterialList.length > 0 && that.data.allMaterialIndex < that.data.allMaterialList.length -1) ? 9 : 10
      })
    }

    let waterFallTitList = Object.assign([], that.data.waterFallTitList)
    let goodsContents = waterFallTitList[waterIndex].goodsContents;
    let data = {} //要传的数据
    data.start = that.data.waterStartList[waterIndex]
    data.limit = that.data.waterLimitList[waterIndex]
    data.queryType = waterFallTitList[waterIndex].goodsType == 'GOODS_GROUP' ? 0 : 1;
    data.goodsContents = waterFallTitList[waterIndex].goodsType == 'GOODS_GROUP' ? waterFallTitList[waterIndex].goodsGroupName : waterFallTitList[waterIndex].goodsCategoryArray
    // 防止滚动重复
    if (!that.data.isWaterFallLoading[waterIndex]) {
      that.setData({
        [setWaterLoadingName]: true
      })
    // console.log('请求瀑布流商品 type', type, '此时各个正在加载状态', that.data.isWaterFallLoading, '当前导航对应的参数---',data,'整条瀑布流导航',waterFallTitList)
      http.post(api.GOODS.WATERFALL, data, res => {
        // console.log('当前导航对应的返回的数据---',res);
        let result = res.data.data ? res.data.data : [];
        let setListName = 'waterFallGoodsList[' + waterIndex + ']'
        let setLoadedName = 'isWaterFallLoaded[' + waterIndex + ']'
        let setLoadingName = 'isWaterFallLoading[' + waterIndex + ']'
        let setFirstName = 'isWaterFallFirst[' + waterIndex + ']'
        let lastGoodsList = Object.assign([], that.data.waterFallGoodsList[waterIndex]);
        let randomCount = type == 0 ? 0 : ((Math.floor(Math.random() * 10 + 1)) % 2) == 0 ? 0 : 1
        if (waterIndex == 0) {
          if (that.data.allMaterialList.length > 0 && that.data.allMaterialIndex < that.data.allMaterialList.length -1) {
            ++that.data.allMaterialIndex
            result.splice(randomCount, 0, that.data.allMaterialList[that.data.allMaterialIndex])
          }
        }
        let wholeGoodsList = []
        wholeGoodsList = type == 0 ? result : lastGoodsList.concat(result)
        that.setData({
          [setListName]: wholeGoodsList,
          [setLoadedName]: result.length >= that.data.waterLimitList[waterIndex] ? false : true,
          [setLoadingName]: false,
          [setFirstName]: false,
          allMaterialIndex: that.data.allMaterialIndex
        })

				type == 0 ? that.checkElementHeight() : '';
				// console.log('当前导航渲染的商品', wholeGoodsList, '是否没有更多？', that.data.isWaterFallLoaded, '本次请求是否还在继续', that.data.isWaterFallLoading, '是否是第一次？', that.data.isWaterFallFirst)
			}, err => {
				// console.log('当前导航请求的数据报错', err)
				let setLoadedName = 'isWaterFallLoaded[' + waterIndex + ']'
				let setLoadingName = 'isWaterFallLoading[' + waterIndex + ']'
				that.setData({
					[setLoadedName]: false,
					[setLoadingName]: false,
				})
				// console.log('是否没有更多？', that.data.isWaterFallLoaded, '本次请求是否还在继续', that.data.isWaterFallLoading)
			})
		}
	},

	/**
 * 获取首页轮播 getWheelPlanting
 * */
	getWheelPlanting() {
		let that = this;
			// HOME_BANNER_LIST: '/home/getMaterialGroup',   //首页banner接口  
		sendRequest.send(constants.InterfaceUrl.HOME_BANNER_LIST, { groupName: '支付宝小程序_首页轮播图' }, function(res) {
      let result = res.data.result;
      that.setData({
				wheelPlantingArr: result.material ? result.material : []
			})
			my.setStorage({
				key: 'wheelPlantingArr', // 缓存数据的key
				data: result.material, // 要缓存的数据
				success: (res) => {
				},
			});
      that.checkElementHeight();
			// console.log(that.data.wheelPlantingArr)
		}, function (err) {
			// console.log(that.data.wheelPlantingArr)
		}, 'GET')
	},

	// 轮播滚动时触发
	bannerListChange(e) {
		let { current, source } = e.detail;
		if (source === 'autoplay' || source === 'touch') {
			this.setData({
				currentIndex: current
			})
		}
	},

  /**
	  *获取弹窗广告数据
	*/
	getPop() {
		my.removeStorageSync({
			key: 'isHotStart',
		});
		let that = this;
		let url = '/m/a' + constants.InterfaceUrl.HOME_POP;
		let token = '';
		let contentType = '';
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
			success: function (res) {
				let resData = res.data;
				let result = resData.data;
        that.checkElementHeight();
				if (resData.ret.code == '0') {
					let canUseCollected = my.canIUse('isCollected');
					if (!canUseCollected) {
						my.showToast({
							content: '您的客户端版本过低，请升级你的客户端',
							success: (res) => {
								if (result) {
                  that.setPopImgData(result);
								}
							},
						});
						return;
					} else if (resData.data.appLink == 2) {   // 如果为收藏有礼的弹窗
						my.isCollected({
							success: (res) => {
								// console.log('查询收藏成功');
								if (res.isCollected) {
									// console.log('收藏了',res.isCollected);
									return;
								} else if (result) {
									// console.log('没有收藏',res.isCollected);
                  that.setPopImgData(result);
								}
							},
							fail: (error) => {
								// console.log('查询收藏失败');
								if (result) {
                  that.setPopImgData(result);
								}
							}
						});
					} else if (result) {
              that.setPopImgData(result);
					}
				}
			},
			fail: function (err) {
			}
		})
	},


  // 设置广告数据并判断广告类型
  setPopImgData(result) {
    this.setData({
      popImgData: result
    })
    this.judgePop();
  },

    /**
   * 获取所有瀑布流的 banner，只在第一栏瀑布流显示，排序由高到底，优先显示排序高的，每10个瀑布流商品展示一张 banner;
   * */
  getAllMaterialData() {
    let that = this;
		// 支付宝小程序瀑布流广告banner
		// '/m/a/material/1.0/listMaterialByName'  '/m/a/material/1.0/listMaterialByName', //获取首页底部所有banner位数据
    http.get(api.GOODSDETAIL.LISTMATERIALBYNAME, {
      groupName: '支付宝小程序瀑布流广告banner'
    }, res => {
      let result = res.data.data ? res.data.data : [];
      result.forEach(value => { value.type = 'advert' })
      that.setData({
        allMaterialList: Object.assign(that.data.allMaterialList, result)
      })
      that.checkElementHeight();
      // console.log('瀑布流banner数据', that.data.allMaterialList)
    }, err => {})
  },



  /**
	  *页面跳转类型判断 + 友盟统计上传  type = banner 轮播 type = oneFour 1+4模块 type = oneTwo 1+2模块
	*/
	checkJumpType(e) {
		// console.log(e)
		let { linkType, title, type, url } = e.currentTarget.dataset

		if (linkType == '2') {                      // linkType为2代表跳收藏有礼
			my.uma.trackEvent('homepage_popup_click')
			my.navigateToMiniProgram({
				appId: '2018122562686742',                //收藏有礼小程序的 appid，固定值请勿修改
				path: url,                                //收藏有礼跳转地址和参数
				success: (res) => { },
				fail: (error) => { }
			});
		} else if (type == 'banner') {
			my.uma.trackEvent('homepage_banner_click', { title: title });
			this.goToPage(e);
		}
	},

	// 页面跳转
	goToPage(e) {
		let chInfo = constants.UrlConstants.chInfo;
		let { url } = e.currentTarget.dataset;
		if (url.substring(0, 4).indexOf('http') > -1) {
			my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
		} else {
			my.navigateTo({
				url: url
			});
		}
		this.closePop();
	},

	// 友盟+统计--首页浏览 （如果从推文或者其他方进来并且带广告参数时）
	reportPageOption(options) {
		let globalQuery = Object.assign({}, this.data.app.globalData.query);
		let pageOptions = Object.keys(globalQuery).length > 0 ? Object.assign(options, globalQuery) : options;
		my.uma.trackEvent('homepage_show', pageOptions);
	},

  /**
	  *阻止默认事件
	*/
	touchReturn() {
		return;
	},

  /**
	  * 广告弹窗显示逻辑
	*/
	judgePop: function () {
		let that = this;
		let popImgData = this.data.popImgData;
		// console.log(this.data.popImgData)
		let popId = popImgData.popId;                         // 广告 id ;
		let popType = popImgData.popAdvMemoryOpt;             // 广告类型 ;
		let popModify = popImgData.modifyDate;               // 广告修改时间 ;

		let storagePopImgData = my.getStorageSync({ key: 'popImgData' }).data;
		my.uma.trackEvent('homepage_popup_visibility');     // 友盟+统计--弹窗曝光

		let myDate = new Date()
		let month = myDate.getMonth() + 1;              //获取当前月份(0-11,0代表1月)
		let day = myDate.getDate();                     //获取当前日(1-31)
		popImgData.popMonthDay = month + '' + day;

		if (!storagePopImgData) {
			that.savePopImgData(popImgData);
		} else {
			let localPopId = storagePopImgData.popId;                                     //本地缓存 广告id
			let localPopType = storagePopImgData.popAdvMemoryOpt;                         //本地缓存 广告类型
			let localPopModify = storagePopImgData.modifyDate;                            //本地缓存 广告修改时间 ;
			if ((popId != localPopId || popType != localPopType || popModify != localPopModify)) {
				that.savePopImgData(popImgData);
			} else if (localPopType == 'EVERY_OPEN_ONCE_SHOW') {
				this.setData({
					showToast: true
				})
			} else if (localPopType == 'ONCE_DAY_SHOW') {
				let localMonthDay = storagePopImgData.popMonthDay;
				if (popImgData.popMonthDay != localMonthDay) {
					that.savePopImgData(popImgData);
				}
			}
		}
	},

	// 缓存广告数据
	savePopImgData(data) {
		this.setData({
			showToast: true
		});
		my.setStorage({
			key: 'popImgData',
			data: data,
			success: (res) => {
			},
		})
	},

	/**
	  * 关闭广告弹窗
	*/
	closePop: function () {
		this.setData({
			showToast: false
		})
	},

	/**
	   * 获取购物车数量
	*/
	getCartNumber: function () {
		this.data.app.getCartNumber();
	},

	/**
	  * 获取 placeholder value
	*/
	getSearchTextMax() {
		let that = this;
		http.get(api.search.SEARCHTEXTMAX, {}, (res) => {
			let resData = res.data;
			if (resData.ret.code == "0" && resData.ret.message == "SUCCESS" && resData.data && resData.data.name) {
				try {
					my.setStorageSync({ key: constants.StorageConstants.searchTextMax, data: resData.data.name });
				} catch (e) { }
				that.setData({
					placeholder: resData.data.name
				})
			}
		}, (err) => {
		})
	},

  // 查询节点高度
  checkElementHeight() {
    let that = this;
    that.data.getWaterFallCount += 1;
    let timeout = setTimeout(function () {
      that.getWaterFallSeat();
      that.getTopContentHeight();
      clearTimeout(timeout)
    }, 800)
  },

	/**
	  * 判断组件实例
	*/
	saveRef(ref) {
		switch (ref.props.__tag) {
			case "search-component":
				this.searchComponent = ref
				break;
			case "bannertype2-ads":
				this.saveComponent('bannertype2-ads', ref);
				break;
			case "doublegoods-ads":
				this.saveComponent('doublegoods-ads', ref);
				break;
			case "goodsgroup-ads":
				this.saveComponent('goodsgroup-ads', ref);
				break;
			case "goodsscroll-ads":
				this.saveComponent('goodsscroll-ads', ref);
				break;
			case "goodswatefall-ads":
				this.saveComponent('goodswatefall-ads', ref);
				break;
			case "navigation-ads":
				this.saveComponent('navigation-ads', ref);
				break;
			case "navigationmini-ads":
				this.saveComponent('navigationmini-ads', ref);
				break;
			case "onefouradvert-ads":
				this.saveComponent('onefouradvert-ads', ref);
				break;
			case "seckill-ads":
				this.saveComponent('seckill-ads', ref);
				break;
			case "shopwindow-ads":
				this.saveComponent('shopwindow-ads', ref);
				break;
			case "singlegoods-ads":
				this.saveComponent('singlegoods-ads', ref);
				break;
			case "twofouradvert-ads":
				this.saveComponent('twofouradvert-ads', ref);
				break;
			default:
				break;
		}
  },

  // 组件实例
  saveComponent(refName, ref) {
    this.allComponent.push({id: ref.$id, componentName: refName, component: ref})
  },

  // 查询所有组件内是否包含‘goodsscroll-ads’ 模板且是需要倒计时展示；
  checkAllComponent(isStart) {
    this.allComponent.forEach(value => {
      if( value && value.componentName == 'goodsscroll-ads' && value.component.props.timerType == "DAY_TIMER" ) {
        isStart ? value.component.cutTimeStart() :  clearTimeout(value.component.data.cutTime_timer);
        // console.log(value.component)
      }
    })
  },
  
	/**
	  * 新版搜索组件开关
	*/
	showSearch: function (noGetHistory) {
		noGetHistory == 'noGetHistory' ? '' : this.searchComponent.getHistory();
		this.setData({
			isShowSearch: !this.data.isShowSearch,
			isFocus: !this.data.isFocus,
		})
	},


	// --------------------------------------------------  测试用，上线记得删除  ----------------------------------
	setResult() {
		let result = [{ "moduleType": "NAVIGATION", "moduleName": "iocn", "items": "[{\"imageUrl\":\"user/admin/20200414/158685747964685318.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/hml/subject_page/399.html\"},{\"imageUrl\":\"user/admin/20200414/158685749481434894.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/hml/subject_page/435.html\"},{\"imageUrl\":\"user/admin/20200414/158685749814141826.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/pages/activities/thematicActivities/thematicActivities?id=201\"},{\"imageUrl\":\"user/admin/20200414/158685750157200170.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/h/personal/signIn\"},{\"imageUrl\":\"user/admin/20200414/158685769324227654.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/myInfo/toMemberSuperDay\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": null, "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }, { "moduleType": "TWOFOURADVERT", "moduleName": "2+4", "items": "[{\"imageUrl\":\"user/admin/20200414/158685986675703820.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/hml/subject_page/413.html\"},{\"imageUrl\":\"user/admin/20200414/158685987039223863.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\" https://shop.fx-sf.com/hml/subject_page/133.html\"},{\"imageUrl\":\"user/admin/20200414/158686012752879523.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/pages/shopping/goodsDetail/goodsDetail?goodsSn=YW8F22BB490A97\"},{\"imageUrl\":\"user/admin/20200414/158686013216396690.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/community/pages/index/index\"},{\"imageUrl\":\"user/admin/20200414/158686013575942872.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/pages/activities/thematicActivities/thematicActivities?id=201\"},{\"imageUrl\":\"user/admin/20200414/158686013930746456.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/pages/activities/thematicActivities/thematicActivities?id=241\"}]", "restrictions": null, "goodsId": null, "spacing": 1, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": null, "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }, { "moduleType": "BANNER_TYPE_2", "moduleName": "banner", "items": "[{\"imageUrl\":\"user/admin/20200416/158700282694362347.gif\",\"linkType\":\"H5_LINK\",\"link\":\"https://datayi.cn/w/nP2EEjRm\"},{\"imageUrl\":\"user/admin/20200416/158700289604758151.jpg\",\"linkType\":\"H5_LINK\",\"link\":\"https://m.sfddj.com/shop/goods/goodsGroup?groupName=APP首页-肉食天地\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": null, "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }, { "moduleType": "GOODS_WATERFALL", "moduleName": "商品瀑布流", "items": "[{\"moduleTitle\":\"国内水果\",\"moduleSubTitle\":\"尝鲜季\",\"goodsType\":\"GOODS_CATEGORY\",\"goodsGroupName\":null,\"goodsCategoryArray\":[\"gnsg\"]},{\"moduleTitle\":\"进口水果\",\"moduleSubTitle\":\"吃点好的\",\"goodsType\":\"GOODS_CATEGORY\",\"goodsGroupName\":null,\"goodsCategoryArray\":[\"jksg\"]},{\"moduleTitle\":\"海鲜水产\",\"moduleSubTitle\":\"深海先锋\",\"goodsType\":\"GOODS_CATEGORY\",\"goodsGroupName\":null,\"goodsCategoryArray\":[\"hxsc\"]},{\"moduleTitle\":\"肉蛋家禽\",\"moduleSubTitle\":\"秋冬囤肉\",\"goodsType\":\"GOODS_CATEGORY\",\"goodsGroupName\":null,\"goodsCategoryArray\":[\"rdjq\"]},{\"moduleTitle\":\"蔬菜食材\",\"moduleSubTitle\":\"新鲜健康\",\"goodsType\":\"GOODS_CATEGORY\",\"goodsGroupName\":null,\"goodsCategoryArray\":[\"scsc\"]}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FBF9F9", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": null, "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }, { "moduleType": "GOODSSCROLL", "moduleName": "商品滚动", "items": "[{\"moduleTitle\":\"热门活动\",\"timerType\":\"DAY_TIMER\",\"goodsGroupName\":\"热门活动\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": [], "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": 14, "goodsGroupName": "热门活动" }, { "moduleType": "HEADLINE", "moduleName": "今日头条", "items": "[{\"id\":11144,\"title\":\"【图文】鹿晗的前女友们，看过来！这里有你们喜欢的小狗肉\",\"type\":0,\"goodsSn\":\"YWC07EB76C002D\"},{\"id\":11151,\"title\":\"爱在桃李芬芳时线下活动圆满结束啦！\",\"type\":0,\"goodsSn\":null},{\"id\":11152,\"title\":\"支付宝小程序头条配置\",\"type\":0,\"goodsSn\":\"YW3AEF4AFE05D4\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "74F5F9", "groupGoodsVoList": null, "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }, { "moduleType": "GOODSGROUP", "moduleName": "1+N个商品", "items": "[{\"imageUrl\":\"user/admin/20200416/158700282694362347.gif\",\"linkType\":\"H5_LINK\",\"link\":\"https://datayi.cn/w/nP2EEjRm\",\"goodsGroupName\":\"活动商品\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": [], "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": 12, "goodsGroupName": "活动商品" }, { "moduleType": "GOODSSCROLL", "moduleName": "商品滚动", "items": "[{\"moduleTitle\":\"本周热销\",\"timerType\":\"NO_TIMER\",\"goodsGroupName\":\"本周热销\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": [], "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": 17, "goodsGroupName": "本周热销" }, { "moduleType": "NAVIGATION_MIN", "moduleName": "1行N个（小）", "items": "[{\"imageUrl\":\"user/admin/20200416/158702135203723807.png\",\"linkType\":\"H5_LINK\",\"link\":\"/pages/home/getCoupon/getCoupon\"},{\"imageUrl\":\"user/admin/20200416/158702236045360476.jpeg\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/GroupBuying/showList\"},{\"imageUrl\":\"user/admin/20200416/158702254912448942.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/hml/subject_page/206.html\"},{\"imageUrl\":\"user/admin/20200416/158702256537006426.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/static_v4/activity/redPacket/redPacket.html?sign=DDJ0000000010013\"},{\"imageUrl\":\"user/admin/20200416/158702237170291917.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"/pages/subPackages/activities/thematicActivites/thematicActivites?id=234\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": null, "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }, { "moduleType": "SHOPWINDOW", "moduleName": "1+2", "items": "[{\"imageUrl\":\"user/admin/20200416/158702222323184248.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://blog.csdn.net/qq_36836336/article/details/84318863\"},{\"imageUrl\":\"user/admin/20200416/158702315898169127.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/shop/goods/view/YW274810048221\"},{\"imageUrl\":\"user/admin/20200416/158702309573102587.png\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://shop.fx-sf.com/shop/goods/view/YW278DBCC2278D\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": null, "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }, { "moduleType": "DOUBLEGOODS", "moduleName": "一行2个", "items": "[{\"imageUrl\":\"user/admin/20200416/158702185711009428.jpg\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://m.sfddj.com/shop/goods/goodsGroup?groupName=APP首页-进口水果\"},{\"imageUrl\":\"user/admin/20200416/158702185086848344.jpg\",\"linkType\":\"CUSTOM_LINK\",\"link\":\"https://m.sfddj.com/shop/goods/goodsGroup?groupName=APP首页-菜蛋食材\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": null, "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }, { "moduleType": "BANNER_TYPE_1", "moduleName": "商品轮播", "items": "[{\"moduleTitle\":\"本月新品\",\"goodsGroupName\":\"本月新品\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": [], "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": 18, "goodsGroupName": "本月新品" }, { "moduleType": "SINGLEGOODS", "moduleName": "一行一个", "items": "[{\"imageUrl\":\"user/admin/20200416/158702185086848344.jpg\",\"linkType\":\"H5_LINK\",\"link\":\"https://shop.fx-sf.com/shop/goods/view/YW066C7058880D\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": null, "groupBuyGoodsVoList": null, "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }, { "moduleType": "TUANGOU", "moduleName": "拼团", "items": "[{\"moduleTitle\":\"热门拼团\",\"viewMoreUrl\":\"/GroupBuying/showList\",\"tuangouGoodsUrl\":\"8\"}]", "restrictions": null, "goodsId": null, "spacing": 0, "topIntervalColor": "FFFFFF", "backgroundImg": null, "backgroundColor": "FFFFFF", "groupGoodsVoList": null, "groupBuyGoodsVoList": [{ "goodsId": 42779, "goodsSn": "YWB8D0BA0BC7BA", "goodsName": "微信小程序拼团优惠券测试", "salePrice": 9.90000, "salesCount": 20, "goodsLabels": "特价", "htmlPath": "shop/goods/YWB8D0BA0BC7BA.html", "orderList": 100000, "goodsTitle": "额外返现", "goodsDefaultImage": "goods/20190426/155624574734887227.jpg", "tuangouPrices": 5.00000, "productId": 107536, "productName": "2吨", "tuangouCount": 3, "applyUser": 0, "activityId": 1267, "label": "", "labels": [], "firstGueeImagePath": null, "afterSaleGuee": "", "tuangou": true }, { "goodsId": 42940, "goodsSn": "YW76C641AF8C57", "goodsName": "拼团库存回调测试01", "salePrice": 42.00000, "salesCount": 3, "goodsLabels": "限时", "htmlPath": "shop/goods/YW76C641AF8C57.html", "orderList": 100004, "goodsTitle": "额外返现", "goodsDefaultImage": "goods/20190426/155624574734887227.jpg", "tuangouPrices": 7.00000, "productId": 108138, "productName": "苹果", "tuangouCount": 2, "applyUser": 0, "activityId": 1289, "label": "大大的撒大叔大|测试|擦啊啊啊啊", "labels": ["大大的撒大叔大", "测试", "擦啊啊啊啊"], "firstGueeImagePath": "icon_Payoff0.png", "afterSaleGuee": "1,2,3,4", "tuangou": true }, { "goodsId": 42959, "goodsSn": "YWF3FA2361D182", "goodsName": "支付宝小程序物流详情页改版", "salePrice": 1.00000, "salesCount": 1, "goodsLabels": "限时", "htmlPath": "shop/goods/YWF3FA2361D182.html", "orderList": 10001, "goodsTitle": "", "goodsDefaultImage": "goods/20191128/157492035556695150.jpg", "tuangouPrices": 0.10000, "productId": 108307, "productName": "5支", "tuangouCount": 2, "applyUser": 0, "activityId": 1290, "label": "年终大狂欢|年货季|冬季", "labels": ["年终大狂欢", "年货季", "冬季"], "firstGueeImagePath": "icon_Payoff0.png", "afterSaleGuee": "1,3,4", "tuangou": true }, { "goodsId": 42957, "goodsSn": "YW9098600F7EDA", "goodsName": "渠道一达人下单", "salePrice": 1.00000, "salesCount": 2, "goodsLabels": null, "htmlPath": "shop/goods/YW9098600F7EDA.html", "orderList": 10000, "goodsTitle": "", "goodsDefaultImage": "goods/20200309/158372989289816053.jpg", "tuangouPrices": 0.60000, "productId": 108200, "productName": "2", "tuangouCount": 2, "applyUser": 0, "activityId": 1291, "label": "", "labels": [], "firstGueeImagePath": null, "afterSaleGuee": "", "tuangou": true }], "secondKillModuleVO": null, "goodsGroupId": null, "goodsGroupName": null }];
		return result;
	},



});