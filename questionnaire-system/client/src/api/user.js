import axios from 'axios'

const instance = axios.create({ baseURL: '/api' })

export const loginApi = (data) => instance.post('/user/login', data)
export const registerApi = (data) => instance.post('/user/register', data)
export const profileApi = () => instance.get('/user/profile')


