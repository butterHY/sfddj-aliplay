import Shop from '/community/service/shop';
import Cart from '/community/service/cart';

Page({
  data: {
    buyNum: 1 // 购买数量
  },
  onLoad(ops) {
    this.id = ops.id;
    if(this.id) {
      this.shop = Shop.init(this);
      this.cart = Cart.init(this);
      this.shop.getTuanGouDetail(this.id, (res, err) => {
        if(res && res.data && res.data.data) {
          res.data.data.recordStatus = 1;
          res.data.data.orderSn = 'abc';
          this.setData({'data': res.data.data}, () => {
            this.timer();
          });
        } else {
          my.alert({
            title: '提示',
            content: err || '请稍后再试'
          });
        }
      });
    }
  },
  timer() {
    if(!this.unloaded && this.data.data.recordStatus == 0) { // 团购状态 0 待成团  1  团购成功  2团购失败
      let time = this.data.data.activityEndTime - Date.now();
      let h = 0, m = 0, s = 0, recordStatus = 0;
      if(time > 0) {
        s = parseInt(time / 1000);
        h = parseInt(s / 3600);
        s -= h * 3600;
        m = parseInt(s / 60);
        s -= m * 60;
      } else {
        recordStatus = 2;
      }
      this.setData({
        h: h, 
        m: m,
        s: s,
        'data.recordStatus': recordStatus
      });
      if(!this.unloaded) {
        setTimeout(() => {
          this.timer();
        }, 1000);
      }
    }
  },
  onUnload() {
    this.unloaded = true;
  },
  // 点击了“规则说明”
  onRegulationClick() {

  },
  onJoinClick() {
    if(this.data.data.recordStatus == 0 && !this.data.data.orderSn) {
      // “我要参团”，弹出购买数量框
      this.setData({
        showPop: true
      });
    }
  },
  onPopClose() {
    this.setData({
      showPop: false
    });
  },
  onReduceClick() { // 点击了“减号”
    if(this.data.buyNum > 1 && !this._eving) {
      this._eving = true;
      this.setData({
        buyNum: this.data.buyNum - 1
      }, () => {
        this._eving = false;
      });
    }
  },
  onPlusClick() { // 点击了“加号”
    if(this.data.buyNum < 99 && !this._eving) {
      this._eving = true;
      this.setData({
        buyNum: this.data.buyNum + 1
      }, () => {
        this._eving = false;
      });
    }
  },
  onJoinSubmit() { // 确认参团，提交购买数量
    if(this.data.data.recordStatus == 0 && !this.data.data.orderSn && !this._eving) {
      this._eving = true;
      this.cart.confirmTuangou(this.data.data, this.data.buyNum, (re, err) => {
        if(re && re.data && re.data.data) {
          my.redirectTo({
            url: '../orderConfirm/orderConfirm?shopid=' + re.data.data.shopId + '&recordid=' + re.data.data.tuangouRecordId + '&activityid=' + re.data.data.tuangouActivityId
          });
        } else if(err) {
          my.alert({
            title: '提示',
            content: err
          });
          this._eving = false;
        }
      });
    }
  },
  onShareAppMessage() { // 自定义分享内容
    return {
      title: '社区专属',
      desc: '为您推荐社区周边优质优惠的金牌店铺。', 
      path: 'community/pages/tuanDetail/tuanDetail?id=' + this.id
    };
  }
});
