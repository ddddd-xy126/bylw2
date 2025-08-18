import { defineStore } from 'pinia'
import { listQuestionnaires } from '@/api/questionnaire'

export const useQuestionnaireStore = defineStore('questionnaire', {
  state: () => ({
    list: [],
    loading: false
  }),
  actions: {
    async fetchList() {
      this.loading = true
      try {
        const { data } = await listQuestionnaires()
        this.list = data.items
      } finally {
        this.loading = false
      }
    }
  }
})


