Component({
  mixins: [],
  data: {
    goodsIntro: {
      infoShow: [
        {
          title: '价格说明',
          text: [
            '1.未划线价：为划线价是当前商品或服务在本平台的实时销售价（不含包装费、运费等），是您最终觉定是否购买商品或服务的依据。最终以订单结算也看呈现的价格为准。',
            '2.划线价：划线价为参考价，并非原价或线下实体门店的销售价。'
          ]
        }
      ],
      detail: [
        {
          text: '未划线价：为划线价是当前商品或服务在本平台的实时销售价（不含包装费、运费等），是您最终觉定是否购买商品或服务的依据。最终以订单结算也看呈现的价格为准',
          src: '',
        }
      ], 
    }
  },
  props: {},
  didMount() { 
    this.init();
  },
  didUpdate() { },
  didUnmount() { },
  methods: {
    init() {
      const _this = this;
      _this.setInfo();
      _this.setDetaile(); 
    },

    setInfo() {
      const _this = this; 
      let _title = 'goodsIntro.infoShow[' + 0 + '].title';
      let _text = 'goodsIntro.infoShow[' + 0 + '].text';

      _this.setData({
        [_title]: _this.props.goodsInfo.info,
        [_text]: []
      })
    },

    setDetaile() {
      const _this = this; 
      let _text = 'goodsIntro.detail[' + 0 + '].text';
      let _src = 'goodsIntro.detail[' + 0 + '].src';

      _this.setData({ 
        [_text]: _this.props.goodsInfo.introduction,  
      })
    },

    imageError(e) {
      // console.log('image 发生 error 事件，携带值为', e.detail.errMsg);
    }, 
    imageLoad(e) {
      // console.log('image 加载成功', e);
    },
  },
});
