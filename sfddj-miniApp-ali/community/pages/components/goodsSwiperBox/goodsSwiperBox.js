 import api from '/api/api';
 Component({
  mixins: [],
  data: {
    wrapWidth: 375,
    imgList: [],
    imgMode: 'aspectFill',
    indicatorDots: false,
    autoplay: true,
    circular: true,
    dot_current: 1,
    dot_count: 1,
     
  }, 
  props: { 
    goodsImagePath: []
  },

  didMount() { 
    this.init();
  },

  didUpdate() {},
  didUnmount() {},
  methods: {
    init() {
      const _this = this;
      _this.getWidth();
      _this.setImgList();
      _this.setDotsShow(); 
       
    },
    getWidth() {
      const _this = this;
      my.createSelectorQuery().select('.goodsSwiperBox').boundingClientRect().exec((ret) => {
          // console.log(ret)
          _this.setData({
            wrapWidth: ret[0].width
          })
      }); 
    },

    swiperChange(e) {
      const _this = this;
      // console.log(e) 
       this.setData({
        dot_current: e.detail.current + 1
      })
    },

    setDotsShow() {
      const _this = this;
      this.setData({
        dot_count: _this.data.imgList.length
      })
    },

    setImgList() {
      const _this = this;
      let _imgPath = this.props.goodsImagePath;
      let _imgList = []; 
      let _autoplay = true;

      if (_imgPath.length == 1) {
        _autoplay = false;
      }

      for (let i=0; i<_imgPath.length; i++) {
        _imgList.push( api.baseImageUrl + _imgPath[i] )
      } 

      _this.setData({
        imgList: _imgList,
        autoplay: _autoplay
      });  
      // console.log( this.data.imgList )
    },

    previewImage(e) {
      const _this = this;
      let index = e.target.dataset.imgIndex; 
      my.previewImage({
        current: index,
        urls: _this.data.imgList,
      });
    }, 
  },
});
