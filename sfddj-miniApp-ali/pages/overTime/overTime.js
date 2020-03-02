let constants = require('../../utils/constants');

Page({
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl
  },
  navigateBack() {
    my.navigateBack()   
  }
});
