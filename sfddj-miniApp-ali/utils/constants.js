// var _myShim = require("....my.shim");
/**
* 配置字段文件类
* @author 01368384，854638
*/

var release = false; //环境切换开关 true:正式环境  false：测试环境

var baseUrl_sit = "https://shop.fx-sf.com"; //测试环境https://sit.sfddj.com https://itsm.sfddj.com；https://shop.fx-sf.com
// var baseUrl_sit = "https://sit.sfddj.com";   //测试环境https://sit.sfddj.com
var baseUrl_pro = "https://m.sfddj.com"; //生产环境
var appType = "/miniapp/v1"; //接口应用类型（小程序或app）
var baseImageUrl_sit = "https://img.fx-sf.com/"; //图片前缀测试环境https://imgsit.sfddj.com
// var baseImageUrl_sit = "https://imgsit.sfddj.com/" //图片前缀测试环境https://imgsit.sfddj.com
var baseImageUrl_pro = "https://img.sfddj.com/"; //图片前缀生产环境
var appPre = '/app/v1';      //跟app调用同一个接口

// var  


// wx.request({
//   url: constants.UrlConstants.baseUrlOnly + constants.InterfaceUrl.POST_ORDER_INVOICE + '?companyName=' + invoiceDatas.companyName + '&taxCode=' + invoiceDatas.taxCode + '&mobile=' + invoiceDatas.phoneNumber,
//   header: {
//     "loginToken": token,
//   },
//   method: 'POST',

/**0
 * BaseUrl地址
 */
var UrlConstants = {
	baseUrl: (release ? baseUrl_pro : baseUrl_sit) + appType,
	baseUrlOnly: release ? baseUrl_pro : baseUrl_sit,
	baseUrlApp: (release ? baseUrl_pro : baseUrl_sit) + appPre,
	baseImageUrl: release ? baseImageUrl_pro : baseImageUrl_sit,
	baseImageLocUrl: baseImageUrl_pro, //存在于服务器端的静态图片前缀
	chInfo: release ? "ch_2019030863501284" : "ch_2018122562647749",    //外跳的信息  
	umaAppKey: release ? '5db26b0f570df32c3b000556' : '5da40e8e570df31bcd000ca6',      //友盟+的appkey


	/**
	 * 缓存key
	 */
}; var StorageConstants = {
	userInfoKey: "userInfo",
	loginInfoKey: "loginfo",
	tokenKey: "token",
	childrenCategoryKey: "childrenCategoryKey",
	searchWordsKey: 'searchWordsKey',
	fatherCategoryId: "fatherCategoryId",
	detfatherCategory: "detfatherCategory",
	isMember: 'isMebmer',
	myPhone: 'myPhone'

	/**
	 * 业务接口地址
	 */
};
var InterfaceUrl = {
	//---------首页相关接口----------//
	GET_ALL_GOODS: "/tuangou/allGoods", //获取所有拼团商品
	GET_ALL_GOODSV2: "/tuangou/allGoodsV2", //获取所有拼团商品(新)
	GET_ALL_FREECOUGOODS: '/tuangou/freeCouponGoodsList', //获取团长免单商品列表
	GET_TUAN_LOTTERYIMG: "/tuangou/lotteryMaterial", //获取拼团抽奖商品列表页的banner图
	GET_COUPON_LIST: '/coupon/couponList', //获取用户所有优惠券
	GET_PINCOUPON_LIST: '/tuangou/freeCouponList', //获取用户拼团优惠券
	GET_PINCOUPONUNUSED_LIST: '/tuangou/freeCouponExpireList', //获取用户过期拼团优惠券
	CAN_RECEIVE_COUPON: '/coupon/canReceiveCoupon', //获取用户可以领取的优惠券
	CAN_RECEIVE_COUPON2: '/coupon/canReceiveCoupon2', //获取用户可以领取的优惠券(新)
	GET_TOP100: '/home/getRecommendNew/100', //获取销量前100的产品
	GET_TOP30: '/home/getRecommendNew/30', //获取销量前30的产品
	EXCHANGE_COUPON: '/coupon/exchangeCoupon', //兑换/领取优惠券

	USE_COUPON_SUITABLE: '/coupon/useCouponSuitable',   //去使用的优惠券商品列表

	GET_GOODS_DETAIL: '/tuangou/goodsDetail', //获取商品详情
	TUANGOU_GOODS_DETAIL: '/tuangou/goodsDetail', //获取拼团商品详情
	TUANGOU_LIKE_GOODS: '/tuangou/likeGoods', //你可能还想拼
	HOT_WORD: '/home/hotWord', //热门搜索词
	SEARCH: '/home/search', //首页搜索
	GET_RECOMMEND: '/home/getRecommend', //今日推荐 
	USER_SHOW_WINDOW: '/user/showWindow', //判断小程序首页是否需要弹窗领卷
	USER_BINGMOBILE2: '/user/bingMobile2', //领取优惠劵绑定手机号
	USER_BINGMOBILEV2: '/user/bingMobileV2', //领券时自动授权绑定手机号
	USER_BINGMOBILEV3: '/user/bingMobileV3', //领券时自动授权绑定手机号(首页)
	USER_BINGMOBILEV4: '/user/bingMobileV4', //支付宝小程序获取直接获取手机绑定

	HOME_BANNER_LIST: '/home/getMaterialGroup',   //首页banner接口
	HOME_GROUPGOODS_LIST: '/home/getGroupGoods',    //首页商品列表
	HOME_POP: '/1.0/pop/advert/getPop',           //首页弹窗广告
	//---------分类相关接口----------//
	HOME_ALL_CATEGORY: "/home/allCategory", //所有分类
	CATEGORY_LOAD_ALL: "/category/loadAll", //顶级分类查询
	CATEGORY_LOAD_ONE: "/category/loadOne", //子分类查询

	//--------购物流程相关接口--------//
	JUDGE_PINTUAN: "/goods/checkGoods", //先判断是否是拼团的商品
	GOODS_DETAIL: "/goods/goodsDetail", //商品详情
  NEW_GOODS_DETAIL: '/goodsShow/1.0/view', // 新版商品详情接口
	SUPPLIER_DETAIL: "/supplier/supplierDetial/", //商家详情
	SHOP_ADD_CART: "/shop/cartItem/addCart", //加入购物车
	SHOW_CART: "/shop/cartItem/showCart", //购物车列表展示
	SHOP_UPDATE_CART: '/shop/cartItem/updateCart', //更新购物车数量
	SHOP_REMOVE_CART: '/shop/cartItem/removeCart/', //删除购物车
	SHOP_CHANGE_PRODUCT: '/shop/cartItem/changeProduct', //修改购物车商品规格
	SHOP_FIND_GROUP: '/shop/cartItem/findGroup', //购物车推荐商品
	SHOP_GET_COUNT: '/shop/cartItem/getCount', //购物车数量
	SHOP_GIFT_LIST: '/shop/gift/sendGiftActivityGoodsList', //送礼列表
	CONTROL_PAYMENT: '/pay/controlPayment', //监测用户支付行为

	PAY_TO_BUY_NOW: '/pay/toBuyNow', //立即购买,获取订单内容
	PAY_BUY_NOW: '/pay/buyNow', //立即购买，根据订单内容产生订单id和支付参数
	PAY_BUY_NOW_2: '/pay/buyNowV2', //立即购买版本2
	PAY_TO_CART_PAY: "/pay/toCartPay", //购物车跳转立即支付，获取订单内容
	PAY_CART_PAY: '/pay/cartPay', //购物车支付，根据订单内容产生订单id和支付参数
	PAY_GIFT_PAY: '/pay/multiGiftOrderPay', //多人送礼

	GET_GOODS_DETAIL_COMMENT: '/goodsComment/getGoodsDetail_Comment', //商详页评论数据
	GOODS_COMMENT_LIST: '/goodsComment/commentList', //获取分页的评论列表数据
	GET_SUPPLIER_GOODS_VO: '/supplier/supplierGoodsVo/', //获取店铺详情页的所有商品
	GET_SUPPLIER_GOODS_VOV2: '/supplier/supplierGoodsVoV2/', //获取店铺详情页的所有商品(新的)
	SAVE_COMMENT: '/goodsComment/saveComment', //上传商品评价
	SAVE_COMMENTV2: '/goodsComment/saveComment_V2', //上传商品评价(新)
	FIND_GOODS_COMMENT: '/goodsComment/findGoodsComment', //验证订单是否已经评论过
	GET_COMMENT_TOKEN: '/goodsComment/getGoodsCommentToken',

	//--------登录认证相关接口-------//
	LOGIN_AUTH: "/login/auth", //登录获取token
	LOGIN_AUTH2: "/login/auth2", //登录获取token新
	USER_SEND_CODE: "/user/sendCode", //绑定手机号获取验证码
	USER_BING_MOBILE: "/user/bingMobile", //绑定手机号
	USER_CHANGE_SENDCODE: '/user/sendCode2', //用户换绑手机号发送验证码
	USER_CHANGE_BINGMOBILE: '/user/changeBing', //用户换绑手机号
	ALI_LOGIN_AUTH: '/login/aliAuth',    //支付宝小程序登录接口

	//---------个人中心相关接口----------//
	// USER_USERINFO: '/user/getUserInfo',  //查询个人信息
	USER_USERINFO: '/user/userInfo', //查询个人信息
	ADD_ADDRESS: '/user/addAddress', //新增用户地址
	SEARCH_ADDRESS: '/user/searchAddress', //获取用户地址
	MODIFY_ADDRESS: '/user/modifyAddress', //修改用户地址
	DELETE_ADDRESS: '/user/deleteAddress', //删除用户地址
	GET_INTEGRAL: '/user/memberPointDetail', //获取积分详情
	GET_INTEGRAL_RECORD: '/user/memberPointRecordList', //获取积分收支明细
	GET_ORDER_LIST: '/order/list', //根据类型获取订单的列表
	ORDER_LIST_COUNT: '/order/listCount', //获取订单数量
	TO_ORDER_PAY: '/pay/toOrderPay', //未支付订单跳转到支付确认页
	USER_EXPRESS: '/user/express', //查询物流信息
	ORDER_RECEIVE: '/order/receive', //用户确认收货
	COUNTINUE_PAY_ORDER: '/pay/continuePayOrder', //未支付的订单继续支付
	CONTINUE_ALIPAY_ORDER: '/pay/continueAliPayOrder',    //未支付的订单继续支付--支付宝小程序
	CNACEL_ORDER: '/order/cancelNoPayOrder', //取消订单
	ORDER_DELETE: '/order/delete', //删除订单  
	ORDER_DETAIL: '/order/order_view', //订单详情
	TUANGOU_ORDER_LIST: '/tuangou/orderList', //获取拼团订单列表
	TUANGOU_ORDER_LISTV2: '/tuangou/orderListV2', //获取拼团订单列表(新)
	TUANGOU_ORDER_DETAIL: '/tuangou/tuanGouDetail', //团购订单详情
	GIFT_SHARE_PAGE: '/shop/gift/sharePageV1', //分享Ta页面展示内容
	SHOP_GIFT_SHARE: '/shop/gift/shareV1', //保存送礼信息
	SHOP_GIFT_RECEIVE: '/shop/gift/receive/', //收礼者页面展示内容(get)
	GIFT_RECEIVE: '/shop/gift/receive/', //提交收礼表单的处理(post)
	SHOP_MULTIGIFT_RECEIVE: '/shop/gift/receiveV1/', //多人送礼收礼者页面展示内容(get)
	MULTIGIFT_RECEIVE: '/shop/gift/receiveV1/', //多人送礼提交收礼表单的处理(post)
	SENDER_WRITE_ADD: '/shop/gift/writeAddressPage/', //多人送礼，送礼者填写地址的处理
	MULTIG_GTFT_ORDER_DETAIL: '/shop/gift/multiGiftOrderDetail/', //多人送礼订单详情页
	GET_THANKSCARD: '/shop/gift/thanksCardData', //获取感谢卡的数据 
	POST_THANKSCARD: '/shop/gift/thanksCardShareCallback', //分享感谢卡的回调
	GET_MEMBERGOODS: '/goods/getMemberGoods', //获取积分兑换商品
	GET_COMEMBERGOODS: '/goods/getCoMemberGoods', //获取优惠购物商品
	GET_MEMBERDEDUCTGOODS: '/goods/getMemberDeductGoods', //获取积分抵扣的商品
	GET_GROWVALUE_RECORD: '/user/memberGrowValueRecordList', //获取成长值增加明细
	SIGN_IN: '/user/signIn', //签到
	GET_MEMBER_AREA: '/user/toMemberIndex', //获取会员专区信息
	GET_MEMBER_EQUTITY: '/user/toMemberEquity', //获取会员权益信息
	GET_MONTHGIFT_PACK: '/coupon/drawVipMonthGiftPackage', //领取专享礼包
	GET_BIRTHDAYGIFT: '/coupon/drawBirthdayGiftPackage', //领取生日礼包
	GET_MEMBERLEVEL_INFO: '/user/memberInfo', //获取会员等级接口
	POST_MEMBER_INFOLIST: '/user/toMyInfoList', //获取个人中心资料
	POST_SAVEGENDER: '/user/saveGender', //修改性别
	POST_SAVEBIRTHDAY: '/user/saveBrithday', //保存生日
	POST_SAVEUSERNAME: '/user/saveUserName', //保存昵称

	GET_MATERIALGROUP: '/home/getMaterialGroup', //获取各轮播图片

	//--------售后相关接口----------//
	SEARCH_APPLY: '/workOrder/searchApply', //查询售后列表
	UPLOAD_IMG: '/workOrder/uploadImg', //上传图片
	DELETE_IMAGE: '/workOrder/deleteImage', //删除图片
	AFTER_SALE: "/workOrder/afterSale", //申请售后
	AFTER_SALE_DETAIL: '/workOrder/afterSaleDetail', //售后详情
	GET_REFUND_MONEY: '/workOrder/getRefundMoney', //获取协商退款金额
	GET_REFUND_MONEYV2: '/workOrder/getRefundMoneyV2', //获取协商退款金额（新）
	WORK_ORDER_CANCEL_APPLY: "/workOrder/cancelApply", //取消售后接口
	APPLY_APPEAL: '/workOrder/applyAppeal', //申述客服
	AGREE_REFUND_AMOUNT: '/workOrder/agreeRefundAmount', //同意协商金额
	CANCEL_APPEAL: '/workOrder/cancelAppeal', //取消申诉客服
	GET_GOODS_AFTER_TRADE_SUC: '/home/getGoodsAfterTradeSucess', //购物完成页猜你喜欢
	// ------------广告行为转化数据上报--------------//
	USERACTION_ADD: '/userAction/add', //上报数据
	USERACTION_CREATE: '/userAction/create', //创建行业数据源
	//   ------------- 全球购 ----------------------//
	GET_ORDER_IDENTIFY: "/order/identify", //身份证与姓名验证
	GET_GLOBAL_NOTICE: '/order/toKnow', //查看全球购用户须知
	UPLOAD_IDCARDIMG: '/upload/saveIDCardImg', //上传身份证图片

	//    ----------------获取jsticket和id传给365那边 -------------//
	GET_TICKET_ID: '/getWeixinData', //获取公众号的jsticket和appid

	// --------------超级会员日 ----------------//
	MEMBER_SUPERDAY_INFO: '/MyInfo/toMemberSuperDay', //超级会员日列表
	MEMBER_SUPERDAY_GOODS: '/MyInfo/findGoodsByGroupName', //超级会员日商品列表

	// --------------购物返现-----------------//
	MEMBER_BALANCE: '/member/memberBalance', //获取可用余额详情
	MEMBER_AVAILABLE_BALANCE: '/member/availableBalance', //获取可用余额明细
	MEMBER_FROZEN_BALANCE: '/member/frozenBalance', //获取预到账余额

	MEMBER_RELE_TASK: '/MyInfo/saveTaskFinished', //完成保级任务


	//  ----------------------速运+跳过来的登录 ----------------- //
	SF_MEMBER_LOGIN: '/goods/goodsSFMemberDetail', //速运会员自动注册登录
	SAVE_ADDRESS_SF: '/goods/saveAddress', //保存速运传过来的地址


	// -----------------------商品分组数据------------------------
	GET_GROUP_DATA: '/m/g/1.0/group/listGoodsByName',


	// ---------------------  秒杀页面--活动场次接口 ----------------
	POST_SPIKE_ACTIVITY_VENUE: '/m/g/secondKill/findActivitysById',

	POST_SPIKE_GOODSLIST: '/m/g/secondKill/findActivityGoodsByDetailId',

	// ----------------- 达观数据上报 ----------------------//
	da_collect: {
		useraction_collect: '/m/da/1.0/useraction/collect/data'
	},

  // ---------------------  支付成功的优惠券弹窗 ----------------
  couponPop: '/pay/sendOrderPayfinishCoupon'

  

	/**
	 * 接口错误Code
	 */
};
var errorCode = {
	SUCCESS: '0001', //成功
	NEED_SHOW_DIALOG: '120001', //需要弹窗
	NOT_SHOW_DIALOG: '120002', //不需要弹窗
	RE_LOGIN: '1001', //需要登录
	BIND_PHONE: '1012', //绑定手机
	ERROR: '0002', //异常
	REQUEST_ERROR: '0003', //请求参数不合法
	GOODS_NUM_ERROR: '6001' //商品数量错误
};

module.exports = {
	UrlConstants: UrlConstants,
	StorageConstants: StorageConstants,
	InterfaceUrl: InterfaceUrl,
	errorCode: errorCode
};