import { api, post } from '/api/http';
const dateFmt = require('/utils/dateformat');

Page({
  data: {
    staticsImageUrl: api.staticsImageUrl,
    baseImageUrl: api.baseImageUrl,
    result: {},
  },
  onLoad(options) {
    let { orderSn } = options;
    this.setData({
      orderSn
    })
    if (orderSn) {
      this.getResult();
    }
  },

  // 获取订单退款详情
  getResult() {
    let { orderSn } = this.data;
    let data = {
      orderSn
    };

    post(api.O2O_ORDER.refundOrderResult, data, res => {
      let result = res.data.data ? res.data.data : {};
      if (Object.keys(result).length > 0) {
        result.createDateStr = dateFmt.DateFormat.format(new Date(result.createDate), 'yyyy-MM-dd hh:mm');
        this.setData({
          result
        })
      }
    }, err => {
      my.showToast({
        content: err
      })
    })


  },


  /**
   * 查看图片
   */
  previewImg: function (e) {
    let { index } = e.currentTarget.dataset;
    let { imageList, baseImageUrl } = this.data;
    // 带有 http 则表示该视频或图片被禁用；
    let newUrls = imageList.map(value => {
      return value = baseImageUrl + value
    });

    let current = newUrls[index];

    my.previewImage({
      urls: newUrls,
      current: current
    })
  },
});
