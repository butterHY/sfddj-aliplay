import api from '/api/api';
const utils = require('/utils/util');

Component({
    mixins: [],
    data: {
        userInfoPop: false,
        sexualList: [{ text: '女士' }, { text: '先生' }],
        sexualIndex: 0,    //用户姓别选择索引
        userName: '',    //用户姓名信息
        userMobile: '',      //用户电话信息
        hasUserInfo: false,
        completeUserName: '',
        shipperMobile: '',
        maxPhoneLength: 16,     // 电话最长数
    },
    props: {},
    didMount() { },
    didUpdate() { },
    didUnmount() { },
    methods: {
        // 填写个人信息
        writeUserData() {
            this.setData({
                userInfoPop: true
            })
        },

        // 关闭弹窗
        closeUserPop() {
          // 还得清空输入的信息
            this.setData({
                userInfoPop: false,
                completeUserName: '',
                shipperMobile: '',
                userName: '',
                userMobile: '',
                hasUserInfo: false,
            })
        },

        // 性别选择
        sexualTap(e) {
            let { index } = e.currentTarget.dataset;
            if (index != this.data.sexualIndex) {
                this.setData({
                    sexualIndex: index,
                })
            }
            else {
                this.setData({
                    sexualIndex: 3
                })
            }
        },

        // 姓名输入时
        onItemInput(e) {
            this.setData({
                [e.target.dataset.field]: e.detail.value
            })
        },

        // 手机号输入时
        phoneInput(e) {
            let value = this.useCheckValue(e.detail.value)
            this.setData({
                [e.target.dataset.field]: value
            })
        },

        // 姓名/手机号清除时
        onClear(e) {
            this.setData({
                [e.target.dataset.field]: ''
            })
        },

        // 填写个人信息确定
        writeComplete() {
            // 先判断有没有填写姓名
            if (!this.data.userName) {
                my.showToast({
                    content: '请填写您的姓名'
                });
                return;
            }

            // 判断电话号码不能为空
            if (!this.data.userMobile) {
                my.showToast({
                    content: '请填写正确的电话信息'
                });
                return;
            }

            let completeUserName = this.data.sexualIndex < 2 ? this.data.userName + this.data.sexualList[this.data.sexualIndex].text : this.data.userName;
            let shipperMobile = this.data.userMobile;
            let checkPhone = this.checkAddrMesStatus()
            if(checkPhone) {
                return;
            }

            this.setData({
                hasUserInfo: true,
                completeUserName,
                shipperMobile,
                userInfoPop: false
            })

            this.props.onWriteInfo({shipperName: completeUserName, shipperMobile})

        },

        // 验证手机号
        //v1.2.0 新增 检查输入过程，并格式化返回座机、手机 01386297
        useCheckValue(value) {
            if (!value) return
            value = value && value.toString() && value.replace(/[^\d]\-/g, '')
            let provinceLevelMunicipalityCode = api.provinceLevelMunicipalityCode,
                preNumber = value && value.charAt(0),
                // isLinePhone = preNumber && (preNumber === '0' || preNumber === '4');  // 0是国内直辖市,4是电信
                isLinePhone = preNumber && (preNumber === '0');  // 0是国内直辖市,4是电信,v1.4.0 移除400的'-'补全
            // isLinePhone = preNumber &&(preNumber === '0' || preNumber === '4' || preNumber === '8');  // 8是港澳
            // 有线电话（座机）校验
            if (isLinePhone) {
                // 检查是否是直辖市的区号，若是在执行删除，从4位变成3位，则跳过此段格式化
                if (value && value.length == 3 && this.data.userMobile.length < 3) {
                    let check = provinceLevelMunicipalityCode.some(item => item == value)
                    // 如果在区号内，则返回区号-号码
                    if (check) {
                        return `${value}-`
                    }
                }
                // 当手动删除区号之间的-时，输入后续值给加上, 4位判断直辖市
                // 同时，输入第4位也可以判断是否是其他的座机区号
                if (value && value.length == 4 && this.data.userMobile.length < 4) {
                    let preThree = value && value.substring(0, 3)
                    let check = provinceLevelMunicipalityCode.some(item => item == preThree)
                    if (check) {
                        return `${preThree}-${preThree.substring(3, preThree.length - 1)}`
                    } else {
                        // 若是不在直辖市内，则是其他的座机区号,输入后续值给加上
                        return `${value}-`
                    }
                }
                // 当手动删除区号间的-时
                if (value && value.length == 5) {
                    let check = value && value.indexOf('-') > -1 ? true : false
                    // 若是没有横杠，则加上
                    if (!check) {
                        let preThree = value && value.substring(0, 4)
                        return `${preThree}-${preThree.substring(4, preThree.length - 1)}`
                    }
                }
            } else {
                // 手机号码不以1开头，强制1开头
                // if (value && value.length == 1 && preNumber !== '1') {
                //   return '1'
                // }
                // v1.3.0调整 用户输入非1时，不做强制1开头，提示用户 01386297
                return value
            }
            return value
        },

        // 检查所填的信息是否正确
        checkAddrMesStatus() {
            // 检测电话
            let telePhoneNuber = this.data.userMobile
            telePhoneNuber = telePhoneNuber && telePhoneNuber.replace(/\-/g, '')
            let isWrongPhone = utils.checkPhoneVal(this.data.userMobile);

            // let isWrongArea = this.data.isWrongArea
            this.setData({
                isWrongPhone: isWrongPhone
            })
            // 
            let isMesWrong = false;
            // 判断手机号是否填写正确
            // if (isWrongPhone) {
            // 
            if (!isWrongPhone) {
                // 
                my.showToast({
                    content: '号码格式错误'
                })
                isMesWrong = true;
            }
            return isMesWrong
        },

    },
});
