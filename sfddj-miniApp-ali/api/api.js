import env from './env'

// 01386297
// 此处接口为后续优化，统一所创建
// 在v1.2.0之后，若是有新的需求，或者功能需要接口调用，请在此统一管理
// v1.2.0期间或者之前的接口位置在utils/constants.js中

export default {
	env,
	// 请求根路径
	baseUrl: env === 'production' ? 'https://m.sfddj.com' : 'https://shop.fx-sf.com',     //主干  https://shop.fx-sf.com  , https://shop.fx-sf.com
	// 其他资源地址配置
	baseImageUrl: env === 'production' ? 'https://img.sfddj.com/' : 'https://img.fx-sf.com/',
	staticsImageUrl: 'https://img.sfddj.com/',
	appId: env === 'production' ? '2019050764321917' : '2018073160767891',
	DDJAppId: env === 'production' ? '2019030863501284' : '2018122562647749',
	mapKey: env === 'production' ? '' : '2ceddac70ce9cc37325dec6398e5a4c7',
	lifestyleId: env === 'production' ? '2014051200005722' : '2014070200006769',
	provinceLevelMunicipalityCode: ['010', '020', '021', '022', '023', '400'], // 直辖市座机区号:北京市、上海市、天津市、重庆市
	defaultAvatar: 'https://img.sfddj.com/miniappImg/icon/icon_default_head.jpeg',       //默认头像，大当家logo

	// 接口
	// v1.1.0
	COMMENT: {
		GET_COMMENT_LIST: '/m/g/comment/1.0/commentByPage',    //获取评论列表
		GET_COMMENT_COUNT: '/m/g/comment/1.0/commentByCount',  //获取商品评论数量
		GET_COMMETN_AUTO_COUNT: '/m/g/comment/1.0/countAutomaticGoodsComment',   //获取商品自动评价数据
		GET_COMMENT_SCORE: '/m/g/comment/1.0/goodsCommentScore',       //获取商品评论评分数
	},

	LOGIN_ALI: '/miniapp/v1/login/aliAuth',

	GUESSLIKE: '/m/g/goods/1.0/guessLike',        //猜你喜欢--达观推荐

	ORDER: {
		order_search: '/m/o/1.0/order/mySearch',   //订单列表页搜索
		order_invoice: '/m/o/1.0/orderInvoice/patch',      //补开电子发票，订单详情
		afterSale_reason: '/m/o/1.0/order/getShowAfterSalesReason',     //获取售后原因
		aftersale_comment_save: '/m/o/afterSale/comment/1.0/save',    //售后评价提交
    reupload_global_img: '/m/o/1.0/order/globalOrderUploadImage',    //重新上传身份证图
	},

	COUPON: {
		COUPON_VALID_LIST: '/m/o/coupon/1.0/user/couponList',               // 获取分页用户有效优惠券列表
		COUPON_INVALID_LIST: '/m/o/coupon/1.0/user/invalidCouponList',      // 获取分页用户有效优惠券列表
	},

	CART: {
		SHOW_CART: '/m/g/cartItem/1.0/showCart',         //新版购物车列表接口
	},

	GOODS: {
    WATERFALL: '/m/g/1.0/group/1.0/getGoodsWaterfall',      //首页瀑布流商品列表
		LISTGOODSBYNAME: '/m/g/1.0/group/listGoodsByName',     //商品分组接口，可用于猜你喜欢商品列表
	},

	GOODSDETAIL: {
		GET_GOODS_DETAIL: '/m/g/goodsShow/1.0/view',                              // 新的商品详情商品数据
		GOODS_DETAIL_COUPON: '/m/o/coupon/1.0/goodsDetailCoupon',                 // 新的商品详情优惠券数据
		GOODS_DETAIL_DRAWCOUPON: '/m/o/coupon/1.0/drawCoupon',                    // 新的商品详情领取优惠券
		GOODS_DETAIL_CONTACTSTORE: '/m/c/m/customer/service/1.0/xnCustomer',      // 新的商品详情获取 “联系商家”的参数
		lISTGOODSBYNAME: '/m/g/1.0/group/listGoodsByName',												// 新的商品详情猜你喜欢接口
		LISTMATERIALBYNAME: '/m/a/material/1.0/listMaterialByName',								// 新商详 banner 位接口
		GPS_ADDR_COLLECT: '/m/da/gps/addr/1.0/collect',                           // gps
	},

	// 签到接口
	SIGNIN: {
		MEMBER_SIGN: '/m/u/1.0/member/newVersion/memberSign',     // 点击签到按钮请求接口
		PRIZE_DETAIL: '/m/u/1.0/member/newVersion/prizeDetail',   // 会员签到奖励详情
	},

	// 搜索接口
	search: {
		'GOODSSEARCH': '/m/c/1.0/opensearch/goodsSearch',													// 根据关键字分页搜索商品接口
		'GOODSSUGGEST': '/m/c/1.0/opensearch/goodsSuggest',												// 根据关键字返回智能推荐搜索片段
		'SUPPLIERSEARCH': '/m/c/1.0/opensearch/supplierSearch',										// 根据关键字分页搜索店铺接口
		'SEARCHTEXTMAX': '/m/g/1.0/search/searchTextMax',													//  搜索隐藏文字
		'SEARCHHOTWORD': '/m/g/1.0/search/hotWordList'														//  热门搜索关键字'
	},

	// 物流详情
	LOGISTICS: {
		'GETEXPRESS': '/m/o/orderSearch/1.0/getExpress',
		// 'lISTGOODSBYNAME': '/m/g/1.0/group/listGoodsByName',												// 新的物流详情猜你喜欢接口                                         
	},

	// 商家店铺
	SUPPLIER: {
		'ATTENTION_STATUS': '/m/g/supplier/getAttention/2.0',                     //判断是否关注商家
		'ATTENT_STORE': '/m/g/supplier/attention',                                //关注店铺
		'GET_SUPPLIER_DETAIL': '/m/g/supplier/1.0/getSupplierDetail',             //获取商家详情信息
		'GET_SUPPLIER_MATERIAL': '/m/a/material/1.0/getSupplierMaterial',         //获取轮播图
		'GET_SUPPLIER_COUPON': '/m/o/coupon/1.0/getSupplierCouponList',           //获取商家优惠券列表
		'SUPPLIER_DRAW_COUPON': '/m/o/coupon/1.0/drawCoupon',                     //领取优惠券的接口
		'SUPPLIER_RECOMMEND': '/m/g/1.0/goodsView/supplierRecommend',             //商家推荐数据
		'GOODS_SEARCH': '/m/c/1.0/opensearch/goodsSearch',                        //商家全部商品列表
		'SUPPLIER_GOODS_CATE': '/m/g/1.0/category/supplierGoodsCategory',         //商家的商品分类
		'SUPPPLIER_CATE_GOODS': '/m/g/1.0/category/supplierCategoryGoods',        //商家分类下的商品
		'XN_CUSTOMER': '/m/c/m/customer/service/1.0/xnCustomer',                  //联系商家
		'SEARCH_TEXT_MAX': '/m/g/1.0/search/1.0/supplier/searchTextMax',          // 搜索框内默认的词
		'SPECIAL_SUBJECT': '/m/a/supplierSubjectPage/1.0/getSupplierFirstSubjectPage',//专题页面
    'DRAW_COUPON': '/m/o/coupon/1.0/drawCoupon',                              // 领取优惠券接口
	},

	THEMATIC: {
		'GET_THEMATIC_DATA': '/m/a/1.0/subject/getSubjectPage',                    //获取专题页内容
	},

	// 评论页接口
	UPLOADCOMMENT: {
		'SAVECOMMENt': '/m/g/comment/1.0/saveGoodsComment',                      // 保存发表评论
		'GETCOMMENTRULE': '/m/g/comment/1.0/getCommentRule',                      // 获取评论规则
	},
	DELETE_IMAGE: '/m/u/1.0/user/deleteImgPro',                                //加强安全性-图片删除

	// 轻会员页的接口 
	LIGHTMEMBER: {
		'GETLIGHTMEMBER': '/m/a/1.0/subject/getLightMember',                      // 广告模块
		'GETEASYMEMBERINFO': '/m/a/aliPayEasyMember/1.0/getEasyMemberInfo',				// 获取用户和活动信息 参数outSignNo
    'AGREEMENTQUERY': '/m/a/aliPayEasyMember/1.0/agreementQuery',             // 查询用户是不是开通成功
	},

	// O2O 商家店铺
	Shop: {
		SEARCH: '/m/oto/otoShop/vicinityShop', // 查找指定经纬度附近的商家店铺
		GETBYID: '/m/oto/otoShop/info/', // 根据ID取得商家店铺
		GETCATEGORIES: '/m/oto/otoShopCategory/list/', // 取指定店铺的所有商品类别
		GETGOODSOFSHOP: '/m/oto/otoShopGoods/list/', // 获取指定店铺的商品列表
		LIKE: '/m/oto/otoShopAttention/1.0/attention', // 关注店铺
		TUANGOUDETAIL: '/m/oto/otoActivityTuangou/1.0/tuangouDetail', // 获取团购详情
	},

	// O2O商家店铺购物车
	O2OCart: {
		ADD: '/m/oto/otoShoppingCart/1.0/addCart', // 添加商品到购物车,
		GETS: '/m/oto/otoShoppingCart/1.0/showCart', // 取得指定店铺购物车中的所有商品
		CLEAR: '/m/oto/otoShoppingCart/1.0/removeCartAll', // 清空店铺购物车
		CHANGE: '/m/oto/otoShoppingCart/1.0/changeProduct', // 改变店铺购物车中某个商品的数量
	},

	// O2O 商品详情
	O2O_GOODSDETAIL: {
		GET_GOODS_INFOR: `/m/oto/otoShopGoods/info/`,		// 获取商品详情的信心
	},

	// O2O 购物车
	O2O_SHOPCAR: {
		addCar: `/m/oto/otoShoppingCart/1.0/addCart`,		// 加入购物车
	},

	// o2o确认订单页
	O2O_ORDERCONFIRM: {
		toOrderPay: '/m/oto/otoOrderPay/1.0/confirm',     //去确认订单页
		createPayOrder: '/m/oto/otoOrderPay/1.0/order',     //获取订单编码
		payNow: '/m/oto/otoOrderPay/1.0/payOrder',           //去支付
		queryPayType: '/m/oto/otoOrderPay/1.0/payQuery',       //检测是否支付成功的
		confirmTuangou: '/m/oto/otoOrderPay/1.0/confirmTuangou', // 确认团购订单
		nowBuy: '/m/oto/otoOrderPay/1.0/nowBuy', // 立即购买
	},

	//O2O订单部分
	O2O_ORDER: {
		getOrderList: '/m/oto/otoOrder/1.0/findOrderListByType',   //获取订单列表
		orderDetail: '/m/oto/otoOrder/1.0/detail',             //获取订单详情
		cancelOrder: '/m/oto/otoOrderPay/1.0/cancelOrder',     //取消订单
		deleteOrder: '/m/oto/otoOrder/1.0/delete',             //删除订单
		getOrderNum: '/m/oto/otoOrder/1.0/findOrderCount',      //获取各订单状态数量
		getPinOrder: '/m/oto/otoActivityTuangouRecord/1.0/findTuangouRecordList',                                   //获取社区拼团订单
		getAfterData: '/m/oto/otoOrderRefund/1.0/getOrderParam',  //获取申请退款数据
		refundOrder: '/m/oto/otoOrderRefund/1.0/refundOrder',      //申请退款
		systemRefund: '/m/oto/otoOrderRefund/1.0/refundOrderNow',    //系统直接退款
	},

	// 地址部分
	O2O_ADDRESS: {
		getAddrList: '/m/oto/otoAddress/getAddress',          	// 获取地址列表
		saveAddr: '/m/oto/otoAddress/save',          			// 保存地址
		delAddr: '/m/oto/otoAddress/delete',          			// 删除地址
	},

	// 高德地图api -- https://lbs.amap.com/api/webservice/gettingstarted
	GDMap: {
		KEY: 'd68d967fdbeba970a72653b52e5e4404',
		REGEO: 'https://restapi.amap.com/v3/geocode/regeo',	// 逆地理编码API服务地址
		SEARCH: 'https://restapi.amap.com/v3/assistant/inputtips', // 输入提示
		POI: 'https://restapi.amap.com/v3/place/text'
	},

  HOME: {
    ADVERTS_MOUDULE: '/m/a/moduleAdvert/1.1/getModuleAdvert',   //获取全部广告模块
  },

}
