import request from '../utils/request'

// 加入购物车
export function addCartItem(data) {
    return request({
        url: '/cart/add',
        method: 'post',
        data // { sku_id: 1, quantity: 1 }
    })
}

// 获取购物车列表 
export function getCartList() {
    return request({
        url: '/cart/list',
        method: 'get'
    })
}

// 删除购物车商品 
export function deleteCartItem(data) {
    return request({
        url: '/cart/delete',
        method: 'post',
        data // { sku_id: 123 }
    })
}