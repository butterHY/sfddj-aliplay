Component({
  mixins: [],
  data: {
    hasAddr: false,
    defaultAddress: {}
  },
  props: {},
  didMount() {
    this.setData({
      defaultAddress: this.props.defaultAddress,
      hasAddr: this.props.defaultAddress && Object.keys(this.props.defaultAddress).length > 0 ? true : false,
      shopId: this.props.shopId
    })
  },
  didUpdate() {
    this.setData({
      defaultAddress: this.props.defaultAddress,
      hasAddr: this.props.defaultAddress && Object.keys(this.props.defaultAddress).length > 0 ? true : false
    })
  },
  didUnmount() { },
  methods: {},
});
