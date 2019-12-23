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
		commentType: 1,       //获取评论列表的类型，1： 全部， 2： 有图
		automaticCount: 0,   //自动评价数量
	},

	onLoad: function(options) {
		this.setData({
			goodScore: options.goodScore,
			goodsCommentTotal: options.goodsCommentTotal,
			goodsId: options.goodsId
		});
		// util.getNetworkType(this);
		this.getGoodsCommentScore();
		this.getCommentCount();
		this.getCommentDataNew();
		this.getAutomaticGoodsComment()
		// http.get(api.COMMENT.GET_COMMENT_LIST,{goodsId: options.goodsId, start: 0, limit: 10}).then(res => {
		// 	console.log(';;;;;---response',res)
		// }, err => {
		// 	console.log(';;;;---err',err)
		// }).catch(err => {
		// 	console.log(';;;catch--',err)
		// })
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
		this.setData({
			isLoadMore: true
		});

		http.get(api.COMMENT.GET_COMMENT_LIST, { goodsId: that.data.goodsId, start: that.data.start, limit: that.data.limit, type: this.data.commentType }, res => {
			let commentList = res.data.data;
			// var result = res.data.result;
			commentList.forEach(function(value, index, arr) {
				if (value) {
					value.createDate = util.formatTime(new Date(value.createDate));
					// if (value.imagePath) {
					// 	var arr = value.imagePath.split(',');
					// 	value.imagePath = arr;
					// }
					// if (value.appendImagePath) {
					// 	value.appendImagePathArr = value.appendImagePath.split(',')
					// }
				}
			});

			var hasMore = false;
			if (commentList && commentList.length == that.data.limit) {
				hasMore = true;
			}

			if (that.data.start == 0) {
				that.data.commentList = commentList;
			} else {
				that.data.commentList = that.data.commentList.concat(commentList);
			}

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
		http.get(api.COMMENT.GET_COMMENT_COUNT, { goodsId: this.data.goodsId }, res => {
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
		http.get(api.COMMENT.GET_COMMENT_SCORE, { goodsId: this.data.goodsId }, res => {
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
		let commentType = e.currentTarget.dataset.type;
		// 如果点击是当前的类型则不用再次请求
		if (commentType == this.data.commentType) {
			return
		}
		else {
			this.setData({
				commentType: commentType,
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
		// var url = baseImageUrl + e.currentTarget.dataset.current;
		var current = e.currentTarget.dataset.current;
		var newUrls = [];
		urls.forEach(function(v, i, arr) {
			v = v.substring(0, 5).indexOf('http') > -1 ? that.data.baseLocImgUrl + 'vueStatic/img/commentErrImg.png' : baseImageUrl + v
			newUrls.push(v);
		});
		my.previewImage({
			urls: newUrls,
			current: current
		});
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
	}

});