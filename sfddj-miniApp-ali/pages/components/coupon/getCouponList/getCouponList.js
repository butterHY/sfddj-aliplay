const constants = require('../../../../utils/constants');
const sendRequest = require('../../../../utils/sendRequest');
let windWidth = my.getSystemInfoSync().windowWidth;

Component({
  mixins: [],
  data: {
    baseImageLocUrl: constants.UrlConstants.baseImageLocUrl,
    isBing: true,
  },
  props: {},
  didMount() {
    this.props
  },
  didUpdate() { },
  didUnmount() { },
  methods: {

    /**
   * 获取优惠券列表
   */
    getCouponList: function() {
      var that = this;
      this.setData({
        isLoadMore: true
      });
      sendRequest.send(constants.InterfaceUrl.CAN_RECEIVE_COUPON2, {}, function(res) {
        let couponList = res.data.result.couponDTOS;
        // var resOff = []
        that.setData({
          isBing: res.data.result.isBing
        });
        if (couponList) {
          couponList.forEach(function(item, index) {
            item.beginDateStr = that.formatTime(item.beginDate);
            item.endDateStr = that.formatTime(item.endDate);
          });
        }

        that.setData({
          couponList: couponList,
          isLoadMore: false
        });
      }, function(err) {
        that.setData({
          isLoadMore: false
        });
        my.showToast({
          content: err
        });
      });
    },

  },


});
