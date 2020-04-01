import api from '/api/api';

Component({
  mixins: [],
  data: {
        staticsImageUrl: api.staticsImageUrl,
        baseImageUrl: api.baseImageUrl,
        goodsList: [],
        shopName: '',
        typeIndex: 0,
        shopTotalPrice: 0,
  },
  props: {},
  didMount() {
        this.setData({
            goodsList: this.props.goodsList,
            shopName: this.props.shopName,
            typeIndex: this.props.typeIndex,
            shopTotalPrice: this.props.shopTotalPrice
        })
  },
  didUpdate() {
      this.setData({
          goodsList: this.props.goodsList,
          shopName: this.props.shopName,
          typeIndex: this.props.typeIndex,
          shopTotalPrice: this.props.shopTotalPrice
      })
  },
  didUnmount() {},
  methods: {},
});
