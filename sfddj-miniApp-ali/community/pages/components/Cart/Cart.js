import Cart from '/community/service/cart';

Component({
  mixins: [],
  data: {
    isShowed: false,
    noticeShow: false,
    actionText: '本店已打烊，请明天8：00来',
    isDisabled: false,
    badgejump: false, // 设为true时，给badge设置scale2 class
  },
  props: {
    canShowDetails: true,
    nextText: '',
    nextPath: '', 
  },
  didMount() {
    this.selfName = 'cart';
    this.cart = Cart.init(this);
  },
  didUpdate(prevProps, prevData) {
    if(!prevProps.shopid && this.props.shopid) {
      this.cart.gets(this.props.shopid, (res) => {
        this.storeClosed();
      });
    }
    
    if(this.props.shopid && prevData.Cart && prevData.Cart[this.props.shopid]) {
      if(prevData.Cart[this.props.shopid].cnt != this.data.Cart[this.props.shopid].cnt) {
        this.setData({
          badgejump: true
        }, () => {
          setTimeout(() => {
            this.setData({
              badgejump: false
            });
          }, 150);
        });
      }
    }
  },
  didUnmount() {},
  methods: { 
    onShowDetailClick() {
      if(this.props.canShowDetails) {
        let obj = this.cart.$get(this.props.shopid + '');
        if((obj && obj.cartList && obj.cartList.length) || this.data.isShowed) {
          this.setData({ 
            isShowed: !this.data.isShowed,
          });
        }
      }
    },

    onHideClick() { 
      this.setData({ 
        isShowed: false,
      });
      this.cart.filter(this.props.shopid); 
    },

    onClearClick() {
      my.confirm({
        content: '确定清空购物车？',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        success: (result) => {
          if(result.confirm) {
            this.cart.clear(this.props.shopid, (res) => {

            });
          }
        },
      });
    },

    onReduceClick(e) {
      if(!this._changing) {
        this._changing = true;
        this.cart.changeNum(this.props.shopid, e.target.dataset.skuid, -1, (res) => {
          this._changing = false;
        });
      }
    },

    onPlusClick(e) {
      if(!this._changing) {
        this._changing = true;
        this.cart.changeNum(this.props.shopid, e.target.dataset.skuid, 1, (res) => {
          this._changing = false;
        });
      }
    },
    onToPayClick() {
      const _this = this;
      if ( this.data.isDisabled ) {
        my.showToast({
          type: 'none',
          content: '店铺打烊了,无法下单！',
          duration: 3000,
        });
        return
      }
      my.navigateTo({ url: (this.props.nextPath || '../orderConfirm/orderConfirm') + '?shopid=' + this.props.shopid });
    },

    // 店铺打烊时间控制
    storeClosed() {
      const _this = this;
      let storeTime = this.props.storeTime;
      if( !storeTime ) return;

      let _actionText = '';
      let _showOff = false;
      let _startTime = this.FormatDateTime( storeTime.startBusinessTime, 'minMinute', '-' );

      let nowTime = storeTime.nowTime || Date.now(); 

      if ( nowTime < storeTime.startBusinessTime ) {
        _actionText = `本店还未到营业时间哦~，将在${_startTime}开业！`;
        _showOff = true;
      }
      else if ( nowTime > storeTime.endBusinessTime ) {
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
    }
  },
});
