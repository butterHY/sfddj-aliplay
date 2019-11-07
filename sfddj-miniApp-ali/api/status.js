import env from './env'

// 定义错误码、全局方法

export default {
  SUCCESS: '200', //成功
//   NEED_SHOW_DIALOG: '120001', //需要弹窗
//   NOT_SHOW_DIALOG: '120002', //不需要弹窗
  RE_LOGIN: '202', //未登录
  NOTAGREEPRIVACY_LOGIN: '203', //未同意隐私政策
  TOKENINVALID_LOGIN2: '204', //token失效
  ARGUMENTERROR_LOGIN : '210', //参数错误
  OPERATIONFAIL_LOGIN: '211', //操作失败
  // TOKENINVALID_LOGIN: '212', //token失效
  USERNOTBIND_LOGIN: '206', //用户未绑定  v1.2.0
  // USERNOTBIND_LOGIN: '213', //用户未绑定 v1.2.0之前
  ERROE_FALSE_LOGIN: true,
  BIND_ERR: '236', // 用户绑定异常
  
  	// s200(200,"访问成功"),
	// s201(201,"系统异常"),
	// u202(202,"未登录"),
	// u203(203,"未注册"),
	// u208(208,"请求来源非法"),
	// c(200,"访问成功"),
	
	// notAgreePrivacy(209,"未同意隐私政策"),
	// argumentError(210,"参数错误"),
	// operationFail(211,"操作失败"),
	// tokenInvalid(212,"token失效"),
	// userNotBind(213,"用户未绑定"),
//   GOODS_NUM_ERROR: '6001' //商品数量错误
  // 新增v1.1.0 用户读取协议后，点击同意协议或者不同意协议字段   01386297
  agreeTreaty: false,
  // 新增v1.1.0 更改协议的方式
  setAgreeTreaty(status) {
    this.agreeTreaty = status
  },
  hasName: /^[\u4E00-\u9FA5|\s|a-z|A-Z]{1,10}$/g,
  setCopyOrderNo(orderNo) {
    // 长按订单号复制剪贴板
    if (orderNo && typeof orderNo === 'string' || typeof orderNo === 'number') {
      my.setClipboard({
        text: orderNo,
        success: () => {
          my.alert({
            title: '提示',
            content: `复制成功！单号：${orderNo}`
          });
        }
      });
    } else {
      my.showToast({
        content: '复制失败~'
      })
    }
  },
  // try catch 捕获的异常提示（只在开发环境显示）
  showError (e, position) {
    if (env === 'developer') {
      console.log(`
      位置：${position},
      捕获异常信息：${JSON.stringify(e)}
      `)
    }
  },
}