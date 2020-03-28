import Shop from '/community/service/shop';

Page({
  data: {
    cartitems: []
  },
  onLoad(options) {
    this.shop = Shop.init('shop', this);
    this.shopId = options.id;
    this.shop.get(this.shopId, (res) => {
      if(res && res.data && res.data.data) {
        this.setData({
          shop: res.data.data
        });

        this.shop.getCategories(this.shopId, (res2) => {
          if(res2 && res2.data && res2.data.data) {
            this.setData({'categories': res2.data.data});
            this.nextPageIdx = 0;
            this.loadGoods();
          }
        });
      }
    });
  },
  loadGoods() {
    this.shop.getGoodsOfShop(this.shopId, this.nextPageIdx, (res) => {
      console.log('GGGGG', res);
      if(res && res.data && res.data.data) {
        console.log('EEEEEEEEEEE');
        this.setData({items: res.data.data});
      }
    });
  },
  onLikeClick(e) {

  },
  onSearchInput(e) {
    this.setData({searchVal: e.detail.value});
  },
  onSearchConfirm(e) {
    // TODO: 目前缺搜索接口
  },
  onShowDetailClick(e) {

  },
  onToPayClick(e) {
    // TODO:
  }
});
