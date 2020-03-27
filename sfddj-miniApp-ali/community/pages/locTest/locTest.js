Page({
  data: {
    longitude: '',
    latitude: '',
    name: '',
    address: '',
  },

  onLoad () {
    this.getLocation();
	},
 
  getLocation() {
    const _this = this;
    
    my.showLoading();
    my.getLocation({
      type: 3,
      success(res) {
        my.hideLoading();
        console.log('getLocation',res)

        _this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
         
      },
      fail() {
        my.hideLoading();
        my.alert({ title: '定位失败' });
      },
    })
  },

  chooseLocation() {
    const _this = this
    console.log('chooseLocation111', my.chooseLocation())
    my.chooseLocation({
      
      success: (res) => {
        console.log('chooseLocation', res)
        _this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          name: res.name,
          address: res.address
        })
      },
      fail: (error) => {
        my.alert({ content: '调用失败：' + JSON.stringify(error), });
      },
    });
  },
})