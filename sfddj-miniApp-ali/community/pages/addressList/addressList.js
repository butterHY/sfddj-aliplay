import { get, api } from '/api/http';

Page({
  data: {
    optionalList: [],     //可选地址列表
    unusableList: [],
    shopId: '',
    staticsImageUrl: api.staticsImageUrl,
  },
  onLoad(options) {
    this.setData({
      shopId: options.shopId ? options.shopId : ''
    })
   },
   onShow(){
     
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
      } else {
        this.setData({
          optionalList: [],
          unusableList: []
        })
      }
    }, err => {})
  },

  // 分拣可选和不可选的
  filterList(result){
    let optionalList = [], unusableList = [];

    for(let i =0; i < result.length; i++) {
      result[i].isMatchesDistance == true ? optionalList.push(result[i]) : unusableList.push(result[i]);
    }

    return {optionalList, unusableList}

  },

  // 点击选择
  selectTap(e) {
    let {index} = e.currentTarget.dataset;
    getApp().globalData.communalAddr = this.data.optionalList[index];
    my.navigateBack();
  },

  // 点击编辑
  editTap(e) {
    let {index, type} = e.currentTarget.dataset;
    let addresss =  type == 'useful' ? this.data.optionalList[index] : this.data.unusableList[index];
    getApp().globalData.editSelectAddr = Object.assign({}, addresss ); 
    // isNew 1 表示新建地址  0表示是旧地址，需要从全局地址中获取数据 
    my.navigateTo({ url: '../addressEdit/addressEdit?isNew=0' });
  },

  // 新建地址
  goNewAddress() {
    // isNew 1 表示新建地址  0表示是旧地址，需要从全局地址中获取数据
    my.navigateTo({ url: '../addressEdit/addressEdit?isNew=1' });
  }
});
