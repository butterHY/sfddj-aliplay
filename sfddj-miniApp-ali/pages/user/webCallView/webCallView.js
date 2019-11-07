// var _myShim = require('........my.shim');

var sendRequest = require('../../../utils/sendRequest');
var constants = require('../../../utils/constants');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		try {
			var link = my.getStorageSync({
				key: 'webCallLink', // 缓存数据的key
			}).data;

			if (link.indexOf('xn/toXn') != -1) {
				// this.setLink(options)
				this.splitLink(options, link);
			} else {
				this.getTicketAndId();
			}
		} catch (e) { }
	},

	splitLink(options, link) {
		var that = this;
		var newLink = options.link + '?';
		var index = link.indexOf('?');
		var str = link.substring(index + 1);
		var pathArr = str.split('&');
		var obj = {};
		var newArr = [];

		var nowTime = new Date()
		for (var i = 0; i < pathArr.length; i++) {
			newArr = pathArr[i].split('=');
			if (newArr[0] == 'uname') {
				newArr[1] = encodeURI(newArr[1]);
			}
			obj[newArr[0]] = newArr[1];
		}

		for (var key in obj) {
			newLink += key + '=' + obj[key] + '&';
		}


		that.setData({
			link: getApp().globalData.systemInfo.platform == 'iOS' ?  newLink + '&ddjTimestamp=' + new Date().getTime() : newLink
		});

	},

	setLink(options) {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.USER_USERINFO, {}, res => {
			var uid = res.data.result.member_id ? res.data.result.member_id : '0';
			var uname = res.data.result.uesrName ? res.data.result.uesrName : '匿名';
			uname = encodeURI(uname);
			var link = options.link + '?uid=' + uid + '&uname=' + uname;
			that.setData({
				link: link
			});
		}, err => { }, 'GET');
	},

	getTicketAndId: function() {
		var that = this;
		sendRequest.send(constants.InterfaceUrl.GET_TICKET_ID, {}, function(res) {
			try {
				var link = my.getStorageSync({ key: 'webCallLink' }).data;
				link = link + '&wxappid=' + res.data.result.appId + '&wxticket=' + res.data.result.jsTiket;
				if (link.substr(0, 5) == 'http:') {
					link = link.replace('http:', 'https:');
				}
				that.setData({
					link: link
				});
				my.removeStorageSync({
					key: 'webCallLink', // 缓存数据的key
				});
			} catch (e) { }
		}, function(err) {
		}, 'POST');
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() { },

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() { },

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() { },


	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() { }

	/**
	 * 用户点击右上角分享
	 */
	// onShareAppMessage: function () {

	// }
});