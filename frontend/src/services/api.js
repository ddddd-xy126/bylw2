import axios from 'axios'
import { useAuthStore } from '../stores/index.js'

const api = axios.create({
	baseURL: 'http://localhost:3001/api',
	timeout: 8000
})

api.interceptors.request.use((config) => {
	const auth = useAuthStore()
	if (auth.token) {
		config.headers = config.headers || {}
		config.headers.Authorization = `Bearer ${auth.token}`
	}
	return config
})

export default api
