// <!-- 首页  秒杀广告 组件 水平滚动产品————商品滚动  -->

let constants = require('../../../../utils/constants');

Component({
  mixins: [],
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: constants.UrlConstants.baseImageUrl,
    ossImgStyle: '?x-oss-process=style/goods_img',
  },
  props: {},
  didMount() {
    this.$page.seckillAds = this;
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    
    /**
	  *旧首页 -- 秒杀获取倒计时时间
    */
    getTimes: async function(isFirstTime) {
      var nowTime = new Date();
      var starTime = '';
      var endTime = '';
      var isLastActivitys = '';
      var index = '';

      for (var i = 0; i < this.data.advertsArr.length; i++) {
        if (this.data.advertsArr[i].moduleType == "SECONDKILL" && this.data.advertsArr[i].secondKillModuleVO) {
          index = i;
          starTime = this.data.advertsArr[i].secondKillModuleVO.startDate;
          endTime = this.data.advertsArr[i].secondKillModuleVO.endDate;
          isLastActivitys = this.data.advertsArr[i].secondKillModuleVO.isLastActivitys;
        }
      }
      if (!this.data.advertsArr[index] || !(this.data.advertsArr[index].secondKillModuleVO)) {
        return;
      }

      starTime = new Date(starTime).getTime();
      endTime = new Date(endTime).getTime();
      nowTime = nowTime.getTime();

      // (starTime - nowTime) / 1000 >= 1 这么判断会多出 几百毫秒，导致活动开始倒计时的时间差是以整数开始的, 如 07：00 而不是 06：59
      if (nowTime < starTime) {
        this.setData({
          isActivitysStart: '活动还未开始',
        })
        this.notYetStarted(starTime);
        return;
      };

      var timeDifference = endTime - nowTime;
      var s1 = (timeDifference / 1000) % 60;
      s1 = Math.floor((timeDifference / 1000) % 60);

      var m1 = Math.floor((timeDifference / 1000 / 60) % 60);
      var h1 = Math.floor((timeDifference / 1000 / 60 / 60));

      var s = s1 <= 0 ? '00' : (s1 < 10 ? '0' + s1 : s1);
      var m = m1 <= 0 ? '00' : (m1 < 10 ? '0' + m1 : m1);
      var h = h1 <= 0 ? '00' : (h1 < 10 ? '0' + h1 : h1);

      this.setData({
        hours: h,
        minute: m,
        second: s
      })

      // if (nowTime - endTime >= 0)，这样判断在活动的最后一秒里，零点几秒，页面已经显示为 00：00：00 了，但这时没有重新请求数据，而是在 1秒后，再计算一次，这一次是 -秒，才重新请求
      if ((timeDifference / 1000) < 1) {
        clearTimeout(that.data.app.globalData.home_spikeTime);
        this.setData({
          isLastActivitys: isLastActivitys
        });
        if (!isLastActivitys) {
          // 请求单独的秒杀广告模块的数据
          var sendRequest = await this.getSpikeModule();

          if (sendRequest.type && (this.data.startTime <= this.data.nowTime) && ((this.data.endTime - this.data.nowTime) / 1000 <= 1)) {
            this.getTimes();
          } else if (sendRequest.type && (this.data.startTime <= this.data.nowTime) && ((this.data.endTime - this.data.nowTime) / 1000 > 1)) { // this.data.timeDifferences < 1    这么判断有时会多出 几百毫秒，导致活动开始倒计时的时间差是以整数开始的, 如 07：00 而不是 06：59
            this.getTimes();
            this.countDown();
            // this.data.timeDifferences >= 1   
          } else if (sendRequest.type && (this.data.startTime > this.data.nowTime)) {
            // 如果是活动还未开始，创建倒计时但不 setData ，直到活动开始则开始渲染 DOM
            this.notYetStarted(this.data.startTime);
          }
        }
      } else if (isFirstTime) {
        this.countDown();
      }
    },

    /**
      *旧首页 -- 秒杀计时器
    */
    countDown: function(starTime) {
      var that = this;
      clearTimeout(that.data.app.globalData.home_spikeTime);
      clearTimeout(that.data.app.globalData.home_spikeTime);
      that.data.app.globalData.home_spikeTime = setInterval(
        function() {
          that.getTimes()
        }, 1000);
    },

    /**
      *旧首页 -- 如果是秒杀活动还未开始，创建倒计时但不 setData ，直到活动开始则开始渲染 DOM
    */
    notYetStarted: function(starTime) {
      clearTimeout(that.data.app.globalData.home_spikeTime);
      var that = this;
      if (starTime) {
        that.data.app.globalData.home_spikeTime = setInterval(
          function() {
            var nowTime = new Date();
            nowTime = nowTime.getTime();
            // (starTime - nowTime) / 1000 < 1 这么判断会多出 几百毫秒，导致活动开始倒计时的时间差是以整数开始的, 如 07：00 而不是 06：59
            if (starTime <= nowTime) {
              that.setData({
                isActivitysStart: null
              })
              that.getTimes('isFirstTime')
            };
          }, 1000);
      }
    },

    /**
      *旧首页 -- 获取秒杀模块
    */ 
    getSpikeModule() {
      var that = this;
      var urlPre = '/m/a';
      var url = urlPre + '/moduleAdvert/1.0/getSecKillAdvert';
      var token = '';
      var contentType = '';
      try {
        token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data ? my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data : '';
      } catch (e) { }
      return new Promise((reslove, reject) => {
        my.httpRequest({
          url: constants.UrlConstants.baseUrlOnly + url,
          method: 'GET',
          data: {
            activitysId: that.data.secondKillActivityId
          },
          headers: {
            'token': token ? token : '',
            "content-type": contentType ? contentType : "application/x-www-form-urlencoded",
            "client-channel": "alipay-miniprogram"
          },
          success: function(res) {
            var resData = res.data;
            if (resData.ret.code == '0') {
              var result = resData.data;
              var index = null;
              var spikeArr = [];
              for (var i = 0; i < that.data.advertsArr.length; i++) {
                if (that.data.advertsArr[i].moduleType == "SECONDKILL") {

                  spikeArr = JSON.parse(JSON.stringify(that.data.advertsArr[i]));
                  spikeArr.secondKillModuleVO = result;
                  index = i;
                  that.data.advertsArr[i] = spikeArr;

                  var nowTime = new Date();
                  var endTime = that.data.advertsArr[i].secondKillModuleVO.endDate;
                  var startTime = that.data.advertsArr[i].secondKillModuleVO.startDate;
                  nowTime = nowTime.getTime();
                  startTime = new Date(startTime).getTime();
                  endTime = new Date(endTime).getTime();
                  var timeDifferences = (startTime - nowTime) / 1000;

                  if (startTime > nowTime) {
                    that.data.isActivitysStart = '活动还未开始';
                  };

                  that.setData({
                    advertsArr: that.data.advertsArr,
                    nowTime: nowTime,
                    startTime: startTime,
                    endTime: endTime,
                    timeDifferences: timeDifferences,
                    isActivitysStart: that.data.isActivitysStart
                  })
                }
              }
              // 缓存数据
              my.setStorage({
                key: 'homeAdvertsArr', // 缓存数据的key
                data: that.data.advertsArr, // 要缓存的数据
                success: (res) => {
                },
              });
              reslove({
                'type': true,
                'result': result
              });
            }
          },
          fail: function(err) {
            reject({
              'type': false,
              'result': err
            });
          }
        })
      })
    },

  },
});
