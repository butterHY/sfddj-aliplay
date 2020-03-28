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
      this.shop.gets(11, 22, this.nextPageIdx, (res) => {
        if(res.data && res.data.data) {
          if(res.data.data.length) {
            this.nextPageIdx++;
          }
          this.$spliceData({
            list: [this.data.list.length, 0, ...res.data.data]
          });
        }
      });
    }
  },
});
