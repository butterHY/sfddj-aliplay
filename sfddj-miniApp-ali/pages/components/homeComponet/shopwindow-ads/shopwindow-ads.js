// <!-- 首页广告组3个图  1+2 组件 -->

let constants = require('../../../../utils/constants');

Component({
  mixins: [],
  data: {
    baseImageUrl: constants.UrlConstants.baseImageUrl,
  },
  props: {
    onGoToPage: (data) => console.log(data),
  },
  didMount() {
    this.$page.shopwindowAds = this;
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    goToPage(e) {
      let { index } = e.currentTarget.dataset;
      my.uma.trackEvent('homepage_oneTwo_click', { index: index });
      this.props.onGoToPage(e);
    },
  },
});
