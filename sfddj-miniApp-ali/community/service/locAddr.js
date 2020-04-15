// 定位设置

import http from '/api/http';
import api from '/api/api';

let LocAddr = {
	locInfo: {},

	// 支付宝定位获取经纬度 在执行 GDCity 获取详情地址信息
	location(fn, failFn) {
		const _this = this;
		my.showLoading();
		my.getLocation({
			type: 1,
			success(res) {
				// console.log('my.getLocation',res);
				my.hideLoading();
				_this.locInfo.city = res.city;
				_this.locInfo.longitude = res.longitude;
				_this.locInfo.latitude = res.latitude;
				_this.locInfo.loading = false; 

				// 高德api定位
				_this.GDCity('', function(addr) {
					// console.log('逆地址', addr); 
					if(fn) fn(addr);
				});
			},
			fail() {
				my.hideLoading();
				// console.log('定位失败!')
				// 获取缓存的数据，如果缓存有数据, 不至于定位失败后没有数据
				// my.getStorage({
				//   key: 'locationInfo',
				//   success: (result) => {
				// 	let data = result.data ? result.data : {};
				// 	getApp().globalData.userLocInfo = data;
				// 	if(fn) fn(data);
				//   }
				// }); 
				if (failFn)failFn();
			},
		})
	},

	// 高德通过经纬度获取城市 详细信息
	GDCity(data, fn) { 
		const _this = this;  
		let _locInfo = data ? data : _this.locInfo;
		let _location = `${_locInfo.longitude}, ${_locInfo.latitude}`;  

		// if ( _locInfo.loading ) return;  // loading 为true 不逆向，说明缓存有数据 但是城市数据固定 不会动态刷新

		my.showLoading();
		// 逆向地理编码
		http.get(api.GDMap.REGEO, {
			key: api.GDMap.KEY,
			location: _location,
			extensions: 'all'
		}, (res) => {
			// console.log('逆向地理',res.data.regeocode)
			// console.log('逆向地理-_location', _location)
			
			let regeo = res.data.regeocode; 
			let _addressComponent = regeo.addressComponent;
			// 省市区数据
			let _area = _addressComponent.province + _addressComponent.city + _addressComponent.district;
			// 街道数据
			let _street = _addressComponent.township;
			// 含有街道地址
			let addr_hasStreeet = regeo.formatted_address.split( _area )[1]; 
			// 不含有街道地址
			let addr_noStreeet = addr_hasStreeet.split( _street )[1];

			let _streetNumber = _addressComponent.streetNumber; 
			let _streetShow = addr_noStreeet;
			// let _streetLoc = _streetNumber.location;
			let _streetLoc = _location;
			let _city = _addressComponent.city.length > 0 ? _addressComponent.city : _addressComponent.province;

			_locInfo.loading = true;
			// 保存全部数据 备用
			_locInfo.addressJson = _addressComponent;
			// 附件1000米 de地址
			_locInfo.pois = regeo.pois; 
			// 经纬度
			_locInfo.streetLoc = _streetLoc;
			// 省
			_locInfo.province = _addressComponent.province;   
			// 市
			_locInfo.city = _city;    
			// 区
			_locInfo.district = _addressComponent.district;
			// 街道
			_locInfo.street = _street;    
			// 全部地址
			_locInfo.addressAll = regeo.formatted_address; 
			// 详细地址
			_locInfo.streetShow = _streetShow;
 
			my.hideLoading();
			if (fn) fn(_locInfo);

		}, (err) => {
			my.hideLoading();
			console.log(err)
		})
	}
}

export default LocAddr;