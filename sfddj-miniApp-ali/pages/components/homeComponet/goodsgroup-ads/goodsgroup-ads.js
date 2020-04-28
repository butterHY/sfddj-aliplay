// <!-- 首页 广告图+商品滚动 —————— 1+商品 组件 -->

let constants = require('../../../../utils/constants');

Component({
  mixins: [],
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: constants.UrlConstants.baseImageUrl,
    ossImgStyle: '?x-oss-process=style/goods_img',
  },
  props: {
    onGoToPage: (data) => console.log(data),
  },
  didMount() {
    this.$page.goodsgroupAds = this;
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
     goToPage(e) {
      this.props.onGoToPage(e);
    },
  },
});
