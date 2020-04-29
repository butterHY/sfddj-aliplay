const utils = require('/utils/util');

import { get, post, api } from '/api/http';

Page({
    data: {
        baseImageUrl: api.baseImageUrl,
        showReason: false,
        reasonList: ['我不想要了', '拍错/多拍', '不新鲜/品质差/口味不佳', '物流时间太久了', '发错货', '漏送', '缺斤少两', '商品与描述不符', '配送员态度差'],
        reasonIndex: 100,
        reasonItem: '',
        refundSum: 0,   //退款金额
        contactMobile: '',     //联系手机号
        problemMes: '',      //问题描述
        imageList: [],       // 上传的图片
        orderSn: '',
        refundObj: {},       // 退款数据
        isSubmiting: false,    //是否正在提交
    },
    onLoad(options) {
        let { orderSn } = options;
        if (orderSn) {
            this.setData({
                orderSn
            })
            this.getRefundData();
        } else {

        }
        //   this.setData({
        //       refoundSum: 63.3,
        //       contactMobile: 18888888888
        //   })
    },

    // 获取申请售后的信息
    getRefundData() {
        let that = this;
        let data = {
            orderSn: this.data.orderSn
        };
        get(api.O2O_ORDER.getAfterData, data, res => {
            let result = res.data.data ? res.data.data : {};
            console.log(result, res)
            if (Object.keys(result).length > 0) {
                this.setData({
                    refundObj: result,
                    contactMobile: result.refundPhone
                })
            }
        }, err => { })
    },

    //   申请原因
    showReasonFn() {
        this.setData({
            showReason: true
        })
    },

    // 选择原因
    tapReason(e) {
        let { index } = e;
        this.setData({
            reasonIndex: index,
            reasonItem: this.data.reasonList[index]
        })
    },

    reasonSure() {
        this.setData({
            showReason: false
        })
    },

    // 手机号输入时
    phoneInput(e) {
        let value = this.useCheckValue(e.detail.value)
        this.setData({
            [e.target.dataset.field]: value
        })
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
        // let telePhoneNuber = this.data.contactMobile
        // telePhoneNuber = telePhoneNuber && telePhoneNuber.replace(/\-/g, '')
        let isWrongPhone = utils.checkPhoneVal(this.data.contactMobile);

        // let isWrongArea = this.data.isWrongArea
        this.setData({
            isWrongPhone: isWrongPhone
        })
        // 
        let isMesWrong = false;
        // 判断手机号是否填写正确
        if (!isWrongPhone) {
            // 
            my.showToast({
                content: '号码格式错误'
            })
            isMesWrong = true;
        }
        return isMesWrong
    },

    // 问题描述
    problemInput(e) {
        this.setData({
            [e.target.field]: e.detail.vaule.trim()
        })
    },

    // 提交申请
    submit() {
        let checkPhone = this.checkAddrMesStatus();
        if (!this.data.reasonItem) {
            my.showToast({
                content: '请选择申请原因'
            })
            return
        }
        if (checkPhone) {
            return;
        }

        this.submitRefund();
    },

    submitRefund() {
        let that = this;
        let { orderSn, reasonItem, contactMobile, problemMes, imageList, isSubmiting } = this.data;
        let refundProof = imageList.join(',');
        let data = {
            orderSn,
            refundReason: reasonItem,
            refundPhone: contactMobile,
            refundMemo: problemMes,
            refundProof
        };

        if (!isSubmiting) {
            // 上锁
            this.setData({
                isSubmiting: true
            })
            post(api.O2O_ORDER.refundOrder, data, res => {
                // 开锁
                this.setData({
                    isSubmiting: false
                })
                if (res.data.ret && res.data.ret.code == '0') {
                    my.showToast({
                        content: '申请成功'
                    })
                    // 跳转去售后详情页
                    my.redirectTo({
                        url: `/community/pages/afterSalesDetail/afterSalesDetail?orderSn=${orderSn}`
                    });
                }
            }, err => {
                // 开锁
                this.setData({
                    isSubmiting: false
                })
                my.showToast({
                    content: err
                })
            })
        }
    },

    uploadImage() {
        let that = this;
        let { imageList } = this.data;
        utils.uploadImage(2, function (res) {
            imageList.push(res);
            that.setData({
                imageList: imageList,
            });
        }, function (res) {
        });
    },

    // 删除图片

    deleteImage: function (e) {
        let { index } = e.currentTarget.dataset;
        let that = this;
        my.confirm({
            title: '提示',
            content: '确定要删除图片',
            success: function (res) {
                if (res.confirm) {
                    that.deleteImageWorkOrder(that.data.imageList[index], index)
                } else if (res.cancel) {
                }
            }
        });
    },

    // 删除图片
    deleteImageWorkOrder: function (imgUrl, index) {
        let that = this
        let data = { imgUrl: imgUrl }
        let { imageList } = this.data;
        post(api.DELETE_IMAGE, data, function (res) {
            //console.log(res)
            if (res.data) {
                my.showToast({
                    content: '删除成功'
                });
                imageList.splice(index, 1)
                that.setData({
                    imageList: imageList
                })
            } else {
                my.showToast({
                    content: '删除失败，未找到图片',
                })
            }
        }, function (err) {
            my.showToast({
                content: '删除失败',
            })
        })
    },
});
