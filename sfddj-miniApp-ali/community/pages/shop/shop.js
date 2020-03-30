import Shop from '/community/service/shop';

Page({
  data: {
    items: []
  },
  onLoad(options) {
    this.shop = Shop.init('shop', this);
    this.shopId = options.id;
    my.createSelectorQuery().select('.shop_goodslist').boundingClientRect().exec((ret) => {
      this.setData({
        itemsheight: ret[0].height
      });
    });
    this.shop.get(this.shopId, (res) => {
      if(res && res.data && res.data.data) {
        console.log('ssssssss', res.data.data);
        this.setData({
          shop: res.data.data
        });

        this.shop.getCategories(this.shopId, (res2) => {
          if(res2 && res2.data && res2.data.data) {
            this.setData({
              'categories': res2.data.data
            });
            if(res2.data.data.length) {
              this.onCategoryClick({target: {dataset: {id: res2.data.data[0].id}}});
            }
          }
        });

        my.getStorage({ 
            key: 'locationInfo',  
            success: function(loc) {
              if(loc && loc.data && loc.data.latitude && loc.data.longitude) {
                if(my.calculateRoute) {
                  my.calculateRoute({
                    startLat: loc.data.latitude,
                    startLng: loc.data.longitude,
                    endLat: res.data.data.latitude,
                    endLng: res.data.data.longitude,
                    success:(e)=>{
                      if(e.success && e.distance) {
                        this.setData({distance: e.distance});
                      }
                    }
                  });
                } else {
                  my.ap.updateAlipayClient({
                    success: () => {
                      my.alert({
                        title: '升级成功',
                      });
                    },
                    fail: () => {
                      my.alert({
                        title: '升级失败',
                      });
                    },
                  });
                }
              }
            } 
        });
      }
    });
  },
  onCategoryClick(e) {
    let id = e.target.dataset.id;
    if(id != this.data.selectedCategoryId) {
      let category = this.data.categories.find((T) => T.id == id);
      if(category) {
        this.setData({
          'selectedCategoryId': id,
          'selectedCategoryName': category.name
        });
        this.$spliceData({items: [0]});
        this.nextPageIdx = 0;
        this.loadGoods();
      }
    }
  },
  loadGoods() {
    if(this.shopId && this.data.selectedCategoryId && !this.data.isSearch) {
      this.shop.getGoodsOfShop(this.shopId, this.data.selectedCategoryId, this.nextPageIdx, (res) => {
        if(res && res.data && res.data.data) {
          if(res.data.data.length > 0) {
            this.nextPageIdx++;
            this.$spliceData({items: [this.data.items.length, 0, ...res.data.data]});
          }
        }
      });
    }
  },
  onLikeClick(e) {
    if(this.data.shop && !this._liking) {
      this._liking = true;
      this.shop.like(this.shopId, !this.data.shop.like, (res) => {
        if(res && res.data) {
          this.setData({
            'shop.like': !this.data.shop.like
          });
        } else {
          if(res && res.ret && res.ret.message) {
            my.alert({
              title: '提示',
              content: res.ret.message
            });
          }
        }
        this._liking = false;
      });
    }
  },
  onSearchInput(e) {
    this.setData({searchVal: e.detail.value});
    if(!e.detail.value) {
      if(this.data.categories && this.data.categories.length > 0 && this.data.isSearch) {
        setTimeout(() => {
          if(!this.data.searchVal) {
            this.setData({isSearch: false});
            this.onCategoryClick({target: {dataset: {id: this.data.categories[0].id}}});
          }
        }, 800);
      }
    }
  },
  onSearchConfirm(e) {
    if(this.data.shop && this.data.searchVal) {
      my.hideKeyboard();
      this.$spliceData({items: [0]});
      this.setData({
        isSearch: true
      });
      this.shop.searchGoodsOfShop(this.shopId, this.data.searchVal, (res) => {
        if(res && res.data && res.data.data) {
          if(res.data.data.length > 0) {
            this.$spliceData({items: [0, 0, ...res.data.data]});
          }
        }
      });
    }
  },
  onScrollToLower() {
    if(!this.data.isSearch) {
      this.loadGoods();
    }
  },
  onShowDetailClick(e) {

  },
  onToPayClick(e) {
    // TODO:
  }
});
