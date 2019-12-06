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
let baseImageUrl = constants.UrlConstants.baseImageUrl;         //  测试环境/生产环境 图片资源地址前缀
let base64imageUrl = constants.UrlConstants.baseImageLocUrl;    //  生产环境图片资源地址前缀
let app = getApp();

import http from '../../../api/http'
import api from '../../../api/api'
import _ from 'underscore'



Page({
	data: {
		buyType: 0,                             // 0:立即购买，1：加入购物车，2：送礼
		goodsSpecMap: [],                       // 全部商品父类规格
		iavPath: '',                            // 当前选中的子类规格的 id 组合（可能一个或者多个）
		allProduct: [],                         // 全部商品子类规格数据
		product: '',                            // 当前选中的规格
		quantity: 1,                            // 规格的数量
		goodsSn: '',
		goodsId: '',                            // 通过 query 传进来商品的 goodsSn 和 goodsId 
		loadComplete: false,                    // 页面加载完成
		loadFail: false,                        // 页面加载失败
		errMsg: '',
		base64imageUrl: base64imageUrl,
		baseImageLocUrl: constants.UrlConstants.baseImageLocUrl,
		baseImageUrl: baseImageUrl,
		showToast: false,
		cashBackRulePopup: false,
		wifiAvailable: true,
		goodsSecondKill: null,                    // 秒杀数据
		isonLoad: false,                          // 页面是否是初始化
		spikePrice: null,                         // 秒杀价格
		isSpikeOver: false,                       // 秒杀倒计时是否完毕
		showGuessPosition: 10000,
		lastShowGuessPosition: 11000,
		floatVal: 50,

    // 优惠券导航栏
    // couponBarData: [],

    // 领券弹窗相关数据
    isShowPopup: false,
    swiperCurrent: 0,
    titleCurrent: 0,
    suctionTop: 1,
    flag: true,                                 // 监听产详和售后的节流开关
    isTitleViewClone: false,                    // 商品详情页和服务售后的导航克隆,
    startCoupon: 0,                           
		limitCoupon: 4,
    hasMore: true,
		isLoadMore: false,
    loadComplete: false,
    couponDataList: [],

    // 收货地址弹窗
    isShowAddressPop: false,
		nonDeliveryArea: false, 										// 是否是不发货地区 

    // 规格数据
    goods: null,                                // 新的商品详情页接口的商品数据
    specType: null,                             // 新的商品详情页接口的商品规格类型
    xgCount: null,                              // 任选规格需要满足选中的子类规格个数
    optionalProduct: [],                        // 任选规格选中子类规格数组
    multiDimension: null,                       // 多选规格的维度
    multiProduct: [],                           // 多选规格每一个子类规格可以组成的组合规格；
    multiformname: null,                        // 多选规格显示的名称；
    selectedSpecsBar: false,                    // 已选规格展示导航栏

    // 返回顶部或首页的导航的节流开关
    setComeBack: true,

    pageOptions: {},                            // 商详页打开时所带的参数
    user_memId: '默认是会员',                   //  是否存在 memberId，判断是否绑定手机号
    priceInfo: {}                              //  商详页不同商品类型的价格和积分和返现数据；
	},

	onLoad: async function(query) {
    var that = this;
		this.setData({
			isonLoad: true,
      pageOptions: query,
		});
		// 达观数据上报
		// this.da_upload_goods(query.goodsSn)
		// utils.setAdInfoAll(options);
		if (query.goodsSn) {
			that.data.goodsSn = query.goodsSn;
			this.setData({
				goodsSn: that.data.goodsSn
			})
			// that.getGoodsDetail(that.data.goodsSn);                              // 旧的商品详情数据请求------原有的写法，因调试新接口暂时注释掉

			that.getNewGoodsDetail(that.data.goodsSn)                             // 新的获取商品详情数据，现主要是用来替换旧的商详数据；
		}
		that.getCartNumber();
	},

	onShow: async function() {
		var that = this;
    let defaultAddress = my.getStorageSync({
      key: 'defaultAddress', // 缓存数据的默认地址
    });
		console.log('全局的 ID',getApp().globalData.NowAddrId);
		
		// 新的写法，如果显示，只要不是页面初始化，那就重新执行倒计时，因为我得判断活动是否过期；
		// 最新的写法，如果是从确认订单页返回再返回，应该重新请求数据以更新库存，还有如果现在还不是秒杀商品，但返回后刚好这个商品正处于秒杀活动时间内，这就得重新请求数据获取时间进行倒计时
		if (!that.data.isonLoad) {
      console.log('我只是显示');
			that.data.startCoupon = 0;
			that.data.limitCoupon = 4;
			clearTimeout(getApp().globalData.goodsDetail_spikeTime);
			var isSuccess = await that.getNewGoodsDetail(that.data.goodsSn);           // 旧的商品详情数据请求 
			if (isSuccess.type && that.data.goods.secKillStatus) {
				that.spikePrice.getTimes(true)
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
		clearTimeout(getApp().globalData.goodsDetail_spikeTime);
	},

	/**
	 * 获取商品评价
	 * @param goodsId 商品id
	 */
	getComment(resData) {
		var that = this;     
      var comment = [];
      if(resData.commentList && resData.commentList.length > 0) {                      // commentList 不为 null 或者 undefied;
        resData.commentList.forEach(function(value, index) {
          if(value && (index == 0 || index == 1)) {                                   // commentList 的值不为 null；
            value.createDate = utils.pointFormatTime(new Date(value.createDate));
            comment.push(value);
          }
        })
      }

      if(resData.goodsShowVO.commentTotal > 0) {                                    // 总评论数为空不显示评论模块, 不为空的话且 comment 不为空才渲染评论
        that.setData({
          showComment: true,
          comment: comment,
        });
      } else {
        that.setData({
          showComment: false,
        })
      }
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
	 * 获取优惠券数据
	 */
  getCoupon: function(type) {
    let that = this;
    let data = {
      goodsId: that.data.goodsId,
      start: that.data.startCoupon,
      limit: that.data.limitCoupon
    }
    this.setData({
			isLoadMore: true
		});
    http.post(api.GOODSDETAIL.GOODS_DETAIL_COUPON, data, function(res) {
      console.log('请求回来了')
      let resData = res.data.data;
      if(resData && resData.length > 0) {
        resData.forEach(value => {
          value.beginDateStr = utils.pointFormatTime(new Date(value.beginDate));
          value.endDateStr = utils.pointFormatTime(new Date(value.endDate));
        })
      }                                                         // NO_RECEIVE   还没领  NORMAR 已经领了

      resData && resData.length == that.data.limitCoupon ? that.data.hasMore = true : that.data.hasMore = false;  // 如果返回的数据长度等于请求条数说明还有更多数据

      type == '0' ? that.data.couponDataList = resData : that.data.couponDataList = that.data.couponDataList.concat(resData);  // 0: 初始化; 1: 每次加载拼接进去的数据;

			that.setData({
				couponDataList: that.data.couponDataList,
				hasMore: that.data.hasMore,           // 是否还有更多
				isLoadMore: false,                    // 正在加载中的加载进度条
			});
    }, function(err){
      that.setData({
				isLoadMore: false,
			});
    })
  },

  // 获取 “联系商家”的参数
  getWebCallParam: function(supplierId) {
    let that = this;
    http.get(api.GOODSDETAIL.GOODS_DETAIL_CONTACTSTORE, {supplierId: supplierId.toString()}, function(res) {
      let resData = res.data.data;
      let retData = res.data.ret;
      let webCallParam = null;
      if(retData.code == '0' && retData.message == 'SUCCESS') {
        if(resData.uid) {
          webCallParam = resData.webCallParam+"?uid="+resData.uid+"b"+"&uname="+resData.uname+"&goodsSn="+that.data.goodsSn+"&siteId="+resData.siteId+"&settingId="+resData.settingId+"&mark=sf.365webcall.com";
        } else {
          webCallParam = resData.webCallParam+"?goodsSn="+that.data.goodsSn+"&siteId="+resData.siteId+"&settingId="+resData.settingId+"&mark=sf.365webcall.com";
        }
        that.setData({
          webCallParam: webCallParam
        })
      }
    }, function(err){
    })
  },
  
	/**
	 * 访问后台接口获取商品详情
	 * @param goodsSn 商品sn
	 */
	getGoodsDetail: function(goodsSn) {
		var that = this;
		return new Promise((reslove, reject) => {
			sendRequest.send(constants.InterfaceUrl.GOODS_DETAIL, { goodsSn: goodsSn }, function(res) {
				//当请求返回成功才请求评论和猜你喜欢的数据
				if (res.data.message == 'success') {
					var id = res.data.result.id;
          // 请求获取商品评论；
					that.getComment(id);
					// 请求获取猜你喜欢的数据
					that.getGuessLike(id, true)
				}


				var article = res.data.result.introduction;
				var result = res.data.result;
				res.data.result.headPortraitPath = result.headPortraitPath ? that.data.baseImageUrl + result.headPortraitPath : that.data.baseImageLocUrl + 'miniappImg/icon/icon_default_head.jpeg'
        // (修改单规格逻辑,暂时注释)           ------ start
				// var allProduct = res.data.allPrdouct;                  (修改单规格逻辑,暂时注释)
				// that.data.allProduct = res.data.allProduct;            (修改单规格逻辑,暂时注释)
				// var minCount = res.data.result.minCount ? res.data.result.minCount : 1; //最少起售数   (修改单规格逻辑,暂时注释)
        // that.data.minCount = minCount;                         (修改单规格逻辑,暂时注释)
        // (修改单规格逻辑,暂时注释)        -------  end
				var goodsSecondKill = res.data.goodsSecondKill;     // 秒杀商品数据
				

				// 判断是否是会员商品
				that.data.SFmember = result.memberGoods ? true : false;
        

				// 判断是否多规格 (修改单规格逻辑,暂时注释)           ------ start
				// if (result.isSpecificationEnabled) {
				// 	// 如果是多规格的话，就用数据返回的goodsSpecMap
				// 	that.data.goodsSpecMap = res.data.goodsSpecMap;
				// } else {
				// 	// 如果不是多规格，就用allProduct来循环goodsSpecMap
				// 	that.data.goodsSpecMap = [{ iakValue: [], iakId: res.data.goodsSpecMap[0].iakId, iakName: res.data.goodsSpecMap[0].iakName }];
				// 	for (var key in allProduct) {
				// 		that.data.goodsSpecMap[0].iakValue.push({});
				// 		that.data.goodsSpecMap[0].iakValue[key].iakId = that.data.goodsSpecMap[0].iakId;
				// 		that.data.goodsSpecMap[0].iakValue[key].iavValue = allProduct[key].name;
				// 		that.data.goodsSpecMap[0].iakValue[key].id = parseInt(allProduct[key].iavPath);
				// 		// that.data.goodsSpecMap[0].iakValue[key].tuanPrice = 
				// 	}
				// }
        // 判断是否多规格 (修改单规格逻辑,暂时注释)             -------  end

        // 这是获取会员积分
				var theMemberPoint = 0;
				// 获取默认的memberPoint     (修改单规格逻辑,暂时注释)           ------ start
				// if (res.data.allProduct) {
				// 	for (var key in res.data.allProduct) {
				// 		if (res.data.allProduct[key].isDefault) {
				// 			theMemberPoint = res.data.allProduct[key].memberPoint;
				// 			that.data.theCostMemberScore = res.data.allProduct[key].costMemberScore;
				// 			that.data.theAwardMemberScore = res.data.allProduct[key].awardMemberScore;
				// 		}
				// 	}
				// }
        //获取默认的memberPoint    (修改单规格逻辑,暂时注释)        -------  end

				// 判断是否积分商品,积分商品type==3
				if (res.data.result.isJifen) {
					var type = 3;
				}

				// 判断是否购物返现商品,积分商品type==4
				if (res.data.result.isRefundMoney) {
					var type = 4;
				}

        // (修改单规格逻辑,暂时注释)           ------ start
				// that.setGoodsSpecMap();
        // (修改单规格逻辑,暂时注释)        -------  end

				that.setData({
					goods: res.data.result,
					categoryAttrKeyList: res.data.categoryAttrKeyList,    // 商品出售规格展示和商品图文详情,   没有  js 对 categoryAttrKeyList 做进一步处理；
					// guessLikeGoods: res.data.guessLikeGoods,
					groupNameTopList: res.data.groupNameTopList,  // 当家爆款，      没有  js 对 groupNameTopList 做进一步处理；
					otherGoods: res.data.otherGoods,              // 商家的其他商品， 没有  js 对 otherGoods 做进一步处理；
					goodsSecondKill: res.data.goodsSecondKill,    // 秒杀商品数据

					goodsSpecMap: that.data.goodsSpecMap,         // 父类规格数据
					product: that.data.product,                   // 当前选中的规格
					quantity: that.data.minCount,
					minCount: that.data.minCount,
					loadComplete: true,
					theMemberPoint: theMemberPoint,               // 这是获取会员积分
					type: type ? type : '',                       //积分商品 type = 3,用来判断选规格的价格那里的显示 
					theCostMemberScore: that.data.theCostMemberScore ? that.data.theCostMemberScore : 0, //顺丰会员会员消耗积分
					theAwardMemberScore: that.data.theAwardMemberScore ? that.data.theAwardMemberScore : 0, //顺丰会员会员奖励积分
					SFmember: that.data.SFmember,
          supplierId: res.data.result.supplierId
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

  getNewGoodsDetail: function(goodsSn) {
		var that = this;
		return new Promise((reslove, reject) => {
      http.get(api.GOODSDETAIL.GET_GOODS_DETAIL, { goodsSn }, function(res){
        	var resData = res.data.data;
          var resRet = res.data.ret
					if (resRet.code == '0' && resRet.message ==  'SUCCESS') {
            that.data.goods = resData.goodsShowVO;

            // 判断是否绑定了手机
            try {
              let user_memId = my.getStorageSync({
                key: "user_memId",
              }).data;

              that.setData({
                user_memId: user_memId == 'null' || user_memId == null || user_memId == 'undefined' || user_memId == undefined ? '默认是会员' : user_memId
              })
            } catch (e) {}

            let supplierInfo = resData.goodsShowVO.supplierInfo ? resData.goodsShowVO.supplierInfo : {};

            // 友盟+统计
            //进来就统计的
            getApp().globalData.uma.trackEvent('goodsDetailPageView', { channel_source: 'mini_alipay', supplierName: supplierInfo.nickName, supplierId: supplierInfo.supplierId, goodsName: that.data.goods.goodsName, goodsSn: that.data.goods.goodsSn, goodsCategoryId: that.data.goods.goodsCategoryId });
            // 如果是从别的广告进来的则统计
            if (that.data.pageOptions.utm_source && that.data.pageOptions.utm_source != 'undefined' && that.data.pageOptions.utm_source != 'null') {
              getApp().globalData.uma.trackEvent('goodsDetailPage_source', { utm_source: that.data.pageOptions.utm_source, utm_medium: that.data.pageOptions.utm_medium, utm_campaign: that.data.pageOptions.utm_campaign, utm_content: that.data.pageOptions.utm_content, utm_term: that.data.pageOptions.utm_term })
            }



            //当请求返回成功才请求评论和猜你喜欢的数据
            that.data.goodsId = resData.goodsShowVO.goodsId;
            // 处理商品评论；
            that.getComment(resData);
            // 请求获取猜你喜欢的数据
            that.getGuessLike(that.data.goodsId, true);
            // 请求获取优惠券数据
            that.getCoupon('0');
            // 请求联系商家的 webCallParam
            that.getWebCallParam(resData.goodsShowVO.supplierInfo.supplierId);
          
						console.log(that.data.goods.supplierInfo.headImage)
            that.data.goods.supplierInfo.headImage = that.data.goods.supplierInfo.headImage ? that.data.goods.supplierInfo.headImage : that.data.baseImageLocUrl + 'miniappImg/icon/icon_default_head.jpeg'; // 商家头像
						
            var article = that.data.goods.introduction;                                           // 商详的富文本字符串
            that.data.minCount = resData.goodsShowVO.minCount ? resData.goodsShowVO.minCount : 1; //最少起售数
            that.data.specType = resData.goodsShowVO.specType;
            that.data.allProduct = resData.goodsShowVO.products;
            that.data.xgCount = resData.goodsShowVO.xgCount;
				    that.data.SFmember = resData.goodsShowVO.memberGoods ? true : false;                  // 判断是否是会员商品
						// that.data.addressList = resData.addressList;
						that.data.addressList = null;
						that.data.goods.nonDeliveryArea = that.data.goods.nonDeliveryArea.split(',');
            if(!that.data.addressList || that.data.addressList.length <= 0) {											// 如果是没有收货地址说明用户没有登录 ， 调用 API 获取当前用户地址
						console.log('===============================')
              that.getAddress();																																	// 没有登录在下单的时候就是快捷下单，需手动填写收货地址；
            } else if(that.data.addressList.length > 0) {
							console.log('+++++++++++++++++++++++++++')
							let detailAddressId = my.getStorageSync({ key: 'detailAddressId' }).data;
							if( detailAddressId ) {																																																											
								if( that.data.addressList.find(value => value.id == detailAddressId) ) {					// 有缓存的选中地址，且数据地址中有则说明用户还在使用该地址，设置这一条数据为显示地址
									that.data.addressList.forEach(value => (value.id == detailAddressId ? value.isDefault = true : value.isDefault = false));
								} else {																																					// 有缓存的选中地址，且数据的地址中没有则说明用户已经删除了，故删除缓存选中地址；
									my.removeStorageSync( {key: 'detailAddressId'} );
									!that.data.addressList.find(value => value.isDefault) ? that.data.addressList[0].isDefault = true : '';
								}
							} else {								  																													// 没有缓存的选中地址则使用数据中的默认地址
								!that.data.addressList.find(value => value.isDefault) ? that.data.addressList[0].isDefault = true : '';
							}
							console.log(detailAddressId);
							that.auto_send();
            }
						
						console.log(that.data.addressList);
						that.setCategoryData();
    
            // 判断是否积分商品,积分商品type==3, 判断是否购物返现商品,积分商品type==4
            var type = '';
            resData.goodsShowVO.jifenStatus ? type = 3 : (resData.goodsShowVO.returnMoneyStatus ? type = 4 : type = '');

            if (resData.goodsShowVO.products) {
              let defaultProducts = that.data.allProduct.find(value => value.isDefault == true);
								console.log(defaultProducts)
								that.data.theMemberPoint = defaultProducts.memberPoint;                         // 会员积分
								that.data.theCostMemberScore = defaultProducts.costMemberScore;                 // 兑换会员积分
								that.data.theAwardMemberScore = defaultProducts.awardMemberScore;               // 奖励会员积分
								that.data.specType == 'SINGLE' ? that.data.iavPath = defaultProducts.iavPath : that.data.iavPath = [];
            }

        // 测试用的，让库存为 0
        // that.data.allProduct[1].store = 0;
            // specType 规格类型,  MULTI 多规格, SINGLE 单规格, OPTIONAL 任选规格；
              that.data.goodsSpecMap = JSON.parse(JSON.stringify(that.data.goods.specifications));
              if( that.data.specType == 'MULTI') {
                that.data.goodsSpecMap.forEach(values => that.data.iavPath.push(''));
                 that.data.iavPath = that.data.iavPath.toString();
                 that.data.multiDimension = that.data.goodsSpecMap.length;
								 that.data.allProduct.forEach(value => !value.imgPath ? value.imgPath = that.data.goods.goodsImages[0] : '');
                 that.multiFormName();
                 that.setGoodsSpecMapAllStore();
              } else {
                that.data.goodsSpecMap.forEach(values => {
                  values.values.forEach(value => {
                    let matching = that.data.allProduct.find(val => value.valueId == parseInt(val.iavPath));
                    console.log(matching);
                    matching && matching.store == 0 ? value.store = 0 : '';
										matching && !matching.imgPath ? matching.imgPath = that.data.goods.goodsImages[0] : '';
                    matching && matching.imgPath ? value.imgPath = matching.imgPath : value.imgPath = that.data.goods.goodsImages[0];
                  })
                })
              }


					  console.log(that.data.allProduct)
            console.log(that.data.goodsSpecMap);

            // that.data.iavPath 在多选和单选的规格中是字符串，在任选规格中需要是数组;
            that.data.specType == 'OPTIONAL' ? that.data.optionalProduct = [] : '';
            // afterSaleGueeList 由 afterSaleGuee中的值得到不同的值，具体看渲染；
            that.data.goods.afterSaleGuee ? that.data.goods.afterSaleGueeList = that.data.goods.afterSaleGuee.split(',') : '';

            that.setGoodsSpecMap();

            that.data.goods.secKillStatus == null ? that.data.goods.secKillStatus = false : '';
            var activityList = that.data.goods.activity ? that.data.goods.activity : {};  // 秒杀数据
            activityList.totalStock = that.data.goods.secKillTotalCount;
            activityList.totalSaleVolume = that.data.goods.secKillTotalSale;
						activityList.secKillPrice = that.data.goods.products.activityPrice;

            // 测试用  
            console.log('是否已售罄总库存，goodsStore', that.data.goods.goodsStore);
            console.log('是否已下架，如果是 SALEING 则是正销售中',that.data.goods.viewStatus)

 
            WxParse.wxParse('article', 'html', article, that, 0);
            that.goodsPrice();

            that.setData({
              loadComplete: true,
              quantity: that.data.minCount,
              minCount: that.data.minCount,
              specType: that.data.specType,
              allProduct: that.data.allProduct,
              goodsSpecMap: that.data.goodsSpecMap,
              product: that.data.product,
              xgCount: that.data.xgCount,
              optionalProduct: that.data.optionalProduct,
              goods: that.data.goods,
              goodsSecondKill: activityList,
              SFmember: that.data.SFmember,
              // SFmember: true,
              type: type ? type : '',                                                                // 积分商品 type = 3,用来判断选规格的价格那里的显示
              // theMemberPoint: that.data.theMemberPoint ? that.data.theMemberPoint : 0,                  // 这是获取会员积分
              // theCostMemberScore: that.data.theCostMemberScore ? that.data.theCostMemberScore : 0,      // 顺丰会员会员消耗积分
					    theAwardMemberScore: that.data.theAwardMemberScore ? that.data.theAwardMemberScore : 0,   // 顺丰会员会员奖励积分
              addressList: that.data.addressList,                                                         // 用户的收货地址
              otherGoods: resData.supplierGoodsList,                                                    // 商家的其他商品，
              goodsId: that.data.goodsId,
            })

            
            reslove({
              type: true
            })
					} else {
            that.setData({
              loadComplete: true,
              loadFail: true,
              errMsg: resRet.message ? resRet.message : ''
            });
            reject({
              type: false
            })
					}
      }, function(err){
          that.setData({
            loadComplete: true,
            loadFail: true,
            errMsg: err ? err : ''
          });
          reject({
            type: false
          })
      })
		})
	},


	// 获取达观推荐的商品---猜你喜欢
	async getGuessLike(goodsId, isFirst) {
    let that = this;
    http.get(api.GUESSLIKE,  { start: 0, limit: 10, sceneType: 'detail', is_first: isFirst, goodsId }, 
      function(res) {
        let guessLikeGoods = res.data.data ? res.data.data : []
        that.setData({
          guessLikeGoods
        })
      }, function(err) { })
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
				if(showGuessPosition < (getApp().globalData.systemInfo.windowHeight - utils.rpx2Px(98))) {
					this.guessLike_da_filter();
				}
			}
		});
	},

	// 猜你喜欢商品列表滚动事件，要筛选达观数据上报
	guessLikeScroll: _.debounce(function(e){
		// this.guessLike_da_filter();
	}, 300),


	// 达观数据上报
	da_upload_goods(goodsSn) {
		// 上报数据
		utils.uploadClickData_da('rec_click', [{ goodsSn: goodsSn }])
	},

	/**
	 * 初始化iavPath、goodsSpec、allProduct，
   * 找到了 allProduct 中默认的规格子类值（有可能是多个），然后再循环父类规格 goodsSpecMap ，再赋值对应子类的 taped = true;
	 */
	setGoodsSpecMap: function() {
		let that = this;
    if (that.data.specType == 'OPTIONAL' || that.data.specType == 'MULTI') {
      this.setProduct('firstTime');
    } else {
      let iavPathArr = that.data.iavPath.split(',');
      that.data.goodsSpecMap.forEach(function(mapValue) {
        mapValue.values.forEach(value => iavPathArr.includes(value.valueId.toString()) ? value.taped = true : '');
      })
      that.setProduct();
    }
	},

	/**
	 * 更新规格界面显示，找到父类规格，然后让被点击的子类规格格框高亮，然后设置全局的默认子类规格；
	 */
	updateGoodsSpecMap: function(fatherIndex, index, specType) {
		var that = this;
		var values = that.data.goodsSpecMap[fatherIndex].values;
    console.log(fatherIndex, index, specType)
    if (that.data.specType == 'OPTIONAL' || that.data.specType == 'MULTI') {                     // 任选规格 和 多选规格
      values.forEach(function(value, i) {
        // 找到当前的子类规格, 如果当前的子类规格 taped 为 false 或不存在就让它 为 true 否则让它为 false; 如果是任选： 不是当前的子类规格该怎样就怎样，如果是多选：当前父类的其他子类规格则都为 false;
        console.log(value)
        if (i == index) {
          if (!value.taped) {
            value.taped = true;
          } else {
            value.taped = false;
          }
        } else if( that.data.specType == 'MULTI' ) {
          value.taped = false;
        }
      });
      // 注意! 这里传递的3个参数分别为： 当前父类规格的 index, 当前子类规格的 index ,规格类型 specType
      that.data.specType == 'OPTIONAL' ? that.setIavPath(fatherIndex, index, 'OPTIONAL') : that.setIavPath(fatherIndex, index, 'MULTI');
    } else {                                                            // 单选规格
      values.forEach(function(value, i) {
        if (i == index) {
          value.taped = true;
          // 注意! 这里传递的2个参数分别为： 当前父类规格的 index, 当前子类规格的 id ,
          that.setIavPath(fatherIndex, value.valueId);
        } else {
          value.taped = false;
        }
      });
    }
	},

	/**
	 * 修改iavPath，调用setProduct 更新全局默认 product 的 iavPath（子类规格，按照父类规格排列）
	 */
	setIavPath: function(index, id, specType) {
		var that = this;
    var values = that.data.goodsSpecMap[index].values;
    console.log(values);
    console.log(id)
    if (specType == 'OPTIONAL') {
      // 1，如果子类规格的 taped 为 true, 说明是新增的子规格，则加在 that.data.iavPath 数组的最后一位，
      // 2，如果为 false 且 that.data.iavPath 存在这个子类规格 iavPath 则说明是原来就有这个子规格的，现在点灭则移除掉这个子类规格，
      // 3，如果 that.data.iavPath.length 大于任选个数 xgCount， 则删除第一条 iavPath；
      if (values[id].taped) {
        that.data.iavPath.push(values[id].valueId);
        if (that.data.iavPath.length > that.data.xgCount) {
          console.log('数组长度大于原有任选长度, 删除第一条 iavPath, 且把它的 taped 设置为 false; ');
          values[values.findIndex(value => that.data.iavPath[0] == value.valueId)].taped = false;
          that.data.iavPath.shift();
        }
      } else {
        that.data.iavPath.splice(that.data.iavPath.findIndex(value => value == values[id].valueId), 1);
      }
      console.log('更新之后的 that.data.iavPath', that.data.iavPath);
      that.setProduct('modifyOptional');

    } else if (specType == 'MULTI') {
        var arr = that.data.iavPath.split(',');
        console.log(values[id])
        values[id].taped ? arr[index] = values[id].valueId + '' :  arr[index] = '';

        console.log('更新之后的 that.data.iavPath', arr);

        that.data.iavPath = arr.toString();
        that.multiFormName();

        if(arr.every(value => value == '')) {
          console.log('全不选，设置 product 为默认的，重置全部子规格的 store');
          that.setProduct('firstTime');
          that.setGoodsSpecMapAllStore();
          return;
        } else if(arr.every(value =>  value != '')) {
          console.log('全选，设置 product 为最新的 that.data.iavth，重置全部子规格的 store');         
          that.setProduct();
        }

        that.setGoodsSpecMapAllStore();
        that.upMultiGoodsSpecMap();

    } else {
      // 设置默认子类规格（按照父类规格顺序排列），iavPath 可以包含多个 iavPath，以‘,’隔开，按父类规格顺序排列；
      var arr = that.data.iavPath.split(',');
      arr[index] = id + '';
      that.data.iavPath = arr.toString();
      this.setProduct();
    }
	},

	/**
	 * 根据全局默认 iavPath 更新全局默认 product, 全部的子类规格的价格是初始价格（单价*最小数量），积分是初始积分（积分数*最小数量）；
	 */
	setProduct: function(specType) {
		    var that = this;
        // console.log(that.data.allProduct);
        var allOptionalProduct = [];
        
        that.data.allProduct.forEach(function(value, index, arr) {
          // ----- 修改规格的价格，原有的是单位价格和单位积分 * 起购数量（没有就取 1）    start;
          // 这是直接选择规格，相较于修改数量来修改价格和积分，多了一个 tuanPrice 团购价格重新赋值；支付宝小程序没有团购；
          // value.tuanPrice = value.tuangouPrices * that.data.minCount;                              // 团购商品价格
          // value.goodsPrice = value.salePrice * that.data.minCount;                                 // 普通商品价格
          // value.secondKillPrice =  value.activityPrice * that.data.minCount;                       // 秒杀商品价格（新接口没有这个字段，而是activityPrice）
          // value.thisMemberPoint =  value.memberPoint * that.data.minCount;                         // 积分商品积分 (新接口没有这个字段)
          // value.thisReturnMoneyPrice = (value.returnMoney * that.data.minCount).toFixed(2);        // 购物返现商品价格 (新接口没有这个字段, 而是returnMoney)
          // value.memberPriceAll = (value.memberPrice * that.data.minCount).toFixed(2);              //  memberPriceAll 会员商品价格
          // value.costMemberScoreAll = value.costMemberScore * that.data.minCount;                   //  会员商品积分
          // value.awardMemberScoreAll = value.awardMemberScore * that.data.minCount;                 //  会员商品奖励会员积分
          // ----- 修改规格的价格，原有的是单位价格和单位积分 * 起购数量（没有就取 1）       end;

          // ----- 位修改规格的价格，改为直接使用后台返回的单价格和单位积分 , 不再 * 起购数量     start;  字段都与新接口核对正确, 只全部值都暂时展示单位
          value.tuanPrice = value.tuangouPrices;                              
          value.goodsPrice = value.salePrice;                                 
          value.secondKillPrice =  value.activityPrice;
          value.thisMemberPoint =  value.memberPoint;                        
          value.thisReturnMoneyPrice = value.returnMoney;                     
          value.memberPriceAll = value.memberPrice;                           
          value.costMemberScoreAll = value.costMemberScore;                   
          value.awardMemberScoreAll = value.awardMemberScore;                 
          // ----- 修改规格的价格，改为直接使用后台返回的单位价格和单位积分 , 不再 * 起购数量       end;


          // 任选规格, 第一次渲染的时候也是使用默认规格来展示；goodsSpecMap 父类规格里的字子规格不用带 tape = true，同时，全局的任选规格 optionalProduct 为 [];
          if (specType == 'firstTime' && value.isDefault == true) {
              console.log('任选规格或多选规格的第一次默认渲染')
              that.data.product = value;
          } else if (specType != 'firstTime' && specType != 'modifyOptional' && that.data.iavPath == value.iavPath) {
              console.log('多选规格和单选规格修改规格')
            // 多选规格和单选规格，如果当前这条子类规格的 iavPath 与 全局默认子类规格的 iavPath 相等，那让全局的默认规格等于这条子类规格；
              that.data.product = value;
          }
        });


        // 切换规格的时候 specType == 'modifyOptional'，这时候开始往 optionalProduct 里 push 子类规格，然后合并 optionalProduct 成为 全局唯一的 product；
        if (specType == 'modifyOptional' && that.data.iavPath.length > 0) {
          // 如果 that.data.iavPath 有值，则找 that.data.allProduct 中匹配的子类规格，然后往 allOptionalProduct 拼接选中的子类规格；
            that.data.iavPath.forEach(function(value) {
              allOptionalProduct.push(that.data.allProduct.find(val => val.iavPath == value))
            })
            console.log('that.data.iavPath 长度大于 0 ，任选规格 push 结束了，开始合并 optionalProduct， 我要调用了')
            that.data.optionalProduct = allOptionalProduct;
            that.mergeOptionalProduct();
          } else if (specType == 'modifyOptional' && that.data.iavPath.length <= 0) {
            // 如果 that.data.iavPath 为 []，则找 that.data.allProduct 原有的为 isDefault 的子类规格，把全局的 that.data.product 设置为改子类规格；
            that.data.product = that.data.allProduct.find(val => val.isDefault == true);
            console.log('that.data.iavPath 长度等于 0 ，任选规格 不push  ,不合并 optionalProduct 且为 []')
            that.data.optionalProduct = allOptionalProduct;
        }

      console.log(that.data.iavPath);
      console.log(that.data.product);
      console.log(that.data.goodsSpecMap);
      console.log(that.data.optionalProduct);

	},

  /**
	* 任选规格商品，合并选中的多个规格的数据
	*/
  mergeOptionalProduct () {
    var that = this;
    console.log('我要开始合并任选规格数组了 ')
    var product = {
        "productId": [],
        "productSn": [],
        "productName": [],
        "tuanPrice": 0,
        "goodsPrice": 0,
        "secondKillPrice": 0,
        "thisMemberPoint": 0,
        "thisReturnMoneyPrice": 0,
        "memberPriceAll": 0,
        "costMemberScoreAll": 0,
        "awardMemberScoreAll": 0
    };
      
    var storeArr = [];
    that.data.optionalProduct.forEach(function(value, index, arr) {
      // 各条子类规格自身的总价和总积分等属性的累加；
      product.productId.push(value.productId);
      product.productSn.push(value.productSn);
      product.productName.push(value.productName);
      product.tuanPrice += value.tuanPrice;
      product.goodsPrice += value.goodsPrice;
      product.secondKillPrice += value.secondKillPrice;
      product.thisMemberPoint += value.thisMemberPoint;
      product.thisReturnMoneyPrice += Number(value.thisReturnMoneyPrice);
      product.memberPriceAll += Number(value.memberPriceAll);
      product.costMemberScoreAll += value.costMemberScoreAll;
      product.awardMemberScoreAll += value.awardMemberScoreAll;
      product.imgPath = (index == arr.length -1) ? value.imgPath : null;
      storeArr.push(value.store)
    })
    product.store = storeArr.sort((a, b) => a-b)[0];
    console.log(product.store)
    that.data.product =  product;
  },

	/**
	* 查看图片
	*/
	commentViewTap: function(e) {
		var urls = e.currentTarget.dataset.urls;
		my.previewImage({
			urls: urls.map(value => value = baseImageUrl + value),
			current: 0
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
    if(e.target.dataset.addCart && e.target.dataset.addCart == "addCart") {
      this.setData({
        showGoodsSpec: false,
      });
      this.goodsSpecSubmitTap();
    } else {
      this.setData({
        showGoodsSpec: true,
        selectedSpecsBar: false,
      });
    }
	},

	/**
	 * 点击立即购买
	 */
	buyNow: function(e) {
		this.data.buyType = 0;
    if(e.target.dataset.buyNow && e.target.dataset.buyNow == "buyNow") {
      this.setData({
        showGoodsSpec: false,
      });
      this.goodsSpecSubmitTap();
    } else {
      this.setData({
        showGoodsSpec: true,
        selectedSpecsBar: false,
      });
    }
	},

	// 如果活动结束了，那就禁止按钮
	onSpikeOver: function() {
    console.log('秒杀结束了')
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
			showGoodsSpec: true,
      selectedSpecsBar: false,
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
	 * 点击已选规格栏
	 */
  selectedSpecs: function() {
    if( this.data.goods.viewStatus != 'SALEING' ) {
      return;
    }
    this.setData({
      selectedSpecsBar: true,
      showGoodsSpec: true,
    })
  },

	/**
	 * 点击规格item，切换规格
	 */
	specItemTap: function(e) {
		var that = this;
		var fatherIndex = e.currentTarget.dataset.fatherindex;
		var index = e.currentTarget.dataset.index;
    console.log('切换事件被触发')
    if (that.data.specType == 'OPTIONAL') {
      this.updateGoodsSpecMap(fatherIndex, index, 'OPTIONAL');
    } else if (that.data.specType == 'MULTI') {
      this.updateGoodsSpecMap(fatherIndex, index, 'MULTI');
    } else {
      this.updateGoodsSpecMap(fatherIndex, index);
    }
		
		this.setData({
			goodsSpecMap: that.data.goodsSpecMap,             // 父类规格，里携带 taped ;
			product: that.data.product,                       // 当前用于渲染的规格 ;
      optionalProduct: that.data.optionalProduct,       // 任选规格被选中的数组 ; 
			quantity: that.data.minCount,                     // 再次初始化为最低起售数 ;
		});

    console.log(that.data.iavPath);
    console.log(that.data.product);
    console.log(that.data.goodsSpecMap);
    console.log(that.data.optionalProduct);
    

    // 如果当前选中的规格的库存为 0 那就提示库存不足, 最新的修改是切换的时候库存为 0 不提醒，只有点击确定按钮的时候如果库存为 0 再提醒；
		// if (that.data.product.store != 0) {
		// 	return;
		// } else {
		// 	that.setData({
		// 		showToast: true,
		// 		showToastMes: '该商品库存不足'
		// 	});
		// 	setTimeout(function() {
		// 		that.setData({
		// 			showToast: false
		// 		});
		// 	}, 1000);
		// }
	},

	/**
	 * 减数量，不能小于0（应该是如果小于最小数量，则提示过低了，如果没有则按照最小数量来计算默认规格的各个价格和积分）
	 */
	subtractTap: function(e) {
		var that = this;
    console.log(that.data.minCount);
    console.log(that.data.quantity)
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
    // 数量减减，秒杀价格 * 新数量
		that.data.quantity--;

    // ---------  任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     start;
    // ---------  修改默认规格的价格和积分，这一段在 --，++，直接修改，离开焦点修改，中都是一样的； start
		// that.data.product.goodsPrice = (that.data.product.salePrice * that.data.quantity).toFixed(2);

		// if (that.data.product.activityPrice) {
		// 	that.data.product.secondKillPrice = (that.data.product.activityPrice * that.data.quantity).toFixed(2);
		// };

		// if (that.data.product.memberPoint) {
		// 	that.data.product.thisMemberPoint = that.data.product.memberPoint * that.data.quantity;
		// }
		// if (that.data.product.returnMoney && that.data.goods.isRefundMoney) {
		// 	that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoney * that.data.quantity).toFixed(2);
		// }
		// if (that.data.SFmember) {
		// 	that.data.product.memberPriceAll = (that.data.product.memberPrice * that.data.quantity).toFixed(2);
		// 	that.data.product.costMemberScoreAll = that.data.product.costMemberScore * that.data.quantity;
		// 	that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * that.data.quantity;
		// }
    // ---------  修改默认规格的价格和积分，这一段在 --，++，直接修改，离开焦点修改，中都是一样的； end
    // ---------  任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     end;

		this.setData({
			quantity: that.data.quantity + '',
			// product: that.data.product     // 该规格对应的价格和积分都不变 所以也就不用去修改规格了
		});
	},

	/**
	 * 加数量，不能大于99（应该是如果大于最大数量，则提示超过了，如果没有则按照最大数量来计算默认规格的各个价格和积分）
	 */
	addTap: function(e) {
		var that = this;
		var maxCount = that.data.product.store && that.data.product.store <= 99 ? that.data.product.store : 99;
		if (that.data.quantity == maxCount) {
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

    // ---------   任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     start;
		// that.data.product.goodsPrice = (that.data.product.salePrice * that.data.quantity).toFixed(2);
		// // 数量加加，秒杀价格 * 新数量
		// if (that.data.product.activityPrice) {
		// 	that.data.product.secondKillPrice = (that.data.product.activityPrice * that.data.quantity).toFixed(2);
		// };

		// if (that.data.product.memberPoint) {
		// 	that.data.product.thisMemberPoint = that.data.product.memberPoint * that.data.quantity;
		// }
		// if (that.data.product.returnMoney && that.data.goods.isRefundMoney) {
		// 	that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoney * that.data.quantity).toFixed(2);
		// }
		// if (that.data.SFmember) {
		// 	that.data.product.memberPriceAll = (that.data.product.memberPrice * that.data.quantity).toFixed(2);
		// 	that.data.product.costMemberScoreAll = that.data.product.costMemberScore * that.data.quantity;
		// 	that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * that.data.quantity;
		// }
    // ---------   任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     end;

		this.setData({
			quantity: that.data.quantity + '',
			// product: that.data.product   // 该规格对应的价格和积分都不变 所以也就不用去修改规格了
		});
	},

	/**
	* 点击数据输入数量（手动输入数量，如果数量大于最大数量，则让默认规格的各个价格和积分按照最大数量来计算，如果没有大于最大数量则还是按照输入的数量来计算）
	* */
	changeQuantity: function(e) {
		var quantity = e.detail.value;
		var that = this;
		var maxCount = that.data.product.store && that.data.product.store <= 99 ? that.data.product.store : 99;
    console.log(that.data.product.store)
    console.log(maxCount)
		if (quantity >= maxCount) {
      console.log('数量大于最大限购数量')
			var mes = that.data.product.store && that.data.product.store <= 99 ? '库存只有' + that.data.product.store + '，不能太贪心喔' : '最多只能99，不要太贪心哦';

      // ---------   任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     start;
			// that.data.product.goodsPrice = (that.data.product.salePrice * maxCount).toFixed(2);
			// that.data.product.tuanPrice = (that.data.product.tuangouPrices * maxCount).toFixed(2);
			// 输入数量，秒杀价格 * 新数量
			// if (that.data.product.activityPrice) {
			// 	that.data.product.secondKillPrice = (that.data.product.activityPrice * maxCount).toFixed(2);
			// };

			// if (that.data.product.memberPoint) {
			// 	that.data.product.thisMemberPoint = that.data.product.memberPoint * maxCount;
			// }
			// if (that.data.product.returnMoney && that.data.goods.isRefundMoney) {
			// 	that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoney * maxCount).toFixed(2);
			// }
			// if (that.data.SFmember) {
			// 	that.data.product.memberPriceAll = (that.data.product.memberPrice * maxCount).toFixed(2);   // 这里应该是原有写错了，quantity 要换成 maxCount
			// 	that.data.product.costMemberScoreAll = that.data.product.costMemberScore * maxCount;        // 这里应该是原有写错了，quantity 要换成 maxCount
			// 	that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * maxCount;      // 这里应该是原有写错了，quantity 要换成 maxCount
			// }
      // ---------   任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     end;

			that.setData({
				showToast: true,
				showToastMes: mes,
				quantity: maxCount,
				// product: that.data.product   // 该规格对应的价格和积分都不变 所以也就不用去修改规格了
			});
       console.log(that.data.quantity)
			setTimeout(function() {
				that.setData({
					showToast: false
				});
			}, 2000);
		} else {

      // ---------    任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     start;
			// that.data.product.goodsPrice = (that.data.product.salePrice * quantity).toFixed(2);
			// that.data.product.tuanPrice = (that.data.product.tuangouPrices * quantity).toFixed(2);
			// // 输入数量，秒杀价格 * 新数量
			// if (that.data.product.activityPrice) {
			// 	that.data.product.secondKillPrice = (that.data.product.activityPrice * quantity).toFixed(2);
			// };

			// if (that.data.product.memberPoint) {
			// 	that.data.product.thisMemberPoint = that.data.product.memberPoint * quantity;
			// }
			// if (that.data.product.returnMoney && that.data.goods.isRefundMoney) {
			// 	that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoney * quantity).toFixed(2);
			// }
			// if (that.data.SFmember) {
			// 	that.data.product.memberPriceAll = (that.data.product.memberPrice * that.data.quantity).toFixed(2);
			// 	that.data.product.costMemberScoreAll = that.data.product.costMemberScore * that.data.quantity;
			// 	that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * that.data.quantity;
			// }
      // ---------    任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     end;

			that.setData({
				quantity: quantity,
				// product: that.data.product     // 该规格对应的价格和积分都不变 所以也就不用去修改规格了
			});
		}
	},

	/**
	 *输入数量失去焦点（失去焦点的时候如果数量小于最小数量或者等于 ‘’ , 那就把默认规格的各个价格和积分按照最低数量来计算）       
	*/
	inputBlur: function(e) {
		var quantity = e.detail.value;
		var that = this;
		var minCount = that.data.minCount;
		if (quantity <= minCount || quantity == '' || !Number(quantity)) {

      // ---------    任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     start;
			// that.data.product.goodsPrice = (that.data.product.salePrice * minCount).toFixed(2);
			// that.data.product.tuanPrice = (that.data.product.tuangouPrices * minCount).toFixed(2);
			// // 输入数量，秒杀价格 * 新数量
			// if (that.data.product.activityPrice) {
			// 	that.data.product.secondKillPrice = (that.data.product.activityPrice * minCount).toFixed(2);
			// };

			// if (that.data.product.memberPoint) {
			// 	that.data.product.thisMemberPoint = that.data.product.memberPoint * minCount;
			// }
			// if (that.data.product.returnMoney && that.data.goods.isRefundMoney) {
			// 	that.data.product.thisReturnMoneyPrice = (that.data.product.returnMoney * minCount).toFixed(2);
			// }
			// if (that.data.SFmember) {
			// 	that.data.product.memberPriceAll = (that.data.product.memberPrice * that.data.minCount).toFixed(2);   // 这里应该是原有写错了，quantity 要换成 minCount
			// 	that.data.product.costMemberScoreAll = that.data.product.costMemberScore * that.data.minCount;        // 这里应该是原有写错了，quantity 要换成 minCount
			// 	that.data.product.awardMemberScoreAll = that.data.product.awardMemberScore * that.data.minCount;      // 这里应该是原有写错了，quantity 要换成 minCount
			// }
      // ---------    任选，多规格，单选的规格选择或者加减更改规格数量，该规格对应的价格和积分都不变     end;

			this.setData({
				quantity: minCount,
				// product: that.data.product       // 该规格对应的价格和积分都不变 所以也就不用去修改规格了
			});
		}
	},

  // 去到购物车
	cartTap: function(e) {
		my.navigateTo({
			url: '/pages/cart/cart'
		});
	},

	/** 
	 * 点击什么是送礼方式，打开送礼方式介绍弹窗，同时关闭送礼方式选择弹窗；
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
    var noTrueChoose = false;
    console.log(this.data.buyType);

    // 如果全局的当前规格为多选规格 则 以 iavPath 作为依据，如果 iavPath 存在空的情值则提示“请正确选择”,
    if (that.data.specType == 'MULTI') {
      var iavPathArr = that.data.iavPath.split(',');
      noTrueChoose = iavPathArr.some(value => value == '');
    }
    // 如果是多选规格且组合的 iavPath 存在空的值则提示“请正确选择”， 如果是当前的数量大于被选中的规格的库存，则提示“没有库存了”；
    if( noTrueChoose || Number(that.data.quantity) > that.data.product.store ) {
      var showToastMes = '';
      noTrueChoose ? showToastMes = '请正确选择' : showToastMes = '没有库存了';
      that.setData({
        showToast: true,
        showToastMes: showToastMes
      });
      setTimeout(function() {
        that.setData({
          showToast: false
        });
      }, 1000);
      return;
    }

    // 规格弹窗隐藏
		this.setData({
			showGoodsSpec: false
		});
    
		switch (this.data.buyType) {
			case 0:
				//立即购买，跳转到订单页面
				that.toBuyNow();
				break;
			case 1:
				//添加购物车，发送请求1 传递添加的商品，发送请求2 更新购物车数量；
				that.toAddCart();
				break;
			case 2:
				//送礼，如果是送礼商品，数量大于 2 的时候显示送礼商品规则弹窗；
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

  // 关闭送礼方式选择弹窗 showGiftBomb，同时关闭送礼方式介绍弹窗  showTheway；
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
    // 友盟统计 购买便统计
    that.umaTrackEvent('buyNow');
		let detailAddressId = my.getStorageSync({ key: 'detailAddressId' }).data;
		console.log(detailAddressId);
		if(that.data.addressList && that.data.addressList.length && detailAddressId) {
			 getApp().globalData.NowAddrId = detailAddressId; 
		}
		my.navigateTo({
			url: '/pages/shopping/confirmOrder/confirmOrder?&productId=' + that.data.product.productId + '&quantity=' + that.data.quantity + '&SFmember=' + that.data.SFmember
		});
	},

	/**
	 * 单人送礼，只有微信小程序有送礼商品
	 */
	sendOnePerson: function() {
		var that = this;
		var showType = 1;
		my.navigateTo({
			url: '/pages/shopping/confirmOrder/confirmOrder?&productId=' + that.data.product.productId + '&quantity=' + that.data.quantity + '&isGiftOrder=true' + '&showType=' + showType
		});
	},

	/**
	 * 多人送礼，只有微信小程序有送礼商品
	 */
	sendManyPerson: function() {
    var that = this;
		var showType = 2;
		my.navigateTo({
			url: '/pages/shopping/confirmOrder/confirmOrder?&productId=' + that.data.product.id + '&quantity=' + that.data.quantity + '&isGiftOrder=true' + '&showType=' + showType
		});
	},

	/**
	 * 添加购物车
	 */
	toAddCart: function() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, { pId: that.data.product.productId, quantity: that.data.quantity + '' }, function(res) {
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
			that.setData({
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

	// 点击全赔保障框弹出弹窗,   改成去到 H5 的全赔页面，不再显示弹窗
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

  // 自定义分享
	onShareAppMessage: function(e) {
		var that = this;
		return {
			title: "【顺丰包邮】" + '【￥' + that.data.goods.defaultPrice + '】' + that.data.goods.goodsName,
			path: '/pages/shopping/goodsDetail/goodsDetail?goodsSn=' + that.data.goodsSn + '&goodsId=' + that.data.goodsId
		};
	},

  // 回到首页
	backToHome: function() {
		my.navigateTo({
			url: '/pages/home/home'
		});
	},

	// 跳去客服网页版     目前的没有 webCallParam 这个参数，后面会有接口专门来获取这个参数；
	goToWebCall: function() {
		var that = this;
    var webCallLink = that.data.webCallParam;
    console.log(webCallLink)
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

  // 领券弹窗打开
  showPopup: function () {
    var that = this;
    that.setData({
      isShowPopup: true
    })
  },
  // 领券弹窗关闭
  onPopupClose: function () {
     var that = this;
      that.setData({
        isShowPopup: false
      })
  },
  // 地址弹窗打开
  showAddressPop: function () {
    this.setData({
      isShowAddressPop: true
    })
  },
  // 地址弹窗关闭
  onAddressPop: function () {
    this.setData({
      isShowAddressPop: false
    })
  },

  // 领取优惠券
  collectCoupons: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let ruleSign = e.currentTarget.dataset.ruleSign;
    http.post(api.GOODSDETAIL.GOODS_DETAIL_DRAWCOUPON, {ruleSign}, function(res) {
      let resData = res.data.data;
			console.log(resData)
			console.log(index)
      if(resData && resData.length > 0) {
         resData[0].beginDateStr = utils.pointFormatTime(new Date(resData[0].beginDate));
         resData[0].endDateStr = utils.pointFormatTime(new Date(resData[0].endDate));

        //           resData[0].beginDateStr = utils.pointFormatTime(new Date(resData[0].beginDate));
        //  resData[0].endDateStr = utils.pointFormatTime(new Date(resData[0].endDate));

         that.data.couponDataList[index] = resData[0];
         that.setData({
           couponDataList: that.data.couponDataList
         })

				 console.log(that.data.couponDataList)
      }
    }, function(err) {
      my.showToast({
        content: '领取失败',
        duration: 2000,
      })
    })
  },

  // 拖拽优惠券弹窗
  lowLoadMore: function () {
    let that = this;
    if (that.data.hasMore) {
			that.setData({
				startCoupon: that.data.couponDataList.length
			});
      that.data.hasMore = false;
			that.getCoupon('1');
		}
  },

  // 监听导航栏当前处于页面什么位置
  listenNavigationBar: function () {
    var that = this;
    my.createSelectorQuery()
      .select('.js_titleView').boundingClientRect()
      .select('.js_titleText').boundingClientRect()
      .exec((ret) => {
      if (ret[1].top - ret[0].height <= 0 && that.data.flag ) {
          that.setData({
            suctionTop: 0,
            flag: false,
            isTitleViewClone: true
          })
      } else if (ret[1].top - ret[0].height >= 0 && !that.data.flag ) {
          that.setData({
            suctionTop: 1,
            flag: true,
            isTitleViewClone: false
          })
      }
    })
  },

  // 监听页面滚动
  onPageScroll: function (e) {
    var that = this;;
    // 设置返回首页/顶部栏
    if(e.scrollTop >= 500 && that.data.setComeBack) {
      that.data.setComeBack = false;
      that.setData({
        comeBackBar: 'show'
      })
    } else if (e.scrollTop < 500 && !that.data.setComeBack) {
      that.data.setComeBack = true;
      that.setData({
        comeBackBar: 'hide'
      })
    }
    // 设置导航栏
    that.listenNavigationBar();
  },

  	// 跳转去h5的全赔页
	goToAfterSaleGuee() {
    let that = this;
    // https://shop.fx-sf.com/h/goodspay/quality/YW02329CB9320C?qpKey=1,2,3
    let webCallLink = constants.UrlConstants.baseUrlOnly + '/h/goodspay/quality/' + that.data.goodsSn + '?qpKey=' + that.data.goods.afterSaleGuee;
    my.setStorageSync({
      key: 'swiperUrl',
      data: webCallLink,
    });
    
    my.navigateTo({
			url: '/pages/user/webView/webView?link=' + webCallLink + '&newMethod=new'
		});
	},

    // 页面回滚到顶部
  goTop() {
    my.pageScrollTo({
      scrollTop: 0,
      duration: 3000,
    });
  },

   // 调用 API 获取当前用户地址
  getAddress() {
    let that = this;
    my.showLoading();
    my.getLocation({ type: 1,
        success(res) {
          my.hideLoading();
          that.setData({
            address: res
          })
					console.log(that.data.address)
					console.log(that.data.addressList)
					that.auto_send();
        },
        fail(err) {
          // my.hideLoading();
          my.showToast({
            content: '定位失败',
            duration: 2000,
          })
        }}
    )
  },


  // 多规格切换
  upMultiGoodsSpecMap() {
    var that = this;
    var fatherIndexArr = that.data.iavPath.split(',');
    var tapNum = 0

    that.data.goodsSpecMap.forEach(function(value) {
      value.values.forEach(values => values.taped ? tapNum += 1 : '');
    })
    console.log(fatherIndexArr)
    console.log(that.data.iavPath);
    console.log(tapNum);

    if(that.data.multiDimension == 2) {                                         // 如果是两个父类
      console.log('2父类')
      that.excludeProduct(fatherIndexArr);
    } else if (that.data.multiDimension == 3) {                                 // 如果是三个父类
           console.log('3父类')
      // 只要选中的 fatherIndexArr 是全空的，重置：setGoodsSpecMapAllStore（）。
      // 如果是二父类，无论选中几个都直接调用 excludeProduct()。
      // 如果是三父类，就要分情况，如果是只选中一个父类，则调用 excludeProduct()，如果是选中两父类或三父类则调用 excludeProduct() 后再两两组成小组合后，再循环判断拼接 + 最后一个子规格； 
      if (tapNum == 2 || tapNum == 3) {
        console.log('三父类，选中了 2个或3个')
        that.excludeProduct(fatherIndexArr);
        fatherIndexArr.forEach(function(value, index) {
          var combinationIavth = JSON.parse(JSON.stringify(fatherIndexArr));
          if(tapNum == 3) {
            combinationIavth[index] = '';
          }
         if( (tapNum == 2 && value == '') || (tapNum == 3)) {
           var values = that.data.goodsSpecMap[index].values;   
           values.forEach(function(val) {
             combinationIavth[index] = val.valueId + '';
             var iavthString = combinationIavth.toString();
             var store =  that.data.allProduct.find(allProductVal => allProductVal.iavPath == iavthString).store;
             if(store == 0 || store == '') {
               val.store = 0;
             }
           })
         }
        })
        console.log(that.data.goodsSpecMap)
      } else {
        console.log('三父类，选中了 1 个');
        that.excludeProduct(fatherIndexArr);
      }
    }
  },

  // 选中一个子规格的时候，如果某一整个父类的所有子规格与子规格A和当前选中的子规格组合成的组合规格库存都为 0 ，那么这一个规格 A 就应该为  "灰显"；
  excludeProduct(fatherIndexArr) {
    var that = this;
    var index = null;
    var isManyEmpty = false;
    console.log(fatherIndexArr)
    var combinationIavth = JSON.parse(JSON.stringify(fatherIndexArr));
    console.log(combinationIavth)
    var addFatherIavth = [];
    fatherIndexArr.forEach(function(value,index,arr) {                  // 选中一个子规格时, 循环当前被选中的子规格 iavth 数组；
      value != '' ? console.log(index) : ''
      if(value != '') {                                                 // 排除当前被选中的这一个子规格的父类，找到为空的其它两个父类的第一个；
        that.data.goodsSpecMap.forEach(function(val, i, brr) {
          if(i != index) {
            console.log(val)                                                    // 使用全局的父类规格找到为空的父类；
            val.values.forEach(function(va, j, jrr) {                         // 循环该父类的子规格；
              combinationIavth[i] = va.valueId + '';                                 // 按照 fatherIndexArr 中父类的位置， 逐个赋值为空的父类的子规格 id；
              console.log(combinationIavth);
              that.data.goodsSpecMap.forEach(function(v, k, krr) {            // 找到为空的其它两个父类的第二个： 1，该父类下标与上一个父类不一样。
                if(k != i && k != index) {
                  isManyEmpty = true;
                  console.log(v)                 //                               2，在选中的子规格数组 fatherIndexArr 中，该父类对应的子规格应该也为 ‘’。
                  v.values.forEach(function(vc, h, hrr) {                   // 循环该父类的子规格；
                    console.log(combinationIavth)
                    combinationIavth[k] = vc.valueId + '';                         // 赋值第二个为空的父类的第每个子规格；
                    console.log(combinationIavth)
                    addFatherIavth.push(combinationIavth.toString());
                  })
                  console.log(addFatherIavth)
                // 第二个父类循环结束, 如果 addFatherIavth 的每一项在 selectionArr 的库存都为 0 ，则第一个父类的当前子规格 '灰显'；
                  var isHaveStore = that.isStore(addFatherIavth);
                  console.log(isHaveStore);
                  addFatherIavth = [];                                                  // 第一个父类的每一个子规格 + 第二个父类的每一个子规格（循环后），addFatherIavth 需要置空；
                  combinationIavth = JSON.parse(JSON.stringify(fatherIndexArr));       //  第一个父类的每一个子规格 + 第二个父类的每一个子规格（循环后），addFatherIavth 需要重置；  
                  if(!isHaveStore) {
                    that.data.goodsSpecMap[i].values[j].store = 0;
                    console.log(that.data.goodsSpecMap);
                  }
                }
              })
              // 如果选中了 2 个子规格后，fatherIndexArr 没有其它空的子规格，则 isManyEmpty 将仍然为false；
              if(!isManyEmpty) {
                console.log(combinationIavth.toString())
                var store =  that.data.allProduct.find(allProductVal => allProductVal.iavPath == combinationIavth.toString()).store;
                if(store == 0 || store == '') {
                  that.data.goodsSpecMap[i].values[j].store = 0
                }
                console.log(that.data.goodsSpecMap);
                addFatherIavth = [];
                combinationIavth = JSON.parse(JSON.stringify(fatherIndexArr));
              }
            })
          }                 
        })
      }
    })
  },

  // 重置，排查每一个子类规格的全部组合可能，如果该子类规格的全部组合可能的库存都为 0 的话，则该子类规格添加 store = 0，否则如果有 store == 0 的属性就删除掉该 store 属性；
  setGoodsSpecMapAllStore() {
    const that = this;
    // 开始渲染的时候就循环每个子规格，找到每个子规格对应的规组合，再判断，如果该子规格的所有规格组合的库存都为 0 ，那给这个子规格做一个标记；
    that.data.goodsSpecMap.forEach(function(value) {
      value.values.forEach(function(val) {
        // 逐个循环 goodsSpecMap 的每一个子规格，然后找到 allProduct 包含这个子规格的组合规格，形成每一个数组 multiProduct；
        var multiProduct = that.data.allProduct.filter(valProduct => valProduct.iavPath.indexOf(val.valueId) > -1);
        console.log(multiProduct)
        console.log('找到一个子规格对应的规格组合 --------');
        if(multiProduct.every(valStore =>  valStore.store == 0 || valStore.store == '')) {
          console.log('这个子规格的规格组合的库存都为 0', val)
          val.store = 0;
        } else if(val.store == 0) {
          //  如果该子规格的所有组合规格的库存不是都为 0 ，则这个子规格如果存在 store 则删除掉，没有就不用理；
            console.log(val)
            delete val.store;
        }
      })
    })

    console.log(that.data.goodsSpecMap)
  },

  // selectionArr： 选中一个子规格，循环该子规格的所有组合规格得出来的数组；addFatherIavth： 选中的这个子规格，拼接第一个为空的父类规格的第一个子规格再循环第二个父类规格拼接第二个父类规格的所有子规格得出的数组；
  isStore(addFatherIavth) {
    let that = this;
    console.log(addFatherIavth);
    var isHaveStore = false;
    addFatherIavth.forEach(function(value) {
      that.data.allProduct.find(val => val.iavPath == value).store != 0 ? isHaveStore = true : '';
    })
    return isHaveStore;
  },

  // 多选规格或任选展示的获取规格名称
  multiFormName() {
    var that = this;
    var multiformnames = [];
    var iavPathArr = that.data.iavPath.split(',');
    iavPathArr.forEach(function(value, index) {
      value == '' ? multiformnames[index] = that.data.goodsSpecMap[index].specName : multiformnames[index] = that.data.goodsSpecMap[index].values.find(val => val.valueId == value).valueName;
    })
    that.setData({
      multiformname: multiformnames.toString()
    })
    console.log(multiformnames.toString());
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

  	// 跳转去商家店铺页
	goToTargetPage(e) {
		let { url, type } = e.currentTarget.dataset
		if (type == 'supplier') {
			// 友盟+  商家点击
			this.umaTrackEvent('supplier');
		} else if (type == 'comment') {
			// 友盟+  评论点击
			this.umaTrackEvent('comment');
		}
		my.navigateTo({
			url: url
		})
	},

  	// 获取手机号
	getPhoneNumber: function(e) {
		var that = this;
    console.log('获取手机号')
		my.getPhoneNumber({
			success: (res) => {
				let response = res.response
				sendRequest.send(constants.InterfaceUrl.USER_BINGMOBILEV4, {
					response: response,
				}, function(res) {
					if (res.data.result) {
						try {
							my.setStorageSync({ key: constants.StorageConstants.tokenKey, data: res.data.result.loginToken });
							my.setStorageSync({ key: 'user_memId', data: res.data.result.memberId });
						} catch (e) {
							my.setStorage({ key: 'user_memId', data: res.data.result.memberId });
						}
					}
					else {}

					my.showToast({
						content: '绑定成功'
					})
					that.setData({
						user_memId: res.data.result ? res.data.result.memberId : '默认会员'
					})
				}, function(res, resData) {
          // '1013',为该用户已绑定手机号；
					var resData = resData ? resData : {}
					if (resData.errorCode == '1013') {
						that.setData({
							user_memId: '默认会员'
						})
						my.setStorage({ key: 'user_memId', data: '默认会员' });
					} else {
						my.showToast({
							content: res,
              duration: 2000,
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

  // 价格和积分的设置
  goodsPrice() {
      let that = this;
      that.data.priceInfo.price = that.data.goods.defaultPrice;   // 商品默认价格
      that.data.priceInfo.oldPrice = '';                          // 商品默认旧价格

      that.data.priceInfo.integralVal = '';                       // 默认积分
      // 如果是积分商品但不是会员商品，则使用默认积分
      if( that.data.goods.jifenStatus && !that.data.SFmember &&  that.data.theMemberPoint ) {
        that.data.priceInfo.integralVal = that.data.theMemberPoint;
      }
      // 如果是会员商品但不是积分商品的话，则使用兑换会员积分
      else if( !that.data.goods.jifenStatus && that.data.SFmember && that.data.theCostMemberScore ) {
        that.data.priceInfo.integralVal = that.data.theCostMemberScore;
      }

      // 会员商品使用会员价格
      if ( that.data.SFmember ) {
				that.data.priceInfo.price = that.data.goods.defaultMemberPrice;
				that.data.priceInfo.oldPrice = that.data.goods.defaultPrice;
      }

      // 全球购状态
      that.data.goods.globalStatus ?  that.data.priceInfo.isGlobal = true : that.data.priceInfo.isGlobal = false;

      /*  包税 isBaoShui 状态
          0:非进口
          1:CC 1.0海外直邮（包税）
          2:国内保税仓（包税）
          3.BC海外直邮（必税）
          4.CC2.0海外直邮-运费和商品价格分离（包税）
      */
      that.data.priceInfo.isBaoShui = false;
      if(  that.data.goods.goodsViceVO.crossBorderPattern == 1 || that.data.goods.goodsViceVO.crossBorderPattern == 2 || that.data.goods.goodsViceVO.rossBorderPattern == 4) {
          that.data.priceInfo.isBaoShui = true;
      }

      // 员工专享
      if(that.data.goods.staffStatus) {}

      that.setData({
        priceInfo: that.data.priceInfo
      })
  },

	selectAddress(e, index) {
		let that = this;
		my.setStorageSync({
			key: 'detailAddressId',
			data: e.currentTarget.dataset.addressId
		});
		console.log('当前点击的 ID', e.currentTarget.dataset.addressId);	
		console.log('全局的 ID', my.getStorageSync({ key: 'detailAddressId' }).data);
		that.data.addressList.find(value => value.isDefault).isDefault = false;
		that.data.addressList[e.currentTarget.dataset.index].isDefault = true;
		that.setData({addressList: that.data.addressList});
		that.auto_send();
		console.log(that.data.addressList);
	},

	auto_send() {
		let that = this;
		let defaultAddress = null;
		if(that.data.addressList && that.data.addressList.length > 0) {
			defaultAddress = that.data.addressList.find(value => value.isDefault);
		} else if (that.data.address && that.data.address.province) {
			defaultAddress = that.data.address;
		}

		that.data.nonDeliveryAre = that.data.goods.nonDeliveryArea.some(value => defaultAddress.province.indexOf(value) > -1) ?  true :  false;
		that.setData({ nonDeliveryArea: that.data.nonDeliveryAre });
		console.log(that.data.goods.nonDeliveryArea)
		console.log(that.data.nonDeliveryArea)
	},

	setCategoryData() {
		let that = this;
		my.setStorageSync({
			key: constants.StorageConstants.detfatherCategory,	
			data: {
				id: that.data.goods.categoryVO.parentId,
				name: "",
			}
		});
	}
});