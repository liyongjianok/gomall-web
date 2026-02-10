import request from '../utils/request'

// 获取地址列表
export function getAddressList() {
    return request({
        url: '/address/list',
        method: 'get'
    })
}

// 新增地址
export function addAddress(data) {
    return request({
        url: '/address/add',
        method: 'post',
        data // { name, mobile, province, city, district, detail_address }
    })
}