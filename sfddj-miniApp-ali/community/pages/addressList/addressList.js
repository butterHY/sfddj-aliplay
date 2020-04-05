Page({
  data: {
    optionalList: [{}, {}],     //可选地址列表
    unusableList: [{}, {}]
  },
  onLoad() { },

  // 点击选择
  selectTap() {
    let defaultAddress = {
      shipName: '123',
      shipPhone: 18823451312,
      province: '广东省',
      city: '深圳市',
      district: '宝安区',
      street: '西乡街道',
      detail: '你猜不到的地址，哈哈哈哈哈哈'
    }
    getApp().globalData.communalAddr = Object.assign({}, defaultAddress); 
    my.navigateBack();
  },

  // 点击编辑
  editTap() {
    let editAddress = {
      shipName: '哈哈',
      shipPhone: 18848848888,
      province: '广东省1',
      city: '深圳市1',
      district: '宝安区1',
      street: '西乡街道1',
      detail: '你猜不到的地址1'
    }
    getApp().globalData.editSelectAddr = Object.assign({}, editAddress);  
    // isNew 1 表示新建地址  0表示是旧地址，需要从全局地址中获取数据
    my.navigateTo({ url: '../addressEdit/addressEdit?isNew=0' });
  },

  // 新建地址
  goNewAddress() {
    // isNew 1 表示新建地址  0表示是旧地址，需要从全局地址中获取数据
    my.navigateTo({ url: '../addressEdit/addressEdit?isNew=1' });
  }
});
