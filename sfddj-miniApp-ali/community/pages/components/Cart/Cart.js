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
    },
    clear() {
      if(this.data.cartitems) {
        this.$spliceData({
          cartitems: [0]
        });
      } else {
        this.setData({
          cartitems: []
        });
      }
      this.setData({obj: {}});
    },
    onClearClick() {
      my.confirm({
        content: '确定清空购物车？',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        success: (result) => {
          if(result.confirm) {
            this.cart.clear(this.props.shopid, (res) => {

            });
          }
        },
      });
    },
    onReduceClick(e) {
      if(!this._changing) {
        this._changing = true;
        this.cart.changeNum(this.props.shopid, e.target.dataset.skuid, -1, (res) => {
          this._changing = false;
        });
      }
    },
    onPlusClick(e) {
      if(!this._changing) {
        this._changing = true;
        this.cart.changeNum(this.props.shopid, e.target.dataset.skuid, 1, (res) => {
          this._changing = false;
        });
      }
    },
    onToPayClick() {
      my.navigateTo({ url: '../orderConfirm/orderConfirm?shopid=' + this.props.shopid });
    }
  },
});
