import { baseImageUrl } from '/api/api';
Component({
  mixins: [],
  data: {
    smallImg200: '?x-oss-process=style/goods_webp',   //大当家图片资源域名 
    baseImageUrl: baseImageUrl,
    aside: '专属于你的附近之精彩', 
    goodsShow: null,

},
  props: {
    storeShow: ''
  },
  didMount() { 
    this.setStoreData(); 
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    // 商铺设置数据
    setStoreData() {
      const _this = this;
      let _goodsShow = [];
      let shopGood = this.props.storeShow.shopGoodsList;
      // console.log(this.props.storeShow)

      for (let i=0; i<shopGood.length; i++) {
        _goodsShow[i] = {};
        _goodsShow[i].goodsId = shopGood[i].id;
        _goodsShow[i].goodsName = shopGood[i].title;
        _goodsShow[i].goodsImage = JSON.parse( shopGood[i].goodsImagePath )[0];

        let skuList = shopGood[i].shopGoodsSkuList[0];
        _goodsShow[i].iavValue = skuList.iavValue;

        if ( skuList.isDiscount ) {
          _goodsShow[i].salePrice = skuList.discountPrice;
          _goodsShow[i].oldPrice = skuList.salePrice;
        }
        else {
          _goodsShow[i].salePrice = skuList.salePrice;
          _goodsShow[i].oldPrice = '';
        }
        
        
      } 

      this.setData({
        goodsShow: _goodsShow
      })

    },
    // 更多
    moreShop() {
      my.navigateTo({
        url: '/community/pages/index/index',
      });
    },

    // 进店
    goShop(e) {
      let shopId = e.target.dataset.shopid; 
      my.navigateTo({
        url: '/community/pages/shop/shop?id=' + shopId,
      });
    },

    // 去详情
    goDetail(e) {
      let goodsId = e.target.dataset.goodsid;  
      my.navigateTo({
        url: '/community/pages/goodsDetail/goodsDetail?goodsId=' + goodsId,
      });
    },
  },
});
