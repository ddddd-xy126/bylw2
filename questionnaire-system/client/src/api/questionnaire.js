import axios from 'axios'

const instance = axios.create({ baseURL: '/api' })

export const listQuestionnaires = (params) => instance.get('/questionnaire', { params })
export const createQuestionnaire = (data, token) => instance.post('/questionnaire', data, { headers: { Authorization: `Bearer ${token}` } })


