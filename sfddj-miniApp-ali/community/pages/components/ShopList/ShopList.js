import Shop from '/community/service/shop';

Component({
  mixins: [],
  data: {
    list: []
  },
  props: {},
  didMount() {
    this.shop = Shop.init('shop', this);
    this.nextPageIdx = 0;
    this.loadMore();
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    loadMore() {
      my.getStorage({ 
        key: 'locationInfo',  
        success: function(loc) {
          if(loc && loc.data && loc.data.latitude && loc.data.longitude) {
            // TODO: 
          }
        } 
      });


      this.shop.gets(11, 22, this.nextPageIdx, (res) => {
        if(res && res.data && res.data.data) {
          if(res.data.data.length) {
            this.nextPageIdx++;
          }
          this.$spliceData({
            list: [this.data.list.length, 0, ...res.data.data]
          });
        } else {
          my.alert({
            title: '提示',
            content: '系统忙，请稍后再试'
          });
        }
      });
    }
  },
});
