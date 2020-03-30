import api from '/api/api';

Page({
    data: {
            staticsImageUrl: api.staticsImageUrl,
            baseImageUrl: api.baseImageUrl,
            typeIndex: 2,
            goodsList: [{},{},{},{}],
            userMessage: '',
            deliveryTypeTaped: false,
    },
    onLoad() {},

    // 配送方式切换
    switchType(e){
        let {index} = e.currentTarget.dataset;
        if(this.data.typeIndex != index) {
            this.setData({
                typeIndex: index,
                deliveryTypeTaped: true
            })
        }
    },

    // 留言输入
    userMesInput(e){
        this.setData({
            [e.target.dataset.field] : e.detail.value
        })
    }
});
