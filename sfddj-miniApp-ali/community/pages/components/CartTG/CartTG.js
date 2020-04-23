import Cart from '/community/service/cart';
import http from '/api/http';
import api from '/api/api';
Component({
  mixins: [],
  data: {
    isShowed: false,
    noticeShow: false,
    actionText: '本店已打烊，请明天8：00来',
    isDisabled: false,
    badgejump: false, // 设为true时，给badge设置scale2 class

    goodsSku: '',
    goodsImg: '',
    skuNum: 1,
    buyType: 0,  // 0 单独购买 1 拼团

  },
  props: {
    goodsData: 'goodsData'
  },
  didMount() {
    this.init();
  },
  didUpdate(prevProps, prevData) {

  },
  didUnmount() {},

  methods: {
    init() {
      let goodsData = this.props.goodsData;
      let _goodsImagePath = JSON.parse(goodsData.goodsImagePath);

      this.selfName = 'cart';
      // this.cart = Cart.init('cart', this);
      console.log(goodsData)

      this.setData({
        goodsSku: goodsData.shopGoodsSkuList[0],
        goodsImg: api.baseImageUrl + _goodsImagePath[0]
      })
    },

    onShowDetailClick(e) { 
      let _buyType = e.target.dataset.buyType;
      this.setData({
        isShowed: !this.data.isShowed,
        buyType: _buyType * 1
      }) 
    },

    onHideClick() {
      this.setData({
        isShowed: false,
      }); 
    },


    onReduceClick(e) {
      let _skuNum = this.data.skuNum; 
      if(_skuNum <= 1) {
        my.showToast({ 
          content: '已经最少数量！',
          duration: 2500,
        });
      }
      else {
        _skuNum--;
        this.setData({
          skuNum: _skuNum
        })
      } 
    },

    onPlusClick(e) {
      let _skuNum = this.data.skuNum; 
      let _goodsSku = this.data.goodsSku;
      if(_skuNum >= _goodsSku.store) {
        my.showToast({ 
          content: '已经最大数量！',
          duration: 2500,
        });
      }
      else {
        _skuNum++;
        this.setData({
          skuNum: _skuNum
        })
      }
    },

    onToPayClick() {
      const _this = this;
      let _buyType = this.data.buyType;
      if (this.data.isDisabled) {
        my.showToast({
          type: 'none',
          content: '店铺打烊了,无法下单！',
          duration: 2500,
        });
        return
      }

      if ( _buyType * 1 ) {
        // 拼单
        console.log('拼单')
      }
      else {
        // 单独购买
        console.log('单独购买')
      }






      // this.cart.filter(this.props.shopid);
      // let obj = this.cart.$get(this.props.shopid + '');
      // if (obj.cnt) {
      //   my.navigateTo({ url: (this.props.nextPath || '../orderConfirm/orderConfirm') + '?shopid=' + this.props.shopid });
      // }
    },

    // 店铺打烊时间控制
    storeClosed() {
      const _this = this;
      let storeTime = this.props.storeTime;
      if (!storeTime || !storeTime.startBusinessTime) return;

      let _actionText = '';
      let _showOff = false;
      let _startTime = this.FormatDateTime(storeTime.startBusinessTime, 'minMinute', '-');

      let nowTime = storeTime.nowTime || Date.now();

      if (storeTime.startBusinessTime && nowTime < storeTime.startBusinessTime) {
        _actionText = `本店还未到营业时间哦~，将在${_startTime}开业！`;
        _showOff = true;
      }
      else if (storeTime.endBusinessTime && nowTime > storeTime.endBusinessTime) {
        // 当前时间大于最晚营业时间
        _actionText = `本店已打烊，将在${_startTime}开业！`;
        _showOff = true;
      }

      this.setData({
        noticeShow: _showOff,
        actionText: _actionText,
        isDisabled: _showOff,
      })
    },

    FormatDateTime(date, minType, point) {
      let _date = new Date(date);
      let y = _date.getFullYear();
      let m = _date.getMonth() + 1;
      m = m < 10 ? ('0' + m) : m;
      let d = _date.getDate();
      d = d < 10 ? ('0' + d) : d;
      let h = _date.getHours();
      h = h < 10 ? ('0' + h) : h;
      let minute = _date.getMinutes();
      minute = minute < 10 ? ('0' + minute) : minute;
      let seconds = _date.getSeconds();
      seconds = seconds < 10 ? ('0' + seconds) : seconds;
      let _sep = '-';
      if (point) _sep = point;

      // 最小到天
      if (minType == 'minDay') {
        return y + _sep + m + _sep + d
      }
      // 最小到分钟
      else if (minType == 'minMinute') {
        return y + _sep + m + _sep + d + ' ' + h + ':' + minute
      }
      // 最小到秒
      else {
        return y + _sep + m + _sep + d + ' ' + h + ':' + minute + ':' + seconds;
      }
    },

    gotoShop() {
      const _shopId = this.props.shopid;
      my.navigateTo({
        url: '/community/pages/shop/shop?id=' + _shopId
      })
    },

    gotoOrder() {
      my.navigateTo({
        url: '/community/pages/orderList/orderList?index=1'
      })
    },

    gotoService() {
      my.navigateTo({
        url: '/pages/user/helpCenter/helpCenter'
      })
    }
  },
});