import request from '../utils/request'

// 获取商品列表 (支持分页、搜索)
export function getProductList(params) {
    return request({
        url: '/product/list',
        method: 'get',
        params // 会自动拼接到 URL 后面，例如 ?page=1&query=西红柿
    })
}

// 获取商品详情
export function getProductDetail(id) {
    return request({
        url: '/product/detail',
        method: 'get',
        params: { id }
    })
}

// 秒杀抢购接口 
export function seckillProduct(skuId) {
    return request({
        url: '/product/seckill',
        method: 'post',
        data: { sku_id: Number(skuId) } // 确保转为数字，后端需要 int64
    })
}