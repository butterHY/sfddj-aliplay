let sendRequest = require('../../../utils/sendRequest');
let constants = require('../../../utils/constants');
let utils = require('../../../utils/util');
let app = getApp();

import http from '../../../api/http';
import api from '../../../api/api';
Page({
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: constants.UrlConstants.baseImageUrl, //图片资源地址前缀
    smallImgArg: '?x-oss-process=style/goods_img_2',
    supplierId: null,
    tabIndex: 0,                                      // 当前选中的tab索引
    sortIndex: 0,                                     // 全部商品排序索引
    sortDataIdx: 0,                                   // 全部商品获取数据时的定义索引
    sortPriceUp: false,                               // 价格排序是否是从低到高
    supplierDetail: {},                               // 保存商家数据的对象
    placeholder: '搜索店铺内商品',                     // 新版搜索的数据
    isShowSearch: false,                              // 新版搜索组件显示开关
    isFocus: false,                                   // 新版搜索组件焦点开关
    searchComponent: null,                            // 新版搜索组件实例

    categroyList: [],                                 // 商家商品分类数据
    cateLeftIndex: 0,                                 // 商家左边分类的索引

    supplierCouponList: [],                           // 优惠券列表

    sortNavOnTop: false,                              // 排序导航是否置顶 
    attentionStatus: false,                           // 是否关注店家
    bannerList: [],                                   // 首页轮播图列表
    bannerHeight: 310,                                // 首页轮播图的高度
    homeHieght: 0,                                    // 店铺首页的高度
    introList: [],                                    // 商家推荐列表
    introStart: 0,                                    // 商家推荐开始数
    introLimit: 20,                                   // 商家推荐一次加载个数
    introContinue: true,                              // 商家推荐数据是否加载完

    allGoodsData: [],
    allGoodsList: [],                                 // 全部商品列表
    allGoodEnd: true,                                 // 是否加载完

    webCallLink: '',                                  // 联系客服的链接

    storeAdsLoad: false,                              // 首页是否完成了轮播广告位的加载
    storeCouponLoad: false,                           // 首页是否完成了优惠券的加载
    storeCommendLoad: false,                          // 首页是否完成了商家推荐接口的加载
    storeGoodsLoad: false,                            // 全部商品页是否完成了某一个接口的加载
    storeCateGoryLoad: false,                         // 商品分类页是否完成了某一个接口的加载
    isGoTop: false,                                   // 返回顶部按钮是否显示
  },
  onLoad: function (options) {
    // 获取分类商品所要处理的数据
    this.allGoodInterData();

    if (options.supplierId) {
      this.setData({
        supplierId: options.supplierId
      })

      // 获取联系客服所需要的数据
      this.getContact();
      // 获取商家详情
      this.getSupplierDetail(options.supplierId)
      // 判断是否关注店铺
      this.getAttentionStatus();
    }
  },

  onShow() {
    // 关闭键盘，有些苹果手机会出现输入搜索去到搜索页返回初始页面时，初始页的键盘没有关闭的问题；
		my.hideKeyboard();
    // 回到页面关闭搜索组件
		this.setData({
			// placeholder: my.getStorageSync({key: 'searchTextMax'}).data,
			isFocus: false,
			isShowSearch: false,
		});
    // 获取搜索框中的占位词
    this.getSearchTextMax();
    if (this.searchComponent) {
      this.searchComponent.setData({inputVal: ''});
    }

    // 每次进到商家店铺页面 就显示首页
    if(this.data.tabIndex == 3){
      this.setData({
        tabIndex: 0,
      })
    }
    
  },

  /**
	  * 存储新版搜索组件实例（但只在页面初始化是挂载，页面重显取不到）
	*/
	saveRef(ref) {
		this.searchComponent = ref;
  },

  /**
	  * 新版搜索组件开关
	*/
	showSearch: function(noGetHistory) {
		// this.searchComponent.getHistory()
		noGetHistory == 'noGetHistory' ? '' : 	this.searchComponent.getHistory();
		this.setData({
			isShowSearch: !this.data.isShowSearch,
			isFocus: !this.data.isFocus,
		})
	},

  /**
   * 获取商家详情
   * @param supplierId 商家Id
   */
  getSupplierDetail() {
    let that = this
    let data = {
      supplierId: this.data.supplierId
    }
    http.post(api.SUPPLIER.GET_SUPPLIER_DETAIL, data, res => {
      let result = res.data.data ? res.data.data : {}
      if (Object.keys(result).length > 0) {
        result.businesImagesStr = result.businesImages ? result.businesImages.join(',') : ''
        result.companyImagesStr = result.companyImages ? result.companyImages.join(',') : ''
      }
      that.setData({
        supplierDetail: result,
        supplierDetailJSON: JSON.stringify(result)
      })
      if(result.supplierSubjectPage){
        // 加载专题页
        that.getSpecialSubjectDat();
      }else{
        // 获取轮播图
        that.getBanner();
        // 获取优惠券列表
        that.getCouponList();
        // 获取商家推荐数据
        that.getIntroData();
      }
    }, err => {

    })

  },

  
  // 获取商家专题页面
  getSpecialSubjectDat(){
    let that = this
    let data = {
      supplierId: this.data.supplierId
    }
    http.get(api.SUPPLIER.SPECIAL_SUBJECT, data, res => {
        let result = res.data.data ? res.data.data : {}
        let hasCountDown = false

      // 模块数据--转换数据
      if (result.pageModuleList) {
        if (Object.keys(result.pageModuleList).length > 0) {
          for (let i = 0; i < result.pageModuleList.length; i++) {
            let item = result.pageModuleList[i];
            if(item.groupGoodsVoList){
              item.goodsMinVOList = item.groupGoodsVoList;
            }
            item.parseItem = JSON.parse(item.items);
            // 添加专题页面的标识
            if(item.parseItem && item.parseItem.length>0){
              for(let j=0;j< item.parseItem.length;j++){
                let el = item.parseItem[j];
                el.pageType='specialPage'
              }
            }
            // 如果是商品滚动模块且有倒计时
            if (item.moduleType == 'GOODSSCROLL') {
              hasCountDown = item.parseItem[0].timerType == 'DAY_TIMER' || hasCountDown ? true : false
            }
          }
        }
      }

      that.setData({
        thematicAds: result,
        hasCountDown,

        banRightMargin: utils.rpx2Px(30),
      })
      if (hasCountDown) {
        that.CutDataTime()
      }
    }, err => {})
  },
  // 当天倒计时
  cutTimeToday: function () {
    var date = new Date();
    date.setMilliseconds(0);

    var nowDate = date.getTime();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setDate(date.getDate() + 1);
    var nextDay = date.getTime();
    var diffTime = (nextDay - nowDate) / 1000;
    return diffTime
  },

  // 倒计时
  CutDataTime: function () {
    let that = this;
    let ss = that.cutTimeToday() % 60;
    let mm = ((that.cutTimeToday() - ss) / 60) % 60;
    let hh = (that.cutTimeToday() - that.cutTimeToday() % 3600) / 3600;
    ss = ss < 10 ? ('0' + ss) : ss;
    mm = mm < 10 ? ('0' + mm) : mm;
    hh = hh < 10 ? ('0' + hh) : hh;

    this.setData({
      countSecond: ss,
      countMinute: mm,
      countHour: hh
    })

    clearTimeout(that.time_CutTime);
    that.time_CutTime = setTimeout(function () {
      that.CutDataTime()
    }, 1000);
  },


  /**
  * 搜索组件获取 placeholder value
  */
  getSearchTextMax() {
    let that = this;
    let data = {
      supplierId: that.data.supplierId
    }
    // 接口报错，暂时缓存固定的测试数据 --------
    http.get(api.SUPPLIER.SEARCH_TEXT_MAX, data, (res) => {
      let resData = res.data;
      if (resData.ret.code == '0' && resData.data && resData.data.name) {
        this.setData({
          placeholder: resData.data.name,
          isFocus: false,
          isShowSearch: false,
        });
      }
    }, (err) => {
    })
  },

  /**
   * 获取商家轮播图
   * @param supplierId 商家Id --- 新的
   */
  getBanner: function () {
    let that = this;
    let data = {
      supplierId: this.data.supplierId
    }
    http.get(api.SUPPLIER.GET_SUPPLIER_MATERIAL, data, res => {
      let result = res.data.data ? res.data.data : {}
      if (result && result.length > 0) {
        that.setData({
          bannerList: result
        })
      }
      that.setData({
        storeAdsLoad: true
      })
    }, err => {
      that.setData({
        storeAdsLoad: true
      })
    })
  },

  /**
   * 轮播图跳转
  */
  goToPage(e) {
    let that = this;
    let url = e.currentTarget.dataset.url;
    let chInfo = constants.UrlConstants.chInfo;
    let pageType = e.currentTarget.dataset.page;
    let linkType = e.currentTarget.dataset.linkType;

    if(!url)return // 如果连接不存在就不执行下边代码
    if(pageType && pageType=='specialPage'){  // 专题页面
      if(linkType == 'GOODS_LINK'){  // 跳转商详页 如url:YW8E860E24B893
        my.navigateTo({
          url: '/pages/shopping/goodsDetail/goodsDetail?goodsSn='+url, 
        })
      }
      else if(linkType == 'H5_LINK'){  // 跳转自定义链接 如url:https://itsm.sfddj.com/h/index/
      
        my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
      }
      else if(linkType == 'CUSTOM_LINK'){ // 跳转自定义页面 如 url:180
        let customUrl = api.baseUrl + '/hml/supplier_subject_page/' + url+'.html'

        my.call('startApp', { appId: '20000067', param: { url: customUrl, chInfo: chInfo } })
      }
      else{
        url = url.replace('pages/', 'pages/subPackages/')
          my.navigateTo({
            url: url, //路径必须跟app.json一致
          })
      }
    }
    else if (url.substring(0,4).indexOf('http') > -1) {
      my.call('startApp', { appId: '20000067', param: { url: url, chInfo: chInfo } })
    }
    else {
      my.navigateTo({
        url: url
      });
    }

  },

  // 获取专题页优惠券
  getSpecialCoupon(e){
    let that = this;
    let couponSign = e.currentTarget.dataset.couponSign;
    let data = {
      ruleSign: couponSign
    }
    http.post(api.SUPPLIER.DRAW_COUPON, data, res => {
      let result = res.data.data ? res.data.data : []
      if (result.length > 0) {
        // 弹窗
        my.showToast({content: '领取成功'});
      }
    }, err => {
      my.showToast({content: err});
    })
  },

  /**
   *获取优惠券列表
  */
  getCouponList: function () {
    let that = this;
    let data = {
      supplierId: this.data.supplierId,
      start: 0,
      limit: 20,
    }
    http.post(api.SUPPLIER.GET_SUPPLIER_COUPON, data, res => {
      let result = res.data.data ? res.data.data : {}
      if (result && result.length > 0) {
        that.setData({
          supplierCouponList: result
        })
      }
      that.setData({
        storeCouponLoad: true
      })
    }, err => {
      that.setData({
        storeCouponLoad: true
      })
    })
  },

  /**
   * 领取优惠券
  */
  drawCoupon: function (e) {
    let that = this;
    let sign = e.currentTarget.dataset.sign;
    let data = {
      ruleSign: sign
    };
    http.post(api.SUPPLIER.SUPPLIER_DRAW_COUPON, data, res => {
      let result = res.data.ret;
      if (result.code == '0') {
        my.showToast({content: '领取成功'});
      }
    }, err => {
      my.showToast({content: err});
    })
  },

  /**
   * 获取商家推荐商品
  */
  getIntroData: function () {
    let that = this;
    let data = {
      supplierId: that.data.supplierId,
      start: that.data.introStart,
      limit: that.data.introLimit,
    };
    let goodsList = that.data.introList;
    // introContinue
    http.get(api.SUPPLIER.SUPPLIER_RECOMMEND, data, res => {
      let result = res.data.data ? res.data.data : [];
      let scrollEnd = true;
      if (result && result.length > 0) {
        if (result.length < that.data.introLimit) {
          scrollEnd = false;
        }
        that.setData({
          introList: goodsList.concat(result),
          introContinue: scrollEnd,
          storeCommendLoad: true
        })
      }
      else {
        that.setData({
          introList: goodsList,
          introContinue: false,
          storeCommendLoad: true
        })
      }
    }, err => {
      that.setData({
        introList: goodsList,
        introContinue: false,
        storeCommendLoad: true
      })
    })
  },

  // 获取商家的分类
  getSupplierCateList() {
    let that = this;
    let data = {
      supplierId: this.data.supplierId
    }

    http.get(api.SUPPLIER.SUPPLIER_GOODS_CATE, data, res => {
      let result = res.data.data ? res.data.data : []
      that.setData({
        categroyList: result,
        storeCateGoryLoad: true
      })
    }, err => {

      that.setData({
        storeCateGoryLoad: true
      })
     })
  },

  // 判断是否关注店铺
  getAttentionStatus() {
    let that = this
    let data = {
      supplierId: this.data.supplierId
    }
    http.get(api.SUPPLIER.ATTENTION_STATUS, data, res => {
      let status = res.data.data == 'true' || res.data.data == true ? true : false
      that.setData({
        attentionStatus: status
      })
    }, err => {

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
				content: '添加购物车成功'
			});
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

  // 页面滚动处理
  onPageScroll(e) {
    let scrollTop = e.scrollTop
    let that = this
    let tabIndex = that.data.tabIndex
    let sortTopHeight = app.globalData.systemInfo.windowWidth * 232 / 750
    // 返回顶部按钮显示的条件
    if(scrollTop> 300){
      that.setData({
        isGoTop:true
      })
    }else{
      that.setData({
        isGoTop:false
      })
    }
    if (tabIndex == 0) {
      // 记录店铺首页页面滚动高度
      that.setData({
        homeHieght: scrollTop
      })
    }
    else if (tabIndex == 1) {
      // 记录每个排序页面的页面高度
      let idx = that.data.sortDataIdx;
      let itemHeight = "allGoodsData[" + idx + "].scrollHeight";
      let isUp = false;

      // 如果是全部商品时，滚动排序导航要置顶
      if (scrollTop > sortTopHeight) {
        isUp = true;
      }
      else {
        isUp = false;
      }

      that.setData({
        sortNavOnTop: isUp,
        [itemHeight]: scrollTop
      })
    }
  },

  // 点击关注店铺
  followStore() {
    let that = this
    // attentionStatus : false--取关， true -- 关注
    let data = {
      supplierId: this.data.supplierId,
      attention: !that.data.attentionStatus
    }
    http.get(api.SUPPLIER.ATTENT_STORE, data, res => {
      let toastMes = !that.data.attentionStatus ? '关注成功' : '取消关注成功'
      that.setData({
        attentionStatus: !that.data.attentionStatus
      })
      my.showToast({content: toastMes});
    }, err => {
      my.showToast({content: err});
    })
  },

  // 切换底部tab栏
  switchTab(e) {
    let {
      index
    } = e.currentTarget.dataset
    //如果点击同一个则不做处理
    if (index != this.data.tabIndex) {
      my.pageScrollTo({ scrollTop: 0 })
    }
    // if (index == "0"){
    //   // homeHieght
    //   let scrollHeight = this.data.homeHieght;
    //   wx.pageScrollTo({ scrollTop: scrollHeight })
    // }

    // 如果是全部商品页面
    if (index == "1") {
      let idx = this.data.sortDataIdx;
      // let scrollHeight = this.data.allGoodsData[idx].scrollHeight;
      // wx.pageScrollTo({ scrollTop: scrollHeight, success:function(){console.log('回到顶部')},fail:function(){cosnole.log('错误')}})
      if (this.data.allGoodsData[idx].list.length <= 0) {
        // 获取全部商品里边的数据
        this.getAllGoodsData(idx);
      }
    }
    // 如果是商品分类页面
    else if (index == "2") {
      // wx.pageScrollTo({ scrollTop: 0 })
      // 获取商品分类的数据
      if (this.data.categroyList.length <= 0) {
        this.getSupplierCateList()
      }
    }
    else if (index == "3") {
      this.goToWebCall()
    }

    this.setData({
      tabIndex: index * 1,
      sortNavOnTop: false,    //重置排序导航位置
    })
  },

  // 切换商品排序类型
  switchSortFn(e) {
    let that = this;
    let { index } = e.currentTarget.dataset;
    let currentIndex = that.data.sortIndex;
    let idx = 0;
    if (index == currentIndex) {
      that.setData({
        sortPriceUp: !that.data.sortPriceUp,
      });
    }

    if (that.data.sortPriceUp && index == 2) {
      idx = 3;  // 当价格箭头向上时，把索引定义为3
    }
    else {
      idx = index
    }

    let scrollHeight = this.data.allGoodsData[idx].scrollHeight;
    my.pageScrollTo({ scrollTop: scrollHeight })
    // 如果对应排序的的数据中已经存储了列表数据 除了符合滚动条件 就不必加载了
    if (that.data.allGoodsData[idx].list.length > 0) {
      that.setData({
        allGoodsList: that.data.allGoodsData[idx].list
      })
    }
    else {
      // 获取全部商品里边的数据
      that.getAllGoodsData(idx);
    }

    that.setData({
      sortIndex: index * 1,
      sortDataIdx: idx
    });

  },

  // 获取全部商品里边的数据
  getAllGoodsData(dataIndex) {
    let that = this;
    let sortType = '';       // 搜索类型 综合、销量、价格
    let sortUp = 'desc';     // 排序
    let opt = JSON.parse(JSON.stringify(that.data.allGoodsData[dataIndex]));
    let goodsList = opt.list;
    let dataItem = "allGoodsData[" + dataIndex + "]";
    switch (Number(dataIndex)) {
      case 0:
        // 综合排序
        sortType = 'order_list';
        sortUp = 'desc';
        break;
      case 1:
        // 销量排序
        sortType = 'sales_count';
        sortUp = 'desc';
        break;
      case 2:
        // 价格排序
        sortType = 'sale_price';
        sortUp = 'desc';
        break;
      case 3:
        // 价格排序
        sortType = 'sale_price';
        sortUp = 'asc';
        break;
      default:
        sortType = 'order_list';
        sortUp = 'desc';
    }
    let data = {
      showChannel: 0,
      sortDir: sortUp,
      sortBy: sortType,
      supplierId: that.data.supplierId,
      start: opt.start,
      limit: opt.limit
    };
    http.post(api.SUPPLIER.GOODS_SEARCH, data, res => {
      let result = res.data.data.goodsList ? res.data.data.goodsList : [];
      let scrollEnd = true;
      if (result && result.length > 0) {
        if (result.length < that.data.introLimit) {
          scrollEnd = false;
        }
        opt.list = goodsList.concat(result);
        opt.scrollEnd = scrollEnd;
      }
      else {
        opt.list = goodsList;
        opt.scrollEnd = false;
      }

      that.setData({
        allGoodsList: opt.list,
        [dataItem]: opt,
        allGoodEnd: opt.scrollEnd,
        storeGoodsLoad: true,
      });
    }, err => {
      opt.list = goodsList;
      opt.scrollEnd = false;
      that.setData({
        allGoodsList: opt.list,
        [dataItem]: opt,
        allGoodEnd: opt.scrollEnd,
        storeGoodsLoad: true,
      });
    })
  },

  /**
   * 全部商品的数据
  */
  allGoodInterData() {
    let that = this;
    let dataItem = [];
    for (var i = 0; i < 4; i++) {
      let obj = {
        start: 0,
        limit: 20,
        scrollEnd: true,
        scrollHeight: 0,
        list: [],         // 加载的数据
      };
      dataItem.push(obj)
    }
    that.setData({
      allGoodsData: dataItem
    })
  },

  // 切换商家商品的分类 -- 左边
  switchStoreCate(e) {
    let { index } = e.currentTarget.dataset
    this.setData({
      cateLeftIndex: index * 1
    })
  },

  // 商品分类进入二级分类页面
  goToList(e) {
    let that = this;
    let categoryId = e.currentTarget.dataset.categoryId;
    let supplierId = that.data.supplierId;
    my.navigateTo({
      url: '/pages/shopping/storeInfo/searchList/searchList?supplierId=' + supplierId + '&categoryId=' + categoryId,
    })
  },

  /**
  * 新版搜索组件开关 
  */
  // showSearch(e) {
  //   this.search_component.setData({ inputVal: '' });
  //   // this.searchComponent.getHistory();
  //   this.setData({
  //     isShowSearch: !this.data.isShowSearch,
  //     isFocus: !this.data.isFocus,
  //   })
  //   e.type == 'onShowSearch' ? '' : this.search_component.getHistory();       // type == tap 说明是在首页触发打开搜索模版，type == onShowSearch 说明是在搜索模版 ‘取消’
  // },

  // 联系客服所需要的数据
  getContact: function () {
    let that = this;
    let data = {
      supplierId: that.data.supplierId
    };
    http.get(api.SUPPLIER.XN_CUSTOMER, data, res => {
      let dataItem = res.data.data
      let webCallParam = res.data.data.webCallParam;
      if (webCallParam) {
        let linkData = webCallParam + '?uid=' + dataItem.uid + 'b&uname=' + dataItem.uname + '&siteId=' + dataItem.sellerId + '&settingId=' + dataItem.settingId;
        that.setData({
          webCallLink: linkData
        })
      }
    }, err => { })
  },

  // 跳去客服网页版
  goToWebCall: function () {
    let that = this
    let webCallLink = that.data.webCallLink;
    try {
      my.setStorageSync({
				key: 'webCallLink', // 缓存数据的key
				data: webCallLink, // 要缓存的数据
			});
    } catch (e) { }
    my.navigateTo({
      url: '/pages/user/webCallView/webCallView?link=' + webCallLink,
    })
  },

  /**
   * 返回首页
  */
  goHome(){
    my.switchTab({
      url: '/pages/home/home',
    })
  },

  /**
   * 返回顶部
  */
  goTop(){
    let that = this;
    my.pageScrollTo({ scrollTop: 0 })
  },

  /**
   * 滚动加载更多
  */
  onReachBottom() {
    let that = this;
    let tabIndex = that.data.tabIndex
    if (tabIndex == 0) {
      // 店铺首页 滚动加载商家推荐数据
      if (that.data.introContinue) {
        that.setData({
          introStart: this.data.introList.length,
        });
        that.getIntroData();
      }
    }
    else if (tabIndex == 1) {
      let idx = that.data.sortDataIdx;
      let opt = JSON.parse(JSON.stringify(that.data.allGoodsData[idx]));
      let dataItem = "allGoodsData[" + idx + "].start";
      if (opt.scrollEnd) {
        that.setData({
          [dataItem]: opt.list.length
        })
        this.getAllGoodsData(idx);
      }
    }
  }

})