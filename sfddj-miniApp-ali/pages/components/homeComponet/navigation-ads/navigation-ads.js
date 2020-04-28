// <!-- 首页 1行N个 ++ 大 组件 -->

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
    this.$page.navigationAds = this;
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    goToPage(e) {
      this.props.onGoToPage(e);
    },
  },
});
