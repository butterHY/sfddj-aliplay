Component({
  mixins: [],
  data: {
     title: '专属于你的附近之精彩',
     locAddress: {
      city: '深圳市',
      address: '彩讯科创中心'
     }
  },
  props: {},
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    goLocationCity() {
      my.navigateTo({ url: '../addressLoc/addressLoc' });
    }

  },
});
