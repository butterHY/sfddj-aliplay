import http from '/api/http';
import api from '/api/api';
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
      this.setData({
        goodsInfo: _this.props.godosPriceInfo
      })
    },

    addCar(e) {
      const _this = this; 
      let addData = {
        skuId: e.target.dataset.skuId,
        quantity: 1
      }  

      http.post(api.O2O_SHOPCAR.addCar, addData, (res) => {
        const _data = res.data.data;
        const _ret = res.data.ret;
        if( _ret.code == '0' ) {
          console.log('addCar', _data)
        }
      }, (err)=>{} );
    }
  },
});
