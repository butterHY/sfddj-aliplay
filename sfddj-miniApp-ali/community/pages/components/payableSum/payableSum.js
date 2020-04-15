Component({
  mixins: [],
  data: {
      totalPrice: 0,
      type: ''
  },
  props: {},
  didMount() {
      this.setData({
          totalPrice: this.props.totalPrice,
          type: this.props.type
      })
  },
  didUpdate() {
      this.setData({
          totalPrice: this.props.totalPrice,
          type: this.props.type
      })
  },
  didUnmount() {},
  methods: {},
});
