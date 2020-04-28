// <!-- 首页 水平滚动产品————商品滚动 组件  已全部更新 -->

let constants = require('../../../../utils/constants');

Component({
  mixins: [],
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: constants.UrlConstants.baseImageUrl,
    ossImgStyle: '?x-oss-process=style/goods_img',
  },
  props: {
    isCutTimer: false,
    onGoToPage: (data) => console.log(data),
  },
  didMount() {
    this.$page.goodsscrollAds = this;
    this.props.isCutTimer ? this.cutTimeStart() : '';
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
      // 普通广告模板开始倒计时
      cutTimeStart(e){
        let that = this;
        that.cutTimeToday();
        clearTimeout(that.data.cutTime_timer);
        that.data.cutTime_timer = setTimeout(function(){
          that.cutTimeStart()
        },1000)
      },

      // 普通广告模板当天倒计时
      cutTimeToday(){
        let that = this;
        let date = new Date();
        let nowData = '',       // 现在的时间
            nextDate = '',      // 明天零点时间
            surplusTime = '',   // 今天剩下的时间
            hh = '',
            mm = '',
            ss = '';
        date.setMilliseconds(0);
        nowData = date.getTime();
        date.setSeconds(0)
        date.setMinutes(0);
        date.setHours(0);
        date.setDate(date.getDate()+1)
        nextDate = date.getTime();
        surplusTime = (nextDate-nowData)/1000;
        if(surplusTime<0){
          surplusTime=0;
        }
        ss = parseInt(surplusTime%60);
        mm = parseInt(surplusTime/60%60);
        hh = parseInt(surplusTime/60/60%24);

        that.setData({
          countTime:{
            hh: hh<10? '0'+hh : hh,
            mm: mm<10? '0'+mm : mm,
            ss: ss<10? '0'+ss : ss
          }
        })
        // console.log(that.data.countTime)
      },

      goToPage(e) {
        let { title, index } = e.currentTarget.dataset;
        let groupGoodsVoList = this.props.item.groupGoodsVoList[index];

        let data = {
          channel_source: 'mini_alipay', 
          supplierName: groupGoodsVoList.nickName, 
          supplierId: groupGoodsVoList.supplierId, 
          goodsName: groupGoodsVoList.goodsName, 
          goodsSn: groupGoodsVoList.goodsSn, 
          goodsCategoryId: groupGoodsVoList.goodsCategoryId
        }

        if ( title.indexOf('爆款') > -1 ) {
          my.uma.trackEvent('homepage_ddjHotSale', data);
        } else if( title.indexOf('新品') > -1 ) {
          my.uma.trackEvent('homepage_ddjNewGoods', data);
        }	else if( title.indexOf('原产') > -1 ) {
          my.uma.trackEvent('homepage_ddjBestGoods', data);
        }

        this.props.onGoToPage(e);
      },

  },

});
