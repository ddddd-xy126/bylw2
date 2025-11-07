import { ref, reactive, computed, watch } from 'vue'

/**
 * 答题逻辑 Composable
 * 处理答题状态、进度计算、跳转逻辑等
 */
export function useQuestionnaireLogic() {
  // 状态管理
  const answers = ref({})
  const committedAnswers = ref({})
  const currentQuestionIndex = ref(0)
  const visitedQuestions = ref(new Set())
  const questions = ref([])

  // 初始化方法
  const initializeLogic = (questionList) => {
    questions.value = questionList || []
  }

  // 计算属性
  const totalQuestions = computed(() => {
    return questions.value?.length || 0
  })

  const currentQuestion = computed(() => {
    const ordered = getOrderedQuestions()
    return ordered[currentQuestionIndex.value] || null
  })

  const isLastQuestion = computed(() => {
    return currentQuestionIndex.value === totalQuestions.value - 1
  })

  const answeredCount = computed(() => {
    return Object.keys(committedAnswers.value).length
  })

  // 获取排序后的问题列表
  const getOrderedQuestions = () => {
    if (!questions.value) return []
    return [...questions.value].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : a.id
      const orderB = b.order !== undefined ? b.order : b.id
      return orderA - orderB
    })
  }

  // 计算预期路径（用于进度计算）
  const computeExpectedPath = () => {
    const orderedQuestions = getOrderedQuestions()
    const path = []
    const seen = new Set()
    let idx = 0

    while (idx >= 0 && idx < orderedQuestions.length) {
      const q = orderedQuestions[idx]
      if (!q || seen.has(String(q.id))) break
      path.push(String(q.id))
      seen.add(String(q.id))

      // 检查跳转逻辑
      if (q.enableLogic && q.logicRules && q.logicRules.length > 0) {
        const userAnswer = committedAnswers.value[q.id]
        let matchedRule = null

        if (q.type === 'single') {
          matchedRule = q.logicRules.find(rule => rule.optionId === userAnswer)
        } else if (q.type === 'multiple' && Array.isArray(userAnswer)) {
          matchedRule = q.logicRules.find(rule => userAnswer.includes(rule.optionId))
        }

        if (matchedRule) {
          const targetIndex = matchedRule.targetQuestion - 1
          if (targetIndex >= 0 && targetIndex < orderedQuestions.length) {
            idx = targetIndex
            continue
          } else {
            break
          }
        }
      }

      idx++
    }

    return path
  }

  const expectedPath = computed(() => computeExpectedPath())

  const progressPercentage = computed(() => {
    const path = expectedPath.value
    if (!path || path.length === 0) return 0
    const answeredOnPath = path.filter(id => committedAnswers.value[id] !== undefined).length
    return (answeredOnPath / path.length) * 100
  })

  // 答案管理
  const setAnswer = (questionId, value) => {
    answers.value[questionId] = value
  }

  const commitAnswer = (questionId) => {
    const value = answers.value[questionId]
    committedAnswers.value[questionId] = value
    visitedQuestions.value.add(String(questionId))
  }

  const getAnswer = (questionId) => {
    return answers.value[questionId]
  }

  // 题目导航
  const goToQuestion = (index) => {
    if (index >= 0 && index < totalQuestions.value) {
      currentQuestionIndex.value = index
    }
  }

  const nextQuestion = (questionList) => {
    // 使用传入的问题列表或默认的
    const qs = questionList || questions.value
    
    // 检查跳转逻辑
    const question = currentQuestion.value
    if (question?.enableLogic && question.logicRules && question.logicRules.length > 0) {
      const userAnswer = answers.value[question.id]
      let matchedRule = null

      if (question.type === 'single') {
        matchedRule = question.logicRules.find(rule => rule.optionId === userAnswer)
      } else if (question.type === 'multiple' && Array.isArray(userAnswer)) {
        matchedRule = question.logicRules.find(rule => userAnswer.includes(rule.optionId))
      }

      if (matchedRule) {
        const targetIndex = matchedRule.targetQuestion - 1
        if (targetIndex >= 0 && targetIndex < totalQuestions.value) {
          currentQuestionIndex.value = targetIndex
          return 'jumped'
        }
      }
    }

    // 正常进入下一题
    if (isLastQuestion.value) {
      return 'complete'
    } else {
      currentQuestionIndex.value++
      return 'next'
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
      return true
    }
    return false
  }

  // 验证所有必答题
  const validateRequiredQuestions = (questionList) => {
    const qs = questionList || questions.value
    const unansweredRequired = qs.filter(q =>
      q.required && (answers.value[q.id] === undefined || answers.value[q.id] === null || answers.value[q.id] === '')
    )
    
    return {
      isValid: unansweredRequired.length === 0,
      unansweredRequired
    }
  }

  // 重置答题
  const resetAnswers = () => {
    answers.value = {}
    committedAnswers.value = {}
    currentQuestionIndex.value = 0
    visitedQuestions.value.clear()
  }

  // 监听当前题目变化
  watch(currentQuestion, (q) => {
    if (q && q.id !== undefined && q.id !== null) {
      visitedQuestions.value.add(String(q.id))
    }
  })

  return {
    // 状态
    answers,
    committedAnswers,
    currentQuestionIndex,
    visitedQuestions,

    // 计算属性
    totalQuestions,
    currentQuestion,
    isLastQuestion,
    answeredCount,
    expectedPath,
    progressPercentage,

    // 方法
    initializeLogic,
    getOrderedQuestions,
    setAnswer,
    commitAnswer,
    getAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    validateRequiredQuestions,
    resetAnswers
  }
}
