// var _myShim = require('........my.shim');
// pages/user/helpCenter/helpCenter.js 
var sendRequest = require('../../../utils/sendRequest');
var utils = require('../../../utils/util');
let constants = require('../../../utils/constants');



Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectItem: 0,
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    list1: [{
      title: '发货时间',
      content: '一般在您下单后24小时内发货，部分商品发货时间会有所差异（如现采现摘、进口清关等），以商品页面描述为准，预售商品下单前请仔细阅读商家发货说明，如遇客观原因影响发货时间商家会在商品页面公告。\r\n注：特殊发货需求请您在下单前联系商家确认，否则商家将按页面描述时间安排发货。',
      image: '',
      open: false
    }, {
      title: '商品到哪里了',
      content: '订单“查询物流”您可通过“大当家商城”—“我的”—“我的订单”—点击对应商品订单下方“查询物流”查看或拨打顺丰物流专线95338查询。',
      image: '',
      open: false
    }, {
      title: '订单查询',
      content: '1、可通过“当家商城”-“我的”-“订单列表”进行查询。\r\n2、关注支付宝生活号“顺丰大当家”-“我的”-“我的订单”。',
      image: '',
      open: false
    }, {
      title: '修改订单收货人信息',
      content: '下单时请您仔细核对购买商品规格及收货人信息，修改收货人信息请在“待发货”状态下联系商家。\r\n注：生鲜水果商品一经发货，因物流时效延长坏果风险高，概不支持修改地址和转寄。',
      image: '',
      open: false
    }, {
      title: '取消订单',
      content: '“待发货”订单您可在订单详情页“申请退款”，商家将在24小时内审核处理。 不支持取消订单情形：\r\n1. 已发货商品;\r\n2. 活动商品截单后不支持取消订单，如截单后申请退款商家有权驳回（截单后商家将批量安排打单发货，故无法受理退款需求）。\r\n3. “申请退款”可进行撤销操作，如确认需要继续发货，请及时撤销申请，商家会尽快安排发货，发货后支持申请售后。',
      image: '',
      open: false
    }, {
      title: '超物流配送范围或时效订单处理',
      content: '如订单超物流配送范围或时效，商家将联系客户取消订单，如客户强烈要求发出，商品损耗风险需客户自行承担，商家无法受理相关售后；\r\n订单发货异常商家将以订单预留下单人信息为准，赠送他人如未预留下单人信息，则默认联系收件人，平台承诺将对客户预留信息进行保密，不做任何其他商业用途。',
      image: '',
      open: false
    }, {
      title: '如何联系商家客服',
      content: '1、您可在商品页面左下角点击“联系商家;\r\n2、 “我的订单”点击“联系商家”。',
      image: '',
      open: false
    }, {
      title: '商品验货及签收',
      content: '订单发货后，物流配送或自提时段内请保持手机畅通，生鲜水果类商品因个人原因（收货人信息有误、电话关机等）导致签收异常，将无法确保商品质量，商家无法提供售后；收到商品请当面与收派员核对是否与订单一致且无商品品质异常。',
      image: '',
      open: false
    }],
    list2: [{
      title: '售后流程',
      content: '如您收到问题商品，请于签收后48小时售后时效内申请售后（特殊商品如商品页面有售后时效说明以商品页面为准），商家将在24小时内处理，遇特殊情形如法定节假日等可能顺延处理。\r\n 售后申请流程：“大当家商城”—“我的”—“我的订单”—点击对应商品订单进入“订单详情”申请售后。\r\n 特殊说明：水产肉类/新鲜蔬果/熟食等生鲜易腐食品因商品特殊性不支持拒收，如有任何商品问题请签收后于售后时效内申请售后。',
      image: '',
      open: false
    }, {
      title: '售后凭证说明',
      content: '提交售后申请时，为确保商家快速处理您的售后问题，请您如是描述您的商品问题并提供清晰可分辨商品问题的照片凭证，原则上如您无法提供真实有效的照片凭证，商家将无法正常受理您的售后。',
      image: '',
      open: false
    }, {
      title: '如何申请平台介入售后',
      content: '如您对商家售后处理有疑议，可要求平台介入，申请流程：“大当家商城”—“我的”—“我的订单”—点击对应商品订单进入“订单详情”—点击【商家已处理】进入处理详情--选择【平台介入】--正确填写申诉原因及照片凭证--【确认】提交，平台将在24小时内处理。',
      image: '',
      open: false
    }, {
      title: '7天无理由退换货',
      content: '客户提出的商品退换货要求需符合国家法律规定的7天无理由退换货品类：\r\n存在以下情形之一的，不予办理退换货：\r\n1、签收次日算起超过7天；\r\n2、商品吊牌、配件/赠品（需要和主商品一起退换，如已损毁丢失等，无法退回的情况下，需按照配件/赠品对应价值折算金额抵扣）、发票缺失或涂改（需要和主商品一起退换，如已损毁丢失等，无法退回的情况下，客户需自行承担发票扣点）、有明显使用痕迹等影响二次销售的商品；\r\n3、基于安全及健康考虑，已拆封的食品、药品、保健品、化妆品、贴身用品等；\r\n4、一经激活或者试用后价值贬损较大的商品，如手机、电脑、数码产品等；\r\n5、拆封后影响人身安全或者健康的商品，或者拆封后易导致商品品质发生改变的商品；\r\n6、礼包或者套装中商品不可以部分退换货；\r\n7、销售时已明示的临近保质期的商品、有瑕疵的商品；\r\n8、消法规定的不可退换商品及其他依法不应办理退换货的情形。',
      image: 'http://img.sfddj.com/miniappImg/more/7TuiHuo.jpg',
      open: false
    }, {
      title: '跨境商品退换货细则',
      content: '注：\r\n1、因跨境商品均为保税仓或境外发货，商品不支持换货，仅提供退货服务；\r\n2、如在购买过程中使用优惠券或折扣券等进行抵扣，如产生退货，抵扣部分不予退还；\r\n3、因跨境购政策随时调整，以上条款将做不定期更新\r\n4、平台退货条件同时适用于跨境商品品类',
      image: 'http://img.sfddj.com/miniappImg/more/worldTuiHuo.jpg',
      open: false
    }, {
      title: '退换货售后规则',
      content: '1.7天无理由退换货即自签收之日起7天内（客户签收商品次日凌晨起开始满168小时为7天）向商家发起申请，商家收到退货商品并确认无误后3个工作日内安排退款。\r\n2.支持7天无理由退换货的商品需保持商品原有品质、功能，商品本身、配件、商标标识齐全且赠品（如有）、发票（如有）齐全、不影响二次销售前提下。',
      image: '',
      open: false
    }, {
      title: '退换货邮费说明',
      content: '因买家自身原因而非卖家或商品原因的退换货，退回邮费由买家承担，退换货详情请联系商家咨询；如因商品质量问题导致的退换货，邮费应由商家承担。',
      image: '',
      open: false
    }, {
      title: '退款说明',
      content: '全额退款或部分退款，商家通过审核后将在3个工作日内按原支付方式退回，您可通过“大当家商城”—“我的”—“我的订单”—点击对应商品订单进入订单详情页—点击“商家已处理”查询售后退款进度。',
      image: '',
      open: false
    }, {
      title: '售后免责情形',
      content: '存在以下情形之一的，平台/商家将不承担售后责任：\r\n1、非购自本平台商品（商品条码不符，无购买凭证）；\r\n2、无法提供真实有效商品问题凭证或提供虚假凭证；\r\n3、平台以客户下单预留信息为准，食品、生鲜类商品因客户原因（收件人号码/地址错误，收件人联系不上，不在收货地等）造成延期收货，或长期未签收导致商品腐坏、无法食用；\r\n4、食品、生鲜类商品等其他无法二次销售商品签收后超48小时未开箱查验导致商品腐坏无法食用（需催熟商品可酌情考虑）；\r\n5、客户事先未与商家沟通直接拒签商品，且无法提供有效售后凭证；\r\n6、数码家电类商品因使用不当等人为原因导致的商品质量问题；\r\n7、其他依法不予以售后的情况。',
      image: '',
      open: false
    }],
    list3: [{
      title: '温馨提示',
      content: '1.平台尽最大努力确保商品图片与实物一致性，由于食品、生鲜商品特殊性，图片仅供参考，商品以实物为准；因拍摄灯光及显示器色差等造成的商品图片与实物色差，不属于质量问题。\r\n2.	商品页面如已明确注明商家售后条款的商品，优先适用于商家条款规定。\r\n3.我们竭诚为客户提供优质的商品及服务，但对于故意套单，恶意索赔等违反实诚信用原则的行为，平台将保留取消订单，拒绝相关无理赔偿直至依法追究法律责任的权利。',
      image: '',
      open: false
    }, {
      title: '拼团商品',
      content: '拼团商品成团时间为24小时（<=24h），超过24小时未成团系统则自动退款。未成团期间，客户、平台及商家均不能对订单信息进行任何修改或退款操作。',
      image: '',
      open: false
    }, {
      title: '送礼订单',
      content: '您可以在付款后一键分享至您想要送礼的对象，并需要在24小时内（<=24h）填写好收件信息，订单则会正式生成，商家会按照订单生成时间正常安排发货，如24小时内未填写收件信息，超过24小时系统则自动进行退款。',
      image: '',
      open: false
    }, {
      title: '超级会员日',
      content: '1、必须为黄金会员以上，才可进行会员价够买;\r\n2、超级会员日为每周二0点至24点（如有变动会在会员中心通知），过期价格恢复正常;\r\n3、购买路径：①商城首页活动页；②商城下方-我的-会员专区-超级会员日-立即选购;',
      image: '',
      open: false
    }, {
      title: '投诉与建议',
      content: '大当家珍视您的每一个意见与建议，您可通过服务中心“联系平台客服”在线向我们反馈您的建议。',
      image: '',
      open: false
    }, {
      title: '商务合作',
      content: '商务合作请您在PC端浏览器搜索“顺丰大当家”官网，点击“关于我们”下载招商信息模板，填写后请发送至招商邮箱：sfdadangjia@sf-express.com，如有合作意向，将有专人在7个工作日内回复您的邮件，如一直未收到回复邮件，则暂无合作意向。',
      image: '',
      open: false
    }, {
      title: '客服工作时间',
      content: '正常情况下，平台客服工作时间为每天9:00-21:00。春节期间，客服值班时间会做相应调整，具体可见在线服务中心公告，其他节假日值班时间均不变。',
      image: '',
      open: false
    }]
  },
  // {
  //   title: '售后流程',
  //   content: '如您收到问题商品，请于签收后48小时售后时效内申请售后（特殊商品如商品页面有售后时效说明以商品页面为准），商家将在24小时内处理，遇特殊情形如法定节假日等可能顺延处理。 售后申请流程：“大当家商城”—“我的”—“我的订单”—点击对应商品订单进入“订单详情”申请售后。 特殊说明：水产肉类/新鲜蔬果/熟食等生鲜易腐食品因商品特殊性不支持拒收，如有商品问题请签收后于售后时效内申请售后。',
  //   image: '',
  //   open: false
  // }

  onLoad: function(options) {
		var that = this;
		that.setData({
      webCallParam: options.webCallParam
    })
	},

  //0:订单问题 1:售后问题 2:其他
  select: function (event) {
    var index = event.currentTarget.dataset.selectIndex;
    this.setData({
      selectItem: index
    });
  },

  //订单问题点击事件：
  openList1: function (event) {
    var index = event.currentTarget.dataset.index;
    var list = this.data.list1;
    for (var key in list) {
      if (key == index) {
        list[key].open = !list[key].open;
      } else {
        list[key].open = false;
      }
    }
    this.setData({
      list1: list
    });
  },

  //售后服务问题点击事件：
  openList2: function (event) {
    var index = event.currentTarget.dataset.index;
    var list = this.data.list2;
    for (var key in list) {
      if (key == index) {
        list[key].open = !list[key].open;
      } else {
        list[key].open = false;
      }
    }
    this.setData({
      list2: list
    });
  },

  //其他问题点击事件：
  openList3: function (event) {
    var index = event.currentTarget.dataset.index;
    var list = this.data.list3;
    for (var key in list) {
      if (key == index) {
        list[key].open = !list[key].open;
      } else {
        list[key].open = false;
      }
    }
    this.setData({
      list3: list
    });
  },

  // 友盟+埋点
	umaTrackEvent(type) {
		if (type == 'webViewCall') {
			// 友盟+统计--签到页浏览
			my.uma.trackEvent('customerServiceView');
    }
	},

  // 跳去客服网页版
	goToWebCall: function() {
		var that = this;
		var webCallLink = that.data.webCallParam;
		//友盟+统计--签到页浏览
		this.umaTrackEvent('webViewCall')

		try {
			my.setStorageSync({
				key: 'webCallLink', // 缓存数据的key
				data: webCallLink, // 要缓存的数据
			});
		} catch (e) { }
		my.navigateTo({
			url: '/pages/user/webCallView/webCallView?link=' + webCallLink + '&newMethod=new'
		});
	},
  // 跳去客服电话
  goToPhone: function(){
    my.makePhoneCall({ number: '0755-9533861' });
  }
});