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
    this.$page.twofouradvertAds = this;
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    goToPage(e) {
      this.props.onGoToPage(e);
    },
  },
});
