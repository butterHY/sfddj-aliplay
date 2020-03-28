Component({
  mixins: [],
  data: {
      userInfoPop: false,
      sexualList: [{text: '女士'}, {text: '男士'}],
      sexualIndex: 0,
  },
  props: {},
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    // 填写个人信息
    writeUserData(){
        this.setData({
            userInfoPop: true
        })
    },

    // 关闭弹窗
    closeUserPop(){
        this.setData({
            userInfoPop: false
        })
    },

    // 性别选择
    sexualTap(e) {
        let {index} = e.currentTarget.dataset;
        if(index != this.data.sexualIndex) {
            this.setData({
                sexualIndex: index,
            })
        }
    },

    // 姓名/手机号输入时
    onItemInput(e){
        this.setData({
            [e.target.dataset.field]: e.target.dataset.value
        })
    },

    // 姓名/手机号清除时
    onClear(e){
        this.setData({
            [e.target.dataset.field]: ''
        })
    },
  },
});
