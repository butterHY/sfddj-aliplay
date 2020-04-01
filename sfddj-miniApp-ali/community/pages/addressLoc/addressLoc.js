import locAddr from '/community/service/locAddr.js';

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
    const _this = this;
    my.getStorage({
      key: 'locationInfo',
      success: function (res) {
        if (JSON.stringify(res.data).length > 2) {
          locAddr.GDCity(res.data, (data) => {
            _this.setData({
              locInfo: data
            });
          });
        }
        else {
          locAddr.location((res) => {
            _this.setData({
              locInfo: res
            })
          });
        }
      }
    });
  },

  // 地址栏选择的方法
  chooseLocation() {
    const _this = this
    my.chooseLocation({

      success: (res) => {
        // console.log('chooseLocation', res)
        _this.setData({
          'locInfo.longitude': res.longitude,
          'locInfo.latitude': res.latitude,
          'locInfo.streetShow': res.name,
          'locInfo.streetLoc': res.longitude + ',' + res.latitude
        });

        locAddr.GDCity(_this.data.locInfo, (data) => {
          my.reLaunch({ url: '../index/index' });
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
    // console.log(selectCity)  
    this.setData({
      'locInfo.streetShow': selectCity.name,
      'locInfo.streetLoc': selectCity.location,
      'locInfo.longitude': _location[0] * 1,
      'locInfo.latitude': _location[1] * 1,
    });

    // 更新locAddr 地址成最新的
    locAddr.locInfo = _this.data.locInfo;

    this.setLocStorage(function () {
      my.reLaunch({ url: '../index/index' });
    });
  },

  // 设置缓存
  setLocStorage(fn) {
    const _this = this;
    // console.log(_this.data.locInfo)
    my.setStorage({
      key: 'locationInfo',
      data: _this.data.locInfo,
      success: function () { if (fn) fn(); }
    });
  },

  // 到城市列表
  goToCityList() {
    my.navigateTo({ url: '../alphabetCity/alphabetCity' });
  },

  // 重新定位
  reLocation() {
    const _this = this;
    let reLocOff = this.data.reLocOff;
    let _timer = this.data.timer_reLoc;

    if (!reLocOff) return;

    _this.setData({ reLocOff: false });

    locAddr.location((res) => {
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
});
