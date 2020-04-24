import {baseImageUrl} from '/api/api';
Component({
  mixins: [],
  data: {
    baseImageUrl: baseImageUrl,
    storeShow: {
      shopName: '数据未设定',
      address: '彩讯科创199',
      id: 2,
      shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
    }
  },
  props: {
    storeInfo: ''
  },
  didMount() {
    // console.log( this.props.storeInfo )

    this.setData({
      storeShow: this.props.storeInfo
    })
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    // 设置小店
    setStore() {

    },
    // 进店
    goShop(e) {
      let shopId = this.data.storeShow.id;
      my.navigateTo({
        url: '/community/pages/shop/shop?id=' + shopId,
      });
    },
  },
});
