Component({
  mixins: [],
  data: {
    title: '专属于你的附近之精彩',
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
  props: {},

  didMount() { 
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

  didUpdate() { },

  didUnmount() { },

  methods: {
    goLocationCity() {
      my.navigateTo({ url: '../addressLoc/addressLoc' });
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

    setLocStorage(fn) {
      const _this = this;
      my.setStorage({
        key: 'locationInfo',
        data: _this.data.locInfo,
        success: function () { if(fn)fn(); }
      });
    },
  },
});
