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
	appId: env === 'production' ? '2019050764321917' : '2018073160767891',
	DDJAppId: env === 'production' ? '2019030863501284' : '2018122562647749',
	mapKey: env === 'production' ? '' : '2ceddac70ce9cc37325dec6398e5a4c7',
	lifestyleId: env === 'production' ? '2014051200005722' : '2014070200006769',

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
	},
  
  COUPON: {
    COUPON_VALID_LIST: '/m/o/coupon/1.0/user/couponList',               // 获取分页用户有效优惠券列表
    COUPON_INVALID_LIST: '/m/o/coupon/1.0/user/invalidCouponList',      // 获取分页用户有效优惠券列表
  },

	CART: {
		SHOW_CART: '/m/g/cartItem/1.0/showCart',         //新版购物车列表接口
	},
  GOODSDETAIL: {
    GET_GOODS_DETAIL: '/m/g/goodsShow/1.0/view',              // 新的商品详情商品数据
  },

  // 签到接口
  SIGNIN: {
    MEMBER_SIGN: '/m/u/1.0/member/newVersion/memberSign',     // 点击签到按钮请求接口
    PRIZE_DETAIL: '/m/u/1.0/member/newVersion/prizeDetail',   // 会员签到奖励详情
  }


}