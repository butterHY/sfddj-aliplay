let constants = require('../../utils/constants');

Page({
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl
  },
  BackToHome() {
    my.switchTab({
      url: '/pages/home/home'
    })
  },
});
