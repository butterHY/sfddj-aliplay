import _ from 'underscore'
import locAddr from '/community/service/locAddr.js';
//获取应用实例不要写在页面外面，会出问题；

let sendRequest = require('../../utils/sendRequest');
let constants = require('../../utils/constants');
let stringUtils = require('../../utils/stringUtils');
let utils = require('../../utils/util');


import api from '../../api/api';
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
    isShowGoTop: false,           //是否要显示返回顶部按钮

    // banner数据
    bannerList: [],              //banner的列表
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
    allMaterialList: [],          //瀑布流第一个导航商品列表的banner广告位
    allMaterialIndex: -1,         //当前瀑布流第一个导航商品列表banner的加载位置
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
			streetLoc: ''
		},

    // 生活号
    canUseLife: my.canIUse('lifestyle'),
    hideLifeStyle: false,             //隐藏关注生活号组件
    
    // 秒杀广告模板数据
    isonLoad: false,

	},

	onLoad: async function(options) {
    // console.log(app.globalData.systemInfo)
    var that = this;
		that.data.app = getApp();
		// 友盟+统计--首页浏览 （如果从推文或者其他方进来并且带广告参数时）
    var pageOptions = options
		var globalQuery = Object.assign({}, that.data.app.globalData.query)
		if (Object.keys(globalQuery).length > 0) {
			pageOptions = Object.assign(options, globalQuery)
		} 
		my.uma.trackEvent('homepage_show', pageOptions);
		
		var wheelPlantingArr = my.getStorageSync({key: 'wheelPlantingArr', }).data;      // 获取缓存首页 banner 数据
		var advertsArr = my.getStorageSync({key: 'homeAdvertsArr', }).data;             // 获取缓存 首页广告模板  数据			---- 移到组件
		var homeGoodsList = my.getStorageSync({	key: 'homeGoodsList', }).data;          // 获取缓存 首页商品  数据
    var placeholder = my.getStorageSync({	key: 'searchTextMax', }).data;          // 获取缓存 首页商品  数据

		that.setData({
      // topContentHeight: that.data.canUseLife ? utils.px2Rpx(56 + 18) : utils.px2Rpx(18),
      waterFallTitHeight: 124 * that.data.app.globalData.systemInfo.windowWidth / 750,             // 瀑布流导航高度；
     //如果在瀑布流导航置顶时，设置瀑布流商品的最低高度, 56: 生活号高度，18：定位高度；44：搜索导航高度；62：瀑布流导航高度；
      goodsBoxMinHeight: that.data.app.globalData.systemInfo.windowHeight - (that.data.canUseLife ? 56 + 18 + 44 + 62 : 18 + 44 + 62),
      wheelPlantingArr: wheelPlantingArr ? wheelPlantingArr : [],
			advertsArr: advertsArr ? advertsArr : [],																																		// ---- 移到组件			
			homeGoodsList: homeGoodsList ? homeGoodsList : [],
      placeholder: placeholder ? placeholder : '',
      isonLoad: true
		})

		console.log(that.data.topContentHeight)
		console.log(that.data.canUseLife)

		that.getWheelPlanting();                                        // 获取 轮播banner 数据
    that.getSearchTextMax();                                        // 获取搜索 placeholder 数据
    that.getAllMaterialData();                                      // 获取第一导航  瀑布流的 banner 数据
		let isSuccess = await that.getAdvertsModule();                  // 获取广告模板数据											---- 移到组件
    // isSuccess.type ? this.getTimes('isFirstTime') : '';             // 获取秒杀模板数据											---- 移到组件

	},

	onShow: function() {
		let that = this;
		console.log('页面显示')
    my.getStorageSync({key: 'isHotStart',}).data ? that.getPop() : '';  // 如果页面是热启动，就请求弹窗广告数据；

		that.getCartNumber();   // 获取购物车数量
    that.initLocation();    // 获取定位数据
    my.hideKeyboard();      // 关闭键盘，有些苹果手机会出现输入搜索去到搜索页返回初始页面时，初始页的键盘没有关闭的问题；
	
		that.searchComponent ? that.searchComponent.setData({inputVal: ''}) : '';   					// 如果有搜索组件则清空搜索值
		that.advertisement && that.data.isCutTimer ? that.advertisement.cutTimeStart() : '';	// 页面 onLoad 则

		
				console.log(that.advertisement)
    // that.data.isCutTimer ? that.cutTimeStart() : '';                            // 如果广告模板倒计时有则开始倒计时
    // !that.data.isonLoad ? that.getTimes('isFirstTime') : '';        // 只是显示并不是创建页面，计算时间并开始倒计时

		that.setData({         // 回到页面关闭搜索组件
			isFocus: false,
			isShowSearch: false,
		});
	},

  /**
	 * 页面隐藏
	 */
	onHide() {
		// clearTimeout(this.data.app.globalData.home_spikeTime);
    // this.data.isonLoad = false;
	},

	/**
	 *  页面被关闭
	 */
	onUnload() {
		// clearTimeout(this.data.app.globalData.home_spikeTime)
	},

	/**
	 *  定位初始化
	 */
	initLocation() {
		const _this = this;
		let userLocInfo = _this.data.app.globalData.userLocInfo;
		if (this.jsonNull(userLocInfo) == 0) {
			locAddr.location((res) => {
				_this.setData({
					locInfo: res
				});
				// 设置缓存并设置全部变量的值 globalData.userLocInfo 
				_this.data.app.setLocStorage(_this.data.locInfo);
				_this.getTopContentHeight();
			});
		}	else {
			_this.setData({
				locInfo: userLocInfo
			})
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

  /**
	 * rpx 转化 px
	 */
	toPx(rpx) {
		return rpx * my.getSystemInfoSync().windowWidth / 750;
	},

	/**
	 * 页面滚动
	 */
	onPageScroll(e) {
    let that = this;
    let { scrollTop } = e;
    let waterFallTopInit = this.data.waterFallTopInit;
    let waterFallTop = this.data.waterFallTop;
    //防止统计位置不准确，重新再算一次
    if ( this.data.waterFallTitList.length > 0 ) {
      this.getWaterFallSeat()
    }

    // 显示返回顶部按钮
    this.setData({
      isShowGoTop: scrollTop > that.data.app.globalData.systemInfo.windowHeight / 2 ? true : false
    })

    if (waterFallTopInit == 'success') {
      if (scrollTop >= (this.data.waterFallTop - that.data.waterFallTitHeight) && !this.data.waterFallTitIsTop) {
        that.setData({
          waterFallTitIsTop: true
        })
      } else if (scrollTop < (this.data.waterFallTop - that.data.waterFallTitHeight ) && this.data.waterFallTitIsTop) {
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
    my.createSelectorQuery().select('#js_advert_list').boundingClientRect().exec((res) => {
      let result = res[0] && res[0] != 'null' ? res[0].height ? res[0].height : 0 : ''
      if (that.data.waterFallTitList.length > 0 && result && (that.data.waterFallTopInit != 'success')) {
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



    // 页面上拉加载更多瀑布流商品 loadWaterFallGoods
  onReachBottom() {
    let that = this;
    console.log('上拉加载', '瀑布流导航数据',that.data.waterFallTitList)
    let { waterIndex, waterFallGoodsList, isWaterFallLoaded } = this.data
    console.log('此时的导航 index', waterIndex, '此时各个正在加载状态', isWaterFallLoaded, '此时各个瀑布流数据', waterFallGoodsList)
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
    console.log('瀑布流点击',e )
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
    my.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

	/**
	 * 添加购物车
	 */
	addCart: function(e) {
		let that = this;
		let productId = e.currentTarget.dataset.pid;
		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: productId, quantity: '1' }, function(res) {
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
	* 下拉刷新
	*/
	onPullDownRefresh() {
    console.log('下拉刷新重新请求数据')
    clearTimeout(this.data.app.globalData.home_spikeTime);	// 清除定时器    
		this.getAdvertsModule();   // 获取广告模块资源
    this.setData({
      allMaterialIndex: -1
    })
    let timer = setTimeout(function() {
      clearTimeout(timer)
      my.stopPullDownRefresh();
    }, 1000)
  },


  /**
	  *分享页面
	*/
	onShareAppMessage: function(res) {
		return {
			title: '顺丰大当家-顺丰旗下电商平台',
			path: '/pages/home/home'
		};
	},


  /**
	  *获取全部广告模块
	*/
	getAdvertsModule() {
		var that = this;
		var token = '';
		var contentType = '';
		var data = { showPage: 'HOMEPAGE' }
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
				success: function(res) {
					let resRet = res.data.ret;
          let resData= res.data.data;
					if (resRet.code == '0' && resData) {
						let newResult = [];
						for ( var i = 0; i < resData.length; i++ ) {
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
                  console.log('全部广告模板请求成功，开始调用 getWaterFallGoodsList(0, 0)')
                  that.getWaterFallGoodsList(0, 0)
                }

                // 如果是滚动商品 有倒计时的情况
                if ( resData[i].moduleType == 'GOODSSCROLL' && resData[i].items[0].timerType == 'DAY_TIMER' ) {
									that.advertisement && that.data.isCutTimer ? that.advertisement.cutTimeStart() : '';
                  that.setData({
                    isCutTimer: true,
                  })
									console.log(that.data.isCutTimer)
                  // 开始倒计时
                //  that.cutTimeStart()
                }
								newResult.push(resData[i]);
							}
						}
						// 缓存广告模板数据
						my.setStorage({
							key: 'homeAdvertsArr',
							data: newResult,
							success: (res) => {},
						});
						that.setData({
							advertsArr: newResult,
							secondKillActivityId: that.data.secondKillActivityId
						})
            console.log('瀑布流导航数据', that.data.waterFallTitList)
            console.log('全部广告模板请求成功，数据---', that.data.advertsArr)
            var timeout = setTimeout(function() {
              that.getWaterFallSeat();
							that.getTopContentHeight();
              clearTimeout(timeout)
            }, 800)
						reslove({
							'type': true,
							'result': resData
						});
					}
					else {
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
      console.log('请求瀑布流商品 type', type,'当前导航对应的参数---',data,'整条瀑布流导航',waterFallTitList)
      http.post(api.GOODS.WATERFALL, data, res => {
        console.log('当前导航对应的返回的数据---',res);
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

				type == 0 ? that.getTopContentHeight() : '';
        console.log('当前导航渲染的商品',wholeGoodsList,'是否没有更多？',that.data.isWaterFallLoaded,'本次请求是否还在继续',that.data.isWaterFallLoading,'是否是第一次？',that.data.isWaterFallFirst)
      }, err => {
        console.log('当前导航请求的数据报错',err)
        let setLoadedName = 'isWaterFallLoaded[' + waterIndex + ']'
        let setLoadingName = 'isWaterFallLoading[' + waterIndex + ']'
        that.setData({
          [setLoadedName]: false,
          [setLoadingName]: false,
        })
        console.log('是否没有更多？',that.data.isWaterFallLoaded,'本次请求是否还在继续',that.data.isWaterFallLoading)
      })
    }
  },

    /**
   * 获取首页轮播 getWheelPlanting
   * */
  getWheelPlanting() {
		let that = this;
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
		}, function(err) {
		}, 'GET')
  },

  // 轮播滚动时触发
  bannerListChange(e) {
    let { current,source } = e.detail;
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

    /**
   * 获取所有瀑布流的 banner，只在第一栏瀑布流显示，排序由高到底，优先显示排序高的，每10个瀑布流商品展示一张 banner;
   * */
  getAllMaterialData() {
    let that = this;
    http.get(api.HOME.ALL_MATERIAL, {
      groupName: '支付宝小程序_首页轮播图'
    }, res => {
      let result = res.data.data ? res.data.data : [];
      for (let i = 0; i < result.length; i++) {
        result[i].type = 'advert'
      }
      that.setData({
        allMaterialList: Object.assign(that.data.allMaterialList, result)
      })
      console.log('瀑布流banner数据', that.data.allMaterialList)
    }, err => {})
  },




  /**
	  *页面跳转 + 友盟统计上传
	*/ 
	goToPage(e) {
		let that = this;
    console.log(e)
		let chInfo = constants.UrlConstants.chInfo;
		let { linkType, title, type, index, fatherIndex, url } = e.currentTarget.dataset
		// linkType为2代表跳收藏有礼
		if (linkType == '2') {
			my.uma.trackEvent('homepage_popup_click')
			my.navigateToMiniProgram({
				appId: '2018122562686742',//收藏有礼小程序的appid，固定值请勿修改
				path: url,//收藏有礼跳转地址和参数
				success: (res) => {},
				fail: (error) => {}
			});
		}
		else {
			// 友盟+统计--首页浏览
			// type = banner banner轮播 type = oneFour 1+4模块 type = oneTwo 1+2模块
			if (type == 'banner') {
        console.log(e)
				my.uma.trackEvent('homepage_banner_click', { title: title });
			}
			if (type == 'oneFour') {
				my.uma.trackEvent('homepage_oneFour_click', { index: index });
			}
			if (type == 'oneTwo') {
				my.uma.trackEvent('homepage_oneTwo_click', { index: index });
			}
			if (type == 'popup') {
				my.uma.trackEvent('homepage_popup_click')
			}

			// 如果是当家爆款、新品上架、原产好物的统计
			if(type == 'goodsCount') {
				let data = {
					channel_source: 'mini_alipay', supplierName: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].nickName, supplierId: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].supplierId, goodsName: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].goodsName, goodsSn: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].goodsSn, goodsCategoryId: that.data.advertsArr[fatherIndex].groupGoodsVoList[index].goodsCategoryId
				}
				// homepage_ddjHotSale , homepage_ddjBestGoods, homepage_ddjNewGoods
				if (title.indexOf('爆款') > -1) {
					// that.umaTrackEvent(type, 'homepage_ddjHotSale', data);
          my.uma.trackEvent('homepage_ddjHotSale', data);
				}
				else if(title.indexOf('新品') > -1) {
					// that.umaTrackEvent(type, 'homepage_ddjNewGoods', data);
          my.uma.trackEvent('homepage_ddjNewGoods', data);
				}
				else if(title.indexOf('原产') > -1) {
					// that.umaTrackEvent(type, 'homepage_ddjBestGoods', data);
          my.uma.trackEvent('homepage_ddjBestGoods', data);
				}
			}

			if (url.substring(0,4).indexOf('http') > -1) {
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

  /**
	  *阻止默认事件
	*/ 
	touchReturn() {
		return;
	},

  /**
	  * 广告弹窗显示逻辑
	*/
	judgePop: function() {
		var popImgData = this.data.popImgData;
		var popId = popImgData.popId;                         // 广告 id ;
		var popType = popImgData.popAdvMemoryOpt;             // 广告类型 ;
		// var popDate = popImgData.popAdvCookieRemainSecond;   // 广告结束时间差 ;
		var popModify = popImgData.modifyDate;               // 广告修改时间 ;

		var storagePopImgData = my.getStorageSync({	key: 'popImgData'}).data;	
		my.uma.trackEvent('homepage_popup_visibility');     // 友盟+统计--弹窗曝光

		var myDate = new Date()
		var month = myDate.getMonth() + 1;              //获取当前月份(0-11,0代表1月)
		var day = myDate.getDate();                     //获取当前日(1-31)
		popImgData.popMonthDay = month + '' + day;

		if (!storagePopImgData) {
			this.setData({
				showToast: true
			});
      that.savePopImgData(popImgData);
		} else {
			var localPopId = storagePopImgData.popId;                                     //本地缓存 广告id
			var localPopType = storagePopImgData.popAdvMemoryOpt;                         //本地缓存 广告类型
			var localPopModify = storagePopImgData.modifyDate;                            //本地缓存 广告修改时间 ;
			if ((popId != localPopId || popType != localPopType || popModify != localPopModify)) {
				this.setData({
					showToast: true
				});
        thata.savePopImgData(popImgData);
			} else if (localPopType == 'EVERY_OPEN_ONCE_SHOW') {
				this.setData({
					showToast: true
				})
			} else if (localPopType == 'ONCE_DAY_SHOW') {
				var localMonthDay = storagePopImgData.popMonthDay;
				if (popImgData.popMonthDay != localMonthDay) {
					this.setData({
						showToast: true
					});
          thata.savePopImgData(popImgData);
				}
			}
		}
	},

  // 缓存广告数据
  savePopImgData(data) {
    my.setStorageSync({
      key: 'popImgData', 
      data: data,
      success: (res) => {
      },
    })
  },

	/**
	  * 关闭广告弹窗
	*/
	closePop: function() {
		this.setData({
			showToast: false
		})
	},

	/**
	   * 获取购物车数量
	*/
	getCartNumber: function() {
		this.data.app.getCartNumber();
	},

	/**
	  * 获取 placeholder value
	*/
	getSearchTextMax() {
		let that = this;
		 http.get( api.search.SEARCHTEXTMAX, {}, (res) => {
			 let resData = res.data;
			if(resData.ret.code == "0" && resData.ret.message == "SUCCESS" && resData.data && resData.data.name) {
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

		switch(ref.props.__tag) {
			case "search-component":
				this.searchComponent = ref
			break;
			case "advertisement":
				this.advertisement = ref
			break;
			default:
			break;
		}
  },
	
	/**
	  * 新版搜索组件开关
	*/
	showSearch: function(noGetHistory) {
		// this.searchComponent.getHistory();
    console.log('点击搜索')
		noGetHistory == 'noGetHistory' ? '' : 	this.searchComponent.getHistory();
		this.setData({
			isShowSearch: !this.data.isShowSearch,
			isFocus: !this.data.isFocus,
		})
		// this.searchComponent.setIsFocus();
	},



});