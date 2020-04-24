Component({
  mixins: [],
  data: {
    title: '商家公告',
    notice: `据气象部门报道，今年第四号台风“妮怛”将严重影响广东，带来强风与强降雨。恶劣天气将对本网正常配送工作带来影响，部分订单配送或有延迟。在保证快递员人身安全及订单货物安全的前提下，我们将按照下单先后顺序尽快为您配送，造成不便，我们深感抱歉，敬请谅解。`
  },
  props: {
     storeNotice: ''
  },
  didMount() {
    this.setData({
      notice: this.props.storeNotice
    }) 
  },
  didUpdate() {},
  didUnmount() {},
  methods: {},
});
