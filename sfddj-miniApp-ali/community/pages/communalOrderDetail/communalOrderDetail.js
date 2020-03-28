
import api from '/api/api';

Page({
    data: {
        staticsImageUrl: api.staticsImageUrl,
        baseImageUrl: api.baseImageUrl,
        contactsTel: 18882341312,
        goodsList: [{},{}]
    },
    onLoad() {
        
    },
    // 取消订单
    cancleOrder(){
        this.confirmPop({content: '确认取消订单？',confirmButtonText: '取消订单', cancelButtonText: '再想想',callback: () => {
            console.log('取消订单确认')
        }})
    },

    // 退款
    returnTap(){
        this.confirmPop({content: '确认申请退款吗？',callback: () => {
            console.log('申请退款确认')
        }})
    },

    //确认弹窗
    confirmPop({content = '', confirmButtonText = '确认', cancelButtonText = '取消',callback = function(){}}){
        my.confirm({
            content,
            confirmButtonText,
            cancelButtonText,
            success: (res) => {
                if(res.confirm) {
                    callback();
                }
            },
        }); 
    },
});
