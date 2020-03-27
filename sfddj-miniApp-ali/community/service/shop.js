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
    gets(x, y, pageIdx, callbackFun) {
        let pageSize = 10;
        http.get(api.Shop.search, {
            longitude: x,
            latitude: y,
            start: pageIdx * pageSize,
            limit: pageSize
        }, (res) => {
            if(res.data && res.data.data) {
                res.data.data.forEach((T) => {
                    T.shopLogo = api.baseImageUrl + T.shopLogo;
                    if(T.shopGoodsList) {
                        T.shopGoodsList.forEach((M) => {
                            if(M.goodsImagePath) {
                                M.goodsImagePath = JSON.parse(M.goodsImagePath);
                                for(let i = 0; i < M.goodsImagePath.length; i++) {
                                    M.goodsImagePath[i] = api.baseImageUrl + M.goodsImagePath[i];
                                }
                            } else {
                                M.goodsImagePath = [];
                            }
                        });
                    }
                });
            }
            if(callbackFun) {
                callbackFun(res);
            }
        });
    }
}

export default Shop;