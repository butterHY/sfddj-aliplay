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

    my.getStorage({
      key: 'locationInfo', 
      success: function(res) {   
        if( res.data ) {
          _this.setData({
            locInfo: res.data
          })
        }
        else {  
          locAddr.location((res)=> {
            _this.setData({
              locInfo: res
            }); 
            
            // 设置缓存并设置全部变量的值 globalData.userLocInfo 
            myApp.setLocStorage(_this.data.locInfo);
          });
        }
      }
    });  
  },

  didUpdate() { },

  didUnmount() { },

  methods: {
    goLocationCity() {
      my.reLaunch({ url: '../addressLoc/addressLoc' });
    }, 
  },
});
