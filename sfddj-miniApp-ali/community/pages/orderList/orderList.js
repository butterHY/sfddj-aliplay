import api from '/api/api';
import http from '/api/http';

Page({
    data: {
        staticsImageUrl: api.staticsImageUrl,
        orderTypeList: ['全部', '待付款', '付款成功', '交易成功', '退款/售后'],
        orderTypeCode: ['ALL', 'NOPAY', 'PAYFINISH', 'COMMENT', 'AFTERSALE'],       // 获取数据列表的类型
        
        typeIndex: 0,
        orderList: [[], [], [], [], []],       //保存订单数据
        hasMoreList: [true, true, true, true, true],                      //是否还有下一页
        isLoadedList: [false, false, false, false, false],            //是否加载过了
        startList: [0, 0, 0, 0, 0],     //请求开始的索引
        limit: 10,
    },
    onLoad() {
        this.getOrderList();
     },

    //   切换订单状态
    switchType(e) {
        let { index } = e.target.dataset;
        if (index != this.data.typeIndex) {
            this.setData({
                typeIndex: index
            })
            if(this.data.isLoadedList[index].toString() == 'false') {
                this.getOrderList()
            }
        }
    },

    // 获取订单列表
    getOrderList(){
        let that = this;
        let {typeIndex, limit} = this.data;
        let start = this.data.startList[typeIndex];
        let data = {
            limit,
            start,
            otoOrderPageEnum: this.data.orderTypeCode[typeIndex]
        };
        let setHasMore = 'hasMoreList[' + typeIndex + ']';
        let setLoaded = 'isLoadedList[' + typeIndex + ']';


        http.post(api.O2O_ORDER.getOrderList, data, res => {
            console.log(res)
            let result = res.data.data ? res.data.data : [];
            that.setData({
                [setHasMore]: result.length >= limit ? true : false,
                [setLoaded]: true
            })
        }, err => {
            that.setData({
                [setHasMore]: false,
                [setLoaded]: true
            })
        })

    },
});
