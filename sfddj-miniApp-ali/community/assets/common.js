import { post, api } from '/api/http';

function getRad(d) {
    var PI = Math.PI;
    return d * PI / 180.0;
}

// 调起支付
function tradePay({ orderSn, tradeNo, callBack, failFun, errorFun }) {
    my.tradePay({
        tradeNO: tradeNo,
        success: function (res) {
            let nowDate = new Date().getTime();
            // 如果支付code为9000则是成功
            if (res.resultCode == '9000') {

                // 检测是否到账
                controllPayment({ orderSn, nowDate, callBack, failFun })


            }
            else if (res.resultCode == '6001') {
                failFun && typeof failFun === 'function' && failFun();
            }
            else if (res.resultCode == '6002') {
                failFun && typeof failFun === 'function' && failFun();
            }
            else {
                failFun && typeof failFun === 'function' && failFun();
            }


        },
        fail: function (res) {
            errorFun && typeof errorFun === 'function' && errorFun();
        }
    });
}

/**
 * 监控用户付款行为 success(成功)/cancel（取消）/sysBreak（异常）
 */
function controllPayment({ orderSn, payTime, callBack, failFun }) {
    // 查看是否支付成功
    post(api.O2O_ORDERCONFIRM.queryPayType, { orderSn }, (res) => {
        let result = res.data.data ? res.data.data : {};
        if (result.payFinish) {
            callBack && typeof callBack === 'function' && callBack();
        }
        else {
            let nowDate = new Date().getTime();
            // 做一个人10秒的回调查询支付成功，否则视为失败
            if (nowDate - payTime < 10000) {
                controllPayment(orderSn, payTime, callBack)
            } else {
                failFun && typeof failFun === 'function' && failFun();
            }
        }
    }, (err) => {
        failFun && typeof failFun === 'function' && failFun();
    })
}

function getTradeNo({ orderSn, tradeNo, callBack, failFun, errorFun }) {
    post(api.O2O_ORDERCONFIRM.payNow, { orderSn }, res => {
        let result = res.data.data ? res.data.data : {};
        if (result && Object.keys(result).length > 0) {
            let { tradeNo } = result;
            tradePay({ orderSn, tradeNo, callBack, failFun, errorFun })
        }
    }, err => {
        failFun && typeof failFun === 'function' && failFun();
    })
}

export default {
    // 计算两个经纬度之间的距离
    // 参考：https://opensupport.alipay.com/support/knowledge/46919/201602450720?ant_source=zsearch
    // lat1 第一点的纬度
    // lng1 第一点的经度
    // lat2 第二点的纬度
    // lng2 第二点的经度
    getDistance(lat1, lng1, lat2, lng2) {
        var f = getRad((lat1 + lat2) / 2);
        var g = getRad((lat1 - lat2) / 2);
        var l = getRad((lng1 - lng2) / 2);
        var sg = Math.sin(g);
        var sl = Math.sin(l);
        var sf = Math.sin(f);
        var s, c, w, r, d, h1, h2;
        var a = 6378137.0;//The Radius of eath in meter.
        var fl = 1 / 298.257;
        sg = sg * sg;
        sl = sl * sl;
        sf = sf * sf;
        s = sg * (1 - sl) + (1 - sf) * sl;
        c = (1 - sg) * (1 - sl) + sf * sl;
        w = Math.atan(Math.sqrt(s / c));
        r = Math.sqrt(s * c) / w;
        d = 2 * w * a;
        h1 = (3 * r - 1) / 2 / c;
        h2 = (3 * r + 1) / 2 / s;
        s = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
        s = s / 1000;
        s = Math.round(s);
        return s;
    },

    // 支付订单 -- orderSn: orderSn订单编码, tradeNo --调起支付要用的, clearShopCart -- 清除本地购物车，下单时要用的, callBack -- 成功回调, failFun -- 支付失败的回调, errorFun -- 调起支付失败的回调
    payOrderNow({ orderSn, tradeNo, clearShopCart, callBack, failFun, errorFun }) {

        // 清除本地购物车
        clearShopCart && typeof clearShopCart === 'function' && clearShopCart();

        // let orderStr = res.data.data.orderStr;
        tradeNo ? tradePay({ orderSn, tradeNo, callBack, failFun, errorFun }) : getTradeNo({ orderSn, tradeNo, callBack, failFun, errorFun });

    },



};