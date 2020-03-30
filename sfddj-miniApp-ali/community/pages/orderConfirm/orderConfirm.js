import api from '/api/api';

Page({
    data: {
            staticsImageUrl: api.staticsImageUrl,
            baseImageUrl: api.baseImageUrl,
            typeIndex: 0,
            goodsList: [{},{},{},{}],
            userMessage: '',
    },
    onLoad() {},

    // 配送方式切换
    switchType(e){
        let {index} = e.currentTarget.dataset;
        if(this.data.typeIndex != index) {
            this.setData({
                typeIndex: index
            })
        }
    },
});
