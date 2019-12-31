const constant = require('../../../utils/constants.js');
const sendRequest = require('../../../utils/sendRequest.js');
import http from '../../../api/http.js'
import api from '../../../api/api.js'


Component({
  mixins: [],
  data: {
    baseImageLocUrl: constant.UrlConstants.baseImageLocUrl,
    activeIndex: 5,
    typeList: ['非常不满意', '不满意', '一般', '满意', '非常满意'],
    reasonList: [
      [{
        text: '售后申请不便',
        statusCode: 1001,
        status: 'APPLY_BOTHER_NOT_CONVENIENT'
      }, {
        text: '处理时间过长',
        statusCode: 1002,
        status: 'DISPOSE_TIME_LONG'
      }, {
        text: '结果不满意',
        statusCode: 1003,
        status: 'RESULT_BAD'
      }, {
        text: '关闭售后不合理',
        statusCode: 1004,
        status: 'CLOSE_AFTER_SALE_UNREASONABLE'
      }, {
        text: '电话联系超过3次',
        statusCode: 1005,
        status: 'PHONE_CONNECTION_THREE'
      }, {
        text: '服务态度差',
        statusCode: 1006,
        status: 'SERVICE_ATTITUDE_BAD'
      }],
      [{
        text: '售后申请不便',
        statusCode: 1001,
        status: 'APPLY_BOTHER_NOT_CONVENIENT'
      }, {
        text: '处理时间过长',
        statusCode: 1002,
        status: 'DISPOSE_TIME_LONG'
      }, {
        text: '结果不满意',
        statusCode: 1003,
        status: 'RESULT_BAD'
      }, {
        text: '关闭售后不合理',
        statusCode: 1004,
        status: 'CLOSE_AFTER_SALE_UNREASONABLE'
      }, {
        text: '电话联系超过3次',
        statusCode: 1005,
        status: 'PHONE_CONNECTION_THREE'
      }, {
        text: '服务态度差',
        statusCode: 1006,
        status: 'SERVICE_ATTITUDE_BAD'
      }],
      [{
        text: '售后申请不便',
        statusCode: 1001,
        status: 'APPLY_BOTHER_NOT_CONVENIENT'
      }, {
        text: '处理时间过长',
        statusCode: 1002,
        status: 'DISPOSE_TIME_LONG'
      }, {
        text: '电话联系超过3次',
        statusCode: 1005,
        status: 'PHONE_CONNECTION_THREE'
      }],
      [{
        text: '处理结果满意',
        statusCode: 2001,
        status: 'PROCESS_RESULT_GOOD'
      }, {
        text: '态度好服务棒',
        statusCode: 2002,
        status: 'SERVICE_ATTITUDE_GOOD'
      }, {
        text: '申请售后界面便捷',
        statusCode: 2003,
        status: 'APPLY_BOTHER_CONVENIENT'
      }, {
        text: '处理时间快',
        statusCode: 2004,
        status: 'PROCESS_TIME_QUICK'
      }],
      [{
        text: '处理结果满意',
        statusCode: 2001,
        status: 'PROCESS_RESULT_GOOD'
      }, {
        text: '态度好服务棒',
        statusCode: 2002,
        status: 'SERVICE_ATTITUDE_GOOD'
      }, {
        text: '申请售后界面便捷',
        statusCode: 2003,
        status: 'APPLY_BOTHER_CONVENIENT'
      }, {
        text: '处理时间快',
        statusCode: 2004,
        status: 'PROCESS_TIME_QUICK'
      }]
    ], //售后评价列表
    selectedList: [], //已选中的售后评价列表

    stableReasonList: [
      [{
        text: '售后申请不便',
        statusCode: 1001,
        status: 'APPLY_BOTHER_NOT_CONVENIENT'
      }, {
        text: '处理时间过长',
        statusCode: 1002,
        status: 'DISPOSE_TIME_LONG'
      }, {
        text: '结果不满意',
        statusCode: 1003,
        status: 'RESULT_BAD'
      }, {
        text: '关闭售后不合理',
        statusCode: 1004,
        status: 'CLOSE_AFTER_SALE_UNREASONABLE'
      }, {
        text: '电话联系超过3次',
        statusCode: 1005,
        status: 'PHONE_CONNECTION_THREE'
      }, {
        text: '服务态度差',
        statusCode: 1006,
        status: 'SERVICE_ATTITUDE_BAD'
      }],
      [{
        text: '售后申请不便',
        statusCode: 1001,
        status: 'APPLY_BOTHER_NOT_CONVENIENT'
      }, {
        text: '处理时间过长',
        statusCode: 1002,
        status: 'DISPOSE_TIME_LONG'
      }, {
        text: '结果不满意',
        statusCode: 1003,
        status: 'RESULT_BAD'
      }, {
        text: '关闭售后不合理',
        statusCode: 1004,
        status: 'CLOSE_AFTER_SALE_UNREASONABLE'
      }, {
        text: '电话联系超过3次',
        statusCode: 1005,
        status: 'PHONE_CONNECTION_THREE'
      }, {
        text: '服务态度差',
        statusCode: 1006,
        status: 'SERVICE_ATTITUDE_BAD'
      }],
      [{
        text: '售后申请不便',
        statusCode: 1001,
        status: 'APPLY_BOTHER_NOT_CONVENIENT'
      }, {
        text: '处理时间过长',
        statusCode: 1002,
        status: 'DISPOSE_TIME_LONG'
      }, {
        text: '电话联系超过3次',
        statusCode: 1005,
        status: 'PHONE_CONNECTION_THREE'
      }],
      [{
        text: '处理结果满意',
        statusCode: 2001,
        status: 'PROCESS_RESULT_GOOD'
      }, {
        text: '态度好服务棒',
        statusCode: 2002,
        status: 'SERVICE_ATTITUDE_GOOD'
      }, {
        text: '申请售后界面便捷',
        statusCode: 2003,
        status: 'APPLY_BOTHER_CONVENIENT'
      }, {
        text: '处理时间快',
        statusCode: 2004,
        status: 'PROCESS_TIME_QUICK'
      }],
      [{
        text: '处理结果满意',
        statusCode: 2001,
        status: 'PROCESS_RESULT_GOOD'
      }, {
        text: '态度好服务棒',
        statusCode: 2002,
        status: 'SERVICE_ATTITUDE_GOOD'
      }, {
        text: '申请售后界面便捷',
        statusCode: 2003,
        status: 'APPLY_BOTHER_CONVENIENT'
      }, {
        text: '处理时间快',
        statusCode: 2004,
        status: 'PROCESS_TIME_QUICK'
      }]
    ], //保存售后评价列表
  },
  props: {
    showComments: true,
    response: {},
  },
  didMount() {
    this.setData({
      response: this.props.response,
    })

    this.resetData()
  },
  didUpdate() { },
  didUnmount() {
    // this.resetData()
  },
  methods: {
    // 重置数据
    resetData() {
      this.setData({
        reasonList: JSON.parse(JSON.stringify(this.data.stableReasonList)),
        selectedList: [],
        activeIndex: 5
      })

    
    },
    selectStar(e) {
      var index = e.currentTarget.dataset.index * 1;
      let selectedList = index == this.data.activeIndex ? this.data.selectedList : []
      let reasonList = Object.assign([], this.data.reasonList)
      //如果不是同一个则要重置选中的元素
      if (index != this.data.activeIndex) {
        for (let i = 0; i < reasonList.length; i++) {
          let item = reasonList[i]
          for (let j = 0; j < item.length; j++) {
            item[j].taped = false
          }
        }
      }
      this.setData({
        activeIndex: index,
        selectedList,
        reasonList
      })
    },
    submit() {
      let that = this;
      let data = {
        workOrderId: this.data.response.workOrderId,
        star: this.data.activeIndex,
        afterSaleComments: this.data.selectedList.join(',')
      }

      http.post(api.ORDER.aftersale_comment_save, data, res => {
        let result = {
          showComment: false,
          showMes: '提交成功',
          success: true
        }
        that.resetData()
        that.props.onSubmitEnding(result);
      }, err => {
        let result = {
          showComment: false,
          showMes: err ? err : '提交失败',
          success: false
        }
        that.resetData()
        that.props.onSubmitEnding(result);
      })

    },

    getCommentText(e) {
      var that = this;
      that.setData({
        comment: e.detail.value
      })
    },
    closeComment() {
      var showComments = false;
      this.resetData()
      this.props.onCloseComment(showComments);
    },

    // 原因选择
    reasonTap(e) {
      let {
        index
      } = e.currentTarget.dataset
      let reasonList = Object.assign([], this.data.reasonList)
      let selectedList = Object.assign([], this.data.selectedList)
      let activeIndex = this.data.activeIndex
      // 如果当前是选中状态，则要变为未选中，且清除其选中纪录
      if (reasonList[activeIndex - 1][index].taped) {
        reasonList[activeIndex - 1][index].taped = false
        let deleteIndex = 0
        for (let i = 0; i < selectedList.length; i++) {
          if (selectedList[i] == reasonList[activeIndex - 1][index].status) {
            deleteIndex = i
          }
        }
        selectedList.splice(deleteIndex, 1)
      } else {
        reasonList[activeIndex - 1][index].taped = true
        selectedList.push(reasonList[activeIndex - 1][index].status)
      }

      this.setData({
        reasonList,
        selectedList
      })
    }
  },
});
