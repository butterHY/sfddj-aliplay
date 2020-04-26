// 店铺组件
// 可用在店铺列表中的某一项
import { defaultAvatar } from '/api/api';

Component({
  mixins: [],
  data: {
    defaultAvatar,     //默认头像
  },
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
