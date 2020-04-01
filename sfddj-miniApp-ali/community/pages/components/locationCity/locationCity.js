import locAddr from '/community/service/locAddr.js';

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
        if( JSON.stringify(res.data).length > 2 ) {
          _this.setData({
            locInfo: res.data
          })
        }
        else {  
          locAddr.location((res)=> {
            _this.setData({
              locInfo: res
            })
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
    }
  },
});
