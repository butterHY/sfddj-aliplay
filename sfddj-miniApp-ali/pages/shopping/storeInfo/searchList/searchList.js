let sendRequest = require('../../../../utils/sendRequest');
let constants = require('../../../../utils/constants');

import http from '../../../../api/http'
import api from '../../../../api/api'

// pages/subPackages/shopping/storeInfo/searchList/searchList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: constants.UrlConstants.baseImageUrl, //图片资源地址前缀
    smallImgArg: '?x-oss-process=style/goods_img_2',
    loadComplete: false,   //是否加载完成
    loadFail: false,       //是否加载失败

    pageType: '',                                       // 是搜索列表页面还是二级分类页面
    searchUrl: api.SUPPLIER.GOODS_SEARCH,               // 搜索列表页的请求接口路径
    categoryUrl: api.SUPPLIER.SUPPPLIER_CATE_GOODS,     // 二级分类页的请求接口路径

    supplierId: '',                                     // 商家id
    categoryId: '',                                     // 商品分类id
    keyWord: '',                                        // 搜索关键词
    limit: 20,
    start: 0,
    goodsContinue: true,
    goodsList: [],                                      // 商品数据
    isGoTop: false,                                     // 是否显示返回顶部按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let storeId = options.supplierId;
    let cateId = options.categoryId;
    let keyId = options.keyWord;
    that.setData({
      supplierId: storeId,
      categoryId: cateId,
      keyWord: keyId
    });
    if (storeId && cateId){
      // 二级分类商品列表页面
      my.setNavigationBar({
        title: '商品列表'
      });
      that.setData({
        pageType: 'categoryPage'
      })
      this.getCategoryData('get', that.data.categoryUrl)
    }
    else if (storeId && keyId){
      // 搜索列表页面
      my.setNavigationBar({
        title: '搜索列表'
      })
      that.setData({
        pageType: 'searchPage'
      })
      this.getCategoryData('post', that.data.searchUrl)
    }
  },

  // 获取商品列表
  getCategoryData: function (postType,url) {
    let that = this;
    let data = {};
    let fun = '';
    if (postType == 'post'){
      // 搜索列表
      data = {
        supplierId: that.data.supplierId,
        keyword: that.data.keyWord,
        showChannel: 0,
        sortDir: 'desc',
        sortBy: 'order_list',
        start: that.data.start,
        limit: that.data.limit
      };
      fun = http.post;
    }
    else if (postType == 'get'){
      // 二级分类页
      data = {
        supplierId: that.data.supplierId,
        categoryId: that.data.categoryId,
        start: that.data.start,
        limit: that.data.limit,
      };
      fun = http.get;
    }
    let listData = that.data.goodsList;
    fun(url, data, res => {
      let result = [];
      if (that.data.pageType == 'categoryPage'){
        result = res.data.data ? res.data.data : [];
      }
      else if (that.data.pageType == 'searchPage'){
        result = res.data.data.goodsList ? res.data.data.goodsList : [];
      }
      let scrollEnd = true;
      if (result && result.length > 0) {
        if (result.length < that.data.limit) {
          scrollEnd = false;
        }
        that.setData({
          goodsList: listData.concat(result),
          goodsContinue: scrollEnd,
          loadComplete: true,
          loadFail: false,
        })
      }
      else {
        that.setData({
          goodsList: listData,
          goodsContinue: false,
          loadComplete: true,
        });
        if (that.data.goodsList.length<=0){
          that.setData({
            loadFail: true,
          });
        }
      }
    }, err => {
      that.setData({
        goodsList: listData,
        goodsContinue: false,
        loadComplete: true,
      })
      if (that.data.goodsList.length <= 0) {
        that.setData({
          loadFail: true,
        });
      }
      // utils.wxShowToast(err, that, 2000)
    })
  },

  /**
   * 添加到购物车
   */
  addCart: function (e) {
    var that = this
    var productId = e.currentTarget.dataset.pid
    sendRequest.send(constants.InterfaceUrl.SHOP_ADD_CART, {
      pId: productId,
      quantity: '1'
    }, function (res) {
      my.showToast({
        content: '添加购物车成功',
      })
    }, function (res) {
      that.setData({
        showToast: true,
        showToastMes: res
      })
      setTimeout(function () {
        that.setData({
          showToast: false
        })
      }, 2000)
    })
  },

  /**
   * 滚动加载更多  pageType: 'categoryPage'
  */
  onReachBottom() {
    let that = this;
    if (that.data.goodsContinue) {
      that.setData({
        start: this.data.goodsList.length,
      });
      if (that.data.pageType == 'categoryPage'){  // 二级分类页
        this.getCategoryData('get', that.data.categoryUrl)
      }
      else if (that.data.pageType == 'searchPage') {   // 搜索列表页
        this.getCategoryData('post', that.data.searchUrl)
      }
      
    }
  },

  // 页面滚动处理
  onPageScroll(e) {
    let scrollTop = e.scrollTop
    let that = this
    // 是否显示返回顶部
    if (scrollTop > 300) {
      that.setData({
        isGoTop: true
      })
    }
    else {
      that.setData({
        isGoTop: false
      })
    }
  },

  /**
   * 返回首页
  */
  goHome() {
    my.switchTab({
      url: '/pages/home/home',
    })
  },

  /**
   * 返回顶部
  */
  goTop() {
    let that = this;
    my.pageScrollTo({ scrollTop: 0 })
  }

})