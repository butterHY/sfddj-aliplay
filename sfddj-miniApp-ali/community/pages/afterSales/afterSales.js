Page({
  data: {
      showReason: false,
      reasonList: ['我不想要了', '拍错/多拍', '不新鲜/品质差/口味不佳', '物流时间太久了', '发错货', '漏送', '缺斤少两', '商品与描述不符', '配送员态度差'],
      reasonIndex: 12,
      reasonItem: '',
      refoundSum: 0,   //退款金额
      contactMobile: '',     //联系手机号
      problemMes: '',      //问题描述
  },
  onLoad() {
      this.setData({
          refoundSum: 63.3,
          contactMobile: 18888888888
      })
  },
    //   申请原因
    showReasonFn(){
        this.setData({
            showReason: true
        })
    },

    // 选择原因
    tapReason(e){
        let { index } = e;
        this.setData({
            reasonIndex: index,
            reasonItem: this.data.reasonList[index]
        })
    },

    reasonSure(){
        this.setData({
            showReason: false
        })
    },

    // 问题描述
    problemInput(e){
        this.setData({
            [e.target.field] : e.detail.vaule
        })
    },

    // 提交申请
    submit(){
        if(!this.data.reasonItem) {
            my.showToast({
                content: '请选择申请原因'
            })
            return
        }
        // 成功后跳转到售后详情页
        my.navigateTo({
            url: '/community/pages/afterSalesDetail/afterSalesDetail'
        });
    },
});
