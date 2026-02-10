import request from '../utils/request'

// 获取地址列表
export function getAddressList() {
    return request({
        url: '/address/list',
        method: 'get'
    })
}

// 新增地址 (简单实现，方便测试)
export function addAddress(data) {
    return request({
        url: '/address/add',
        method: 'post',
        data
    })
}