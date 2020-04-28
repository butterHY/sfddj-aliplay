// <!-- 首页 1+ 4 模块 组件 -->

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
    this.$page.onefouradvertAds = this;
    console.log('我是 onefouradvert')
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    goToPage(e) {
      let { index } = e.currentTarget.dataset;
      my.uma.trackEvent('homepage_oneFour_click', { index: index });
      this.props.onGoToPage(e);
    },
  },
});
