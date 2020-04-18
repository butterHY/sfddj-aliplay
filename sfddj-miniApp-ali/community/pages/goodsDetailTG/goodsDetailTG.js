import http from '/api/http';
import api from '/api/api'; 
Page({
  data: {
    goodsId: 2,
    goodsImagePath: [],
    godosPriceInfo: null,
    goodsInfo: null,
    skuList: null,
    shopId: '',       // 店铺id
    storeTime: null,  // 店铺营业时间
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
        // console.log(_data)
        let _goodsImagePath = JSON.parse( _data.goodsImagePath );  
        let _goodsInfo = {}
        let _skuList = {} 
        let _storeTime = {} 
        // 商品价格区域
        _this.setPrice(_data);
        // 营业时间
        _storeTime.endBusinessTime = _data.endBusinessTime;
        _storeTime.startBusinessTime = _data.startBusinessTime;
        _storeTime.nowTime = _data.nowTime;
        // 商品详情介绍
        _goodsInfo.info = _data.goodInfo;
        _goodsInfo.introduction = _data.introduction; 
        _skuList = _data.shopGoodsSkuList[0]; 

        _this.setData({
          goodsImagePath: _goodsImagePath, 
          goodsInfo: _goodsInfo,
          skuList: _skuList,
          shopId: _data.shopId,
          storeTime: _storeTime
        }); 
        // 设置标题
        my.setNavigationBar({ 
          title: _data.title,
        });
      }

    }, (err) => { })
  },

  setPrice(data) {
    const _this = this; 
    let _price = {}; 
    let _goodsImagePath = JSON.parse( data.goodsImagePath );    
    
    // 全部数据
    _price = Object.assign({}, data); 

    // 图片数据
    _price.goodsImagePath = api.baseImageUrl + _goodsImagePath[0];  
    
    _this.setData({ 
      godosPriceInfo: _price, 
    });
  }
});
