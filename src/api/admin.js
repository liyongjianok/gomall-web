import request from '../utils/request'

// 1. 获取仪表盘统计
export function getStats() {
    return request({ url: '/admin/stats', method: 'get' })
}

// 2. 用户管理
export function getAdminUserList(params) {
    return request({ url: '/admin/users', method: 'get', params })
}

export function toggleUserStatus(data) {
    return request({ url: '/admin/user/toggle', method: 'post', data })
}

export function deleteAdminUser(id) {
    return request({ url: `/admin/user/${id}`, method: 'delete' })
}

// 3. 商品管理
export function getAdminProductList(params) {
    return request({ url: '/admin/products', method: 'get', params })
}

export function updateAdminProduct(data) {
    return request({ url: '/admin/product/update', method: 'post', data })
}

// 4. 订单管理
export function shipOrder(order_no) {
    return request({ url: '/admin/order/ship', method: 'post', data: { order_no } })
}