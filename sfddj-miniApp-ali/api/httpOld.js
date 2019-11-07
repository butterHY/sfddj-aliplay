import api from './api';
import env from './env'
import status from './status'
import { StorageConstants } from '../utils/constants'

let token = my.getStorageSync({ key: StorageConstants.tokenKey }).data ? my.getStorageSync({ key: StorageConstants.tokenKey }).data : '';

let header = {
	"token": token,
	"content-type": "application/x-www-form-urlencoded",
	"client-channel": "alipay-miniprogram"
}
/**
 * 整理 编写 01386297
 * 这是一个http类的工具集，有以下方法：
 * api    请求url
 * status 自定义状态值
 * self 页面实例，配合checkLoginStatus方法的入参
 * post 获取数据的post方法
 * get  获取数据的get方法
 * setHeaders 设置请求头
 * checkLoginStatus 监测是否登录
 * login  获取token并登录
 * checkNetworkStatus 监测当前网络状态
 * intercepterResponse 数据响应的拦截器
 * intercepterError 异常拦截器
 */
export default {
	api,
	status,
	// count: 0,
	timer: '',
	successCallBack: '',
	failCallBack: '',
	url: '',
	data: {},
	// self: '',
	async post(url = '', data = {}, headers = {}, dataType = 'json', oldRequest = false, callback) {
		this.url = url
		this.data = data
		let that = this
		console.log(';;;;-----',url)
		if(!token){
			header.token = my.getStorageSync({ key: StorageConstants.tokenKey }).data ? my.getStorageSync({ key: StorageConstants.tokenKey }).data : ''
		}

		// header.token = ''

		// request
		return new Promise((reslove, reject) => {
			let options = {
				url: `${api.baseUrl}${url}`,
				method: 'POST',
				data,
				headers: Object.assign({}, header, headers),
				dataType: dataType,
				success: function(response) {
					console.log(';;;;;;----response',response);
					// TODO: 待添加接口异常处理
					if (!oldRequest) {
						let res = filterData(res)
						that.intercepterResponse(response, (ret) => {
							reslove(res, url, data, headers, dataType, oldRequest)
						}, (err) => { reject(err, url, data, headers, dataType, oldRequest) }, url, data, headers, dataType, oldRequest)
					}
					else {
						reslove(response,url, data, headers, dataType, oldRequest)
					}
				},
				fail: function(err) {
					console.log(';;;;;;----err',err);
					// request异常处理
					if (oldRequest) {
						reslove()
					}
					else {
						// request异常处理
						that.intercepterError(err, err => {
							reject(err)
						})
					}
				}
			}
			if (my.canIUse('request')) {
				my.request(options);
			} else {
				my.httpRequest(options);
			}
		})
	},
	async get(url = '', data = {}, headers = {}, dataType = 'json', oldRequest = false) {
		let that = this
		// if(!token){
		// 	header.token = my.getStorageSync({ key: StorageConstants.tokenKey }).data ? my.getStorageSync({ key: StorageConstants.tokenKey }).data : ''
		// }

		header.token = ''

		return new Promise((reslove, reject) => {
			let options = {
				url: `${api.baseUrl}${url}`,
				method: 'GET',
				data,
				headers: Object.assign({}, header, headers),
				dataType: dataType,
				success: function(response) {
					if (oldRequest) {
						reslove(response)
					}
					else {
						// TODO: 待添加接口异常处理
						that.intercepterResponse(response, (ret) => {
							reslove(ret)
						}, (err) => { reject(err, url, data, headers, dataType, oldRequest) })
					}

				},
				fail: function(err) {
					if (oldRequest) {
						reslove()
					}
					else {
						// request异常处理
						that.intercepterError(err, err => {
							reject(err)
						})
					}

				}
			}
			if (my.canIUse('request')) {
				my.request(options);
			} else {
				my.httpRequest(options);
			}
		})
	},
	setHeaders(options) {
		// 添加headers报头
		header = Object.assign({}, header, options)
	},
	checkLoginStatus(successCallBack, self, failCallBack) {
		// 入口授权监测
		this.successCallBack = successCallBack;
		this.failCallBack = failCallBack
		this.self = self
		if (!header['sftoken']) {
			this.login(successCallBack, failCallBack)
		} else {
			this.successCallBack(this.self)
		}
	},
	_getPermissoin() {
		// 获取用户授权
		return new Promise((resolve, reject) => {
			my.getAuthCode({
				scopes: ['auth_base'],
				success: (res) => {
					resolve(res.authCode)
					// resolve('201')
				},
				fail: function(e) {
					reject(e)
				}
			});
		})
	},
	/**
	 * 
	 * @param {function} successCallBack 成功的回调
	 * @param {function} failCallBack 失败的回调
	 */
	login(successCallBack, failCallBack,url, data,headers,dataType,oldRequest,method) {
		let _this = this
		// 登录接口
		try {
			// this.count = ++this.count
			this._getPermissoin().then(authCode => {
				this.post(api.LOGIN_ALI, { authCode: authCode },{},'',true).then(result => {
					console.log(';;;;---',result)
					let { errorCode } = result.data;
					errorCode = errorCode && errorCode.toString();
					console.log(';;;;-----',result,errorCode,result.data.result.loginToken,StorageConstants.tokenKey)
					if (errorCode == '0001') {
						my.setStorageSync({ key: StorageConstants.tokenKey, data: result.data.result.loginToken });
						// my.setStorageSync({ key: 'ddj_memId', data: res.data.result.memberId });
						// my.setStorageSync({ key: 'ddj_opId', data: res.data.result.openId });
						console.log('00000',_this,this)
						if (successCallBack) successCallBack()
						// this.post(url, data, headers, dataType, oldRequest).then(res=>{})
						
					}
					else {
						if (failCallBack) failCallBack()
					}
					// let { state, data: { message, success, sftoken } } = result.data
					// state = state && state.toString()
					// if (state == '200' && success && sftoken) {
					// 	this.setHeaders({ sftoken: sftoken })
					// 	successCallBack && typeof successCallBack == 'function' && successCallBack(this.self)
					// 	return Promise.resolve()
					// } else {
					// 	failCallBack && typeof failCallBack == 'function' && failCallBack(this.self)
					// 	return Promise.resolve()
					// }
				}, err => {
					my.switchTab({
						url: '/pages/home/home', // 跳转的 tabBar 页面的路径（需在 app.json 的 tabBar 字段定义的页面）。注意：路径后不能带参数
						success: (res) => {

						},
					});
				}).catch(e => {
					// let { errorMessage, code } = e
					// my.alert({
					// 	title: '错误提示',
					// 	content: `登录失败!失败原因：${errorMessage || code}`,
					// 	buttonText: '我知道了',
					// 	success: () => {
					// 		failCallBack && typeof failCallBack == 'function' && failCallBack(this.self)
					// 	},
					// });
					if (failCallBack) failCallBack()
				})
			}, err => {
				my.alert({
					title: '错误提示',
					content: `获取授权失败!失败原因：${err.code}`,
					buttonText: '我知道了',
					success: () => {
						failCallBack && typeof failCallBack == 'function' && failCallBack(this.self)
					},
				});
			}).catch(e => {
				let { errorMessage } = e
				my.alert({
					title: '错误提示',
					content: `获取授权失败!失败原因：${errorMessage}`,
					buttonText: '我知道了',
					success: () => {
						failCallBack && typeof failCallBack == 'function' && failCallBack(this.self)
					},
				});
			})
		} catch (e) {
			my.alert({
				title: '错误提示',
				content: `系统错误!失败原因：http调用异常`,
				buttonText: '我知道了'
			});
			// this.count = 0
		}

	},
	checkNetworkStatus() {
		// 检查网络状态 网络类型值 UNKNOWN / NOTREACHABLE / WIFI / 3G / 2G / 4G / WWAN
		return new Promise((resolve, reject) => {
			my.getNetworkType({
				success: res => {
					resolve({
						hasNetworkType: res.networkAvailable,
						networkType: res.networkType
					})
				},
				fail: err => {
					reject({
						hasNetworkType: false,
						networkType: UNKNOWN
					})
				}
			})
		})
	},
	async intercepterResponse(response, callback, errFunc, url = '', data = {}, headers = {}, dataType = 'json', oldRequest = false,method) {
		// let _this = this
		// 请求所有的接口都返回200，但是响应的实际状态码为服务器返回的state，我们需要在此作出回应
		let { ret } = response.data
		if (ret) {
			ret.code = ret.code && ret.code.toString()

			if (ret.code == '0') {  //请求成功
				callback(response)
			}

			else if (ret.code == '00100') {  //token无效,要重新登录
				this.login(function() {
					my.hideLoading();
					console.log(';;;;-----',url,data,headers, dataType, oldRequest)
					// _this.post(url, data, headers, dataType, oldRequest)
				}, function() {
					my.hideLoading()
					// errFunc(response)
				},url, data,headers,dataType,oldRequest,method)
			}
			else if (ret.code == '00128') {  //未绑定手机号
				callback(response)
				if (url != '/coupon/exchangeCoupon') {
					my.redirectTo({
						url: '/pages/user/bindPhone/bindPhone'
					});
				} else {
					return;
				}
			}
			else {
				errFunc(response)
			}
		}
		else {
			errFunc(response)
		}

		// switch (state) {
		// 	case '201':
		// 		callback({ state: state, msg: msg || '系统异常', data: data || [], })
		// 		my.alert({ title: '提示', content: msg || '系统异常' });
		// 		break;
		// 	case '203':
		// 	case '206':
		// 		callback({ state: state, msg: msg || '未登录', data: data || [], })
		// 		my.navigateTo({ url: '/pages/login/login' });
		// 		break;
		// 	case '210':
		// 	case '211':
		// 		callback({ state: state, msg: msg || '请求参数错误', data: data || [], })
		// 		my.alert({ title: '提示', content: msg || '请求参数错误' });
		// 		break;
		// 	case '202':
		// 	case '204':
		// 		callback({ state: state, msg: msg || 'token失效', data: data || [], })
		// 		// 重新调用登录接口
		// 		await this.login()
		// 		this.post(this.url, this.data)
		// 		break;
		// 	case '200':
		// 	default:
		// 		callback(response)
		// }
	},
	intercepterError(err, callback) {
		// request过程中的异常处理
		switch (err.error) {
			case 11:
				callback({ code: 11, message: '无权跨域' })
				if (env === 'production') {
					my.showToast({ type: 'fail', content: '服务器繁忙，请稍后再试~' });
				} else {
					my.showToast({ type: 'fail', content: '无权跨域' });
				}
				break;
			case 12:
				callback({ code: 12, message: '网络出错' })
				if (env === 'production') {
					my.showToast({ type: 'fail', content: '服务器繁忙，请稍后再试~' });
				} else {
					my.showToast({ type: 'fail', content: '网络出错' });
				}
				break;
			case 13:
				callback({ code: 13, message: '超时' })
				if (env === 'production') {
					my.showToast({ type: 'fail', content: '服务器连接超时，请稍后再试~' });
				} else {
					my.showToast({ type: 'fail', content: '超时' });
				}
				break;
			case 14:
				callback({ code: 14, message: '解码失败' })
				if (env === 'production') {
					my.showToast({ type: 'fail', content: '服务器连接超时，请稍后再试~' });
				} else {
					my.showToast({ type: 'fail', content: '解码失败' });
				}
				break;
			case 19:
				callback({ code: 19, message: 'HTTP错误' })
				if (env === 'production') {
					my.showToast({ type: 'fail', content: '服务器连接超时，请稍后再试~' });
				} else {
					my.showToast({ type: 'fail', content: 'HTTP错误' });
				}
				break;
			case 20:
				callback({ code: 20, message: '请求已被停止/服务端限流' })
				if (env === 'production') {
					my.showToast({ type: 'fail', content: '服务器连接超时，请稍后再试~' });
				} else {
					my.showToast({ type: 'fail', content: '请求已被停止/服务端限流' });
				}
				break;
		}
	},
}