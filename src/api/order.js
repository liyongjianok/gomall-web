import request from '../utils/request'

// 创建订单
export function createOrder(data) {
    return request({
        url: '/order/create',
        method: 'post',
        data // { address_id: 1 }
    })
}

// 获取订单列表
export function getOrderList() {
    return request({
        url: '/order/list',
        method: 'get'
    })
}