import http from '/api/http';
import api from '/api/api';

Component({
  mixins: [],
  data: {
    totalPrice: 0,
    totalPrice_old: 0,
    disabledOff: false,
    showBottom: false,
  },
  props: {},
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    onButtomBtnTap() {
      this.setData({
        showBottom: true,
      });
    },

    onPopupClose() {
      this.setData({ 
        showBottom: false,
      });
    },

    getCarInfo() {
      const _this = this;

    }
  },
});
