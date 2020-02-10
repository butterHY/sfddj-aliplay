var constants = require('../../../utils/constants');
var stringUtils = require('../../../utils/stringUtils');
var util = require('../../../utils/util');
var sendRequest = require('../../../utils/sendRequest');



Page({
  data: {
    advertsArr: [],
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    baseImageUrl: constants.UrlConstants.baseImageUrl,
    current: 1,
    ossImgStyle: '?x-oss-process=style/goods_img_2',
    goodsList: [],
    blue: "pink",
    childrenCategoryTags: [{ name: '苹果', id: "a" }, { name: '梨子', id: 'b' }, { name: '橘子', id: 'c' }, { name: '香蕉', id: 'd' }],
    isScroll_x: true,
    allGoodsList: [],
    navigationHeight: null,
    itemId: null,
    sticky: false,
    selectNavigation: null
  },
  onLoad: async function() {
    var that = this;

    var advertsArr = my.getStorageSync({
      key: 'homeAdvertsArr', // 缓存数据的key
    }).data;

    var goodsList = my.getStorageSync({
      key: 'homeGoodsList', // 缓存数据的key
    }).data;



    that.setData({
      advertsArr: advertsArr,
      goodsList: goodsList,
    })

    that.getAllPintuanProduct(0);
    that.data.isonLoad = await that.getAdvertsModule();

    my.setNavigationBar({
      title: '专题活动',
      backgroundColor: 'red',
      success() { },
      fail() { },
    });

    // console.log(this.data.goodsList);

  },

  onReady() {
    var that = this;
    var allItemWidth = 0;
    var navigationWidth = 0;
    var navigationHeight = 0;
    my.createSelectorQuery().selectAll('.all').boundingClientRect().exec((all) => {
      var allItem = all[0];
      for (var i = 0; i < allItem.length; i++) {
        allItemWidth += allItem[i].width;
      }
    })
    my.createSelectorQuery()
      .selectAll('.navigation').boundingClientRect()
      .exec((navigation) => {
        navigationWidth = navigation[0][0].width;
        navigationHeight = navigation[0][0].height;
        that.setData({
          navigationHeight: navigationHeight
        })



        if (allItemWidth > navigationWidth) {
          that.setData({
            isScroll_x: false
          })
        }
      })

  },


  /**
 * 广告模块
 * */
  getAdvertsModule() {
    var that = this;
    var urlPre = '/m/a';
    var url = urlPre + '/1.0/moduleAdvert/getModuleAdvert';
    var token = '';
    var contentType = '';
    try {
      token = my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data ? my.getStorageSync({ key: constants.StorageConstants.tokenKey }).data : '';
      // console.log('hhhhhaaa', token);
    } catch (e) { }

    return new Promise((reslove, reject) => {
      my.httpRequest({
        url: constants.UrlConstants.baseUrlOnly + url,
        method: 'GET',
        data: {
          channel: 'ALIPAY_MINIAPP',
          sceneName: 'HOME',
          sceneParam: 'MINI_ALIPAY'
        },

        headers: {
          'token': token ? token : '',
          "content-type": contentType ? contentType : "application/x-www-form-urlencoded",
          "client-channel": "alipay-miniprogram"
        },
        success: function(res) {
          // console.log('修改之前的数据', that.data.advertsArr)
          // console.log(res)
          var resData = res.data;
          if (resData.ret.code == '0') {
            var result = resData.data;

            for (var i = 0; i < result.length; i++) {
              result[i].items = JSON.parse(result[i].items);
              if (result[i].moduleType == "SECONDKILL") {
                that.data.secondKillActivityId = result[i].items[0].secondKillActivityId;
              }
            }

            // console.log('数据请求成功 advChange---', result);
            // 缓存数据
            my.setStorage({
              key: 'homeAdvertsArr', // 缓存数据的key
              data: result, // 要缓存的数据
              success: (res) => {

              },
            });
            that.setData({
              advertsArr: result,
              secondKillActivityId: that.data.secondKillActivityId

            })
            // console.log('修改之后的数据+++', that.data.advertsArr)

            reslove({
              'type': true,
              'result': result
            });

          }
        },

        fail: function(err) {
          // console.log('数据请求失败  adverts===err', err);
          reject({
            'type': false,
            'result': err
          });
        }
      })
    })

  },


  /**
 * 获取所有商品 type： 0:刷新 1:下拉加载
 * */
  getAllPintuanProduct(type) {
    this.setData({
      isLoadMore: true
    });
    var that = this;
    sendRequest.send(constants.InterfaceUrl.HOME_GROUPGOODS_LIST,
      {
        groupName: 'H5首页-热销排行',
        start: 0,
        limit: 15
      }, function(res) {
        var isLoadMore = false;
        my.stopPullDownRefresh();
        // console.log(res);
        var result = res.data.result;
        var hasMore = false;
        var goodsList = that.data.goodsList;
        if (result && result.length == that.data.limit) {
          hasMore = true;
        }
        if (type == 0) {
          goodsList = result;
        } else {
          goodsList = goodsList.concat(result);
        }
        // 缓存数据
        my.setStorage({
          key: 'homeGoodsList', // 缓存数据的key
          data: goodsList, // 要缓存的数据
          success: (res) => {

          },
        });
        var goodsList1 = {};
        goodsList1.id = 'a';
        goodsList1.item = goodsList;

        var goodsList2 = {};
        goodsList2.id = 'b';
        goodsList2.item = goodsList;

        var goodsList3 = {};
        goodsList3.id = 'c';
        goodsList3.item = goodsList;


        var goodsList4 = {};
        goodsList4.id = 'd';
        goodsList4.item = goodsList;

        var allGoodsList = [];
        allGoodsList.push(goodsList1);
        allGoodsList.push(goodsList2);
        allGoodsList.push(goodsList3);
        allGoodsList.push(goodsList4);


        that.setData({
          goodsList: goodsList,
          hasMore: hasMore,
          isLoadMore: isLoadMore,
          allGoodsList: allGoodsList
        });
      }, function(err) {
        my.stopPullDownRefresh();
        that.setData({
          isLoadMore: false
        });
        // console.log(err);
      }, 'GET', true);
  },

  /**
 * 点击tag更新商品列表显示，重新请求数据，更新商品列表显示
 * @param e 点击参数
 */
  tagViewTap: function(e) {
    // console.log(this.data.sticky)
    var that = this;
    // console.log(e)
    var itemId = e.currentTarget.dataset.id;
    var id = e.currentTarget.id;
    that.data.childrenCategoryTags.forEach(function(value, index, array) {
      if (index == id) {
        value.taped = true;
      } else {
        value.taped = false;
      }
    });
    that.setData({
      childrenCategoryTags: that.data.childrenCategoryTags,
      selectNavigation: true
    });
    // that.data.start = 0;
    // that.getGoodsData(0);

    //滚动到屏幕顶部
    // my.pageScrollTo({
    //   scrollTop: 0
    // });
    // that.setData({
    //   scrollTop: 0
    // })
    // console.log(itemId)
    // itemId = "#" + itemId;
    // console.log(itemId)
    my.createSelectorQuery()
      .select('#' + itemId).boundingClientRect()
      .exec((commodityModule) => {

        var top = Math.abs(commodityModule[0].top)
        top = Math.floor(top)

        if (top == 0 || top <= 45) {
          that.setData({
            selectNavigation: false
          })
        } else {
          that.setData({
            itemId: itemId
          })
        }

        console.log(this.data.itemId)
        console.log(top)
        console.log(this.data.selectNavigation)
      })

  },

  /**
 * 监听屏幕滚动事件，调整tagView显示， 顶部分类导航模块的 ‘吸顶效果’
 * @param e 滑动参数
 */
  scrollingFn: function(event) {
    console.log(this.data.selectNavigation)
    // console.log(event)
    // console.log(top)
    // console.log(event.detail.scrollTop )
    // console.log(this.data.navigationHeight )
    // event.detail.scrollTop = this.data.navigationHeight;
    // console.log(event.detail.scrollTop )
    // console.log(this.data.sticky)

    // 吸顶效果
    my.createSelectorQuery()
      .selectAll('.navigation').boundingClientRect()
      .exec((navigation) => {
        var navigationTop = navigation[0][0].top;
        var navigationHeight = navigation[0][0].height;
        if (navigationTop <= 0 && !this.data.sticky) {
          this.setData({
            sticky: true
          });
          // console.log(height, navigationTop);
        } else if (navigationTop >= 0 && this.data.sticky) {
          this.setData({
            sticky: false
          });
          // console.log(height, navigationTop);
        }
      })

    // 页面锚点定位滚动效果
    var itemId = this.data.itemId;
    if (itemId) {
      my.createSelectorQuery()
        .select('#' + itemId).boundingClientRect()
        .exec((commodityModule) => {
          // console.log(commodityModule[0].top)
          var top = Math.abs(commodityModule[0].top)
          top = Math.floor(top)
          // console.log(top)
          if (top <= 45 && this.data.selectNavigation) {
            // console.log('等于0了')
            var scrollTop = event.detail.scrollTop - 45;
            // console.log(scrollTop)
            //  this.setData({
            //    scrollTop: scrollTop
            //  })

            this.setData({
              selectNavigation: false,
              itemId: null
            })
          }
          else {
            // this.setData({
            //   selectNavigation: true,
            //   itemId: null
            // })
          }
        })
    }


    // 页面拖拽滚动导航栏高亮效果；
    if (this.data.selectNavigation) {
      return;
    }

    my.createSelectorQuery()
      .selectAll('.commodityModule').boundingClientRect()
      .exec((commodityModule) => {
        // console.log(commodityModule[0])
        // console.log(commodityModule[0].top)
        for (var i = 0; i < commodityModule[0].length; i++) {
          var top = commodityModule[0][i].top;
          var bottom = commodityModule[0][i].bottom;
          // console.log(top)
          // top = Math.floor(top)
          if (top <= 45 && bottom >= 45) {
            console.log('我进来了')
            if (!this.data.childrenCategoryTags[i].taped) {
              for (var j = 0; j < this.data.childrenCategoryTags.length; j++) {
                this.data.childrenCategoryTags[j].taped = false;
              }
              this.data.childrenCategoryTags[i].taped = true;
              console.log('我置顶且为false,修改数据')
              this.setData({
                childrenCategoryTags: this.data.childrenCategoryTags,
                selectNavigation: false
              })
            }

          } else if (this.data.childrenCategoryTags[i].taped) {
            console.log('我离开了可视区域')
            this.data.childrenCategoryTags[i].taped = false;

            this.setData({
              childrenCategoryTags: this.data.childrenCategoryTags,
              itemId: null
            })
          }
        }

      })




  },





});
