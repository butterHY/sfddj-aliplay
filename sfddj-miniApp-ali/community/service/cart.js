// 购物车

import http from '/api/http';
import api from '/api/api';

class Cart extends getApp().Service {
    constructor() {
        super();
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
                let obj = this.$get(shopId + '');
                if(!obj) {
                    let _obj = {cartList: [], cartTotalNumb: 0, salePrice: 0, discountPrice: 0, cnt: 0};
                    if(obj === null) {
                      this.$set(shopId, _obj);
                    }
                    obj = _obj;
                }
                let cnt2 = obj.cnt + cnt,
                    salePrice = obj.salePrice + sku.salePrice * cnt,
                    discountPrice = obj.discountPrice + (sku.isDiscount ? sku.discountPrice : sku.salePrice) * cnt;
                let idx = obj.cartList.findIndex((T) => T.skuId == sku.id);
                if(idx >= 0) {
                    this.$set({
                        [`${shopId}.salePrice`]: salePrice,
                        [`${shopId}.discountPrice`]: discountPrice,
                        [`${shopId}.cartList[${idx}].quantity`]: obj.cartList[idx].quantity + cnt,
                        [`${shopId}.cartList[${idx}].id`]: res.data.data.id,
                        [`${shopId}.cnt`]: cnt2
                    }, (T) => {
                        return T.selfName == 'cart' && T.props.shopid == shopId;
                    });
                } else {
                    this.$set({
                        [`${shopId}.salePrice`]: salePrice,
                        [`${shopId}.discountPrice`]: discountPrice,
                        [`${shopId}.cartList[${obj.cartList.length}]`]: {
                            "defaultGoodsImage": goods.goodsImagePath instanceof Array ? goods.goodsImagePath[0] : goods.goodsImagePath,
                            "discountPrice": sku.discountPrice,
                            "discountStatus": sku.isDiscount,
                            "goodsId": sku.goodsId,
                            "goodsImagePath": goods.goodsImagePath instanceof Array ? goods.goodsImagePath[0] : goods.goodsImagePath,
                            "goodsSn": goods.goodsSn,
                            "id": res.data.data.id,
                            "name": goods.title,
                            "quantity": cnt,
                            "salePrice": sku.salePrice,
                            "skuId": sku.id,
                            "skuValue": sku.iavValue
                        },
                        [`${shopId}.cnt`]: cnt2
                    }, (T) => {
                        return T.selfName == 'cart' && T.props.shopid == shopId;
                    });
                }
                if(callbackFun) {
                    let tip = {};
                    if(sku.store < 3) {
                        tip.msg = '库存不足，请尽快下单';
                    }
                    callbackFun(res, tip);
                }
            }, (err) => {
                if(callbackFun) {
                    callbackFun(undefined, err);
                }
            });
        }
    }


    gets(shopId, callbackFun) {
        let data = this.$get(shopId + '');
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
                    this.$set(shopId + '', res.data.data, (T) => {
                        return T.selfName == 'cart' && T.props.shopid == shopId;
                    });
                    if(callbackFun) {
                        callbackFun(res.data.data);
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
                this.$set(shopId + '', null, (T) => {
                    return T.selfName == 'cart' && T.props.shopid == shopId;
                });
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
        let shop = this.$get(shopId);
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
                            }, skuId, addNum, (re) => {
                                if(callbackFun) {
                                    setTimeout(() => {
                                        callbackFun(re);
                                    }, 200);
                                }
                            });
                        } else {
                            if(callbackFun) {
                                callbackFun(undefined);
                            }
                        }
                    } else {
                        let newNum = item.quantity + addNum;
                        if(newNum >= 0 && newNum <= 99) {
                            http.post(api.O2OCart.CHANGE, {
                                cartId: item.id,
                                addCount: addNum
                            }, (res) => {
                                if(res.data && res.data.ret && res.data.ret.code == 0) {
                                    this.$set({
                                        [`${shopId}.cartList[${idx}].quantity`]: newNum,
                                        [`${shopId}.cnt`]: shop.cnt + addNum,
                                        [`${shopId}.salePrice`]: Math.abs(shop.salePrice + item.salePrice * addNum),
                                        [`${shopId}.discountPrice`]: Math.abs(shop.discountPrice + (item.discountStatus ? item.discountPrice : item.salePrice) * addNum)
                                    }, (T) => {
                                        return T.selfName == 'cart' && T.props.shopid == shopId;
                                    });
                                    if(callbackFun) {
                                        setTimeout(() => {
                                            callbackFun(shop);
                                        }, 200);
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
							// 如果超过99加提示
							if(newNum > 99) {
								if(callbackFun) {
									callbackFun({}, {msg: '已达上限99'});
								}
							} else {
								
								if(callbackFun) {
									callbackFun(undefined);
								}
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
        let shop = this.$get(shopId + '');
        if(shop) {
            let cartList = shop.cartList;
            if(cartList) {
                while(true) {
                    let idx = cartList.findIndex((T) => T.quantity <= 0);
                    if(idx >= 0) {
                        this.$splice(`${shopId}.cartList`, [idx, 1], (T) => {
                            return T.selfName == 'cart' && T.props.shopid == shopId;
                        });
                    } else {
                        break;
                    }
                }
            }
        }
    }




    // 团购


    // 确认团购订单
    confirmTuangou(tuangouDetail, n, callbackFun) {
        if(tuangouDetail.tuangouSkuList && tuangouDetail.tuangouSkuList.length > 0) {
            http.post(api.O2O_ORDERCONFIRM.confirmTuangou, {
                recordId: tuangouDetail.recordId,
                skuId: tuangouDetail.tuangouSkuList[0].id,
                quantity: n
            }, (res) => {
                if(res.data && res.data.ret && res.data.ret.code == 0) {
                    if(callbackFun) {
                        callbackFun(res);
                    }
                } else {
                    if(callbackFun) {
                        callbackFun(undefined, '发生错误的了');
                    }
                }
            }, (err) => {
                if(callbackFun) {
                    callbackFun(undefined, err);
                }
            });
        } else {
            callbackFun(undefined, '发生错误了');
        }
    }


    // 立即购买
    nowBuy(skuId, n, callbackFun) {
        http.post(api.O2O_ORDERCONFIRM.nowBuy, {
            skuId: skuId,
            quantity: n
        }, (res) => {
            if(res.data && res.data.ret && res.data.ret.code == 0) {
                if(callbackFun) {
                    callbackFun(res);
                }
            } else {
                if(callbackFun) {
                    callbackFun(undefined, '发生错误的了');
                }
            }
        }, (err) => {
            if(callbackFun) {
                callbackFun(undefined, err);
            }
        });
    }
}

export default Cart;