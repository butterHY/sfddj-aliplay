import { baseImageUrl } from '/api/api';
import locAddr from '/community/service/locAddr.js';

Component({
  mixins: [],
  data: {
    smallImg200: '?x-oss-process=style/goods_webp',   //大当家图片资源域名 
    baseImageUrl: baseImageUrl,
    aside: '专属于你的附近之精彩',
    goodsShow: [],
    storeDis: 0,     // 小店距离
    show: false,
    storeShow: {}
  },
  props: {
    // storeShow: ''
  },
  didMount() {
    // this.setStoreData(); 
  },
  didUpdate() {
    // this.setStoreData(); 
  },
  didUnmount() { },
  methods: {
    // 商铺设置数据
    setStoreData(storeObj = {}, show, _locInfo) {
      const _this = this;
      let storeShow = storeObj;
      let goodsShow = this.data.goodsShow;
      let _goodsShow = [];
      let shopGood = storeShow.shopGoodsList ? storeShow.shopGoodsList : [];
      //   let _locInfo = locAddr.locInfo;
      //   console.log(locAddr.locInfo)

      // 计算店铺距离
      let _distance = _this.getDistance(_locInfo.latitude * 1, _locInfo.longitude * 1, storeShow.latitude * 1, storeShow.longitude * 1);
      //   _this.setData({
      //     storeDis: _distance
      //   });

      // 防止重复加载
      //   if (goodsShow && goodsShow.length > 0) {
      //     if (goodsShow[0].shopId == storeShow.id) return;
      //   } else {

      //   }

      // console.log('storeShow', storeShow)
      // console.log('goodsShow', goodsShow)

      for (let i = 0; i < shopGood.length; i++) {
        _goodsShow[i] = {};
        _goodsShow[i].shopId = shopGood[i].shopId;
        _goodsShow[i].goodsId = shopGood[i].id;
        _goodsShow[i].goodsName = shopGood[i].title;
        _goodsShow[i].goodsImage = JSON.parse(shopGood[i].goodsImagePath)[0];

        let skuList = shopGood[i].shopGoodsSkuList[0];
        _goodsShow[i].iavValue = skuList.iavValue;

        if (skuList.isDiscount) {
          _goodsShow[i].salePrice = skuList.discountPrice;
          _goodsShow[i].oldPrice = skuList.salePrice;
        } else {
          _goodsShow[i].salePrice = skuList.salePrice;
          _goodsShow[i].oldPrice = '';
        }
      }

      this.setData({
        storeShow,
        goodsShow: _goodsShow,
        storeDis: _distance,
        show: show
      })

    },

    // 更多
    moreShop() {
      // 友盟埋点--社区入口点击量, type为stoerList是进入社区店铺列表
      my.uma.trackEvent('homepage_O2O_enter', { type: 'storeList' });
      my.navigateTo({
        url: '/community/pages/index/index',
      });
    },

    // 进店
    goShop(e) {
      let shopId = e.target.dataset.shopid;
      // 友盟埋点--社区入口点击量, type为stoerList是进入社区店铺列表， store是进入店铺， goodsDetail是进入商品详情, shopId是店铺id
      my.uma.trackEvent('homepage_O2O_enter', { type: 'store', shopId: shopId });
      my.navigateTo({
        url: '/community/pages/shop/shop?id=' + shopId,
      });
    },

    // 去详情
    goDetail(e) {
      let {goodsId, shopId } = e.target.dataset;
      // 友盟埋点--社区入口点击量, type为stoerList是进入社区店铺列表， store是进入店铺， goodsDetail是进入商品详情, shopId是店铺id, goodsId为商品id
      my.uma.trackEvent('homepage_O2O_enter', { type: 'goodsDetail', shopId, goodsId });
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
      if (lat1 == lat2 && lng1 == lng2) return 0;
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
      s = Math.round(s) * 1;
      if (s > 1000) {
        s = (s / 1000).toFixed(2) * 1 + 'km';
      }
      else {
        s = s + 'm';
      }
      return s;
    },

    getRad(d) {
      var PI = Math.PI;
      return d * PI / 180.0;
    }

  }
});
