// 店铺相关

import MiniAppService from "alipay-miniapp-service";
import http from '/api/http';
import api from '/api/api';

class Shop extends MiniAppService {
    constructor() {
        super();
    }

    static get name() {
        return 'Shop';
    }

    // 取得指定经纬度附近的所有店铺
    gets(x, y, callbackFun) {
        http.get(api.Shop.search, {
            longitude: x,
            latitude: y
        }, (res) => {
            console.log('WWW', res);
        });
    }
}

export default Shop;