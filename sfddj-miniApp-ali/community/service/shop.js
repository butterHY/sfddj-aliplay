// 店铺相关

import http from '/api/http';
import api from '/api/api';
import {getDistance} from '/community/assets/common';

const app = getApp();

class Shop extends app.Service {
    constructor() {
        super();
    }

    static get Name() {
        return 'Shop';
    }

    static sortShopData(shop) {
        shop.shopLogo = api.baseImageUrl + shop.shopLogo;
        if(shop.shopGoodsList) {
            shop.shopGoodsList.forEach((M) => {
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
        if(shop.businessTime) {
            let ary = shop.businessTime.split('-');
            if(ary.length == 2) {
                let timeStart = ary[0],
                    timeEnd = ary[1];
                shop.timeStart = timeStart;
                shop.timeEnd = timeEnd;
            }
        }
        if(shop.latitude && shop.longitude) {
            let loc = app.globalData.userLocInfo;
            if(loc && loc.longitude) {
                shop.distance = getDistance(loc.latitude, loc.longitude, shop.latitude, shop.longitude);
            }
        }
    };

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
                    Shop.sortShopData(T);
                });
            }
            if(callbackFun) {
                callbackFun(res);
            }
        }, (err) => {
            if(callbackFun) {
                callbackFun(undefined, err);
            }
        });
    }


    get(id, callbackFun) {
        http.get(api.Shop.GETBYID + id, {}, (res) => {
            if(res.data && res.data.data) {
                Shop.sortShopData(res.data.data);
            }
            if(callbackFun) {
                callbackFun(res);
            }
        }, (err) => {
            if(callbackFun) {
                callbackFun(undefined, err);
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
    getGoodsOfShop(shopId, categoryId, pageIdx, callbackFun) {
        let pageSize = 20;
        let ps = {
            start: pageIdx * pageSize,
            limit: pageSize
        };
        // 取团购商品所传的参数不同
        if(categoryId == -1) {
            ps.isTuangou = 1;
        } else {
            ps.categoryId = categoryId;
        }
        http.get(api.Shop.GETGOODSOFSHOP + shopId, ps, (res) => {
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


    // 用关键字搜索店铺内的商品
    searchGoodsOfShop(shopId, keyword, callbackFun) {
        http.get(api.Shop.GETGOODSOFSHOP + shopId, {
            keyword: keyword,
            start: 0,
            limit: 50
        }, (res) => {
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


    // 关注或取消关注指定的店铺
    like(shopId, isLike, callbackFun) {
        http.post(api.Shop.LIKE, {
            shopId: shopId,
            attention: isLike
        }, (res) => {
            if(callbackFun) {
                callbackFun(res);
            }
        }, (err) => {
            if(callbackFun) {
                callbackFun(undefined, err);
            }
        });
    }


    // 获取团购活动详情
    // 用户还未参与团购时用这个方法取得团购信息
    getTuanGouDetail(activityId, callbackFun) {
        http.post(api.Shop.TUANGOUDETAIL, {
            activityId: activityId
        }, (res) => {
            if(res && res.data && res.data.data) {
                if(res.data.data.goodsDefaultImage) {
                    res.data.data.goodsDefaultImage = JSON.parse(res.data.data.goodsDefaultImage);
                    res.data.data.goodsDefaultImage = res.data.data.goodsDefaultImage.map((T) => {
                        return api.baseImageUrl + T;
                    });
                }
                if(res.data.data.tuangouMemberList) {
                    res.data.data.tuangouMemberList.forEach((T) => {
                        T.memberImagePath = api.baseImageUrl + T.memberImagePath;
                    });
                }
            }
            if(callbackFun) {
                callbackFun(res);
            }
        }, (err) => {
            if(callbackFun) {
                callbackFun(undefined, err);
            }
        });
    }
}

export default Shop;