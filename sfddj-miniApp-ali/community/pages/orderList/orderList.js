// import api from '/api/api';
import { post, api } from '/api/http';
const dateFmt = require('/utils/dateformat');

Page({
    data: {
        staticsImageUrl: api.staticsImageUrl,
        orderTypeList: ['全部', '待付款', '付款成功', '交易成功', '退款/售后'],
        orderTypeCode: ['ALL', 'NOPAY', 'PAYFINISH', 'COMMENT', 'AFTERSALE'],       // 获取数据列表的类型

        typeIndex: 0,
        orderList: [[], [], [], [], []],       //保存订单数据
        hasMoreList: [true, true, true, true, true],                      //是否还有下一页
        isLoadedList: [false, false, false, false, false],            //是否加载过了
        startList: [0, 0, 0, 0, 0],     //请求开始的索引
        limit: 10,
        allTimer: null,        //全部订单的定时器
        noPayTimer: null,      //未支付订单的定时器
        countList: [[], [], [], [], []],      //定时器列表
        // allCounting: false,        //全部状态订单是否在使用倒计时
        // noPayCounting: false,      // 未支付状态订单是否在使用倒计时
        isCounting: [false, false, false, false, false],    //对应的订单状态是否在使用倒计时
    },
    onLoad(options) {
		let index = options.index ? options.index : 0;
		this.setData({
			typeIndex: index
		})
        this.getOrderList(0);
    },

    onUnload() {
        // 清除定时器
        clearTimeout(this.data.allTimer);
        clearTimeout(this.data.noPayTimer);
    },

    //   切换订单状态
    switchType(e) {
        let { index } = e.target.dataset;
        if (index != this.data.typeIndex) {
            this.setData({
                typeIndex: index
            })
            if (this.data.isLoadedList[index].toString() == 'false') {
                this.getOrderList(0)
            }
        }
    },

    // 获取订单列表
    getOrderList(type = '') {
        let that = this;
        let { typeIndex, limit, orderList } = this.data;
        let setHasMore = 'hasMoreList[' + typeIndex + ']';
        let setLoaded = 'isLoadedList[' + typeIndex + ']';
        let setOrderList = 'orderList[' + typeIndex + ']';
        let setCountList = 'countList[' + typeIndex + ']';

        // 如果type == 0则视为刷新
        if (type.toString() == '0') {
            let setStart = 'startList[' + typeIndex + ']';
            this.setData({
                [setStart]: 0,
                [setHasMore]: true,
                [setOrderList]: []
            })
        }

        let start = this.data.startList[typeIndex];
        let data = {
            limit,
            start,
            otoOrderPageEnum: this.data.orderTypeCode[typeIndex]
        };


        post(api.O2O_ORDER.getOrderList, data, res => {
            let result = res.data.data ? res.data.data : [];
            let handleList = that.handleGoods(result);
            result = handleList.goodsList;
            let { countList } = handleList;
            let newestList = start == 0 ? Object.assign([], result) : orderList[typeIndex].concat(result);
            let newestCountList = start == 0 ? Object.assign([], countList) : orderList[typeIndex].concat(countList);
            that.setData({
                [setHasMore]: result.length >= limit ? true : false,
                [setLoaded]: true,
                [setOrderList]: newestList,
                [setCountList]: newestCountList
            })
            that.isUseCountDown();
        }, err => {
            that.setData({
                [setHasMore]: false,
                [setLoaded]: true
            })
        })

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
        let { typeIndex, hasMoreList, orderList, startList } = this.data;
        // 如果还有数据则加载更多
        if (hasMoreList[typeIndex].toString() == 'true') {
            let setStart = 'startList[' + typeIndex + ']';
            this.setData({
                [setStart]: orderList[typeIndex].length
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
        let {index, orderSn} = e.currentTarget.dataset;
        let { typeIndex, orderList } = this.data;
        my.confirm({
            content: '确定要删除该订单吗？',
            // confirmButtonText: '',
            // cancelButtonText,
          success: (res) => {
            if(res.confirm) {
              that.deleteOrderRequest(orderSn, typeIndex, orderList, index);
            }
          },
        });
        
    },

    // 删除订单请求
    deleteOrderRequest(orderSn, typeIndex, orderList, index){
      let that = this;
      post(api.O2O_ORDER.deleteOrder, { orderSn }, res => {
            let { code, message } = res.data.ret;
            if (code == '0') {
                my.showToast({
                    content: '删除成功'
                })
                orderList[typeIndex].splice(index,1);
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
    toDDJHome(){
      my.navigateTo({
        url: '/community/pages/index/index'
      });
    },

});
