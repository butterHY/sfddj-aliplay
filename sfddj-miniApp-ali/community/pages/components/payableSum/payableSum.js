Component({
  mixins: [],
  data: {
      shopTotalPrice: 0
  },
  props: {},
  didMount() {
      this.setData({
          shopTotalPrice: this.props.shopTotalPrice
      })
  },
  didUpdate() {},
  didUnmount() {},
  methods: {},
});
