// 购物车

import MiniAppService from "alipay-miniapp-service";
import http from '/api/http';
import api from '/api/api';

class Cart extends MiniAppService {
    constructor() {
        super();
        this.shops = {};
    }

    static get Name() {
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
                    obj = this.shops[shopId] = {cartList: [], cartTotalNumb: 0, salePrice: 0, discountPrice: 0};
                }
                obj.cnt += cnt;
                obj.salePrice += sku.salePrice * cnt;
                if(sku.isDiscount) {
                    obj.discountPrice += sku.discountPrice * cnt;
                } else {
                    obj.discountPrice += sku.salePrice * cnt;
                }
                let idx = obj.cartList.findIndex((T) => T.skuId == sku.id);
                if(idx >= 0) {
                    obj.cartList[idx].quantity += cnt;
                    obj.cartList[idx].id = res.data.data.id;
                    if(this.$cmps) {
                        this.$cmps.forEach((T) => {
                            if(T.selfName == 'cart' && T.props.shopid == shopId) {
                                T.setData({
                                    'obj.cnt': obj.cnt,
                                    'obj.salePrice': obj.salePrice,
                                    'obj.discountPrice': obj.discountPrice,
                                    [`obj.cartList[${idx}].id`]: obj.cartList[idx].id,
                                    [`obj.cartList[${idx}].quantity`]: obj.cartList[idx].quantity
                                });
                            }
                        });
                    }
                } else {
                    obj.cartList.push({
                        "defaultGoodsImage": goods.goodsImagePath[0],
                        "discountPrice": sku.discountPrice,
                        "discountStatus": sku.isDiscount,
                        "goodsId": sku.goodsId,
                        "goodsImagePath": goods.goodsImagePath[0],
                        "goodsSn": goods.goodsSn,
                        "id": res.data.data.id,
                        "name": goods.title,
                        "quantity": cnt,
                        "salePrice": sku.salePrice,
                        "skuId": sku.id,
                        "skuValue": sku.iavValue
                    });
                    this.$cmps.forEach((T) => {
                        if(T.selfName == 'cart' && T.props.shopid == shopId) {
                            T.setData({
                                'obj.cnt': obj.cnt,
                                'obj.salePrice': obj.salePrice,
                                'obj.discountPrice': obj.discountPrice,
                                'obj.cartList': obj.cartList
                            });
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
                        discountPrice = 0,
                        cnt = 0;
                    if(res.data.data.cartList) {
                        res.data.data.cartList.forEach((T) => {
                            if(T.defaultGoodsImage) {
                                T.defaultGoodsImage = api.baseImageUrl + JSON.parse(T.defaultGoodsImage)[0];
                            }
                            if(T.goodsImagePath) {
                                T.goodsImagePath = api.baseImageUrl + JSON.parse(T.goodsImagePath)[0];
                            } else {
                                T.goodsImagePath = T.defaultGoodsImage;
                            }
                            if(T.discountStatus) {
                                discountPrice += T.discountPrice * T.quantity;
                            } else {
                                discountPrice += T.salePrice * T.quantity;
                            }
                            salePrice += T.salePrice * T.quantity;
                            cnt += T.quantity;
                        });
                    }
                    res.data.data.salePrice = salePrice;
                    res.data.data.discountPrice = discountPrice;
                    res.data.data.cnt = cnt;
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


    clear(shopId, callbackFun) {
        http.post(api.O2OCart.CLEAR, {
            shopId: shopId
        }, (res) => {
            if(res.data && res.data.ret && res.data.ret.code == 0) {
                delete this.shops[shopId];
                if(this.$cmps) {
                    this.$cmps.forEach((T) => {
                        if(T.selfName == 'cart' && T.props.shopid == shopId && T.clear) {
                            T.clear();
                        }
                    });
                }
                if(callbackFun) {
                    callbackFun(res.data);
                }
            } else {
                if(callbackFun) {
                    callbackFun(undefined);
                }
            }
        });
    }

    changeNum(shopId, skuId, addNum, callbackFun) {
        let shop = this.shops[shopId];
        if(shop) {
            let cartList = shop.cartList;
            if(cartList) {
                let idx = cartList.findIndex((T) => T.skuId == skuId);
                if(idx >= 0) {
                    let item = cartList[idx];
                    if(item.quantity == 0) {
                        if(addNum > 0) {
                            this.add(shopId, {
                                goodsImagePath: [item.defaultGoodsImage],
                                goodsSn: item.goodsSn,
                                title: item.name,
                                shopGoodsSkuList: [{
                                    id: item.skuId,
                                    discountPrice: item.discountPrice,
                                    isDiscount: item.discountStatus,
                                    goodsId: item.goodsId,
                                    salePrice: item.salePrice,
                                    iavValue: item.skuValue
                                }]
                            }, skuId, addNum, callbackFun);
                        } else {
                            if(callbackFun) {
                                callbackFun(undefined);
                            }
                        }
                    } else {
                        let newNum = item.quantity + addNum;
                        if(newNum >= 0 && newNum <= 999) {
                            http.post(api.O2OCart.CHANGE, {
                                cartId: item.id,
                                addCount: addNum
                            }, (res) => {
                                if(res.data && res.data.ret && res.data.ret.code == 0) {
                                    item.quantity = newNum;
                                    shop.cnt += addNum;
                                    shop.salePrice += item.salePrice * addNum;
                                    if(item.discountStatus) {
                                        shop.discountPrice += item.discountPrice * addNum;
                                    } else {
                                        shop.discountPrice += item.salePrice * addNum;
                                    }
                                    if(this.$cmps) {
                                        this.$cmps.forEach((T) => {
                                            if(T.selfName == 'cart' && T.props.shopid == shopId) {
                                                T.setData({
                                                    [`obj.cartList[${idx}].quantity`]: newNum,
                                                    'obj.cnt': shop.cnt,
                                                    'obj.salePrice': shop.salePrice,
                                                    'obj.discountPrice': shop.discountPrice
                                                });
                                            }
                                        });
                                    }
                                    if(callbackFun) {
                                        callbackFun(shop);
                                    }
                                } else {
                                    if(callbackFun) {
                                        callbackFun(undefined);
                                    }
                                }
                            }, (err) => {
                                if(callbackFun) {
                                    callbackFun(undefined, err);
                                }
                            });
                        } else {
                            if(callbackFun) {
                                callbackFun(undefined);
                            }
                        }
                    }
                } else {
                    if(callbackFun) {
                        callbackFun(undefined);
                    }
                }
            } else {
                if(callbackFun) {
                    callbackFun(undefined);
                }
            }
        } else {
            if(callbackFun) {
                callbackFun(undefined);
            }
        }
    }


    filter(shopId) {
        let shop = this.shops[shopId];
        if(shop) {
            let cartList = shop.cartList;
            if(cartList) {
                while(true) {
                    let idx = cartList.findIndex((T) => T.quantity <= 0);
                    if(idx >= 0) {
                        cartList.splice(idx, 1);
                    } else {
                        break;
                    }
                }
                this.$cmps.forEach((T) => {
                    if(T.selfName == 'cart' && T.props.shopid == shopId) {
                        T.setData({
                            'obj.cartList': cartList
                        });
                    }
                });
            }
        }
    }
}

export default Cart;