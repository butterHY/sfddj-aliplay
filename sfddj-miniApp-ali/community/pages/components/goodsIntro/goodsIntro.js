import api from '/api/api';

Component({
  mixins: [],
  data: {
    baseImageUrl: api.baseImageUrl,
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
      let detail = [];
      let intro = this.parseIntro(this.props.goodsInfo.introduction);
      // 如果是对象，则直接将整个数据保存
      if (typeof (intro) == 'object') {
        detail.push(intro);
      } else {
        let introObj = { desc: intro };
        detail.push(introObj);
      }
      this.setData({
        'goodsIntro.detail': detail
      })
    },

    // 转换详情字段
    parseIntro(data) {
      if (typeof data == 'string') {
        try {
          var obj = JSON.parse(data);
          return obj;
          return true;
        } catch (e) {
          return data;
        }
      } else {
        return data;
      }
    },

    imageError(e) {
      // console.log('image 发生 error 事件，携带值为', e.detail.errMsg);
    },
    imageLoad(e) {
      // console.log('image 加载成功', e);
    },
  },
});
