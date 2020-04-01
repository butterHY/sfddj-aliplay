import api from '/api/api';
import Cart from '/community/service/cart';
import http from '/api/http';

Page({
    data: {
            staticsImageUrl: api.staticsImageUrl,
            baseImageUrl: api.baseImageUrl,
            typeIndex: 2,
            goodsList: [{},{},{},{}],
            memo: '',
            deliveryTypeTaped: false,
            shopTotalPrice: 0,     //整个商店商品的总价格
            deliveryFee: 0,         //配送费
            originalTotalPrice: 0,    //最原始商品的总价
            shopCartList: [],        //店铺商品
            shopid: '',             //商铺id
            shopName: '',
            selfInfo: {
                shipperName: '',
                shipperMobile: '',
            },

    },
    onLoad(options) {
        let {shopid} = options;
        this.cart = Cart.init('cart', this);
        if(shopid) {
            this.setData({
                shopid
            })
            // 参数1：店铺ID
            this.cart.gets(shopid, (res) => {
                console.log('[[]]]--',res);
                let result = res && Object.keys(res).length > 0 ? res : {};
                if(Object.keys(result).length > 0){
                    let shopCartList = result.cartList ? result.cartList : [];
                    
                    this.setData({
                        shopTotalPrice: result.discountPrice < result.salePrice ? result.discountPrice : result.salePrice,     //整个商店商品的总价格
                        originalTotalPrice: result.discountPrice < result.salePrice ? result.discountPrice : result.salePrice,    //最原始商品的总价
                        shopCartList: Object.assign([], shopCartList),
                    })
                }
            });

            this.getOrderData(shopid);
        }
        
    },

    // 获取进入确认订单页的数据
    getOrderData(shopId){
        http.post(api.O2O_ORDERCONFIRM.toOrderPay, {shopId},res => {
            console.log(res)
            let result = res.data.data ? res.data.data : {};
            if(Object.keys(result).length > 0){
                let shopCartList = result.items;
                shopCartList.forEach((val, i, arr) => {
                    val.goodsImagePath = this.data.baseImageUrl + JSON.parse(val.productImg)[0];
                    val.salePrice = val.price;
                    val.name = val.goodsName;

                })
                this.setData({
                    confirmToken: result.confirmToken,
                    shopTotalPrice: this.data.shopTotalPrice > 0 ? this.data.shopTotalPrice : result.price,
                    // shopCartList: this.data.shopCartList.length > 0 ? this.data.shopCartList : shopCartList,
                    shopName: result.name
                })
            }
        }, err => {

        })
    },

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
    },

    // 去结算
    submitPay(){
        if(this.data.typeIndex < 2) {
            // 门店自提
            if(this.data.typeIndex == 0) { 
                // 如果是门店自提，则判断是否有填写个人信息
                if(!this.data.selfInfo.shipperName || !this.data.selfInfo.shipperMobile) {
                    my.showToast({
                      content: '请正确填写提货人信息'
                    });
                    return;
                } else {
                    let data = {
                        confirmToken: this.data.confirmToken,
                        deliveryType: 'SELF',
                        shipName: this.data.selfInfo.shipperName,
                        shipPhone: this.data.selfInfo.shipperMobile,
                        memo: this.data.memo ,
                        payType: 'ALIPAY'
                    }
                    http.post(api.O2O_ORDERCONFIRM.payNow, data, res => {
                        console.log(res)
                    }, err => {})
                }
            }
        } else {   //如果没选择配送方式，则提示
            my.showToast({
                content: '请选择配送方式'
            })
        }
    },

    //填写个人信息确认
    confirmWriteInfo(e){
        // let selfInfo = Object.assign({},e)
        this.setData({
            selfInfo:  Object.assign({},e)
        })
    },

});
