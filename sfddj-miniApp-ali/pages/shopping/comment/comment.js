// var _myShim = require('........my.shim');
/**
* 评价详情页面
* @author 01368384
*/
let app = getApp();
var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');
var util = require('../../../utils/util');
var baseImageUrl = constants.UrlConstants.baseImageUrl; //图片资源地址前缀
// let http = require('../../../api/http');
// let api = require('../../../api/api')
import http from '../../../api/http'
import api from '../../../api/api'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		loadComplete: false,
		loadFail: false,
		errMsg: '',
		goodsId: '',
		start: 0,
		limit: 10,
		hasMore: true,
		isLoadMore: false,
		result: '',
		commentList: [],
		baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
		supplierTit: "商家回复：",
		platformTit: "平台回复：",
		countData: { allCount: 0, youTuCount: 0 },
    commentFenlei: 1,                 //获取评论列表的类型，1： 全部， 2： 有图
    automaticCount: 0,                //自动评价数量
    defaultSort: 0,                   //排序，0：默认排序，1：按时间排序

    isFullScreen: false,              // 视频是否进入全屏
    videoShow: false,                 // 视频显示
    videoDirection: 0,

        
    setComeBack: true,                // 返回顶部或首页的导航的节流开关
    pullUpShow: false,                    // 用户是上拉
    coloneScrollTop: [],
    js_estimateNavHeight: null,       // js_estimateNav 节点高度；

	},

	onLoad: function(options) {
		this.setData({
			goodScore: options.goodScore,                                 // 商详页带过来的，没有用到
			goodsCommentTotal: options.goodsCommentTotal,                 // 商详页带过来的，没有用到
			goodsId: options.goodsId,
      commentType: options.type
		});
		// util.getNetworkType(this);
		this.getGoodsCommentScore();
		this.getCommentCount();
		this.getCommentDataNew();
    options.type == 'buyerShow'  ? '' : this.getAutomaticGoodsComment();
		

    my.setNavigationBar({
      title: options.type == 'buyerShow' ? '买家秀' : '评价详情',
    });
	},

  onShow() {
  },

	/**
	 * 获取评论列表信息
	 * @param goodsId 商品id
	 * @param start 分页下标
	 * @param limit 分页条数
	 */
	getCommentData: function() {
		var that = this;
		this.setData({
			isLoadMore: true
		});
		sendRequest.send(constants.InterfaceUrl.GOODS_COMMENT_LIST, { goodsId: that.data.goodsId, start: that.data.start, limit: that.data.limit }, function(res) {
			var result = res.data.result;
			result.forEach(function(value, index, arr) {
				if (value) {
					value.createDate = util.formatTime(new Date(value.createDate));
					if (value.imagePath) {
						var arr = value.imagePath.split(',');
						value.imagePath = arr;
					}
					if (value.appendImagePath) {
						value.appendImagePathArr = value.appendImagePath.split(',')
					}
				}
			});

			var hasMore = false;
			if (result && result.length == that.data.limit) {
				hasMore = true;
			}

			if (that.data.start == 0) {
				that.data.result = result;
			} else {
				that.data.result = that.data.result.concat(result);
			}

			that.setData({
				result: that.data.result,
				baseImageUrl: baseImageUrl,
				loadComplete: true,
				hasMore: hasMore,
				isLoadMore: false
			});
		}, function(err) {
			that.setData({
				loadComplete: true,
				loadFail: true,
				isLoadMore: false,
				errMsg: err
			});
		}, "GET");
	},

	/**
	 * 获取评论列表信息
	 * @param goodsId 商品id
	 * @param start 分页下标
	 * @param limit 分页条数
	 */
	getCommentDataNew: function() {
		var that = this;
    let videoPath = [];
    let appendVideoPath = [];
    let { goodsId,start,limit,commentFenlei,commentType,defaultSort } = that.data;

		this.setData({
			isLoadMore: true
		});

		http.get(api.COMMENT.GET_COMMENT_LIST, { goodsId, start, limit, type: commentFenlei, commentType: commentType == 'buyerShow' ? '1' : '2',sort: defaultSort }, res => {
			let commentList = res.data.data;
			// var result = res.data.result;
			commentList.forEach(value => {
				if (value) {
					value.createDate = util.pointFormatTime(new Date(value.createDate));
          if ( value.videoPath && value.videoPath.length > 0 ) { 
            value.videoPath.forEach((vals, index) => {
              if ( index % 2 == 0) {            // 测试环境有脏数据，做了排除
                let videoValue = {
                  videoSrc: vals,
                  videoCover: value.videoPath[index + 1]
                }
                videoPath.push(videoValue)
              }
            })
            value.videoPath = videoPath;
            videoPath = [];
          }
          if ( value.appendVideoPath && value.appendVideoPath.length > 0 ) {
            value.appendVideoPath.forEach((val, ind) => {
              if ( ind % 2 == 0) {                // 测试环境有脏数据，做了排除
                let videoValue = {
                  videoSrc: val,
                  videoCover: value.appendVideoPath[ind + 1]
                }
                appendVideoPath.push(videoValue)
              }
            })
            value.appendVideoPath = appendVideoPath;
            appendVideoPath = [];
          }
				}
			});

      var hasMore = commentList && commentList.length == that.data.limit ? true : false;
      that.data.commentList = that.data.start == 0 ? commentList : that.data.commentList.concat(commentList);

			that.setData({
				commentList: that.data.commentList,
				baseImageUrl: baseImageUrl,
				loadComplete: true,
				hasMore: hasMore,
				isLoadMore: false
			});

      that.data.start == 0 ? that.getHeight() : '';
		}, err => {
			that.setData({
				loadComplete: true,
				hasMore: false,
				isLoadMore: false
			})
      that.data.start == 0 ? that.getHeight() : '';
		})
	},

	// 获取商品评论数量
	getCommentCount() {
		let that = this;
		http.get(api.COMMENT.GET_COMMENT_COUNT, { commentType: that.data.commentType == 'buyerShow' ? '1' : '2', goodsId: that.data.goodsId }, res => {
			let result = res.data;
			that.setData({
				countData: result.data
			})
      that.getHeight();
		}, err => {
      that.getHeight();
		})
	},

	// 获取商品的好评度
	getGoodsCommentScore() {
		let that = this;
		http.get(api.COMMENT.GET_COMMENT_SCORE, { commentType: that.data.commentType == 'buyerShow' ? '1' : '2', goodsId: that.data.goodsId }, res => {
			let result = res.data;
			that.setData({
				commentScore: result.data
			})
      that.getHeight();
		}, err => {
      that.getHeight();
		})
	},

	// 获取商品自动评价数量
	getAutomaticGoodsComment() {
		let that = this;
		http.get(api.COMMENT.GET_COMMETN_AUTO_COUNT, { goodsId: this.data.goodsId }, res => {
			let result = res.data;
			that.setData({
				automaticCount: result.data
			})
      that.getHeight();
		}, err => {
      that.getHeight()
		})
	},

	// 点击是有图还是没图
	filterCommentList(e) {
		let commentFenlei = e.currentTarget.dataset.type;
		// 如果点击是当前的类型则不用再次请求
		if ( commentFenlei == this.data.commentFenlei ) {
			return
		}
		else {
			this.setData({
				// commentType: commentType,
        commentFenlei,
				commentList: [],
				start: 0
			})
			this.getCommentDataNew()
		}

	},

	/**
	* 查看图片
	*/
	commentViewTap: function(e) {
		var that = this
    var urls = e.currentTarget.dataset.urls;
    var index = e.currentTarget.dataset.current;

    // 带有 http 则表示该视频或图片被禁用；
    let newUrls = urls.map(value => {
      return value = value.substring(0, 5).indexOf('http') > -1 ? that.data.baseLocImgUrl  + 'vueStatic/img/commentErrImg.png' : baseImageUrl + value
    });

    my.previewImage({
      urls: newUrls,
      current: index
    })
	},

	/**
	 * 页面上拉触底事件的处理函数onReachBottom
	 */
	loadMoreList: function(e) {
		if (this.data.hasMore) {
			this.setData({
				start: this.data.commentList.length
			});
			this.getCommentDataNew();
		}
	},

    /**
   * 播放买家秀视频，播放时进入全屏
   */
  playCommeVideo(e) {
    this.setData({
      videoId: e.currentTarget.dataset.id,
      videoSrc: e.currentTarget.dataset.videoSrc,
      videoShow: true
    })
    var video = my.createVideoContext(this.data.videoId);
    video.play();
  },

  /**
   * 播放买家秀视频，播放时正在缓冲视频即进入全屏；
   */
  videoLoading() {
    var video = my.createVideoContext(this.data.videoId);
    video.requestFullScreen({direction: 0});
  },

  // 当前买家秀视频进入全屏以后加锁
  fullscreenchange(e) {
    this.data.isFullScreen = e.detail.fullScreen;
    if ( !this.data.isFullScreen ) {
      this.setData({
        videoShow: false
      })
      var video = my.createVideoContext(this.data.videoId);
      video.pause();
      video.stop();
    }
  },

  selectionSort(e) {
    let sortType = e.currentTarget.dataset.sortType;
    if( (sortType == 'defaultSort' && this.data.defaultSort == 0) || (sortType == 'timeSort' && this.data.defaultSort == 1) ) {
      return;
    } else {
      this.setData({
        defaultSort: e.currentTarget.dataset.sortType == 'defaultSort' ? 0 : 1,
        start: 0
      })
      this.getCommentDataNew();
    }
  },

    // 监听页面滚动
  scrollEvent: function(e) {
    let that = this;
    // 设置返回首页/顶部栏
    if (e.detail.scrollTop >= 500 && that.data.setComeBack) {
      that.data.setComeBack = false;
      that.setData({
        comeBackBar: 'show',
      })
    } else if (e.detail.scrollTop < 500 && !that.data.setComeBack) {
      that.data.setComeBack = true;
      that.setData({
        comeBackBar: 'hide',
        scrollTop: null
      })
    }

    that.data.coloneScrollTop.push(e.detail.scrollTop);
    let length = that.data.coloneScrollTop.length;
    if( that.data.coloneScrollTop[length - 1] ==  that.data.coloneScrollTop[length - 2] || length < 2 ) {
      return;
    }
    let isPullUp = that.data.coloneScrollTop[length - 1] <  that.data.coloneScrollTop[length - 2] ? true : false;
    let outRange = that.data.coloneScrollTop[length - 1] > that.data.js_estimateNavHeight ? true : false;
    // console.log('最后一个滚动距离',that.data.coloneScrollTop[length - 1],'倒数第二个滚动距离', that.data.coloneScrollTop[length - 2]);
    if( !outRange && that.data.pullUpShow ) {
      // console.log('滚动距离小于导航高度，影藏')
      that.data.pullUpShow = false;
      that.setData({
        pullUpShow: that.data.pullUpShow,
      })
      return;
    } else {
      if( length > 0 && isPullUp  && !that.data.pullUpShow && outRange ) {
          // console.log('滚动距离大于导航高度，且上拉拉，显示')
          that.data.pullUpShow = true;
          that.setData({
            pullUpShow: that.data.pullUpShow,
          }) 
      } else if ( length > 0 && !isPullUp && that.data.pullUpShow && outRange ) {
        // console.log('滚动距离大于导航高度，且下拉拉，影藏')
        that.data.pullUpShow = false;
          that.setData({
            pullUpShow: that.data.pullUpShow,
          })
      }
    }
    // console.log(that.data.coloneScrollTop)
  },

  getHeight() {
    let that = this;
    my.createSelectorQuery().select('.js_estimateNav').boundingClientRect().exec((res) => {
      let result = res[0] && res[0] != 'null' ? res[0].height ? res[0].height : 0 : 0;
      that.setData({
        // (result * app.globalData.systemInfo.windowWidth / 750)
        js_estimateNavHeight: result,
      })
    });
  },

  // 页面回滚到顶部
  goTop() {
   this.setData({
      scrollTop: 1,
      duration: 500,
   });
  },

});