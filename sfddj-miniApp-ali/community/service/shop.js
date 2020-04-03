// 店铺相关

import MiniAppService from "alipay-miniapp-service";
import http from '/api/http';
import api from '/api/api';

class Shop extends MiniAppService {
    constructor() {
        super();
    }

    static get Name() {
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
        }, (err) => {
            if(callbackFun) {
                callbackFun(undefined, err);
            }
        });
    }


    get(id, callbackFun) {
        http.get(api.Shop.GETBYID + id, {}, (res) => {
            if(res.data && res.data.data) {
                res.data.data.shopLogo = api.baseImageUrl + res.data.data.shopLogo;
                if(res.data.data.businessTime) {
                    let ary = res.data.data.businessTime.split('~');
                    if(ary.length == 2) {
                        let timeStart = ary[0],
                            timeEnd = ary[1];
                        res.data.data.timeStart = timeStart;
                        res.data.data.timeEnd = timeEnd;
                    }
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
        http.get(api.Shop.GETGOODSOFSHOP + shopId, {
            categoryId: categoryId,
            start: pageIdx * pageSize,
            limit: pageSize
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
                callbackFun(err);
            }
        });
    }
}

export default Shop;


// Test

// const app = getApp();


// function MiniAppService() {
//     if(!MiniAppService.__id) {
//         MiniAppService.__id = 1;
//     }
//     let _id = '_service_' + (MiniAppService.__id++);
//     this.__defineGetter__('$id', function() {
//         return _id;
//     });
//     this.__defineSetter__('$id', function() {
//         throw '$id is readonly';
//     });
//     if(!app._$datas) {
//         app._$datas = {};
//     }
//     let _data = app._$datas[_id];
//     if(!_data) {
//         _data = app._$datas[_id] = {};
//     }
//     this.__defineGetter__('$data', function() {
//         return _data;
//     });
//     this.__defineSetter__('$data', function() {
//         throw '$data is readonly';
//     });

//     let _cmps = [];
//     this.__defineGetter__('$cmps', function() {
//         return _cmps;
//     });
//     this.__defineSetter__('$cmps', function() {
//         throw '$cmps is readonly';
//     });
// }


// MiniAppService.init = function(cmp) {
//     if(!cmp) {
//         throw 'cmp is undefined';
//     }
//     if(!cmp.setData) {
//         throw 'cmp is not a Page or Component';
//     }
//     if(!this.Name) {
//         throw 'service class missed "Name" property';
//     }
//     if(!app.__$instances) {
//         app.__$instances = {};
//     }
//     this.$instance = app.__$instances[this.Name];
//     if(!this.$instance) {
//         this.$instance = app.__$instances[this.Name] = new this();
//     }
//     if(this.$instance.$cmps.indexOf(cmp) < 0) {
//         if(cmp.$page) {
//             if(!cmp.$page.__$cmps) {
//                 cmp.$page.__$cmps = [];
//             }
//             cmp.$page.__$cmps.push(cmp);
//         } else {
//             let _onunload = cmp.onUnload;
//             cmp.onUnload = () => {
//                 if(cmp.__$cmps) {
//                     cmp.__$cmps.forEach((T) => {
//                         let idx = this.$instance.$cmps.indexOf(T);
//                         if(idx >= 0) {
//                             this.$instance.$cmps.splice(idx, 1);
//                         }
//                     });
//                 }
//                 let idx = this.$instance.$cmps.indexOf(cmp);
//                 if(idx >= 0) {
//                     this.$instance.$cmps.splice(idx, 1);
//                 }
//                 if(_onunload) {
//                     _onunload.apply(cmp, []);
//                 }
//             };
//         }
//         this.$instance.$cmps.push(cmp);
//         cmp.setData({[this.Name]: this.$instance.$data});
//         cmp[this.$instance.$id] = this.Name;
//     }

//     return this.$instance;
// };


// MiniAppService.prototype.$apply = function(filter) {
//     if(!filter || filter instanceof Function) {
//         if(this.$cmps) {
//             this.$cmps.forEach((T) => {
//                 if(!filter || filter(T)) {
//                     T.setData({[T[this.$id]]: T.data[T[this.$id]]});
//                 }
//             });
//         }
//     }
// };


// MiniAppService.prototype.$set = function(key, val, filter) {
//     this.$data[key] = val;
//     this.$apply(filter);
//     // if(!filter || filter instanceof Function) {
//     //     if(this.$cmps) {
//     //         this.$cmps.forEach((T) => {
//     //             if(!filter || filter(T)) {
//     //                 //T.setData({[key]: val});
//     //             }
//     //         });
//     //     }
//     // }
// };

// MiniAppService.prototype.$get = function(key) {
//     return this.$data[key];
// };

// export default MiniAppService;