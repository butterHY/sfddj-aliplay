// 定位设置

import http from '/api/http';
import api from '/api/api';

let LocAddr = {
	locInfo: {},

	// 支付宝定位获取经纬度 在执行 GDCity 获取详情地址信息
	location(fn) {
		const _this = this;
		my.showLoading();
		my.getLocation({
			type: 1,
			success(res) {
				// console.log(res);
				my.hideLoading();
				_this.locInfo.city = res.city;
				_this.locInfo.longitude = res.longitude;
				_this.locInfo.latitude = res.latitude;
				_this.locInfo.loading = false; 

				// 高德api定位
				_this.GDCity('', function(addr) {
					if(fn) fn(addr);
				});
			},
			fail() {
				my.hideLoading();
				console.log('定位失败!')
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
			
			let regeo = res.data.regeocode; 
			let _addressComponent = regeo.addressComponent;
			let _area = _addressComponent.province + _addressComponent.city + _addressComponent.district;
			let _streetNumber = _addressComponent.streetNumber;
			let _building = _addressComponent.building;
			let _streetShow = regeo.formatted_address.split( _area )[1];
			let _streetLoc = _streetNumber.location;
			let _city = _addressComponent.city.length > 0 ? _addressComponent.city : _addressComponent.province;

			_locInfo.loading = true;
			_locInfo.addressJson = _addressComponent;
			_locInfo.district = _addressComponent.district;
			_locInfo.addressAll = regeo.formatted_address;
			_locInfo.pois = regeo.pois;

			_locInfo.streetShow = _streetShow;
			_locInfo.streetLoc = _streetLoc;
			_locInfo.city = _city;   

			_this.setLocStorage(_locInfo, function() { 
				// console.log('缓存好了', _locInfo); 
				my.hideLoading();
				if (fn) fn(_locInfo);
			}); 

		}, (err) => {
			my.hideLoading();
			console.log(err)
		})
	},

	// 设置缓存数据
	setLocStorage(data, fn) { 
		// console.log('locAddr-setLocStorage', data ) 
		my.setStorage({
			key: 'locationInfo',
			data: data,
			success: function (res) { if (fn) fn(); },
			fail: function(err) {
				console.log('缓存失败了',err)
			}
		});
	},
}

export default LocAddr;