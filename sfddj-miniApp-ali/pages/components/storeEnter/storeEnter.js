import { baseImageUrl } from '/api/api';
import locAddr from '/community/service/locAddr.js';

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
      // console.log(locAddr.locInfo)

      let _locInfo = locAddr.locInfo;

      let distance = _this.getDistance(_locInfo.latitude*1, _locInfo.longitude*1, this.props.storeShow.latitude*1, this.props.storeShow.longitude*1);


       console.log( distance )


      for (let i=0; i<shopGood.length; i++) {
        _goodsShow[i] = {};
        _goodsShow[i].goodsId = shopGood[i].id;
        _goodsShow[i].goodsName = shopGood[i].title;
        _goodsShow[i].goodsImage = JSON.parse( shopGood[i].goodsImagePath )[0];

        let skuList = shopGood[i].shopGoodsSkuList[0];

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

    // 计算两个经纬度之间的距离
    // 参考：https://opensupport.alipay.com/support/knowledge/46919/201602450720?ant_source=zsearch
    // lat1 第一点的纬度
    // lng1 第一点的经度
    // lat2 第二点的纬度
    // lng2 第二点的经度
    getDistance(lat1, lng1, lat2, lng2) {
      lat1 = parseFloat(lat1);
      lng1 = parseFloat(lng1);
      lat2 = parseFloat(lat2);
      lng2 = parseFloat(lng2);
      var f = this.getRad((lat1 + lat2) / 2);
      var g = this.getRad((lat1 - lat2) / 2);
      var l = this.getRad((lng1 - lng2) / 2);
      var sg = Math.sin(g);
      var sl = Math.sin(l);
      var sf = Math.sin(f);

      var s, c, w, r, d, h1, h2;
      var a = 6378137.0;//The Radius of eath in meter.
      var fl = 1 / 298.257;
      sg = sg * sg;
      sl = sl * sl;
      sf = sf * sf;
      s = sg * (1 - sl) + (1 - sf) * sl;
      c = (1 - sg) * (1 - sl) + sf * sl;
      w = Math.atan(Math.sqrt(s / c));
      r = Math.sqrt(s * c) / w;
      d = 2 * w * a;
      h1 = (3 * r - 1) / 2 / c;
      h2 = (3 * r + 1) / 2 / s;
      s = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
      s = Math.round(s);
      return s;
    },
    getRad(d) {
      var PI = Math.PI;
      return d * PI / 180.0;
    }
    
  }
});
