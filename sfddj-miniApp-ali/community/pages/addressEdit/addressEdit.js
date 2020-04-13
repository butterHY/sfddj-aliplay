import locAddr from '/community/service/locAddr.js';
import http from '/api/http';
import api from '/api/api'; 

Page({
  data: { 
    locInfo: {},    // 定位信息
    name_placeholder: '姓名',
    mobile_placeholder: '手机号码',
    addr_placeholder: '请选择收获地址',
    street_placeholder: '精确到门牌号', 

    pageTitle: '',
    isNew: 0,   // 是否新建地址

     // 上传数据 
    optAddr: {     
      fullName: '',   
      mobile: '',   
      isDefault: '',   
      latitude: '',
      longitude: '',  
      province: '广东',
      city: '深圳',
      area: '宝安区',
      address: '',
      locate: ''
    },   
  },
  onLoad(e) { 
    this.init(e); 
  },

  init(data) {
    const _this = this;
    const mydata = this.data;
    let title = '';
    this.data.isNew = data.isNew * 1;  

    if ( data.isNew * 1 ) { 
      title = '新建地址'; 
    }
    else {
      let _editAddr = getApp().globalData.editSelectAddr;
      title = '编辑地址'; 
      // console.log('_editAddr', _editAddr); 
      _this.setData({
        optAddr: _editAddr, 
      });
    } 
    // 设置标题
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
    const _this = this;
    const mydata = this.data;
    // 清除按钮显示  
    this.setData({
      [e.target.dataset.field]: e.detail.value,
    }); 
  },

  // 地址详情
  onInputDetail (e) {
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
  saveAddr() {  
    const _this = this; 
    this.verifyForm(false, function() { 
      my.navigateBack(); 
    })
  },
  
  // 保存和使用
  useAddr() { 
    const _this = this;
    const mydata = this.data;
    this.verifyForm(true, function() {
      my.navigateBack();
    })   
  },

  // 删除地址
  delAddr() {
    const _this = this;
    const mydata = this.data;   

    my.confirm({
      title: '删除地址',
      content: '确定删除该收货地址码？', 
      success: (result) => {
        if( result.confirm ) {
          // 确定
          // console.log('提交删除的数据', mydata.optAddr) 
          http.post(api.O2O_ADDRESS.delAddr, {
            id: mydata.optAddr.id
          }, (res) => { 
            let _ret = res.data.ret;
            let _data = res.data.data;
            if (_ret.code == '0') { 
                // 到地址列表
                // my.redirectTo({ url: '../addressList/addressList' });
                my.navigateBack();
            }  
          }, (err)=>{})
        }
        else {
          // 取消
        }
      },
      
    }); 
  }, 

  // 上传数据
  postAddress(isDefault, fn) {
    const _this = this;
    const mydata = this.data;   
    mydata.optAddr.isDefault = isDefault ? true : false;   
    // console.log('提交保存数据', mydata.optAddr) 
    http.post(api.O2O_ADDRESS.saveAddr, mydata.optAddr, (res) => { 
      let _ret = res.data.ret;
      let _data = res.data.data;
      if (_ret.code == '0') { 
          if (fn) fn();
      }  
    }, (err)=>{})
  },

  // 定位地址栏选择的方法
  chooseLocation() {
    const _this = this
    let _optAddr = this.data.optAddr;
    my.chooseLocation({ 
      success: (res) => {
        // console.log('chooseLocation - address', res)
        _this.setData({
          'locInfo.longitude': res.longitude,
          'locInfo.latitude': res.latitude, 
          'optAddr.locate': res.name,
          'optAddr.address': res.address, 
          'optAddr.longitude': res.longitude,
          'optAddr.latitude': res.latitude, 
        });
 
        locAddr.GDCity(_this.data.locInfo, (data) => {  
          // 如果 定位的name 是空 返回 省市区
          let _area = data.province + data.city + data.district;
          if ( _optAddr.locate ) { 
            _area =  _optAddr.locate;
          } 
          
          _this.setData({ 
            'optAddr.province': data.province,
            'optAddr.city': data.city,
            'optAddr.area': data.district,
            'optAddr.locate': _area,
          }) 
          console.log('data', data) 
          // console.log('optAddr', _this.data.optAddr) 
        }); 
        
      },
      fail: (error) => { },
    });
  },
  
  // 验证
  verifyForm(isTrue, fn) {
    const _this = this;
    const reg = /^(1[2|3|4|5|6|7|8|9])[\d]{9}$/;   // 验证手机号码没有空格
    let _optAddr = this.data.optAddr; 

    // 联系人
    if( _optAddr.fullName == '' || !_optAddr.fullName ) {
      // console.log('联系人不能空')
      my.showToast({
        type: 'none',
        content: '联系人不能空',
        duration: 2500
      });
      return
    }

    if ( _optAddr.mobile == '' ) {
      // console.log('电话号码不能为空')
      my.showToast({
        type: 'none',
        content: '电话号码不能为空',
        duration: 2500
      });
      return
    }
    else if ( !reg.test(_optAddr.mobile * 1) ) {
      // console.log('请输入正确的电话号码')
      my.showToast({
        type: 'none',
        content: '请输入正确的电话号码',
        duration: 2500
      });
      return
    }

    
    if ( _optAddr.locate == '' || !_optAddr.locate ) {
      // console.log('地址不能为空')
      my.showToast({
        type: 'none',
        content: '地址不能为空',
        duration: 2500
      });
      return
    }
    
    if ( _optAddr.address == '' || !_optAddr.address ) {
      // console.log('详细地址不能为空')
      my.showToast({
        type: 'none',
        content: '详细地址不能为空',
        duration: 2500
      });
      return
    }

    _this.postAddress(isTrue, function() { 
      if(fn)fn();
    });   

  }
  
});
