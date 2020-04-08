const myApp = getApp();

Page({
  data: {
    currentCity: {},
    cityList: [
      {
        letter: 'G',
        list: [
          {
            name: '广州市',
            latitude: 23.117055,
            longitude: 113.275995,
          }
        ]
      },
      {
        letter: 'S',
        list: [
          {
            name: '深圳市',
            latitude: 22.528298,
            longitude: 113.948925,
          }
        ]
      }
    ],
    alphabet: [],

    locCity: {},
    locInfo: {
      latitude: 22.528298,
      longitude: 113.948925,
      city: '深圳市'
    }
  },
  onLoad() {
    this.setLetterShow();
   
  },

  onShow: function () {
    this.setCurrentCity();
    
  },


  onAlphabetClick(ev) {
    console.log(ev)
    // my.alert({
    //   content: JSON.stringify(ev.data),
    // });
  },

  // 设置字母
  setLetterShow() {
    // const charCode = 65;
    // const charList = [];
    // for (let i = 0; i < 10; i++) {
    //   charList.push(String.fromCharCode(charCode + i));
    // }

    let charList = [];
    let _cityList = this.data.cityList;

    for (let i = 0; i < _cityList.length; i++) {
      charList.push(_cityList[i].letter);
    }

    this.setData({
      alphabet: charList,
    });
  },

  // 设置当前城市
  setCurrentCity() {
    const _this = this; 
    let userLocInfo = myApp.globalData.userLocInfo; 

    if (this.jsonNull(userLocInfo) == 0) {
      // console.log('重新定位')
			_this.getLocation( ()=>{}, ()=> {
        // 定位失败
        // my.getStorage({
        //   key: 'locationInfo',
        //   success: function (res) {
        //     if (res.data) {
        //       _this.setData({
        //         locCity: res.data
        //       });
        //     }
        //     else {
        //       _this.getLocation();
        //     }
        //   }
        // });   
      });
    }
    else {
      // console.log('userLocInfo', userLocInfo);
      _this.setData({
        'locCity.city': userLocInfo.city ? userLocInfo.city : userLocInfo.name,
        'locCity.longitude': userLocInfo.longitude,
        'locCity.latitude': userLocInfo.latitude,
        'locIlocCitynfo.loading': false,
      });
    }
  },

  selectCity(e) { 
    let cityData = e.target.dataset.cityName; 
    // 选择当前定位直接返回
    if (!cityData) {
      my.navigateBack();
      return;
    }
    else {
      // 选择其他城市列表中的城市
      // console.log(cityData)
      this.setData({
        'locInfo.city': cityData.city ? cityData.city : cityData.name,
        'locInfo.longitude': cityData.longitude,
        'locInfo.latitude': cityData.latitude,
        'locInfo.loading': false,
      });

      // my.reLaunch({ url: '../addressLoc/addressLoc' }); 
      // 设置缓存并设置全部变量的值 globalData.userLocInfo 
      myApp.setLocStorage(this.data.locInfo, function() {
        my.navigateBack();
      });
    } 
  },

  getLocation(fn1,fn2) {
    const _this = this;
    my.showLoading();
    my.getLocation({
      type: 1,
      success(res) {
        my.hideLoading();
        _this.setData({
          'locInfo.city': res.city,
          'locInfo.longitude': res.longitude,
          'locInfo.latitude': res.latitude,
          'locInfo.loading': false,
        });

        _this.setData({
          locCity: _this.data.locInfo
        });

        myApp.setLocStorage(_this.data.locInfo); 

        if (fn1) fn1();
      },
      fail() {
        my.hideLoading();
        if (fn2) fn2();
        // my.alert({ title: '定位失败' });
      },
    })
  },

  jsonNull(json) {
    let num = 0;
    for (let i in json) {
      num++;
    }
    return num;
  },

});
