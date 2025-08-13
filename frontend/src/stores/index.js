import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
	state: () => ({ token: '', user: null }),
	actions: {
		setToken(token) { this.token = token },
		setUser(user) { this.user = user },
		logout() { this.token = ''; this.user = null }
	}
})
