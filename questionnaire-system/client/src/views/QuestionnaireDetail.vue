<template>
  <div class="q-detail">
    <el-page-header :content="questionnaire?.title || '问卷详情'" @back="$router.back()" />
    <el-card style="margin-top:16px">
      <template v-if="loading">
        <el-skeleton :rows="5" animated />
      </template>
      <template v-else>
        <template v-if="current">
          <h3 style="margin: 0 0 12px">{{ current.content }}</h3>
          <div v-if="current.type==='single'">
            <el-radio-group v-model="answers[current.id]">
              <el-radio v-for="opt in current.options" :key="opt.value" :label="opt.value">{{ opt.label }}</el-radio>
            </el-radio-group>
          </div>
          <div v-else-if="current.type==='multiple'">
            <el-checkbox-group v-model="answers[current.id]">
              <el-checkbox v-for="opt in current.options" :key="opt.value" :label="opt.value">{{ opt.label }}</el-checkbox>
            </el-checkbox-group>
          </div>
          <div v-else>
            <el-input v-model="answers[current.id]" type="textarea" rows="4" placeholder="请输入" />
          </div>
          <div style="margin-top:16px; display:flex; gap:8px">
            <el-button @click="prev" :disabled="historyStack.length===0">上一步</el-button>
            <el-button type="primary" @click="next">下一步</el-button>
          </div>
        </template>
        <template v-else>
          <el-result icon="success" title="已完成">
            <template #sub-title>
              <div>得分：{{ finalScore }}</div>
            </template>
            <template #extra>
              <el-button type="primary" @click="restart">重新开始</el-button>
            </template>
          </el-result>
        </template>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { getFirstQuestion, getQuestionById, resolveNext } from '@/utils/logicEngine'
import { computeScore, normalizeScore } from '@/utils/scoring'

const route = useRoute()
const loading = ref(true)
const questionnaire = reactive({ id: null, title: '', questions: [] })

const rules = [
  { questionId: 'q1', type: 'map', weight: 10, map: { A: 8, B: 6 } },
  { questionId: 'q2', type: 'map', weight: 5, map: { code: 5, comm: 4, design: 4 } }
]

const answers = reactive({})
const historyStack = reactive([])
const currentId = ref(null)

const current = computed(() => getQuestionById(questionnaire, currentId.value))
const finalScore = ref(0)

onMounted(async () => {
  const { data } = await axios.get(`/api/questionnaire/${route.params.id}`)
  questionnaire.id = data.id
  questionnaire.title = data.title
  questionnaire.questions = data.questions
  currentId.value = getFirstQuestion(questionnaire)?.id || null
  loading.value = false
})

function next() {
  const cur = current.value
  if (!cur) return
  const defaultNext = getNextDefault(cur)
  const goTo = resolveNext(cur, answers, defaultNext)
  historyStack.push(cur.id)
  if (!goTo) {
    finalScore.value = normalizeScore(computeScore(rules, answers))
    currentId.value = null
  } else {
    currentId.value = goTo
  }
}

function prev() {
  const prevId = historyStack.pop()
  if (prevId) currentId.value = prevId
}

function getNextDefault(cur) {
  const ordered = [...questionnaire.questions].sort((a,b)=>a.order-b.order)
  const idx = ordered.findIndex(q => q.id === cur.id)
  return idx >= 0 && idx < ordered.length - 1 ? ordered[idx+1].id : null
}

function restart() {
  for (const k of Object.keys(answers)) delete answers[k]
  historyStack.splice(0, historyStack.length)
  currentId.value = getFirstQuestion(questionnaire)?.id || null
  finalScore.value = 0
}
</script>

<style scoped>
.q-detail { padding: 16px; }
</style>


