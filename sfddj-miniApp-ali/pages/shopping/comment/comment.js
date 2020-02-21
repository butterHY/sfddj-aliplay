// var _myShim = require('........my.shim');
/**
* 评价详情页面
* @author 01368384
*/

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

    isFullScreen: false,      // 视频是否进入全屏
    videoShow: false,         // 视频显示
    videoDirection: 0
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
		this.setData({
			isLoadMore: true
		});

		http.get(api.COMMENT.GET_COMMENT_LIST, { goodsId: that.data.goodsId, start: that.data.start, limit: that.data.limit, type: that.data.commentFenlei, commentType: that.data.commentType == 'buyerShow' ? '1' : '2' }, res => {
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
		}, err => {
			that.setData({
				loadComplete: true,
				hasMore: false,
				isLoadMore: false
			})
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
		}, err => {

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
		}, err => {

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
		}, err => {

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
		// var urls = e.currentTarget.dataset.urls;
		// // var url = baseImageUrl + e.currentTarget.dataset.current;
		// var current = e.currentTarget.dataset.current;
		// var newUrls = [];
		// urls.forEach(function(v, i, arr) {
		// 	v = v.substring(0, 5).indexOf('http') > -1 ? that.data.baseLocImgUrl + 'vueStatic/img/commentErrImg.png' : baseImageUrl + v
		// 	newUrls.push(v);
		// });
		// my.previewImage({
		// 	urls: newUrls,
		// 	current: current
		// });

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

});