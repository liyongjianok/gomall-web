import request from '../utils/request'

export function getAddressList() {
    return request({ url: '/address/list', method: 'get' })
}

export function createAddress(data) {
    return request({ url: '/address/create', method: 'post', data })
}

export function updateAddress(data) {
    return request({ url: '/address/update', method: 'post', data })
}

export function deleteAddress(address_id) {
    return request({ url: '/address/delete', method: 'post', data: { address_id } })
}