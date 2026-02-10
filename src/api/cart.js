import request from '../utils/request'

// 加入购物车
export function addToCart(data) {
    return request({
        url: '/cart/add',
        method: 'post',
        data // { sku_id: 1, quantity: 1 }
    })
}

// 获取购物车列表 (稍后开发购物车页面会用到)
export function getCartList() {
    return request({
        url: '/cart/list',
        method: 'get'
    })
}