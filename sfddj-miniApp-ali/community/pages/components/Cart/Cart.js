import Cart from '/community/service/cart';

Component({
  mixins: [],
  data: {
    isShowed: false
  },
  props: {
    canShowDetails: false
  },
  didMount() {
    this.selfName = 'cart';
    this.cart = Cart.init('cart', this);
  },
  didUpdate() {
    if(this.props.shopid) {
      this.cart.gets(this.props.shopid, (res) => {
        if(res) {
          this.setData({
            'cartitems': res.cartList,
            'obj': res
          });
        }
      });
    }
  },
  didUnmount() {},
  methods: {
    onShowDetailClick() {
      if(this.data.isShowed) {
        this.onHideClick();
      } else {
        this.setData({isShowed: true}, () => {
          setTimeout(() => {
            this.setData({itemsshow: true});
          }, 0);
        });
      }
    },
    onHideClick() {
      this.setData({itemsshow: false}, () => {
        setTimeout(() => {
          this.setData({isShowed: false});
        }, 380);
      });
    }
  },
});
