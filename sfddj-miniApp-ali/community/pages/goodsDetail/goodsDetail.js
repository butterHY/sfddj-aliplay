import http from '/api/http';
import api from '/api/api'; 
Page({
  data: {
    goodsData: '',
    goodsId: 2,
    goodsImagePath: [],
    godosPriceInfo: null,
    goodsInfo: null,
    skuList: null,
    shopId: '',       // 店铺id
    storeTime: null,  // 店铺营业时间
    nowTime: 0,    // 服务器当前时间
    storeInfo: null,
    storeNotice: '',  // 公告
    userListTG:[]   // 团购列表
  },
  onLoad(e) { 
    this.setData({
      goodsId: e.goodsId
    });
    this.getGoodsInfo();
  },

  onHide() {
    console.log('hide')
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
          goodsData: _data,
          goodsImagePath: _goodsImagePath,
          goodsInfo: _goodsInfo,
          skuList: _skuList,
          shopId: _data.shopId,
          nowTime: _data.nowTime,
          storeTime: _storeTime,
          userListTG: _data.tuangouActivityList
        }); 
        // 设置标题
        my.setNavigationBar({ 
          title: _data.title,
        });

        // 获取商品信息
        _this.getStoreInfo();
      }

    }, (err) => {})
  },

  // 获取商家信息
  getStoreInfo() {
    const _this = this;
    let _shopId = this.data.shopId;
    
    // 不是团购 不获取
    if ( !this.data.goodsData.isTuangou ) return;   

    http.get( api.Shop.GETBYID + _shopId, {}, (res) => {
      const _data = res.data.data;
      const _ret = res.data.ret;
      if ( _ret.code == '0') {

        _this.setData({
          storeInfo: _data,
          storeNotice: _data.notice
        })
      }
      else {}
    }, (err)=>{})
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
  },

  // 分享内容
  onShareAppMessage() {
    const _this = this;
    const _goodsData = this.data.goodsData;
    const _goodsId = this.data._goodsId;
    let des = '社区专属    为您推荐社区周边优质优惠的金牌店铺'

    return {
      title: _goodsData.title,
      desc: des,
      path: 'pages/goodsDetailTG/goodsDetailTG?goodsId=' + _goodsId,
      content: '自定义吱口令文案，最多 28 个字符',
      imageUrl: '自定义分享小图 icon 元素，支持：网络图片路径',
      success: function() {},
    };
  },

});
