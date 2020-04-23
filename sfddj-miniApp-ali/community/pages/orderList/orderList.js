// import api from '/api/api';
import { post, api } from '/api/http';
const dateFmt = require('/utils/dateformat');

Page({
    data: {
        staticsImageUrl: api.staticsImageUrl,
        baseImageUrl: api.baseImageUrl,
        tabList: [{ title: 'o2o订单' }, { title: "拼团订单" }],
        tabIndex: 0,
        orderTypeList: [['全部', '待付款', '付款成功', '交易成功', '退款/售后'], ['全部', '交易成功', '退款/售后']],
        // pinOrderTypeList: ['全部', '交易成功', '退款/售后'],
        orderTypeCode: [['ALL', 'NOPAY', 'PAYFINISH', 'COMMENT', 'AFTERSALE'], [0, 1, 2]],       // 获取数据列表的类型

        typeIndexList: [0, 0],
        orderList: [[], [], [], [], []],       //保存订单数据
        pinOrderList: [[], [], []],           //拼团订单数据
        hasMoreList: [[true, true, true, true, true], [true, true, true]],                      //是否还有下一页
        isLoadedList: [[false, false, false, false, false], [false, false, false]],            //是否加载过了
        startList: [[0, 0, 0, 0, 0],[0, 0, 0]],     //请求开始的索引
        limit: 10,
        allTimer: null,        //全部订单的定时器
        noPayTimer: null,      //未支付订单的定时器
        countList: [[], [], [], [], []],      //定时器列表
        // allCounting: false,        //全部状态订单是否在使用倒计时
        // noPayCounting: false,      // 未支付状态订单是否在使用倒计时
        isCounting: [false, false, false, false, false],    //对应的订单状态是否在使用倒计时
        isLoadingList: [[false, false, false, false, false], [false, false, false]],    //是否正在加载
    },
    onLoad(options) {
        let index = options.index ? options.index : 0;
        this.setData({
            typeIndex: index
        })
        // this.getOrderList(0);
    },

    onShow() {
        this.getOrderList(0, this.data.orderList[this.data.typeIndex].length)
    },

    onUnload() {
        // 清除定时器
        clearTimeout(this.data.allTimer);
        clearTimeout(this.data.noPayTimer);
    },

    //   切换订单状态
    switchType(e) {
        let { index, fatherIndex } = e.target.dataset;
        let { typeIndexList, tabIndex, isLoadedList } = this.data;
        let setIndexName = 'typeIndexList[' + tabIndex + ']';
        if (index != typeIndexList[tabIndex]) {
            this.setData({
                [setIndexName]: index
            })
            if (isLoadedList[tabIndex][index].toString() == 'false') {
                this.getOrderList(0)
            }
        }
    },

    // 获取订单列表
    getOrderList(type = '', setLimit) {
        let that = this;
        let { tabIndex, limit, orderList, isLoadingList, typeIndexList } = this.data;
        tabIndex == 0 ? this.getO2OOrder(type, setLimit) : this.getPinOrder(type, setLimit);
    },

    getO2OOrder(type = '', setLimit) {
        let that = this;
        let { tabIndex, limit, orderList, pinOrderList, isLoadingList, typeIndexList, startList, orderTypeCode } = this.data;
        let index = typeIndexList[tabIndex];
        let setHasMore = 'hasMoreList[' + tabIndex + '][' + index +']';
        let setLoaded = 'isLoadedList[' + tabIndex + '][' + index +']';
        let setOrderList = tabIndex == 0 ?  'orderList[' + index + ']' : 'pinOrderList[' + index + ']';
        let setCountList = 'countList[' + index + ']';
        let setLoadingList = 'isLoadingList[' + tabIndex + '][' + index +']';
        let nowOrderList = tabIndex == 0 ? orderList[index] : pinOrderList[index];
        limit = setLimit && setLimit > 10 ? setLimit + 1 : limit;

        // 如果type == 0则视为刷新
        if (type.toString() == '0') {
            let setStart = 'startList[' + tabIndex + '][' + index + ']';
            this.setData({
                [setStart]: 0,
                [setHasMore]: true,
                [setOrderList]: setLimit && setLimit > 0 ? nowOrderList : []
            })
        }

        let start = startList[tabIndex][index];
        let data = {
            limit,
            start,
            otoOrderPageEnum: orderTypeCode[tabIndex][index]
        };

        if (!isLoadingList[tabIndex][index]) {

            // 加载开关
            this.setData({
                [setLoadingList]: true
            })

            post(api.O2O_ORDER.getOrderList, data, res => {
                let result = res.data.data ? res.data.data : [];
                let handleList = that.handleGoods(result);
                result = handleList.goodsList;
                let { countList } = handleList;
                let newestList = start == 0 ? Object.assign([], result) : orderList[index].concat(result);
                let newestCountList = start == 0 ? Object.assign([], countList) : orderList[index].concat(countList);
                that.setData({
                    [setHasMore]: result.length >= limit ? true : false,
                    [setLoaded]: true,
                    [setOrderList]: newestList,
                    [setCountList]: newestCountList,
                    [setLoadingList]: false
                })
                that.isUseCountDown();
            }, err => {
                that.setData({
                    [setHasMore]: false,
                    [setLoaded]: true,
                    [setLoadingList]: false
                })
            })
        }
    },

    getPinOrder(type = '', setLimit) {
        let that = this;
        let { tabIndex, limit, orderList, pinOrderList, isLoadingList, typeIndexList, startList, orderTypeCode } = this.data;
        let index = typeIndexList[1];
        let setHasMore = 'hasMoreList[1][' + index +']';
        let setLoaded = 'isLoadedList[1][' + index +']';
        let setOrderList = tabIndex == 0 ?  'orderList[' + index + ']' : 'pinOrderList[' + index + ']';
        let setCountList = 'countList[' + index + ']';
        let setLoadingList = 'isLoadingList[1][' + index +']';
        let nowOrderList = tabIndex == 0 ? orderList[index] : pinOrderList[index];
        limit = setLimit && setLimit > 10 ? setLimit + 1 : limit;

        // 如果type == 0则视为刷新
        if (type.toString() == '0') {
            let setStart = 'startList[' + tabIndex + '][' + index + ']';
            this.setData({
                [setStart]: 0,
                [setHasMore]: true,
                [setOrderList]: setLimit && setLimit > 0 ? nowOrderList : []
            })
        }

        let start = startList[tabIndex][index];
        let data = {
            limit,
            start,
            status : orderTypeCode[tabIndex][index]
        };

        if (!isLoadingList[tabIndex][index]) {

            // 加载开关
            this.setData({
                [setLoadingList]: true
            })

            post(api.O2O_ORDER.getPinOrder, data, res => {
                let result = res.data.data ? res.data.data : [];
                let handleList = that.handleGoods(result);
                result = handleList.goodsList;
                let { countList } = handleList;
                let newestList = start == 0 ? Object.assign([], result) : orderList[index].concat(result);
                let newestCountList = start == 0 ? Object.assign([], countList) : orderList[index].concat(countList);
                that.setData({
                    [setHasMore]: result.length >= limit ? true : false,
                    [setLoaded]: true,
                    [setOrderList]: newestList,
                    [setCountList]: newestCountList,
                    [setLoadingList]: false
                })
                // that.isUseCountDown();
            }, err => {
                that.setData({
                    [setHasMore]: false,
                    [setLoaded]: true,
                    [setLoadingList]: false
                })
            })
        }
    },

    // 判断要不要启用倒计时
    isUseCountDown() {
        let { typeIndex, isCounting, countList } = this.data;
        let setCounting = 'isCounting[' + typeIndex + ']';
        if (typeIndex < 2) {
            if (!isCounting[typeIndex]) {
                // 先查看是否需要用倒计时的
                let needCount = countList[typeIndex].some((item, i, arr) => {
                    return item > 0
                })
                if (needCount) {
                    this.setData({
                        [setCounting]: true
                    })

                    typeIndex == 0 ? this.allCountDown() : this.noPayCountDown();
                } else {
                    return;
                }
            }
        }
    },

    // 处理商品信息
    handleGoods(list) {
        let that = this;
        let defaultImg = "https://img.sfddj.com/miniappImg/icon/icon_default_head.jpg";
        let goodsList = list && Object.keys(list).length > 0 ? list : [];
        let countList = [];    //定时器列表
        let now = new Date().getTime();
        goodsList.forEach((val, i, arr) => {
            val.goodsImagePath = val.orderItemList[0] && Object.keys(val.orderItemList[0]).length > 0 ? val.orderItemList[0].goodsImagePath ? api.baseImageUrl + val.orderItemList[0].goodsImagePath : defaultImg : defaultImg;
            // 转换订单状态中文
            val.orderStatusStr = that.handleStatus(val.orderStatus);
            // 转换订单创建时间
            val.createDateStr = dateFmt.DateFormat.format(new Date(val.createDate), 'yyyy-MM-dd hh:mm');


            val.createDate + 900000 - now > 0 ? countList.push(val.createDate + 900000 - now) : countList.push(0);



        })
        return { goodsList, countList };
    },

    // 处理订单的状态
    handleStatus(orderStatus) {
        switch (orderStatus) {
            case 'NOPAY':
                return '待支付'
                break;
            case 'CANCEL':
                return '已取消'
                break;
            case 'FINISHED':
                return '交易成功'
                break;
            default:
                return '支付成功'
        }
    },

    // 滚动到底部加载更多
    loadMoreList() {
        let { tabIndex, hasMoreList, orderList, pinOrderList, startList, typeIndexList } = this.data;
        let index = typeIndexList[tabIndex];
        let listLen = tabIndex == 0 ? orderList[index].length : pinOrderList[index].length;
        // 如果还有数据则加载更多
        if (hasMoreList[tabIndex][index].toString() == 'true') {
            let setStart = 'startList[' + tabIndex + '][' + index + ']';
            this.setData({
                [setStart]: listLen
            })
            this.getOrderList();
        } else {
            return
        }
    },


    //倒计时  -- 全部类型
    allCountDown() {
        let that = this;
        let { countList, orderList, allTimer } = this.data;
        let allOrderList = orderList[0];
        let allCountList = countList[0];
        let setOrderList = 'orderList[0]';
        let setCountList = 'countList[0]';
        allCountList.forEach((item, i, arr) => {
            if (item > 0) {
                let mins = parseInt((item / 1000) / 60);
                let seconds = parseInt((item / 1000 - mins * 60));
                let minsStr = mins < 10 ? '0' + mins : mins;
                let secondsStr = seconds < 10 ? '0' + seconds : seconds;
                allOrderList[i].leftTimeStr = minsStr + ':' + secondsStr;
            } else {
                if (allOrderList[i].orderStatus == 'NOPAY') {
                    allOrderList[i].orderStatus = 'CANCEL';
                    allOrderList[i].orderStatusStr = '已取消';
                }
            }
        })
        this.setData({
            'orderList[0]': allOrderList
        })
        clearTimeout(this.data.allTimer);
        this.data.allTimer = setTimeout(function () {
            // leftTimes = parseInt(leftTimes - 1000);
            for (let j = 0; j < allCountList.length; j++) {
                allCountList[j] = allCountList[j] > 0 ? allCountList[j] - 1000 : 0;
            }
            that.setData({
                [setCountList]: allCountList
            })
            that.allCountDown();
        }, 1000)
    },

    //倒计时  -- 待支付类型
    noPayCountDown() {
        let that = this;
        let { countList, orderList, noPayTimer } = this.data;
        let noPayOrderList = orderList[1];
        let noPayCountList = countList[1];
        // let setOrderList = 'orderList[' + 0 + ']';
        let setCountList = 'countList[1]';
        noPayCountList.forEach((item, i, arr) => {
            if (item > 0) {
                let mins = parseInt((item / 1000) / 60);
                let seconds = parseInt((item / 1000 - mins * 60));
                let minsStr = mins < 10 ? '0' + mins : mins;
                let secondsStr = seconds < 10 ? '0' + seconds : seconds;
                noPayOrderList[i].leftTimeStr = minsStr + ':' + secondsStr;
            } else {
                if (noPayOrderList[i].orderStatus == 'NOPAY') {
                    noPayOrderList[i].orderStatus = 'CANCEL';
                    noPayOrderList[i].orderStatusStr = '已取消';
                }
            }
        })
        this.setData({
            'orderList[1]': noPayOrderList
        })
        clearTimeout(this.data.noPayTimer);
        this.data.noPayTimer = setTimeout(function () {
            // leftTimes = parseInt(leftTimes - 1000);
            for (let j = 0; j < noPayCountList.length; j++) {
                noPayCountList[j] = noPayCountList[j] > 0 ? noPayCountList[j] - 1000 : 0;
            }
            that.setData({
                [setCountList]: noPayCountList
            })
            that.noPayCountDown();
        }, 1000)
    },

    // 删除订单
    deleteOrder(e) {
        let that = this;
        let { index, orderSn } = e.currentTarget.dataset;
        let { typeIndex, orderList } = this.data;
        my.confirm({
            content: '确定要删除该订单吗？',
            // confirmButtonText: '',
            // cancelButtonText,
            success: (res) => {
                if (res.confirm) {
                    that.deleteOrderRequest(orderSn, typeIndex, orderList, index);
                }
            },
        });

    },

    // 删除订单请求
    deleteOrderRequest(orderSn, typeIndex, orderList, index) {
        let that = this;
        post(api.O2O_ORDER.deleteOrder, { orderSn }, res => {
            let { code, message } = res.data.ret;
            if (code == '0') {
                my.showToast({
                    content: '删除成功'
                })
                orderList[typeIndex].splice(index, 1);
                that.setData({
                    orderList
                })
            } else {
                my.showToast({
                    content: message || '删除失败'
                })
            }
        }, err => {
            my.showToast({
                content: err || '删除失败'
            })
        })
    },

    // 去逛逛跳转
    toDDJHome() {
        my.navigateTo({
            url: '/community/pages/index/index'
        });
    },

    // tab栏点击
    handleTabClick(e) {
        let { index } = e;
        let { tabIndex } = this.data;
        if (index != tabIndex) {
            this.setData({
                tabIndex: index
            })
            // if()
        }
    },
    // 顶部tab栏切换
    tabChange(e) {
        let { index } = e;
        let { tabIndex } = this.data;
        if (index != tabIndex) {
            this.setData({
                tabIndex: index
            })
            // if()
        }
    }

});
