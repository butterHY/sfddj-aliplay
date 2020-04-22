
Component({
  mixins: [],
  data: {
  },
  props: {
    onCounterPlusOne: (data) => console.log(data),
    waterIndex: 0,
  },
  didMount() {
    this.$page.goodswatefallAds = this;
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    waterFallChange (e) {
      // let { index } = e.currentTarget.dataset;
      console.log('我是瀑布流导航组件' , e)
      this.props.onWaterFallChange(e);

    }
  },
});

