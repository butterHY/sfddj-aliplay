Page({
  data: {},
  onLoad: function (options) {
      this.setData({
        link: options.link,
        link: `https://sfddj.sobot.com/chat/h5/v2/index.html?sysnum=7a02fc9cf20d4c59947a5937837851c1&uname=` + options.uname + '&groupid=a9b3ae2b38dd4a80bbb7a7669fb36919'
      });
  },
});
