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
      goodsId: '',
      goodsSn: '',  
    }
  },
  props: {
    godosPriceInfo: 'godosPriceInfo'
  },
  didMount() {
    this.init();
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    init() {
      const _this = this;
      this.cart = Cart.init('cart', this);

      this.setData({
        goodsInfo: _this.props.godosPriceInfo
      })

      console.log(this.data.goodsInfo)
    },

    addCar(e) {
      const _this = this; 
      let _goodsInfo = this.data.goodsInfo;  
      let addData = {
        shopId: _goodsInfo.shopId, 
        skuId: _goodsInfo.skuData.id,
        num: 1
      }   
      console.log(addData)
      // 参数1：店铺ID
      // 参数2：商品数据，将整个商品数据传过去
      // 参数3：skuID
      // 参数4：数量
      // 参数5：回调函数
      _this.cart.add(addData.shopId, _goodsInfo, addData.skuId, addData.num, (res) => {
          // do somthing
          console.log(res)
      }); 

      // http.post(api.O2O_SHOPCAR.addCar, addData, (res) => {
      //   const _data = res.data.data;
      //   const _ret = res.data.ret;
      //   if( _ret.code == '0' ) {
      //     console.log('addCar', _data)
      //   }
      // }, (err)=>{} );
    }
  },
});
