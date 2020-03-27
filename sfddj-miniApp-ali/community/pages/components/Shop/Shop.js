// 店铺组件
// 可用在店铺列表中的某一项

Component({
  mixins: [],
  data: {},
  props: {},
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    onEnterClick(e) {
      my.navigateTo({ url: '../shop/shop?id=' + e.target.dataset.id });
    }
  },
});
