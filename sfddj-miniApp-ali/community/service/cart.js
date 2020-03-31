// 购物车

import MiniAppService from "alipay-miniapp-service";
import http from '/api/http';
import api from '/api/api';

class Cart extends MiniAppService {
    constructor() {
        super();
        this.shops = {};
    }

    static get name() {
        return 'Cart';
    }

    add(shopId, goods, skuId, cnt, callbackFun) {
        let sku = undefined;
        if(goods.shopGoodsSkuList) {
            sku = goods.shopGoodsSkuList.find((T) => T.id == skuId);
        }
        if(sku) {
            http.post(api.O2OCart.ADD, {
                skuId: skuId,
                quantity: cnt
            }, (res) => {
                /**
                 * {
        "cartList": [
        {
            "defaultGoodsImage": "string",
            "discountPrice": 0,
            "discountStatus": false,
            "goodsId": 0,
            "goodsImagePath": "string",
            "goodsSn": "string",
            "id": 0,
            "name": "string",
            "quantity": 0,
            "salePrice": 0,
            "skuId": 0
        }
        ],
        "cartTotalNumb": 0
    }
                */
                let obj = this.shops[shopId];
                if(!obj) {
                    obj = this.shops[shopId] = {cartList: [], cartTotalNumb: 0};
                }
                obj.cartList.push({
                    "defaultGoodsImage": goods.goodsImagePath,
                    "discountPrice": sku.discountPrice,
                    "discountStatus": sku.isDiscount,
                    "goodsId": sku.goodsId,
                    "goodsImagePath": goods.goodsImagePath,
                    "goodsSn": goods.goodsSn,
                    "id": shopId,
                    "name": goods.title,
                    "quantity": cnt,
                    "salePrice": sku.salePrice,
                    "skuId": sku.id
                });
                obj.cartTotalNumb += cnt;
                if(this.$cmps) {
                    this.$cmps.forEach((T) => {
                        if(T.selfName == 'cart' && T.props.shopid == shopId) {
                            // T.setData({

                            // });
                        }
                    });
                }
                if(callbackFun) {
                    callbackFun(res);
                }
            }, (err) => {
                if(callbackFun) {
                    callbackFun(err);
                }
            });
        }
    }


    gets(shopId, callbackFun) {
        if(!this.shops) {
            this.shops = {};
        }
        let data = this.shops[shopId];
        if(data) {
            callbackFun(data);
        } else {
            http.get(api.O2OCart.GETS, {
                shopId: shopId
            }, (res) => {
                if(res.data && res.data.data) {
                    let salePrice = 0,
                        discountPrice = 0;
                    if(res.data.data.cartList) {
                        res.data.data.cartList.forEach((T) => {
                            if(T.defaultGoodsImage) {
                                T.defaultGoodsImage = JSON.parse(T.defaultGoodsImage)[0];
                            }
                            if(T.goodsImagePath) {
                                T.goodsImagePath = JSON.parse(T.goodsImagePath)[0];
                            }
                            if(T.discountStatus) {
                                discountPrice += T.discountPrice;
                            } else {
                                discountPrice += T.salePrice;
                            }
                            salePrice += T.salePrice;
                        });
                    }
                    res.data.data.salePrice = salePrice;
                    res.data.data.discountPrice = discountPrice;
                    this.shops[shopId] = res.data.data;
                    if(callbackFun) {
                        callbackFun(this.shops[shopId]);
                    }
                } else {
                    if(callbackFun) {
                        callbackFun(undefined);
                    }
                }
            });
        }
    }
}

export default Cart;