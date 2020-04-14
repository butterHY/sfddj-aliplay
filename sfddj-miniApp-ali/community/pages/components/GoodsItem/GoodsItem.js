// 商品列表中的某一项
// 接收一个 data 属性参数，即要展示的商品的数据。

import Cart from '/community/service/cart';

Component({
  mixins: [],
  data: {
    cartjump: false, // 当为true时，购物车图标应用scale2 class
  },
  props: {
    data: {},
    canclick: true,
    spacingClass: 'spacing'
  },
  didMount() {
    if(!this.constructor.idx) {
      this.constructor.idx = 1;
    }
    this.setData({
      'imgidx': this.constructor.idx++
    });
    my.createSelectorQuery().select('#goodsitemimgbox_' + this.data.imgidx).boundingClientRect().exec((ret) => {
      this.setData({
        styleHeight: 'height:' + ret[0].width
      });
    });
    
    this.cart = Cart.init(this);
  },
  didUnmount() {},
  didUpdate() {},
  methods: {
    onTap(e) {
      if(this.props.canclick) {
        my.navigateTo({ url: '../goodsDetail/goodsDetail?goodsId=' + e.target.dataset.id });
      }
    },
    onCartClick() {
      if(this.props.canclick && this.props.data) {
        if(this.props.data.shopGoodsSkuList) {
          this.setData({
            cartjump: true
          }, () => {
            setTimeout(() => {
              this.setData({
                cartjump: false
              });
            }, 150);
          });
          this.cart.add(this.props.data.shopId, this.props.data, this.props.data.shopGoodsSkuList[0].id, 1, (res, err) => {
            if(res) {
              if(err && err.msg) {
                my.showToast({
                  type: 'success',
                  content: err.msg,
                  duration: 1500
                });
              }
            } else if(err) {
              my.alert({
                title: '提示',
                content: err
              });
            }
          });
        }
      }
    }
  }
});
