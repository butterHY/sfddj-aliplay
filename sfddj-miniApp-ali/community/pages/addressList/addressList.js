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
  }
});
