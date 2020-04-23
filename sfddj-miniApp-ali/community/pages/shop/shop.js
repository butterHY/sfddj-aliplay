import {getDistance} from '/community/assets/common';
import Shop from '/community/service/shop';

Page({
  data: {
    searchVal: '',
    items: []
  },
  onLoad(options) {
    this.shop = Shop.init(this);
    this.shopId = options.id;
    my.createSelectorQuery().select('.shop_goodslist').boundingClientRect().exec((ret) => {
      this.setData({
        itemsheight: ret[0].height
      });
    });
    this.shop.get(this.shopId, (res) => {
      if(res && res.data && res.data.data) {
        this.setData({
          shop: res.data.data,
          storeTime: {
            startBusinessTime: res.data.data.startBusinessTime,
            endBusinessTime: res.data.data.endBusinessTime,
            nowTime: res.data.data.nowTime
          }
        });

        this.shop.getCategories(this.shopId, (res2) => {
          if(res2 && res2.data && res2.data.data) {
            if(res.data.data.hadTuangou) {
              // 如果有设置团购，则需在左侧的类目中加入“社区团购”
              res2.data.data.splice(0, 0, {id: -1, name: '社区团购'});
            }
            this.setData({
              'categories': res2.data.data
            });
            if(res2.data.data.length) {
              this.onCategoryClick({target: {dataset: {id: res2.data.data[0].id}}});
            }
          }
        });

        if(res.data.data.nowTime && res.data.data.startBusinessTime && res.data.data.endBusinessTime) {
          let msg = undefined;
          if(res.data.data.nowTime < res.data.data.startBusinessTime || res.data.data.nowTime > res.data.data.endBusinessTime) {
            msg = '本店还未到营业时间哦~';
          } else if(res.data.data.timeEnd && res.data.data.endBusinessTime - res.data.data.nowTime < 3600000) {
            msg = `本店将于${res.data.data.timeEnd}休息，请尽快下单`;
          }
          if(msg) {
            this.setData({
              msg: msg
            });
          }
        }
      }
    });
  },
  onCategoryClick(e) {
    let id = e.target.dataset.id;
    if(id != this.data.selectedCategoryId) {
      this.setData({
        resultmsg: ''
      });
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
      this.shop.like(this.shopId, !this.data.shop.attention, (res) => {
        if(res && res.data) {
          this.setData({
            'shop.attention': !this.data.shop.attention
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
  onSearchInput(val) {
    this.setData({searchVal: val});
    // if(!e.detail.value) {
    //   if(this.data.categories && this.data.categories.length > 0 && this.data.isSearch) {
    //     setTimeout(() => {
    //       if(!this.data.searchVal) {
    //         this.setData({isSearch: false});
    //         this.onCategoryClick({target: {dataset: {id: this.data.categories[0].id}}});
    //       }
    //     }, 800);
    //   }
    // }
  },
  onSearchConfirm(e) { // 提交搜索
    if(this.data.shop && this.data.searchVal) {
      my.hideKeyboard();
      this.$spliceData({items: [0]});
      this.setData({
        isSearch: true,
        selectedCategoryId: -99
      }, () => {
        this.setData({
          resultmsg: ''
        });
        this.shop.searchGoodsOfShop(this.shopId, this.data.searchVal, (res) => {
          if(res && res.data && res.data.data) {
            if(res.data.data.length > 0) {
              this.$spliceData({items: [0, 0, ...res.data.data]});
            } else {
              this.setData({
                resultmsg: '未搜索到相关产品~'
              });
            }
          }
        });
      });
    }
  },
  onSearchClear() {
    this.onSearchCancel();
  },
  onSearchCancel() { // 取消搜索，展示类目中第一个类目的商品列表
    this.setData({searchVal: ''});
    if(this.data.categories && this.data.categories.length > 0 && this.data.isSearch) {
      this.setData({isSearch: false}, () => {
        this.onCategoryClick({target: {dataset: {id: this.data.categories[0].id}}});
      });
    }
  },
  onScrollToLower() {
    if(!this.data.isSearch) {
      this.loadGoods();
    }
  }
});
