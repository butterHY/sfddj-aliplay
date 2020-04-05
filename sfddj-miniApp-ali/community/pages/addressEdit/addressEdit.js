import locAddr from '/community/service/locAddr.js';
import http from '/api/http';
import api from '/api/api'; 

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

    locInfo: {},    // 定位信息
    pageTitle: '',
    isNew: 0,   // 是否新建地址
  },
  onLoad(e) { 
    this.init(e); 
  },

  init(data) {
    const _this = this;
    let title = '';
    this.data.isNew = data.isNew * 1;  

    if ( data.isNew * 1 ) { 
      title = '新建地址'; 
    }
    else {
      let _editAddr = getApp().globalData.editSelectAddr;
      title = '编辑地址'; 
      _this.setData({
        name: _editAddr.shipName, 
        tel: _editAddr.shipPhone, 
        address: _editAddr.province + _editAddr.city +_editAddr.district, 
        street: _editAddr.street + _editAddr.detail, 
      });
    }


    // 设置表他
    my.setNavigationBar({ 
      title: title,
    });
  },

  // 姓名验证
  onInputName (e) {
    // 清除按钮显示
    this.setData({
      [e.target.dataset.field]: e.detail.value,
    });
  },

  // 电话验证
  onInputTel (e) {
    // 清除按钮显示
    this.setData({
      [e.target.dataset.field]: e.detail.value,
    });
  },
  // 清除输入内容
  onClear(e) {
    this.setData({
      [e.target.dataset.field]: '',
    });
  },

  // 保存地址
  saveAddr() {},
  
  // 保存和使用
  useAddr() {},

  // 删除地址
  delAddr() {}, 

  // 定位地址栏选择的方法
  chooseLocation() {
    const _this = this
    my.chooseLocation({

      success: (res) => {
        // console.log('chooseLocation - address', res)
        _this.setData({
          'locInfo.longitude': res.longitude,
          'locInfo.latitude': res.latitude,
          'locInfo.streetShow': res.name,
          'locInfo.streetLoc': res.longitude + ',' + res.latitude,
          street: res.name
        });

        locAddr.GDCity(_this.data.locInfo, (data) => { 
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
