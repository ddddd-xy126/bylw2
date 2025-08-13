import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import QuestionnaireList from '../pages/QuestionnaireList.vue'
import QuestionnaireDetail from '../pages/QuestionnaireDetail.vue'
import Reports from '../pages/Reports.vue'
import Achievements from '../pages/Achievements.vue'
import Profile from '../pages/Profile.vue'

const routes = [
	{ path: '/', component: Home },
	{ path: '/questionnaires', component: QuestionnaireList },
	{ path: '/questionnaires/:id', component: QuestionnaireDetail },
	{ path: '/reports', component: Reports },
	{ path: '/achievements', component: Achievements },
	{ path: '/profile', component: Profile }
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router
