import locAddr from '/community/service/locAddr.js';

Page({
  data: { 
    name: '', 
    tel: '',
    address: '',
    street: '',
    name_placeholder: '姓名',
    tel_placeholder: '手机号码',
    addr_placeholder: '请选择收获地址',
    street_placeholder: '精确到门牌号',
    testVal: '',

    locInfo: {}
  },
  onLoad() {},

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

  // 地址栏选择的方法
  chooseLocation() {
    const _this = this
    my.chooseLocation({

      success: (res) => {
        console.log('chooseLocation - address', res)
        _this.setData({
          'locInfo.longitude': res.longitude,
          'locInfo.latitude': res.latitude,
          'locInfo.streetShow': res.name,
          'locInfo.streetLoc': res.longitude + ',' + res.latitude,
          street: res.name
        });

        locAddr.GDCity(_this.data.locInfo, (data) => {
           console.log('GDCity',data)
           let _area = data.province + data.city + data.district;
           _this.setData({
             address: _area, 
           })
        });
      },
      fail: (error) => { },
    });
  },
  
});
