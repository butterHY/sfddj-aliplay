
// import api from '/api/api';
import { post, api } from '/api/http';
import { payOrderNow } from '/community/assets/common';
const dateFmt = require('/utils/dateformat');

Page({
    data: {
        staticsImageUrl: api.staticsImageUrl,
        baseImageUrl: api.baseImageUrl,
        contactsTel: 18882341312,
        goodsList: [],
        orderSn: '',
        leftTimes: 0,
        leftTimeStr: '00:00',     //倒计时的字符串显示形式
        timer: null,
        typeIndex: 0,
        loadComplete: false,       //是否加载完成 
        loadFail: false,           //是否加载失败
    },
    onLoad(options) {
        let { orderSn } = options;
        this.setData({
            orderSn
        })

    },
    onShow(){
      
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
                console.log('申请退款确认')
            }
        })
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
                my.showToast({
                    content: '支付成功'
                })
                that.getOrderDetail()
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


});
