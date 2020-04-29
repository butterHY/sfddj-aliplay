
// import api from '/api/api';
import { post, api } from '/api/http';
import { payOrderNow } from '/community/assets/common';
const dateFmt = require('/utils/dateformat');

Page({
    data: {
        staticsImageUrl: api.staticsImageUrl,
        baseImageUrl: api.baseImageUrl,
        goodsList: [],
        orderSn: '',
        leftTimes: 0,
        leftTimeStr: '00:00',     //倒计时的字符串显示形式
        timer: null,
        typeIndex: 0,
        loadComplete: false,       //是否加载完成 
        loadFail: false,           //是否加载失败
        orderModalOpened: false,
        timeStatus: 'end',         //默认是订单时间超过3小时
        isSubmiting: false,       //是否正在提交的开关
    },
    onLoad(options) {
        let { orderSn } = options;
        this.setData({
            orderSn
        })

    },
    onShow() {

        this.getOrderDetail();
    },

    // onUnload() {
    //     clearTimeout(this.data.timer);
    // },

    onHide() {
        // 页面隐藏
        clearTimeout(this.data.timer);
    },
    onUnload() {
        // 页面被关闭
        clearTimeout(this.data.timer);
    },

    // 获取订单详情
    getOrderDetail() {
        let that = this;
        post(api.O2O_ORDER.orderDetail, { orderSn: this.data.orderSn }, res => {
            // console.log('orderDetail', res)
            let result = res.data.data ? res.data.data : {};
            result.items = result.items && Object.keys(result.items).length > 0 ? that.handleGoodsInfo(result.items) : [];
            if (result.orderStatus == 'NOPAY') {
                that.noPayCount(result.createDate);
            }
            this.setGoodsInfo(result);
            // 判断显不显示退款按钮
            this.isShowAfterSale(result);
            this.setData({
                result,
                goodsList: result.items,
                loadComplete: true,
                loadFail: false
            })
        }, err => {
            this.setData({
                loadComplete: true,
                loadFail: true
            })
        })
    },

    // 设置商品信息
    setGoodsInfo(result) {
        this.setData({
            deliveryFee: result.deliveryFee,
            shopTotalPrice: result.payFee,
            totalPrice: result.totalFee,
            typeIndex: result.deliveryType == 'SELF' ? 0 : 1,
            orderDate: dateFmt.DateFormat.format(new Date(result.createDate), 'yyyy-MM-dd hh:mm')
        })
    },

    // 处理商品信息
    handleGoodsInfo(list = []) {
        // 为了与其他组件的字段兼容
        list.forEach((val, i, arr) => {
            val.goodsImagePath = val.productImg ? api.baseImageUrl + val.productImg : '';
            val.salePrice = val.price;
            val.name = val.goodsName;
            val.skuValue = val.productName;
        })
        return list;
    },

    // 如果是未支付的要判断是否要显示倒计时
    noPayCount(createDate) {
        let nowTime = new Date().getTime();
        let lastTime = 900000 + createDate;
        // 如果不超过15分钟,启用倒计时
        if (lastTime - nowTime > 0) {
            this.setData({
                leftTimes: lastTime - nowTime
            })
            this.countDown();
        } else {    //停止倒计时
            // this.getOrderDetail(this.data.orderSn);
        }
    },

    // 判断是否显示要显示退款按钮
    isShowAfterSale(result) {
        // 如果是还没配送的, 但已付款的
        if (result.orderStatus == 'PAYFINISH') {
            let timeStatus = this.timeSpan(result.createDate);
            this.setData({
                timeStatus
            })
        }
    },

    // 判断现在的时间与订单时间的差距
    timeSpan(createDate) {
        let nowTime = new Date().getTime();
        let withinTenMins = createDate + 600000;   // 10分钟内的时间
        let within3hours = createDate + 10800000;   // 3小时内的时间
        // 10分钟内可系统退款
        if (nowTime < withinTenMins) {
            return 'tenMins';
        } else if (nowTime < within3hours) {  //3小时内未配送可申请退款
            return '3Hours';
        } else {
            return 'end';
        }
    },

    //倒计时
    countDown() {
        let that = this;
        let { leftTimes } = this.data;
        if (leftTimes > 0) {

            let mins = parseInt((leftTimes / 1000) / 60);
            let seconds = parseInt((leftTimes / 1000 - mins * 60));
            let minsStr = mins < 10 ? '0' + mins : mins;
            let secondsStr = seconds < 10 ? '0' + seconds : seconds;
            this.setData({
                leftTimeStr: minsStr + ':' + secondsStr
            })
            clearTimeout(this.data.timer);
            this.data.timer = setTimeout(function () {
                leftTimes = parseInt(leftTimes - 1000);
                that.setData({
                    leftTimes
                })
                that.countDown();
            }, 1000)
        }
        else {
            this.getOrderDetail(this.data.orderSn);
        }
    },

    // 取消订单
    cancelOrder() {
        this.confirmPop({
            content: '确认取消订单？', confirmButtonText: '取消订单', cancelButtonText: '再想想', callback: () => {
                post(api.O2O_ORDER.cancelOrder, { orderSn: this.data.orderSn }, res => {
                    let result = res.data.data ? res.data.data : {};
                    my.showToast({
                        content: '取消成功'
                    })
                    this.getOrderDetail()
                }, err => {
                    my.showToast({
                        content: err
                    })
                })
            }
        })
    },

    // 退款
    returnTap() {
        this.confirmPop({
            content: '确认申请退款吗？', callback: () => {
                this.handleRefund({
                    tenFn: () => {
                        this.systemRefund();
                    },
                    hoursFn: () => {
                        my.navigateTo({
                            url: `/community/pages/afterSales/afterSales?orderSn=${this.data.orderSn}`
                        });
                    }
                })
            }
        })
    },

    handleRefund({ tenFn, hoursFn }) {
        let { createDate } = this.data.result;
        let timeStatus = this.timeSpan(createDate);
        // 可系统直接退款
        if (timeStatus == 'tenMins') {
            tenFn && typeof tenFn === 'function' && tenFn()
        } else if (timeStatus == '3Hours') {   //跳去申请售后页
            hoursFn && typeof hoursFn === 'function' && hoursFn()
        } else {
            // 不能退款，提示；
            my.showToast({
                content: '暂无法退款，可联系商家'
            })
        }
    },

    // 系统直接退款
    systemRefund() {
        let data = { orderSn: this.data.orderSn };
        if (!this.data.isSubmiting) {
            // 设开关
            this.setData({
                isSubmiting: true
            })
            post(api.O2O_ORDER.systemRefund, data, res => {
                // 开开关
                this.setData({
                    isSubmiting: false
                })
                if (res.data.ret && res.data.ret.code == '0') {
                    my.showToast({
                        content: '退款成功'
                    })
                    this.getOrderDetail();
                }
            }, err => {
                // 设开关
                this.setData({
                    isSubmiting: false
                })
                my.showToast({
                    content: err
                })
            })
        }
    },


    //确认弹窗
    confirmPop({ content = '', confirmButtonText = '确认', cancelButtonText = '取消', callback = function () { } }) {
        my.confirm({
            content,
            confirmButtonText,
            cancelButtonText,
            success: (res) => {
                if (res.confirm) {
                    callback();
                }
            },
        });
    },

    // 去支付
    toPayNow(e) {
        let that = this;
        let { orderSn, tradeNo } = e.currentTarget.dataset;
        payOrderNow({
            orderSn,
            tradeNo,
            callBack: () => {
                this.setData({
                    orderModalOpened: true
                })
            },
            failFun: () => {
                my.showToast({
                    content: '支付失败'
                })
            },
            errorFun: () => {
                my.showToast({
                    content: '支付失败'
                })
            }
        })
    },

    // 复制订单号
    copyOrderSn() {
        my.setClipboard({
            text: this.data.orderSn,
            success: function (res) {
                my.getClipboard({
                    success: ({ text }) => {
                        my.showToast({
                            content: '订单号复制成功',
                            type: 'success'
                        })
                    }
                });
            }
        });
    },

    // 超3小时提示，点我知道
    onModalClick() {
        my.showToast({
            content: '支付成功'
        })
        this.setData({
            orderModalOpened: false
        })
        this.getOrderDetail()
    },

    // 去售后详情页
    toAfterDetail() {
        let { orderSn } = this.data;
        my.navigateTo({
            url: `/community/pages/afterSalesDetail/afterSalesDetail?orderSn=${orderSn}`
        });
    },

});
