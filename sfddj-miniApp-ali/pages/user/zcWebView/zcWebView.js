Page({
  data: {},
  onLoad: function (options) {
      this.setData({
        link: options.link,
        link: `https://ten.sobot.com/chat/h5/v2/index.html?sysnum=0662d9d57e404c098245fae5b2b8d056&uname=` + options.uname
      });
  },
});
