import api from './api'
// import sendRequest send './http'
import sendRequest from '../utils/sendRequest'

export default {
  // 运单查询
  queryWaybillInfo (params, header) {
    return new Promise((resolve, reject) => {
      sendRequest.send(api.QUERY_SISBYBNO, params, res => {resolve(res)}, err => {resolve(err)})
    })
  },
  // 我收的/我寄的
  getMyExpress (params) {
    return new Promise((resolve, reject) => {
      sendRequest.send(api.QUERY_EXPRESS, params, res => {resolve(res)}, err => {resolve(err)})
    })
  },
  // 我的订单 查询所有订单 v1.2.0之后，新接口
  getMine (params) {
    return new Promise((resolve, reject) => {
      sendRequest.send(api.NEW_QUERY_ALL_ORDER, params, res => {resolve(res)}, err => {resolve(err)})
    })
  },
  // 取消订单
  cancelOrder (params) {
    return new Promise((resolve, reject) => {
      sendRequest.send(api.CANCLE_ORDER, params, res => {resolve(res)}, err => {resolve(err)})
    })
  },
  // 删除运单
  removeMyExpress (params) {
    return new Promise((resolve, reject) => {
      sendRequest.send(api.REMOVE_EXPRESS, params, res => {resolve(res)}, err => {resolve(err)})
    })
  },
  // 删除订单
  deleteMyOrder (params) {
    return new Promise((resolve, reject) => {
      sendRequest.send(api.SHANCHU_EXPRESS, params, res => {resolve(res)}, err => {resolve(err)}, "GET")
    })
  },
  // 查单历史记录
  queryHistory (params) {
    return new Promise((resolve, reject) => {
      sendRequest.send(api.QUERY_HISTORY, params, res => {resolve(res)}, err => {resolve(err)})
    })
  },
  // 删除查单历史记录
  deleteRecord (params) {
    return new Promise((resolve, reject) => {
      sendRequest.send(api.DELETE_QUERY_HISTORY, params, res => {resolve(res)}, err => {resolve(err)})
    })
  },
  // 查询运费
  searchFee (params) {
    return new Promise((resolve, reject) => {
      sendRequest.send(api.QEURY_COST, params, res => {resolve(res)}, err => {resolve(err)})
    })
  },
}