import request from '../utils/request'

// 获取商品评价列表 (无需登录)
export function getReviewList(params) {
    return request({
        url: '/review/list',
        method: 'get',
        params // { product_id: 1, page: 1, page_size: 10 }
    })
}

// 提交商品评价 (需登录)
export function addReview(data) {
    return request({
        url: '/review/add',
        method: 'post',
        data
        /* { 
          order_no: 'xxx', sku_id: 1, product_id: 1, 
          content: '很赞', star: 5, sku_name: '红色' 
        } 
        */
    })
}

// 检查是否已评价 (需登录)
export function checkReviewStatus(params) {
    return request({
        url: '/review/status',
        method: 'get',
        params // { order_no: 'xxx', sku_id: 1 }
    })
}