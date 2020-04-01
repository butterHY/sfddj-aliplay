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
      charList.push( _cityList[i].letter );
    } 

    this.setData({
      alphabet: charList,
    });
  },

  // 设置当前城市
  setCurrentCity() {
    const _this = this; 
    my.getStorage({ 
      key: 'locationInfo',  
      success: function(res) { 
        if( JSON.stringify(res.data).length > 2 ) {
          _this.setData({
            locCity: res.data
          });
        }
        else {
          _this.getLocation();
        }  
      } 
    });    
  }, 

  selectCity(e) { 
    let cityData = e.target.dataset.cityName;
    // console.log(cityData)
    this.setData({
      'locInfo.city': cityData.city ? cityData.city : cityData.name,
      'locInfo.longitude': cityData.longitude,
      'locInfo.latitude': cityData.latitude, 
      'locInfo.loading': false, 
    });
    this.setLocStorage(()=> {
      my.reLaunch({ url: '../addressLoc/addressLoc' });
    });
  }, 

  getLocation() {
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
        })

        _this.setLocStorage();
      },
      fail() {
        my.hideLoading();
        my.alert({ title: '定位失败' });
      },
    })
  },

  setLocStorage(fn) {
    const _this = this;
    my.setStorage({
      key: 'locationInfo',
      data: _this.data.locInfo,
      success: function () { if(fn)fn(); }
    });
  },

});
