import request from '../utils/request'

export function payOrder(data) {
    return request({
        url: '/payment/pay',
        method: 'post',
        data
    })
}