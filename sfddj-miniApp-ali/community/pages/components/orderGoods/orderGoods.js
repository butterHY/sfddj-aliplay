import api from '/api/api';

Component({
  mixins: [],
  data: {
        staticsImageUrl: api.staticsImageUrl,
        baseImageUrl: api.baseImageUrl,
        goodsList: [],
  },
  props: {},
  didMount() {
      this.setData({
          goodsList: this.props.goodsList
      })
  },
  didUpdate() {},
  didUnmount() {},
  methods: {},
});
