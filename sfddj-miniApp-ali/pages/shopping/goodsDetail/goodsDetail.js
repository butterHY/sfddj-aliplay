// var _myShim = require('........my.shim');
/**
* 商品详情页
* @author 01368384
*  
*/
my.canIUse('component2');
let WxParse = require('../../../wxParse/wxParse');
let sendRequest = require('../../../utils/sendRequest');
let constants = require('../../../utils/constants');
let utils = require('../../../utils/util');
let baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
let base64imageUrl = constants.UrlConstants.baseImageLocUrl; //图片资源地址前缀
let app = getApp();

import http from '../../../api/http'
import api from '../../../api/api'
import _ from 'underscore'



Page({

	data: {
		buyType: 0,        //0:立即购买，1：加入购物车，2：送礼
		goodsSpecMap: [],   //商品规格map
		iavPath: '',      //规格key
		allProduct: [],     //商品数据
		product: '',     //对应规格的商品
		quantity: 1,
		goodsSn: '',
		goodsId: '',    // 通过 query 传进来商品的 goodsSn 和 goodsId ，但在此商品详情页中并没有使用这个传进来的 goodsId；
		loadComplete: false,
		loadFail: false,
		errMsg: '',
		base64imageUrl: base64imageUrl,
		baseImageLocUrl: constants.UrlConstants.baseImageLocUrl,
		baseImageUrl: baseImageUrl,
		showToast: false,
		cashBackRulePopup: false,
		wifiAvailable: true,
		goodsSecondKill: null,
		isonLoad: false,
		isFirstTime: true,
		spikePrice: null,
		// isSuccess: null,
		isSpikeOver: false,
		commentScore: 0,     //商品好评度
		start: 0,
		limit: 10,
		showGuessPosition: 10000,
		lastShowGuessPosition: 11000,
		floatVal: 50,
		pageOptions: {},       //商详页打开时所带的参数
		user_memId: '默认是会员',         //是否存在memberId，判断是否绑定手机号
	},

	onLoad: async function(query) {

		// 友盟+统计
		// getApp().globalData.uma.trackEvent('goods_show',{goodsSn: query.goodsSn});

		this.setData({
			isonLoad: true,
			pageOptions: query
		});

		// 如果从推文或者其他方进来并且带广告参数时
		var globalQuery = Object.assign({}, app.globalData.query)
		if (globalQuery.goodsSn == query.goodsSn) {
			this.setData({
				pageOptions: Object.assign(this.data.pageOptions, globalQuery)
			})
			// 重置
			getApp().globalData.query = {}
		}

		// 用于测试---清掉token缓存
		// my.clearStorage();

		// 达观数据上报
		// this.da_upload_goods(query.goodsSn)

		// utils.setAdInfoAll(options);
		var that = this;

		if (query.goodsSn) {
			//   console.log(query.goodsSn)
			that.data.goodsSn = query.goodsSn;
			this.setData({
				goodsSn: that.data.goodsSn
			})
			that.getGoodsDetail(that.data.goodsSn);
		}
		that.getCartNumber();




	},

	onShow: async function() {
		var that = this;


		// utils.getNetworkType(this);
		// 原有的写法，如果是进来的上一个路径是商品详情页，则页面重新请求数据，
		// if(app.globalData.options.path == 'pages/shopping/goodsDetail/goodsDetail'){
		//   this.data.goodsSn = app.globalData.options.query.goodsSn;
		//   this.setData({
		//     goodsSn: this.data.goodsSn
		//   })
		//    that.getGoodsDetail(that.data.goodsSn);
		// }


		// 新的写法，如果显示，只要不是页面初始化，那就重新执行倒计时，因为我得判断活动是否过期；
		// 最新的写法，如果是从确认订单页返回再返回，应该重新请求数据以更新库存，还有如果现在还不是秒杀商品，但返回后刚好这个商品正处于秒杀活动时间内，这就得重新请求数据获取时间进行倒计时
		if (!this.data.isonLoad) {
			clearTimeout(getApp().globalData.goodsDetail_spikeTime);
			var isSuccess = await that.getGoodsDetail(that.data.goodsSn);
			if (isSuccess.type && this.data.goodsSecondKill) {
				this.spikePrice.getTimes(this.data.isFirstTime)
			}

		}

	},


	// 页面隐藏
	onHide() {
		clearTimeout(getApp().globalData.goodsDetail_spikeTime);
		this.setData({
			isonLoad: false,
		})
	},

	// 页面被关闭
	onUnload() {
		clearTimeout(getApp().globalData.goodsDetail_spikeTime)
	},



	/**
	 * 获取商品评价
	 * @param goodsId 商品id
	 */

	async getComment(goodsId) {
		//var goodsId = 10058
		var that = this;
		sendRequest.send(constants.InterfaceUrl.GET_GOODS_DETAIL_COMMENT, { goodsId: goodsId }, function(res) {
			var goodsCommentList = res.data.result.goodsCommentList;
			if (goodsCommentList.length > 0) {
				// 获取商品评论的好评度
				that.getCommentScore(goodsId)
				var comment = goodsCommentList[0];
				if (comment) {
					comment.createDate = utils.formatTime(new Date(comment.createDate));
					if (comment.imagePath) {
						var arr = comment.imagePath.split(',');
						comment.imagePath = arr;
					}
				}
				that.setData({
					showComment: true,
					goodScore: res.data.result.goodScore,
					goodsCommentTotal: res.data.result.goodsCommentTotal,
					comment: comment,
					baseImageUrl: baseImageUrl
				});

				// 设置猜你喜欢的位置
				// that.setGuessPosition();
			} else {
				that.setData({
					showComment: false
				});
			}
		}, function(res) { }, "GET");
	},

	// 获取评论的好评度
	getCommentScore(goodsId) {
		let that = this;
		http.get(api.COMMENT.GET_COMMENT_SCORE, { goodsId }, res => {
			that.setData({
				commentScore: res.data.data
			})
		}, err => { })
	},

	/**
	 * 获取购物车数量
	 */
	getCartNumber: function() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.SHOP_GET_COUNT, {}, function(res) {
			that.setData({
				count: res.data.result.count
			});
		}, function(res) { });
	},

	/**
	 * 访问后台接口获取商品详情
	 * @param goodsSn 商品sn
	 */
	getGoodsDetail: function(goodsSn) {
		var that = this;
		return new Promise((reslove, reject) => {
			sendRequest.send(constants.InterfaceUrl.GOODS_DETAIL, { goodsSn: goodsSn }, function(res) {

				// 判断是否绑定了手机
				try {
					let user_memId = my.getStorageSync({
						key: "user_memId",
					}).data;
					that.setData({
						user_memId: user_memId == 'null' || user_memId == null || user_memId == 'undefined' || user_memId == undefined ? '默认是会员' : user_memId
					})
				} catch (e) {
				}

				var result = res.data.result ? res.data.result : {};

				// 友盟+统计
				//进来就统计的
				getApp().globalData.uma.trackEvent('goodsDetailPageView', { channel_source: 'mini_alipay', supplierName: result.nickName, supplierId: result.supplierId, goodsName: result.name, goodsSn: result.goodSn, goodsCategoryId: result.goodsCategoryId });
				// 如果是从别的广告进来的则统计
				if (that.data.pageOptions.utm_source && that.data.pageOptions.utm_source != 'undefined' && that.data.pageOptions.utm_source != 'null') {
					getApp().globalData.uma.trackEvent('goodsDetailPage_source', { utm_source: that.data.pageOptions.utm_source, utm_medium: that.data.pageOptions.utm_medium, utm_campaign: that.data.pageOptions.utm_campaign, utm_content: that.data.pageOptions.utm_content, utm_term: that.data.pageOptions.utm_term })
				}

				//当请求返回成功才请求评论
				if (res.data.message == 'success') {
					var id = res.data.result.id;
					that.getComment(id);

					// 请求获取猜你喜欢的数据
					that.getGuessLike(id, true)
				}

				var article = res.data.result.introduction;
				res.data.result.headPortraitPath = result.headPortraitPath ? that.data.baseImageUrl + result.headPortraitPath : that.data.baseImageLocUrl + 'miniappImg/icon/icon_default_head.jpeg'
				var allProduct = res.data.allProduct;
				that.data.allProduct = res.data.allProduct;
				var minCount = res.data.result.minCount ? res.data.result.minCount : 1; //最少起售数
				var goodsSecondKill = res.data.goodsSecondKill;     // 秒杀商品数据
				that.data.minCount = minCount;

				// 判断是否是会员商品
				that.data.SFmember = result.memberGoods ? true : false;

				// 判断是否多规格 
				if (result.isSpecificationEnabled) {
					// 如果是多规格的话，就用数据返回的goodsSpecMap
					that.data.goodsSpecMap = res.data.goodsSpecMap;
				} else {
					// 如果不是多规格，就用allProduct来循环goodsSpecMap
					that.data.goodsSpecMap = [{ iakValue: [], iakId: res.data.goodsSpecMap[0].iakId, iakName: res.data.goodsSpecMap[0].iakName }];
					for (var key in allProduct) {
						that.data.goodsSpecMap[0].iakValue.push({});
						that.data.goodsSpecMap[0].iakValue[key].iakId = that.data.goodsSpecMap[0].iakId;
						that.data.goodsSpecMap[0].iakValue[key].iavValue = allProduct[key].name;
						that.data.goodsSpecMap[0].iakValue[key].id = parseInt(allProduct[key].iavPath);
						// that.data.goodsSpecMap[0].iakValue[key].tuanPrice = 
					}
				}

				var theMemberPoint = 0;
				// 获取默认的memberPoint
				if (res.data.allProduct) {
					for (var key in res.data.allProduct) {
						if (res.data.allProduct[key].isDefault) {
							theMemberPoint = res.data.allProduct[key].memberPoint;
							that.data.theCostMemberScore = res.data.allProduct[key].costMemberScore;
							that.data.theAwardMemberScore = res.data.allProduct[key].awardMemberScore;
						}
					}
				}

				// 判断是否积分商品,积分商品type==3
				if (res.data.result.isJifen) {
					var type = 3;
				}

				// 判断是否购物返现商品,积分商品type==4
				if (res.data.result.isRefundMoney) {
					var type = 4;
				}

				that.setGoodsSpecMap();
				that.setData({
					goods: res.data.result,
					categoryAttrKeyList: res.data.categoryAttrKeyList,
					// guessLikeGoods: res.data.guessLikeGoods,
					groupNameTopList: res.data.groupNameTopList,
					otherGoods: res.data.otherGoods,
					goodsSecondKill: res.data.goodsSecondKill,    // 秒杀商品数据

					goodsSpecMap: that.data.goodsSpecMap,
					product: that.data.product,
					quantity: minCount,
					minCount: that.data.minCount,
					loadComplete: true,
					theMemberPoint: theMemberPoint,
					type: type ? type : '', //积分商品 type = 3,用来判断选规格的价格那里的显示 
					theCostMemberScore: that.data.theCostMemberScore ? that.data.theCostMemberScore : 0, //顺丰会员会员消耗积分
					theAwardMemberScore: that.data.theAwardMemberScore ? that.data.theAwardMemberScore : 0, //顺丰会员会员奖励积分
					SFmember: that.data.SFmember
				});
				WxParse.wxParse('article', 'html', article, that, 0);


				if (res.data.message == 'success') {
					reslove({
						type: true
					})
				}
			}, function(err) {
				that.setData({
					loadComplete: true,
					loadFail: true,
					errMsg: err ? err : ''
				});
				reject({
					type: false
				})
			});
		})

	},

	// 获取达观推荐的商品---猜你喜欢
	async getGuessLike(goodsId, isFirst) {
		let that = this;
		http.get(api.GUESSLIKE, { start: this.data.start, limit: this.data.limit, sceneType: 'detail', is_first: isFirst, goodsId }, res => {

			let guessLikeGoods = res.data.data ? res.data.data : []

			that.setData({
				guessLikeGoods
			})
			// this.setGuessPosition()
		}, err => { })
	},

	// 设置滚动到猜你喜欢的位置
	setGuessPosition() {
		my.createSelectorQuery().select('.js_guessLike').boundingClientRect().exec(res => {
			let result = res[0]
			if (result && result != 'null' && result != 'undefined') {
				let showGuessPosition = result.top - getApp().globalData.systemInfo.windowHeight + result.height / 2 + utils.rpx2Px(98)
				let lastShowGuessPosition = result.top + result.height * 2 / 3
				this.setData({
					showGuessPosition,
					lastShowGuessPosition
				})

				// 如果不用滚动就显示的话，就直接筛选一次
				if (showGuessPosition < (getApp().globalData.systemInfo.windowHeight - utils.rpx2Px(98))) {
					this.guessLike_da_filter();
				}
			}
		});
	},

	// 猜你喜欢商品列表滚动事件，要筛选达观数据上报
	guessLikeScroll: _.debounce(function(e) {
		// this.guessLike_da_filter();
	}, 300),


	// 达观数据上报
	da_upload_goods(goodsSn) {

		// 上报数据
		utils.uploadClickData_da('rec_click', [{ goodsSn: goodsSn }])
	},

	/**
	 * 初始化iavPath、goodsSpec、allProduct
	 */
	setGoodsSpecMap: function() {
		var that = this;
		that.data.iavPath = '';
		var goodsSpecMap = that.data.goodsSpecMap;
		var allProduct = that.data.allProduct;
		var iavPathArr = [];
		for (var j = 0; j < allProduct.length; j++) {
			if (allProduct[j].isDefault) {
				that.data.iavPath = allProduct[j].iavPath;
				var iavPath = allProduct[j].iavPath;

				if (iavPath.indexOf(',')) {
					iavPathArr = iavPath.split(',');
				}
				for (var i = 0; i < goodsSpecMap.length; i++) {
					var iakValue = goodsSpecMap[i].iakValue;
					for (var key in goodsSpecMap[i].iakValue) {
						for (var kk in iavPathArr) {
							if (goodsSpecMap[i].iakValue[key].id == parseInt(iavPathArr[kk])) {
								that.data.goodsSpecMap[i].iakValue[key].taped = true;
							}
						}
					}
				}
			}
		}

		this.setProduct();
	},

	/**
	 * 更新规格界面显示
	 */
	updateGoodsSpecMap: function(fatherIndex, index) {
		var that = this;
		var goodsSpec = that.data.goodsSpecMap[fatherIndex];
		var iakValue = goodsSpec.iakValue;
		iakValue.forEach(function(value, i, arr) {
			if (i == index) {
				value.taped = true;
				that.setIavPath(fatherIndex, value.id);
			} else {
				value.taped = false;
			}
		});
	},

	/**
	 * 修改iavPath，调用setProduct更新product
	 */
	setIavPath: function(index, id) {
		var that = this;
		var arr = that.data.iavPath.split(',');
		arr[index] = id + '';
		that.data.iavPath = arr.toString();
		this.setProduct();
	},

	/**
	 * 根据iavPath更新product
	 */
	setProduct: function() {
		var that = this;
		that.data.allProduct.forEach(function(value, index, arr) {
			// that.data.allProduct
			value.tuanPrice = value.tuangouPrices * that.data.minCount;                              // 团购商品价格
			value.goodsPrice = value.salePrice * that.data.minCount;                                 // 普通商品价格
			value.secondKillPrice = value.activitysPrice * that.data.minCount;                       // 秒杀商品价格

			value.thisMemberPoint = value.memberPoint * that.data.minCount;                          // 积分商品积分
			value.thisReturnMoneyPrice = (value.returnMoneyPrice * that.data.minCount).toFixed(2);   // 购物返现商品价格
			value.memberPriceAll = (value.memberPrice * that.data.minCount).toFixed(2);              //  memberPriceAll 会员商品价格
			value.costMemberScoreAll = value.costMemberScore * that.data.minCount;                   //  会员商品积分
			value.awardMemberScoreAll = value.awardMemberScore * that.data.minCount;                 //  会员商品奖励会员积分

			if (that.data.iavPath == value.iavPath) {
				that.data.product = value;
			}
		});
	},

	/**
	 * 点击swiper图片
	 */
	imageViewTap: function(e) {
		my.previewImage({
			urls: e.currentTarget.dataset.urls,
			current: e.currentTarget.dataset.current
		});
	},

	/**
	* 查看图片
	*/
	commentViewTap: function(e) {
		var urls = e.currentTarget.dataset.urls;
		var url = baseImageUrl + e.currentTarget.dataset.current;
		var newUrls = [];
		urls.forEach(function(v, i, arr) {
			v = baseImageUrl + v;
			newUrls.push(v);
		});
		my.previewImage({
			urls: newUrls,
			current: url
		});
	},

	/**
	 * 切换商品详情和售后服务
	 */
	switchDetailShowTap: function(e) {
		this.setData({
			hideDetailTag: e.currentTarget.id == "1"
		});
	},

	/**
	 * 点击添加购物车
	 */
	addCart: function(e) {
		this.data.buyType = 1;
		this.setData({
			showGoodsSpec: true
		});
	},

	/**
	 * 点击立即购买
	 */
	buyNow: function(e) {
		this.data.buyType = 0;
		this.setData({
			showGoodsSpec: true
		});
	},

	//   如果活动结束了，那就禁止按钮
	onSpikeOver: function() {
		this.setData({
			isSpikeOver: true
		})
	},


	/**
	 * 点击送礼
	 */
	sendGift: function(e) {
		this.data.buyType = 2;
		this.setData({
			showGoodsSpec: true
		});
	},

	/**
	 * 点击隐藏规格dialog
	 */
	colseSpecDialog: function(e) {
		this.setData({
			showGoodsSpec: false,
			showGiftBomb: false
		});
	},

	/**
	 * 点击规格item，切换规格
	 */
	specItemTap: function(e) {
		var that = this;
		var fatherIndex = e.currentTarget.dataset.fatherindex;
		var index = e.currentTarget.dataset.index;
		this.updateGoodsSpecMap(fatherIndex, index);
		this.setData({
			goodsSpecMap: that.data.goodsSpecMap,
			product: that.data.product,
			quantity: that.data.minCount //再次初始化为最低起售数
		});
		if (that.data.product.store != 0) {
			return;
		} else {
			that.setData({
				showToast: true,
				showToastMes: '该商品库存不足'
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 1000);
		}
	},

	/**
	 * 减数量，不能小于0
	 */
	subtractTap: function(e) {
		var that = this;
		if (that.data.quantity == that.data.minCount) {
			that.setData({
				showToast: true,
				showToastMes: '该商品起售量不能低于' + that.data.minCount
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 1500);
			return;
		}
		that.data.quantity--;
		that.data.product.goodsPrice = (that.data.quantity * that.data.product.salePrice).toFixed(2);
		// 数量减减，秒杀价格 * 新数量
		if (that.data.product.activitysPrice) {
			that.data.product.secondKillPrice = (that.data.quantity * that.data.product.activitysPrice).toFixed(2);
		};

		if (that.data.product.memberPoint) {
			that.data.product.thisMemberPoint = that.data.product.memberPoint * that.data.quantity;
		}
		if (that.data.product.returnMoneyPrice && that.data.goods.isRefundMoney) {
			that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoneyPrice * that.data.quantity).toFixed(2);
		}
		if (that.data.SFmember) {
			that.data.product.memberPriceAll = (that.data.product.memberPrice * that.data.quantity).toFixed(2);
			that.data.product.costMemberScoreAll = that.data.product.costMemberScore * that.data.quantity;
			that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * that.data.quantity;
		}
		this.setData({
			quantity: that.data.quantity + '',
			product: that.data.product
		});
	},

	/**
	 * 加数量，不能大于99
	 */
	addTap: function(e) {
		var that = this;
		var maxCount = that.data.product.store && that.data.product.store <= 99 ? that.data.product.store : 99;
		if (that.data.quantity == 99) {
			var mes = that.data.product.store && that.data.product.store <= 99 ? '库存只有' + that.data.product.store + '，不能太贪心喔' : '最多只能99，不要太贪心哦';
			that.setData({
				showToast: true,
				showToastMes: mes
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 1500);
			return;
		}
		that.data.quantity++;
		that.data.product.goodsPrice = (that.data.quantity * that.data.product.salePrice).toFixed(2);
		// 数量加加，秒杀价格 * 新数量
		if (that.data.product.activitysPrice) {
			that.data.product.secondKillPrice = (that.data.quantity * that.data.product.activitysPrice).toFixed(2);
		};

		if (that.data.product.memberPoint) {
			that.data.product.thisMemberPoint = that.data.product.memberPoint * that.data.quantity;
		}
		if (that.data.product.returnMoneyPrice && that.data.goods.isRefundMoney) {
			that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoneyPrice * that.data.quantity).toFixed(2);
		}
		if (that.data.SFmember) {
			that.data.product.memberPriceAll = (that.data.product.memberPrice * that.data.quantity).toFixed(2);
			that.data.product.costMemberScoreAll = that.data.product.costMemberScore * that.data.quantity;
			that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * that.data.quantity;
		}
		this.setData({
			quantity: that.data.quantity + '',
			product: that.data.product
		});
	},

	/**
	* 点击数据输入数量
	* */
	changeQuantity: function(e) {
		var quantity = e.detail.value;
		var that = this;
		var maxCount = that.data.product.store && that.data.product.store <= 99 ? that.data.product.store : 99;

		if (quantity >= maxCount) {
			var mes = that.data.product.store && that.data.product.store <= 99 ? '库存只有' + that.data.product.store + '，不能太贪心喔' : '最多只能99，不要太贪心哦';
			that.data.product.goodsPrice = (that.data.product.salePrice * maxCount).toFixed(2);
			that.data.product.tuanPrice = (that.data.product.tuangouPrices * maxCount).toFixed(2);

			// 输入数量，秒杀价格 * 新数量
			if (that.data.product.activitysPrice) {
				that.data.product.secondKillPrice = (maxCount * that.data.product.activitysPrice).toFixed(2);
			};

			if (that.data.product.memberPoint) {
				that.data.product.thisMemberPoint = that.data.product.memberPoint * maxCount;
			}
			if (that.data.product.returnMoneyPrice && that.data.goods.isRefundMoney) {
				that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoneyPrice * maxCount).toFixed(2);
			}
			if (that.data.SFmember) {
				that.data.product.memberPriceAll = (that.data.product.memberPrice * that.data.quantity).toFixed(2);
				that.data.product.costMemberScoreAll = that.data.product.costMemberScore * that.data.quantity;
				that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * that.data.quantity;
			}
			that.setData({
				showToast: true,
				showToastMes: mes,
				quantity: maxCount,
				product: that.data.product
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 2000);
		} else {
			that.data.product.goodsPrice = (that.data.product.salePrice * quantity).toFixed(2);
			that.data.product.tuanPrice = (that.data.product.tuangouPrices * quantity).toFixed(2);

			// 输入数量，秒杀价格 * 新数量
			if (that.data.product.activitysPrice) {
				that.data.product.secondKillPrice = (quantity * that.data.product.activitysPrice).toFixed(2);
			};

			if (that.data.product.memberPoint) {
				that.data.product.thisMemberPoint = that.data.product.memberPoint * quantity;
			}
			if (that.data.product.returnMoneyPrice && that.data.goods.isRefundMoney) {
				that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoneyPrice * quantity).toFixed(2);
			}
			if (that.data.SFmember) {
				that.data.product.memberPriceAll = (that.data.product.memberPrice * that.data.quantity).toFixed(2);
				that.data.product.costMemberScoreAll = that.data.product.costMemberScore * that.data.quantity;
				that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * that.data.quantity;
			}
			that.setData({
				quantity: quantity,
				product: that.data.product
			});
		}
	},

	/**
	 *输入数量失去焦点       
	 * 
	*/
	inputBlur: function(e) {
		var quantity = e.detail.value;
		var that = this;
		var minCount = that.data.minCount;
		if (quantity <= minCount || quantity == '') {
			that.data.product.goodsPrice = (that.data.product.salePrice * minCount).toFixed(2);
			that.data.product.tuanPrice = (that.data.product.tuangouPrices * minCount).toFixed(2);

			// 输入数量，秒杀价格 * 新数量
			if (that.data.product.activitysPrice) {
				that.data.product.secondKillPrice = (minCount * that.data.product.activitysPrice).toFixed(2);
			};

			if (that.data.product.memberPoint) {
				that.data.product.thisMemberPoint = that.data.product.memberPoint * minCount;
			}
			if (that.data.product.returnMoneyPrice && that.data.goods.isRefundMoney) {
				that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoneyPrice * minCount).toFixed(2);
			}
			if (that.data.SFmember) {
				that.data.product.memberPriceAll = (that.data.product.memberPrice * that.data.quantity).toFixed(2);
				that.data.product.costMemberScoreAll = that.data.product.costMemberScore * that.data.quantity;
				that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * that.data.quantity;
			}
			this.setData({
				quantity: minCount,
				product: that.data.product
			});
		}
	},

	cartTap: function(e) {
		my.navigateTo({
			url: '/pages/cart/cart'
		});
	},

	/** 
	 *点击什么是送礼方式
	 *
	 */
	theway: function(e) {
		this.setData({
			showTheway: true,
			showGiftBomb: false
		});
	},

	/**
	 * 点击规格选择确认按钮
	 */
	goodsSpecSubmitTap: function(e) {
		var that = this;
		if (Number(that.data.quantity) > that.data.product.store) {
			that.setData({
				showToast: true,
				showToastMes: '没有库存了'
			});
			setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 1000);
			return;
		}
		this.setData({
			showGoodsSpec: false
		});
		switch (this.data.buyType) {
			case 0:
				//立即购买
				that.toBuyNow();
				break;
			case 1:
				//添加购物车
				that.toAddCart();
				break;
			case 2:
				//送礼
				if (that.data.quantity >= 2) {
					this.setData({
						showGiftBomb: true
					});
				} else {
					that.sendOnePerson();
				}
				break;
			default:
				//默认立即购买
				that.toBuyNow();
				break;
		}
	},

	bombClose: function(e) {
		this.setData({
			showTheway: false,
			showGiftBomb: false
		});
	},

	/**
	 * 立即购买
	 */
	toBuyNow: function() {
		var that = this;
		// 友盟+ 立即购买点击
		this.umaTrackEvent('buyNow')
		my.navigateTo({
			url: '/pages/shopping/confirmOrder/confirmOrder?&productId=' + that.data.product.id + '&quantity=' + that.data.quantity + '&SFmember=' + that.data.SFmember
		});
	},

	/**
	 * 单人送礼
	 */
	sendOnePerson: function() {
		var that = this;
		var showType = 1;
		my.navigateTo({
			url: '/pages/shopping/confirmOrder/confirmOrder?&productId=' + that.data.product.id + '&quantity=' + that.data.quantity + '&isGiftOrder=true' + '&showType=' + showType
		});
	},

	/**
	 * 多人送礼
	 */
	sendManyPerson: function() {
		var showType = 2;
		var that = this;
		my.navigateTo({
			url: '/pages/shopping/confirmOrder/confirmOrder?&productId=' + that.data.product.id + '&quantity=' + that.data.quantity + '&isGiftOrder=true' + '&showType=' + showType
		});
	},

	/**
	 * 添加购物车
	 */
	toAddCart: function() {
		var that = this;

		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: that.data.product.id, quantity: that.data.quantity + '' }, function(res) {
			if (res.data.errorCode == '0001') {

				// 达观数据上报
				// utils.uploadClickData_da('cart', [{ productId: that.data.product.id, actionNum: '1' }])

				//友盟+  加入购物车点击
				that.umaTrackEvent('addCart')

				my.showToast({
					content: '添加购物车成功'
				});
				that.getCartNumber(); //获取购物车数量
			}
		}, function(res) {
			// wx.showToast({
			//   title: '添加购物车失败',
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

	// 点击全赔保障框弹出弹窗
	showCompensationRuleFn() {
		var that = this;
		that.setData({
			showCompensationRule: true
		});
	},

	//关闭全赔规则弹窗
	closeCompensationRule() {
		var that = this;
		that.setData({
			showCompensationRule: false
		});
	},

	// 点击返现金额内容弹出规则弹窗
	showCashBackRuleFn() {
		var that = this;
		that.setData({
			cashBackRulePopup: true
		});
	},

	// 关闭返现规则弹窗
	closeCashBackRule() {
		var that = this;
		that.setData({
			cashBackRulePopup: false
		});
	},

	/**
	 * 送TA
	 */
	toSendGift: function() {
		var that = this;
		my.navigateTo({
			url: '/pages/shopping/confirmOrder/confirmOrder?&productId=' + that.data.product.id + '&quantity=' + that.data.quantity + '&isGiftOrder=true'
		});
	},
	onShareAppMessage: function(e) {
		var that = this;
		return {
			title: "【顺丰包邮】" + '【￥' + that.data.goods.salePrice + '】' + that.data.goods.name,
			path: '/pages/shopping/goodsDetail/goodsDetail?goodsSn=' + that.data.goodsSn + '&goodsId=' + that.data.goodsId
		};
	},

	backToHome: function() {
		my.navigateTo({
			url: '/pages/home/home'
		});
	},

	// 跳转去商家店铺页
	goToTargetPage(e) {
		let { url, type } = e.currentTarget.dataset

		if (type == 'supplier') {
			// 友盟+  商家点击
			this.umaTrackEvent('supplier')

		}
		else if (type == 'comment') {
			// 友盟+  商家点击
			this.umaTrackEvent('comment')

		}

		my.navigateTo({
			url: url
		})
	},

	// 跳去客服网页版
	goToWebCall: function() {
		var that = this;
		var webCallLink = that.data.goods.webCallParam;

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


	// 页面滚动事件
	_onPageScroll: _.debounce(function(e) {
		let { scrollTop } = e;
		// 只有滚动到猜你喜欢的位置时才筛选可上报的数据
		if (scrollTop >= this.data.showGuessPosition && scrollTop <= this.data.lastShowGuessPosition) {
			this.guessLike_da_filter();
		}
	}, 300),

	// 猜你喜欢达观统计筛选
	guessLike_da_filter() {
		let da_uploadData = [];
		let { windowHeight, windowWidth } = getApp().globalData.systemInfo;

		// 循环筛选可上报的数据
		for (let i = 0; i < this.data.guessLikeGoods.length; i++) {
			let goodsClass = '.js_goodsList_' + i;
			let item = this.data.guessLikeGoods[i];
			if (!item.isLoaded) {
				my.createSelectorQuery().select(goodsClass).boundingClientRect().exec(res => {
					let result = res[0]
					if (result && result != 'null' && result != 'undefined') {
						if (result.top < (windowHeight - utils.rpx2Px(98)) && result.bottom > (0 + this.data.floatVal) && result.left >= 0 && (result.right - this.data.floatVal) < windowWidth) {
							let { goodsSn } = item;
							let setGuessLikeLoad = "guessLikeGoods[" + i + "].isLoaded";
							da_uploadData.push({ goodsSn })
							this.setData({
								[setGuessLikeLoad]: true
							})
							// 如果一次性已加载完则上传数据
							if (i == (this.data.guessLikeGoods.length - 1)) {
								if (da_uploadData && Object.keys(da_uploadData).length > 0) {
									utils.uploadClickData_da('rec_show', da_uploadData)
								}
							}
						}
						else {
							// 如果一次性已加载完则上传数据
							if (i == (this.data.guessLikeGoods.length - 1)) {
								if (da_uploadData && Object.keys(da_uploadData).length > 0) {
									utils.uploadClickData_da('rec_show', da_uploadData)
								}
							}
						}
					}
					else {
						// 如果一次性已加载完则上传数据
						if (i == (this.data.guessLikeGoods.length - 1)) {
							if (da_uploadData && Object.keys(da_uploadData).length > 0) {
								utils.uploadClickData_da('rec_show', da_uploadData)
							}
						}
					}
				})
			}
			else {
				// 如果一次性已加载完则上传数据
				if (i == (this.data.guessLikeGoods.length - 1)) {
					if (da_uploadData && Object.keys(da_uploadData).length > 0) {
						utils.uploadClickData_da('rec_show', da_uploadData)
					}
				}
			}

		}


	},
	// getNetworkType() { 
	//   my.getNetworkType({
	//     success: (res) => { 
	//      this.setData({
	//         wifiAvailable: res.networkAvailable
	//       })
	//     }
	//   }); 
	// }


	// 获取手机号
	getPhoneNumber: function(e) {
		var that = this;

		my.getPhoneNumber({
			success: (res) => {
				let response = res.response
				sendRequest.send(constants.InterfaceUrl.USER_BINGMOBILEV4, {
					response: response,
				}, function(res) {
					console.log(res)
					if (res.data.result) {
						try {
							my.setStorageSync({ key: constants.StorageConstants.tokenKey, data: res.data.result.loginToken });
							my.setStorageSync({ key: 'user_memId', data: res.data.result.memberId });
						} catch (e) {
							my.setStorage({ key: 'user_memId', data: res.data.result.memberId });
						}
					}
					else {

					}



					my.showToast({
						content: '绑定成功'
					})
					that.setData({
						user_memId: res.data.result ? res.data.result.memberId : '默认会员'
					})
				}, function(res, resData) {
					var resData = resData ? resData : {}
					if (resData.errorCode == '1013') {
						that.setData({
							user_memId: '默认会员'
						})
						my.setStorage({ key: 'user_memId', data: '默认会员' });
					}
					else {
						my.showToast({
							content: res
						})

					}

				});
			},
			fail: (res) => {
				my.navigateTo({
					url: '/pages/user/bindPhone/bindPhone'
				});
			},
		});

	},


	// 获取手机号失败
	onAuthError(res) {
		// my.navigateTo({
		// 	url: '/pages/user/bindPhone/bindPhone'
		// });
		return
	},

	// 友盟+数据上报  ---立即购买、加入购物车、商家、评论
	umaTrackEvent(type) {
		let umaData = {}
		let { pageOptions, goods } = this.data
		umaData.channel_source = pageOptions.utm_source ? pageOptions.utm_source : 'mini_alipay' //来源
		umaData.supplierName = goods.nickName  //商家名称
		umaData.supplierId = goods.supplierId   //商家id
		umaData.goodsName = goods.name        //商品名称
		umaData.goodsSn = goods.goodSn       //商品id/商品编码
		umaData.goodsCategoryId = goods.goodsCategoryId  //商品分类id

		if (type == 'buyNow') {

			// 友盟+统计  ----商详立即购买点击
			getApp().globalData.uma.trackEvent('goodsDetail_buyNow', umaData);
		}
		else if (type == 'addCart') {
			// 友盟+统计  ----商详加入购物车点击
			getApp().globalData.uma.trackEvent('goodsDetail_addCart', umaData);

		}
		else if (type == 'supplier') {

			// 友盟+统计  ----商详商家点击
			getApp().globalData.uma.trackEvent('goodsDetail_custService', umaData);
		}
		else if (type == 'comment') {
			// 友盟+统计  ----商详评论点击
			getApp().globalData.uma.trackEvent('goodsDetail_comment', umaData);

		}
	},

});