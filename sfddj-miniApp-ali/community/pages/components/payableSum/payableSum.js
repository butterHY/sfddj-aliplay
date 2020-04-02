Component({
  mixins: [],
  data: {
      totalPrice: 0
  },
  props: {},
  didMount() {
      this.setData({
          totalPrice: this.props.totalPrice
      })
  },
  didUpdate() {
      this.setData({
          totalPrice: this.props.totalPrice
      })
  },
  didUnmount() {},
  methods: {},
});
