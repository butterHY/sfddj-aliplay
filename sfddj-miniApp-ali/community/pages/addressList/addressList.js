import { get, api } from '/api/http';

Page({
  data: {
    optionalList: [],     //可选地址列表
    unusableList: [],
    shopId: '',
  },
  onLoad(options) {
    this.setData({
      shopId: options.shopId ? options.shopId : ''
    })
    this.getAddrList();
   },

  // 获取地址列表
  getAddrList() {
    let { shopId } = this.data;
    get(api.O2O_ADDRESS.getAddrList, {shopId}, res => {
      let result = res.data.data ? res.data.data : []
      if(result && Object.keys(result).length > 0) {
        let {optionalList, unusableList} = this.filterList(result);
        this.setData({
          optionalList,
          unusableList
        })
      }
    }, err => {})
  },

  // 分拣可选和不可选的
  filterList(result){
    let optionalList = [], unusableList = [];

    for(let i =0; i < result.length; i++) {
      result[i].isMatcheDistance == true ? optionalList.push(result[i]) : unusableList.push(result[i]);
    }

    return {optionalList, unusableList}

  },

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
