import api from '/api/api';

Page({
  data: {
      staticsImageUrl: api.staticsImageUrl,
      orderTypeList: ['全部', '待付款', '付款成功', '交易成功', '退款/售后'],
      typeIndex: 0,
      orderList: [[],[{},{},{},{},{},{},{},{},{},{}],[],[],[]],       //保存订单数据
      hasMoreList: [true, true, true, true, true],                      //是否还有下一页
      isLoadedList: [false, false, false, false, false],            //是否加载过了
  },
  onLoad() {},

    //   切换订单状态
    switchType(e) {
        let {index} = e.target.dataset;
        if(index != this.data.typeIndex) {
            this.setData({
                typeIndex: index
            })
        }
    },
});
