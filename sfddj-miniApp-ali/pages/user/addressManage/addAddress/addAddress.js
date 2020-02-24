// var _myShim = require('..........my.shim');
// pages/user/addressManage/addressManage.js 
var constants = require('../../../../utils/constants');
var stringUtils = require('../../../../utils/stringUtils');
var sendRequest = require('../../../../utils/sendRequest');
var cityDataAll = require('../../../../utils/city.data-3');
var utils = require('../../../../utils/util');
var cityData = cityDataAll.cityData3;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    customItem: '全部',
    name: '',
    mobile: '',
    detailAddr: '',
    originalAddr: {},
    pageType: 0,
    setDefault: false,
    baseImgLocUrl: constants.UrlConstants.baseImageLocUrl,
    cityData: cityData,
    value: [0, 0, 0],
    addrMenuShow: false,
    addrInfo: ["省、", "市、", "区"], //省市区信息
    changeMenu: false, //记录有没有选过地址
    valueStr: [0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //pageType: 0:新建 1:编辑地址
    var pageType = 0;
    var addressStr = "";
    // utils.getNetworkType(this);
    if (options.pageType == 1) {
      pageType = 1;
      addressStr = options.originalAddr;
      my.setNavigationBar({
        title: '编辑地址'
      });
      var addrInfo = [];
      var addressInfo = {};
      try {
        addressInfo = JSON.parse(addressStr);
        addrInfo[0] = addressInfo.province;
        addrInfo[1] = addressInfo.city;
        addrInfo[2] = addressInfo.area;
      } catch (e) {
        addressInfo = {};
        addrInfo = [];
      }
      this.setData({
        originalAddr: addressInfo,
        pageType: pageType,
        addrInfo: addrInfo,
        name: addressInfo.fullName,
        mobile: addressInfo.mobile,
        detailAddr: addressInfo.address,
        setDefault: addressInfo.isDefault
      });
      this.sortAdd(1);
    } else {
      pageType = 0;
      my.setNavigationBar({
        title: '新建地址'
      });
      this.sortAdd(0);
    }
  },
  
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    });
  },
  handleNameInput: function (e) {
    this.setData({
      name: e.detail.value
    });
  },
  handlePhoneInput: function (e) {
    this.setData({
      mobile: e.detail.value
    });
  },
  handleAddrInput: function (e) {
    this.setData({
      detailAddr: e.detail.value
    });
  },

  // 分类省市区
  sortAdd(type) {
    var that = this;

    var cityData = this.data.cityData;
    if (type == 0) {
      that.setData({
        provinces: cityData,
        city: cityData[0].children,
        area: cityData[0].children[0].children
      });
    } else {
      var addrInfo = that.data.addrInfo;
      var provinces = [],
          city = [],
          area = [],
          provinceNum = 0,
          cityNum = 0,
          areaNum = 0;
      for (var j = 0, len = cityData.length; j < len; j++) {
        var data = cityData[j];
        if (addrInfo[0] == data.text || addrInfo[0].indexOf(data.text.substring(0, 3)) > 0) {
          provinceNum = j;
          for (var k = 0, leng = data.children.length; k < leng; k++) {
            var dataS = data.children[k];
            if (addrInfo[1] == dataS.text || addrInfo[1].indexOf(dataS.text.substring(0, 3)) > 0) {
              cityNum = k;
              for (var l = 0, lengt = dataS.children.length; l < lengt; l++) {
                var dataSS = dataS.children[l];
                if (addrInfo[2] == dataSS.text || addrInfo[2].indexOf(dataSS.text.substring(0, 4)) > 0) {
                  areaNum = l;
                }
              }
            }
          }
        }
      }

      that.setData({
        provinces: cityData,
        city: cityData[provinceNum].children,
        area: cityData[provinceNum].children[cityNum].children,
        value: [provinceNum, cityNum, areaNum],
        // loadComplete: true,
        // loadFail: false
      });
    }
  },

  //点击省市区弹出选择弹框
  showMenu() {
    var that = this;

    if (that.data.addrMenuShow) {
      return;
    }
    that.setData({
      addrMenuShow: true
    });
  },

  // 弹出选街道弹窗
  showAddrStreet() {
    var that = this;
    if (that.data.addrInfo && that.data.addrInfo.length > 0) {
      that.setData({
        streetMenuShow: true
      });
    } else {
      that.setData({
        showToast: true,
        showToastMes: '请先选择地区'
      });
      setTimeout(function () {
        that.setData({
          showToast: false
        });
      }, 1500);
    }
  },

  // 关闭选地址弹窗
  closeAddrMenu() {
    var that = this;
    that.setData({
      addrMenuShow: false
    });
  },

  // 关闭街道选择弹窗
  closeStreetMenu() {
    var that = this;
    that.setData({
      streetMenuShow: false
    });
  },

  //街道确定
  streetSure() {
    var that = this;
    that.setData({
      streetMenuShow: false,
      streetInfo: that.data.street[that.data.valueStr[0]].text
    });
  },

  citySure(e) {
    var that = this;
    var value = that.data.value;
    var addrInfo = [];
    addrInfo[0] = that.data.provinces[value[0]].text;
    addrInfo[1] = that.data.city[value[1]].text;
    addrInfo[2] = that.data.area[value[2]] ? that.data.area[value[2]].text : '';
    that.setData({
      addrInfo: addrInfo,
      addrMenuShow: false
    });
  },

  // 选择地址时的方法
  changeAddr(e) {
    var that = this;
    var value = e.detail.value;
    var provinces = that.data.provinces;
    var city = that.data.city;
    var area = that.data.area;
    var provinceNum = value[0];
    var cityNum = value[1];
    var countyNum = value[2];
    that.data.changeMenu = true;
    // 如果省份选择项和之前不一样，表示滑动了省份，此时市默认是省的第一组数据，
    if (that.data.value[0] != provinceNum) {
      // var id = provinces[provinceNum].id
      // if(that.data.)/
      that.setData({
        value: [provinceNum, 0, 0],
        city: that.data.cityData[provinceNum].children,
        area: that.data.cityData[provinceNum].children[0].children ? that.data.cityData[provinceNum].children[0].children : []
      });
    } else if (that.data.value[1] != cityNum) {
      // 滑动选择了第二项数据，即市，此时区显示省市对应的第一组数据
      // var id = citys[cityNum].id
      that.setData({
        value: [provinceNum, cityNum, 0],
        area: that.data.cityData[provinceNum].children[cityNum].children ? that.data.cityData[provinceNum].children[cityNum].children : []
      });
    } else {
      // 滑动选择了区
      that.setData({
        value: [provinceNum, cityNum, countyNum]
      });
    }
  },

  changeStreet(e) {
    var that = this;
    var valueStr = e.detail.value;
    var street = that.data.street;
    var streetNum = valueStr[0];
    if (that.data.valueStr[0] != streetNum) {
      that.setData({
        valueStr: [streetNum]
      });
    }
  },

  addAddr: function () {
    if (stringUtils.isNotEmpty(this.data.name) && stringUtils.isNotEmpty(this.data.mobile) && stringUtils.isNotEmpty(this.data.detailAddr)) {
      if (stringUtils.isPhoneNumber(this.data.mobile)) {
        if (this.data.addrInfo[0] == "省、") {
          my.showToast({
            content: '请选择省市区'
          });
          return;
        }

        var payLoad = {
          realName: this.data.name,
          mobile: this.data.mobile,
          province: this.data.addrInfo[0],
          city: this.data.addrInfo[1],
          area: this.data.addrInfo[2],
          AccAddress: this.data.detailAddr,
          isDefault: this.data.setDefault ? '1' : '0'
        };
        if (this.data.pageType == 1) {
          //修改地址时需要传入原始地址的addressId
          payLoad.addressId = this.data.originalAddr.id;
        }
        my.showLoading({
          content: 'loading'
        });
        sendRequest.send(this.data.pageType == 0 ? constants.InterfaceUrl.ADD_ADDRESS : constants.InterfaceUrl.MODIFY_ADDRESS, payLoad, function (res) {
          my.hideLoading();
          my.showToast({
            content: '地址添加成功！'
          });
          my.navigateBack();
        }, function (err) {
          my.hideLoading();
        });
      } else {
        my.showToast({
          content: '号码格式错误！'
        });
      }
    } else {
      my.showToast({
        content: '请保证信息填写完整！'
      });
    }
  },

  setDefault: function () {
    this.setData({
      setDefault: !this.data.setDefault
    });
  }
});