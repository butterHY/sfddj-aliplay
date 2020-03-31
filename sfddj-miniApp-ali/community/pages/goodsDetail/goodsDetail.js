import http from '/api/http';
import api from '/api/api';

Page({
  data: {
    goodsId: 2,
    goodsImagePath: [],
    godosPriceInfo: null,
    goodsInfo: null,
    skuList: null,
  },
  onLoad(e) { 
    this.setData({
      goodsId: e.goodsId
    });
    this.getGoodsInfo();
  },

  getGoodsInfo() {
    const _this = this;
    const mydata = this.data;
    http.get( api.O2O_GOODSDETAIL.GET_GOODS_INFOR + mydata.goodsId, {}, (res) => { 
      const _data = res.data.data;
      const _ret = res.data.ret;

      if ( _ret.code == '0') {
        console.log(_data)
        let _goodsImagePath = JSON.parse( _data.goodsImagePath );  
        let _goodsInfo = {}
        let _skuList = {} 

        _this.setPrice(_data);

        _goodsInfo.info = _data.goodInfo;
        _goodsInfo.introduction = _data.introduction;

        _skuList = _data.shopGoodsSkuList[0];

        _this.setData({
          goodsImagePath: _goodsImagePath, 
          goodsInfo: _goodsInfo,
          skuList: _skuList
        });
      }

    }, (err) => { })
  },

  setPrice(data) {
    const _this = this;
    let _data = data;
    let _price = {};
    let skuData =  _data.shopGoodsSkuList[0]; 
    // 商品默认规格数据
    _price.skuData = skuData; 

    // 商品价格区域
    _price.priceShow = _data.priceShow;
    // 商品名称
    _price.name = _data.title;
    // 商品总销量
    _price.totalSaleCount = _data.totalSaleCount;
    // 商品月销量
    _price.monthSaleCount = _data.monthSaleCount;
    // 商品id
    _price.goodsId = _data.id; 
    // 商品编码
    _price.goodsSn = _data.goodsSn;

    _this.setData({ 
      godosPriceInfo: _price, 
    });
  }
});
