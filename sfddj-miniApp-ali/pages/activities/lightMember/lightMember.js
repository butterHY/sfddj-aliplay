Page({
  data: {
    isLightMember: true,
    showRuleStatus: false
  },
  onLoad() {
    my.setNavigationBar({
      title: '会员中心',
      backgroundColor: '#2b2d3e',
      // borderBottomColor,
      // image,
    })
  },
  isShowRule() {
    console.log(this.data.showRuleStatus)
    this.setData({
      showRuleStatus: !this.data.showRuleStatus
    })
  }
});
