// 商品列表中的某一项
// 接收一个 data 属性参数，即要展示的商品的数据。

Component({
  mixins: [],
  data: {
    
  },
  props: {
    data: {},
    canclick: true,
    spacingClass: 'spacing'
  },
  didMount() {
    if(!this.constructor.idx) {
      this.constructor.idx = 1;
    }
    this.setData({
      'imgidx': this.constructor.idx++
    });
    my.createSelectorQuery().select('#goodsitemimgbox_' + this.data.imgidx).boundingClientRect().exec((ret) => {
      this.setData({
        styleHeight: 'height:' + ret[0].width
      });
    });
    
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    onTap(e) {
      if(this.props.canclick) {
        my.navigateTo({ url: '../goodsdetail/goodsdetail?id=' + e.target.dataset.id });
      }
    },
    onCartClick() {
      if(this.props.canclick) {
        console.log('ggggggg');
      }
    }
  }
});
