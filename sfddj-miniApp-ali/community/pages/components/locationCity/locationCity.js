import locAddr from '/community/service/locAddr.js';
const myApp = getApp();

Component({
  mixins: [],
  data: {
    title: '专属于你的附近之精彩',
    locInfo: {
      loading: false,
      longitude: '',
      latitude: '',
      city: '', 
      addressAll: '',
      addressJson: {},
      pois: [],
      streetShow: '',
      streetLoc: ''
    }
  },
  props: {},

  didMount() { 
   
    const _this = this; 
    let userLocInfo = myApp.globalData.userLocInfo; 
     console.log('didMount', userLocInfo)

    if ( this.jsonNull(userLocInfo) == 0 ) {
      console.log('重新定位')
      locAddr.location((res)=> {
        _this.setData({
          locInfo: res
        });  
        // 设置缓存并设置全部变量的值 globalData.userLocInfo 
        myApp.setLocStorage(_this.data.locInfo);
      });
    }
    else {
      _this.setData({
        locInfo: userLocInfo
      })
    } 
  },

  didUpdate() { 
    const _this = this; 
    let userLocInfo = myApp.globalData.userLocInfo; 
    console.log('didUpdate', userLocInfo)
  },

  didUnmount() { },

  methods: {
    goLocationCity() {
      my.navigateTo({ url: '../addressLoc/addressLoc' });
    }, 

    jsonNull(json) {
      let num = 0;
      for(let i in json){  
        num++; 
      } 
      return num;
    }

  },
});
