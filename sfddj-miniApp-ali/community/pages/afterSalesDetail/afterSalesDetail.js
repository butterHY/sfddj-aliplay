import api from '/api/api';

Page({
  data: {
    staticsImageUrl: api.staticsImageUrl,
    baseImageUrl: api.baseImageUrl,
    imageList: ['', '', '', '']
  },
  onLoad() { },

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
