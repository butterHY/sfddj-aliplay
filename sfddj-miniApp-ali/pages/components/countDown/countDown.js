let constants = require('../../../utils/constants');
my.canIUse('component2');
Component({
  mixins: [],
  data: {
    baseImageLocUrl: constants.UrlConstants.baseImageLocUrl,   //  生产环境图片资源地址前缀
    hours: '00',
    minute: '00',
    second: '00',
    mSecond: '00'
  },

  // 设置默认属性
  props: {
    goodsSecondKill: null, //  秒杀商品的数据
    // product: null,         //  秒杀规格的数据
    isFirstTime: null,     //是否是第一次执行 getTime()，页面初始化后组件才挂载到页面上，所以在组件挂载和页面显示都是第一次获取时间
    starTime: null,
    endTime: null,
    // oldPrice: '',
    // spikePrice: '',
    onSpikeOver: (data) => console.log(data),

  },

  onInit() {
    // this.props.product.activityStock = 3;
    this.setData({
      goodsSecondKill: this.props.goodsSecondKill
    })
    console.log(this.props.goodsSecondKill)
  },

  deriveDataFromProps(nextProps) {
  },

  didMount() {
    this.$page.spikePrice = this; // 通过此操作可以将组件实例挂载到所属页面实例上
    if (this.props.secKillStatus && this.props.goodsSecondKill.activityStock > 0 && this.props.viewStatus == 'SALEING') {
      this.getTimes(this.props.isFirstTime);
    };
  },

  didUpdate() {
  },

  didUnmount() {
    clearTimeout(getApp().globalData.goodsDetail_spikeTime)
  },

  methods: {

    getTimes: function(isFirstTime) {
      var nowTime = new Date();
      var starTime = this.props.goodsSecondKill.detailVOS[0].startDate;
      var endTime = this.props.goodsSecondKill.detailVOS[0].endDate;
      var isLastActivitys = '';

      starTime = new Date(starTime).getTime();
      endTime = new Date(endTime).getTime();
      nowTime = nowTime.getTime();

      var timeDifference = endTime - nowTime;
      var s1 = (timeDifference / 1000) % 60;

      var hours = Math.floor((timeDifference / 1000 / 60 / 60));
      var minute = Math.floor((timeDifference / 1000 / 60) % 60);
      var second = Math.floor((timeDifference / 1000) % 60)

      // var ms = timeDifference % 1000
      // ms = Math.floor(ms / 100)

      var s = second <= 0 ? '00' : (second < 10 ? '0' + second : second);
      var m = minute <= 0 ? '00' : (minute < 10 ? '0' + minute : minute);
      var h = hours <= 0 ? '00' : (hours < 10 ? '0' + hours : hours);

      this.setData({
        hours: h,
        minute: m,
        second: s,
        // mSecond: ms
      })

      if (nowTime - endTime >= 0) {
        clearTimeout(getApp().globalData.goodsDetail_spikeTime);
        this.props.onSpikeOver('isSpikeOver');
      } else if (nowTime < starTime) {
        clearTimeout(getApp().globalData.goodsDetail_spikeTime);
        this.props.onSpikeOver('noStart');
      } else if (isFirstTime) {
        this.countDown();
      }
    },

    //---------- 倒计时 -------------
    countDown: function() {
      clearTimeout(getApp().globalData.goodsDetail_spikeTime)
      var that = this;
      getApp().globalData.goodsDetail_spikeTime = setInterval(
        function() {
          console.log('aa')
          that.getTimes()
        }, 1000)
    },

  }
});
