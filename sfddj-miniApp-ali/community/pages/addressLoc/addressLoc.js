import locAddr from '/community/service/locAddr.js';
const myApp = getApp();

Page({
  data: {
    searchCity: '',
    placeholderTxt: '请输入要搜索的地址',

    locInfo: {
      loading: false,
      longitude: '',
      latitude: '',
      city: '',
      addressAll: '',
      addressJson: {},
      pois: [],
      streetShow: '',
      streetLoc: ''
    },

    reLocOff: true,
    timer_reLoc: null,

  },
  onLoad() {
  },

  onShow: function () {
    const _this = this;
    let userLocInfo = myApp.globalData.userLocInfo; 

    if (this.jsonNull(userLocInfo) == 0) {
      // console.log('重新定位')
      locAddr.location((res) => {
        _this.setData({
          locInfo: res
        });
        // 设置缓存并设置全部变量的值 globalData.userLocInfo 
        myApp.setLocStorage(_this.data.locInfo);
      });
    }
    else { 
      // 从城市列表过来的 loading 为false 需要重新定位加载   loading 为true 可以直接使用
      if ( userLocInfo.loading ) {
        _this.setData({
          locInfo: userLocInfo
        })
      }
      else {
        // 此时 userLocInfo的值 只有 经纬度和城市时候
        locAddr.GDCity(userLocInfo, (res)=> {
          _this.setData({
            locInfo: res
          });
          // 设置缓存并设置全部变量的值 globalData.userLocInfo 
          myApp.setLocStorage(_this.data.locInfo);
        });
      } 
    }
  },

  // 地址栏选择的方法
  chooseLocation() {
    const _this = this
    let _locInfo = this.data.locInfo;
    let _name = ''; 

    my.chooseLocation({
      success: (res) => {
        console.log('chooseLocation', res) 
        _this.setData({
          'locInfo.longitude': res.longitude,
          'locInfo.latitude': res.latitude, 
        });
        _name = res.name;

        locAddr.GDCity(_this.data.locInfo, (data) => {
          // name 没有 显示 pois第一个数据的name
          data.streetShow = _name ? _name : _name = data.pois[0].name; 
          data.addressAll = data.province + data.city + data.district + data.street + _name;  
          myApp.setLocStorage(data, function () {
            my.navigateBack();
          });
        });
      },
      fail: (error) => { },
    });
  },

  // 选择地址方法
  selectCity(e) {
    const _this = this;
    let selectCity = e.target.dataset.itemData;
    let _location = selectCity.location.split(',');
    let _locInfo = _this.data.locInfo;
    let _addressAll = _locInfo.province + _locInfo.city + _locInfo.district + _locInfo.street + selectCity.address;
    this.setData({
      'locInfo.streetShow': selectCity.name,
      'locInfo.streetLoc': selectCity.location,
      'locInfo.addressAll': _addressAll,
      'locInfo.longitude': _location[0] * 1,
      'locInfo.latitude': _location[1] * 1,
    });

    // 更新locAddr 地址成最新的
    locAddr.locInfo = _this.data.locInfo;
    // console.log(locAddr.locInfo)
    myApp.setLocStorage(_this.data.locInfo, function () {
      my.navigateBack();
    });
  },

  // 到城市列表
  goToCityList() {
    my.navigateTo({ url: '../alphabetCity/alphabetCity' });
  },

  // 到新增地址
  newAddress() {
    my.navigateTo({ url: '../addressList/addressList' });
  },

  // 重新定位
  reLocation() {
    const _this = this;
    let reLocOff = this.data.reLocOff;
    let _timer = this.data.timer_reLoc;

    if (!reLocOff) return;

    _this.setData({ reLocOff: false });

    locAddr.location((res) => {
      // console.log('重新定位', res)
      _this.setData({
        locInfo: res
      })
    });

    clearTimeout(_timer);
    _timer = setTimeout(() => {
      _this.setData({ reLocOff: true })
    }, 1000);

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

  jsonNull(json) {
    let num = 0;
    for (let i in json) {
      num++;
    }
    return num;
  },
});
