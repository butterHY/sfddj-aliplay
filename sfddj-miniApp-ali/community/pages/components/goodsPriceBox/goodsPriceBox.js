import http from '/api/http';
import api from '/api/api';
import Cart from '/community/service/cart';

Component({
  mixins: [],
  data: {
    goodsInfo: { 
      name: '',
      priceShow: '',
      totalSaleCount: '',
      defaultSku: '', 
    }
  },
  props: {
    godosPriceInfo: 'godosPriceInfo'
  },
  didMount() {
    this.cart = Cart.init(this);
    this.init();
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    init() {
      const _this = this;

      this.setData({
        goodsInfo: _this.props.godosPriceInfo,
        defaultSku: _this.props.godosPriceInfo.shopGoodsSkuList[0]
      })

      console.log(this.data.goodsInfo)
    },

    addCar(e) {
      if (!this._adding) {
        this._adding = true;
        const _this = this;
        let _goodsInfo = this.data.goodsInfo;
        let _defaultSku = this.data.defaultSku;
        let addData = {
          shopId: _goodsInfo.shopId,
          skuId: _defaultSku.id,
          num: 1
        }
        // console.log(addData)  
        // console.log(_goodsInfo) 
        // 参数1：店铺ID
        // 参数2：商品数据，将整个商品数据传过去
        // 参数3：skuID
        // 参数4：数量
        // 参数5：回调函数
        _this.cart.add(addData.shopId, _goodsInfo, addData.skuId, addData.num, (res, err) => {
          _this._adding = false;
          if (res) {
            if (err && err.msg) {
              my.showToast({
                type: 'success',
                content: err.msg,
                duration: 1500
              });
            }
          } else if (err) {
            my.alert({
              title: '提示',
              content: err
            });
          }
        });
      }
    }
  },
});
