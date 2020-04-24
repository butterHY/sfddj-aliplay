// import api from '/api/api';
import Cart from '/community/service/cart';
import { post, api } from '/api/http';
import { payOrderNow } from '/community/assets/common';

Page({
    data: {
        staticsImageUrl: api.staticsImageUrl,
        baseImageUrl: api.baseImageUrl,
        typeIndex: 2,
        // shopCartList: [],
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
        // deliveryFee: 0,       //配送费
        deliveryOutGratis: 0,      //满多少可免邮的价格
        totalPrice: 0,           //总价格
        defaultAddress: {},      //商家配送时的地址
        result: {},
        recordId: null,        //社区拼团商品购买需要的
        skuId: null,        //社区拼团商品购买需要的
        quantity: 1,        //社区拼团商品购买需要的
        isTuangou: false,     //是否是拼团商品
        orderModalOpened: false,    //订单3小时后确认提示
        orderSn: '',
    },
    onLoad(options) {
        let { shopid, recordId, skuId, quantity } = options;
        // 普通购买
        if (shopid) {
            this.cart = Cart.init(this);
            this.setData({
                shopid
            })

            this.getCartService(shopid);

            this.getOrderData(shopid);
        } else {
            if (recordId && skuId) {
                this.setData({
                    recordId,
                    skuId,
                    quantity,
                    isTuangou: true
                })
                this.getPinOrderData();
            } else if(skuId) {
                this.setData({
                    recordId,
                    skuId,
                    quantity: quantity ? quantity : 1,
                    isTuangou: true
                })
            }
        }

    },

    onShow() {
        // let defaultAddress = {
        //     shipName: '123',
        //     shipPhone: 18823451312,
        //     province: '广东省',
        //     city: '深圳市',
        //     district: '宝安区',
        //     street: '西乡街道',
        //     detail: '你猜不到的地址，哈哈哈哈哈哈'
        // }
        let communalAddr = getApp().globalData.communalAddr;
        if (communalAddr && Object.keys(communalAddr).length > 0) {
            this.setData({
                defaultAddress: Object.assign({}, communalAddr)
            })

            // 清空全局地址
            getApp().globalData.communalAddr = {};
        }
    },

    // 获取购物车中的数据
    getCartService(shopid) {
        // 参数1：店铺ID
        this.cart.gets(shopid, (res) => {
            let result = res && Object.keys(res).length > 0 ? res : {};
            if (Object.keys(result).length > 0) {
                let shopCartList = result.cartList ? result.cartList : [];
                this.setData({
                    shopTotalPrice: result.discountPrice < result.salePrice ? result.discountPrice : result.salePrice,     //整个商店商品的总价格
                    originalTotalPrice: result.discountPrice < result.salePrice ? result.discountPrice : result.salePrice,    //最原始商品的总价
                    shopCartList: Object.assign([], shopCartList),
                    totalPrice: result.discountPrice < result.salePrice ? result.discountPrice : result.salePrice,
                })
            }
        });
    },

    // 获取进入确认订单页的数据
    getOrderData(shopId) {
        post(api.O2O_ORDERCONFIRM.toOrderPay, { shopId }, res => {
            // console.log(res)
            let result = res.data.data ? res.data.data : {};
            if (Object.keys(result).length > 0) {
                let shopCartList = result.items;
                let noneStoreList = [];   //没有库存
                let noneStoreIdList = []
                shopCartList.forEach((val, i, arr) => {
                    val.goodsImagePath = this.data.baseImageUrl + val.productImg;
                    val.salePrice = val.price;
                    val.name = val.goodsName;
                    val.skuValue = val.productName;
                    // val.store && val.store > 0 ? '' : noneStoreList.push(val.goodsName);
                    if (val.store <= 0) {
                        noneStoreList.push(val.goodsName);
                        noneStoreIdList.push(val.goodsId);
                    }
                    // 如果是最后一个
                    if (i == shopCartList.length - 1) {
                        if (noneStoreList.length > 0) {
                            let noneStoreStr = noneStoreList.join('、');
                            my.confirm({
                                // title: '删除地址',
                                content: `${noneStoreStr + '已售罄，是否继续下单？'}`,
                                confirmButtonText: '是',
                                cancelButtonText: '否',
                                success: (result) => {
                                    if (result.confirm) {

                                    }
                                    else {
                                        // 取消，就返回上一页
                                        my.navigateBack();
                                    }
                                },

                            });

                        }
                    }
                })
                this.setData({
                    result: result,
                    confirmToken: result.confirmToken,    //防止重复提交的token
                    shopTotalPrice: this.data.shopTotalPrice > 0 && result.price == this.data.shopTotalPrice ? this.data.shopTotalPrice : result.price,
                    // shopCartList: this.data.shopCartList.length > 0  ? this.data.shopCartList : shopCartList,
                    shopCartList: this.data.shopTotalPrice <= 0 || result.price != this.data.shopTotalPrice || shopCartList.length != this.data.shopCartList ? shopCartList : this.data.shopCartList,       //如果service里算的价格跟接口返回的不一样，或者service的价格没设置到，则要重新加一下商品列表。
                    shopName: result.name,     // 商家名称
                    deliveryFee: result.deliveryOutGratis && result.deliveryOutGratis > 0 ? (result.deliveryFee && result.price < result.deliveryOutGratis ? result.deliveryFee : 0) : result.deliveryFee,    // 配送费
                    deliveryOutGratis: result.deliveryOutGratis ? result.deliveryOutGratis : 0,
                    totalPrice: this.data.totalPrice > 0 && this.data.totalPrice == result.price ? this.data.totalPrice : result.price
                })
            }
        }, err => {
            my.showToast({
                content: err ? err : '很抱歉，暂时无法购买',
                complete: () => {
                    my.navigateBack({});
                }
            })
        })
    },

    // 获取拼团商品确认订单数据
    getPinOrderData() {
        let { recordId, skuId, quantity } = this.data;
        let data = {
            recordId,
            skuId,
            quantity
        }
        post(api.O2O_ORDERCONFIRM.confirmTuangou, data, res => {
            let result = res.data.data ? res.data.data : {};
            if (Object.keys(result).length > 0) {
                let shopCartList = result.items ? result.items : [];
                shopCartList.forEach((val, i, arr) => {
                    val.goodsImagePath = this.data.baseImageUrl + val.productImg;
                    val.salePrice = val.price;
                    val.name = val.goodsName;
                    val.skuValue = val.productName;
                })
                this.setData({
                    result: result,
                    confirmToken: result.confirmToken,    //防止重复提交的token
                    shopTotalPrice: result.price,
                    shopCartList: shopCartList,
                    shopName: result.name,     // 商家名称
                    deliveryFee: result.deliveryOutGratis && result.deliveryOutGratis > 0 ? (result.deliveryFee && result.price < result.deliveryOutGratis ? result.deliveryFee : 0) : result.deliveryFee,    // 配送费
                    deliveryOutGratis: result.deliveryOutGratis ? result.deliveryOutGratis : 0,
                    totalPrice: result.price,

                })
                console.log('[[getPinOrder--01111', this.data.shopCartList)
            }
        }, err => {
            my.showToast({
                content: err,
                complete: () => {
                    my.navigateBack();
                }
            })
        })
    },

    // 拼团商品的单独购买
    getPinAloneData() {
        let { skuId, quantity } = this.data;
        let data = {
            skuId,
            quantity
        }
        post(api.O2O_ORDERCONFIRM.nowBuy, data, res => {
            let result = res.data.data ? res.data.data : {};
            if (Object.keys(result).length > 0) {
                let shopCartList = result.items ? result.items : [];
                shopCartList.forEach((val, i, arr) => {
                    val.goodsImagePath = this.data.baseImageUrl + val.productImg;
                    val.salePrice = val.price;
                    val.name = val.goodsName;
                    val.skuValue = val.productName;
                })
                this.setData({
                    result: result,
                    confirmToken: result.confirmToken,    //防止重复提交的token
                    shopTotalPrice: result.price,
                    shopCartList: shopCartList,
                    shopName: result.name,     // 商家名称
                    deliveryFee: result.deliveryOutGratis && result.deliveryOutGratis > 0 ? (result.deliveryFee && result.price < result.deliveryOutGratis ? result.deliveryFee : 0) : result.deliveryFee,    // 配送费
                    deliveryOutGratis: result.deliveryOutGratis ? result.deliveryOutGratis : 0,
                    totalPrice: result.price,

                })
                console.log('[[getPinOrder--01111', this.data.shopCartList)
            }
        }, err => {
            my.showToast({
                content: err,
                complete: () => {
                    my.navigateBack();
                }
            })
        })
    },

    // 配送方式切换
    switchType(e) {
        let { index } = e.currentTarget.dataset;
        if (this.data.typeIndex != index) {
            // 如果是选择商家配送，如果商家设置了满多少免配送费的，如果要商品总价大于等于满额则为0，否则就要加上设置的配送费；
            let deliveryFee = index == 1 ? (this.data.deliveryOutGratis > 0 ? this.data.shopTotalPrice >= this.data.deliveryOutGratis ? 0 : this.data.deliveryFee : this.data.deliveryFee) : 0;
            this.setData({
                typeIndex: index,
                deliveryTypeTaped: true,
                totalPrice: this.data.totalPrice + deliveryFee
            })
        }
    },

    // 留言输入
    userMesInput(e) {
        this.setData({
            [e.target.dataset.field]: e.detail.value
        })
    },

    // 去结算
    submitPay() {
        if (this.data.typeIndex < 2) {
            let data = {
                confirmToken: this.data.confirmToken,
                memo: this.data.memo,
                payType: 'ALIPAY'
            }
            // 门店自提
            if (this.data.typeIndex == 0) {
                // 如果是门店自提，则判断是否有填写个人信息
                if (!this.data.selfInfo.shipperName || !this.data.selfInfo.shipperMobile) {
                    my.showToast({
                        content: '请正确填写提货人信息'
                    });
                    return;
                } else {
                    data = Object.assign(data, {
                        deliveryType: 'SELF',
                        shipName: this.data.selfInfo.shipperName,
                        shipPhone: this.data.selfInfo.shipperMobile,
                    })
                    if (!this.data.isSubmiting) {
                        this.setData({
                            isSubmiting: true
                        })
                        my.showLoading();
                        this.createPayOrder(data);
                    } else {
                        return;
                    }
                }
            } else {
                // 判断地址是否已选择
                if (this.data.defaultAddress && Object.keys(this.data.defaultAddress).length > 0) {
                    let defaultAddress = this.data.defaultAddress
                    data = Object.assign(data, {
                        deliveryType: 'LOGISTICS',
                        shipName: defaultAddress.fullName,
                        shipPhone: defaultAddress.mobile,
                        province: defaultAddress.province ? defaultAddress.province : '',
                        city: defaultAddress.city ? defaultAddress.city : '',
                        district: defaultAddress.area ? defaultAddress.area : '',
                        street: defaultAddress.street ? defaultAddress.street : '',
                        detail: defaultAddress.locate + defaultAddress.address,
                        latitude: defaultAddress.latitude ? defaultAddress.latitude : '',
                        longitude: defaultAddress.longitude ? defaultAddress.longitude : ''
                    })
                    this.createPayOrder(data);
                } else {
                    my.showToast({
                        content: '请选择地址'
                    })
                    return;
                }
            }

        } else {   //如果没选择配送方式，则提示
            my.showToast({
                content: '请选择配送方式'
            })
        }
    },

    createPayOrder(data) {
        let that = this;
        post(api.O2O_ORDERCONFIRM.createPayOrder, data, res => {
            if (res.data.data && Object.keys(res.data.data).length > 0) {
                let { orderSn, tradeNo } = res.data.data;
                // console.log(res.data.data,orderSn,tradeNo);
                // 调起支付
                payOrderNow({
                    orderSn,
                    tradeNo,
                    clearShopCart: () => {
                        this.cart.clear(this.data.shopid, (res) => {
                        });
                    },
                    callBack: () => {
                        // that.cancelSwitch();
                        // my.showToast({
                        //     content: '支付成功'
                        // });
                        // my.redirectTo({
                        //     url: '/community/pages/orderDetail/orderDetail?orderSn=' + orderSn
                        // })
                        this.setData({
                            orderModalOpened: true,
                            orderSn
                        })
                    },
                    failFun: () => {
                        // 解除防止重复提交开关
                        that.cancelSwitch();
                        my.showToast({
                            content: '已取消'
                        })
                        my.redirectTo({
                            url: '/community/pages/orderDetail/orderDetail?orderSn=' + orderSn
                        })
                    },
                    errorFun: () => {
                        that.cancelSwitch();
                    }
                })
            } else {
                that.cancelSwitch();
            }

        }, err => {
            that.cancelSwitch();
            my.showToast({
                content: err
            })
            // 重新更新下token
            that.getOrderData(that.data.shopid);
        })
    },

    /**
	 * 调起支付
	 */
    showWxPayment: function (res) {
        var that = this;
        if (res.data.data && Object.keys(res.data.data).length > 0) {
            // 清除本地购物车
            this.cart.clear(this.data.shopid, (res) => {
            });
            // conso
            let { orderSn, tradeNo } = res.data.data;
            // let orderStr = res.data.data.orderStr;
            my.tradePay({
                tradeNO: tradeNo,
                success: function (res) {
                    let nowDate = new Date().getTime();
                    // 如果支付code为9000则是成功
                    if (res.resultCode == '9000') {

                        // 检测是否到账
                        that.controllPayment(orderSn, nowDate, () => {
                            that.cancelSwitch();
                            my.showToast({
                                content: '支付成功'
                            });
                            my.redirectTo({
                                url: '/community/pages/orderDetail/orderDetail?orderSn=' + orderSn
                            })
                        })


                    }
                    else if (res.resultCode == '6001') {
                        // 解除防止重复提交开关
                        that.cancelSwitch();
                        my.showToast({
                            content: '已取消'
                        })
                        my.redirectTo({
                            url: '/community/pages/orderDetail/orderDetail?orderSn=' + orderSn
                        })
                    }
                    else if (res.resultCode == '6002') {
                        // 解除防止重复提交开关
                        that.cancelSwitch();
                        my.showToast({
                            content: '网络连接出错'
                        })
                        my.redirectTo({
                            url: '/community/pages/orderDetail/orderDetail?orderSn=' + orderSn
                        })
                    }
                    else {
                        // 解除防止重复提交开关
                        that.cancelSwitch();
                        my.showToast({
                            content: '支付失败'
                        })
                        my.redirectTo({
                            url: '/community/pages/orderDetail/orderDetail?orderSn=' + orderSn
                        })
                    }


                },
                fail: function (res) {
                    that.cancelSwitch();
                }
            });
        } else {
            that.cancelSwitch();
        }
    },

    // 解除开关
    cancelSwitch() {
        my.hideLoading();
        // 解除防止重复提交开关
        this.setData({
            isSubmiting: false
        })
    },


	/**
	 * 监控用户付款行为 success(成功)/cancel（取消）/sysBreak（异常）
	 */
    controllPayment(orderSn, payTime, callback) {
        let that = this;
        post(api.O2O_ORDERCONFIRM.queryPayType, { orderSn }, (res) => {
            let result = res.data.data ? res.data.data : {};
            if (result.payFinish) {
                callback()
            }
            else {
                let nowDate = new Date().getTime();
                // 做一个人10秒的回调查询支付成功，否则视为失败
                if (nowDate - payTime < 10000) {
                    that.controllPayment(orderSn, payTime, callback)
                } else {
                    that.cancelSwitch();
                    // 支付失败
                    my.showToast({
                        content: '支付失败'
                    })
                    my.redirectTo({
                        url: '/community/pages/orderDetail/orderDetail?orderSn=' + orderSn
                    })
                }
            }
        }, (err) => {
            // 支付失败
            // my.showToast({
            //     content: '支付失败'
            // })
            that.cancelSwitch();
            my.redirectTo({
                url: '/community/pages/orderDetail/orderDetail?orderSn=' + orderSn
            })
        })
    },

    //填写个人信息确认
    confirmWriteInfo(e) {
        // let selfInfo = Object.assign({},e)
        this.setData({
            selfInfo: Object.assign({}, e)
        })
    },

    // 超3小时提示，点我知道
    onModalClick() {
        this.cancelSwitch();
        my.showToast({
            content: '支付成功'
        });
        my.redirectTo({
            url: '/community/pages/orderDetail/orderDetail?orderSn=' + this.data.orderSn
        })
    },

});
