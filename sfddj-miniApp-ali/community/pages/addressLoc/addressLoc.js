
Page({
  data: {
    searchCity: '',
    placeholderTxt: '请输入要搜索的地址', 

    locInfo: {
      longitude: '',
      latitude: '',
      area: '',
      city: '',
      name: '',
      address: '',
      pois: []
    }
    
  },
  onLoad() {
    const _this = this; 
    my.getStorage({
      key: 'locationInfo', 
      success: function(res) {
        if(res.data) {
          _this.setData({
            locInfo: res.data
          })
        }
        else {
          _this.getLocation();
        }
      }
    });  
  },

  getLocation() {
    const _this = this; 
    my.showLoading();
    my.getLocation({
      type: 3,
      success(res) {
        my.hideLoading();
        let _area = `${res.province}${res.city}${res.district}`;
        let _name = `${res.streetNumber.street}${res.streetNumber.number}`;
        // console.log('getLocation',res) 

        _this.setData({
          'locInfo.longitude': res.longitude,
          'locInfo.latitude': res.latitude,
          'locInfo.area': _area,
          'locInfo.city': res.city,
          'locInfo.name': _name,
          'locInfo.address': _area + _name,
          'locInfo.pois': res.pois, 
        });

        _this.setLocStorage(); 
      },
      fail() {
        my.hideLoading();
        my.alert({ title: '定位失败' });
      },
    })
  },

  onItemInput(e) {
    this.setData({
      [e.target.dataset.field]: e.detail.value,
    });
  }, 

  onClear(e) {
    this.setData({
      [e.target.dataset.field]: '',
    });
  },

  setCity(e) {
    let _name = e.target.dataset.name; 
    let _address = e.target.dataset.address; 
    // console.log(e)
    this.setData({ 
      'locInfo.name': _name, 
      'locInfo.address': _address
    });
    this.setLocStorage(function() {
      my.navigateTo({ url: '../index/index' });
    }); 
  },


  chooseLocation() {
    const _this = this 
    my.chooseLocation({
      
      success: (res) => {
        console.log('chooseLocation', res)
        _this.setData({
          'locInfo.longitude': res.longitude,
          'locInfo.latitude': res.latitude,  
          'locInfo.name': res.name,
          'locInfo.address': res.address
        })
        _this.setLocStorage(); 
      },
      fail: (error) => {},
    });
  },

  setLocStorage(fn) {
    const _this = this; 
    // console.log(_this.data.locInfo)
    my.setStorage({
      key: 'locationInfo',
      data: _this.data.locInfo,
      success: function() { if(fn)fn(); }
    });  
  },

  goToCityList() {
    my.navigateTo({ url: '../alphabetCity/alphabetCity' });
  }
  
});
