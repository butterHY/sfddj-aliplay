import api from '/api/api';

Component({
  mixins: [],
  data: {
    baseImageUrl: api.baseImageUrl,
    goodsIntro: {
      infoShow: [],
      detail: [],
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
      // let _title = 'goodsIntro.infoShow[' + 0 + '].title';
      // let _text = 'goodsIntro.infoShow[' + 0 + '].text';
      let infoShow = [];
      let info = this.parseIntro(this.props.goodsInfo.info);

      // 如果是对象，则直接将整个数据保存
      if (typeof (info) == 'object') {
        infoShow.push(info);
      } else {
        let infoObj = { desc: info };
        infoShow.push(infoObj);
      }

      _this.setData({
        'goodsIntro.infoShow': infoShow
      })
      // console.log(this.data.goodsIntro.infoShow)
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
