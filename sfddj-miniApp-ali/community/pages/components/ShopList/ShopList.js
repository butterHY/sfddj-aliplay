import Shop from '/community/service/shop';

const app = getApp();

Component({
  mixins: [],
  data: {
    list: []
  },
  props: {},
  didMount() {
    this.shop = Shop.init(this);
    this.reload();
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    loadMore() {
      let loc = app.globalData.userLocInfo;
      if(loc && loc.longitude) {
        this.shop.gets(loc.longitude, loc.latitude, this.nextPageIdx, (res) => {
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
    reload() { // 重新加载
      this.nextPageIdx = 0;
      if(this.data.list) {
        this.$spliceData({
          list: [0]
        }, () => {
          this.loadMore();
        });
      }
    }
  },
});
