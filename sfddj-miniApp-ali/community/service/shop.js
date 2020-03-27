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
        http.get(api.Shop.SEARCH, {
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


    get(id, callbackFun) {
        http.get(api.Shop.GETBYID + id, {}, (res) => {
            if(res.data && res.data.data) {
                res.data.data.shopLogo = api.baseImageUrl + res.data.data.shopLogo;
            }
            if(callbackFun) {
                callbackFun(res);
            }
        });
    }


    // 取指定店铺的所有商品类别
    getCategories(shopId, callbackFun) {
        http.get(api.Shop.GETCATEGORIES + shopId, {}, (res) => {
            if(callbackFun) {
                callbackFun(res);
            }
        });
    }


    // 取指定店铺的商品列表
    getGoodsOfShop(shopId, pageIdx, callbackFun) {
        http.get(api.Shop.GETGOODSOFSHOP + shopId, {}, (res) => {
            if(res.data && res.data.data) {
                res.data.data.forEach((T) => {
                    if(T.goodsImagePath) {
                        T.goodsImagePath = JSON.parse(T.goodsImagePath);
                        for(let i = 0; i < T.goodsImagePath.length; i++) {
                            T.goodsImagePath[i] = api.baseImageUrl + T.goodsImagePath[i];
                        }
                    } else {
                        T.goodsImagePath = [];
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