// 前端问卷逻辑引擎：基于问卷 JSON 的条件与跳转规则

// condition: { op: 'eq'|'ne'|'gt'|'lt'|'in'|'includes', key: 'q1', value: any }
export function evaluateCondition(condition, answers) {
  const left = answers[condition.key]
  const right = condition.value
  switch (condition.op) {
    case 'eq': return left === right
    case 'ne': return left !== right
    case 'gt': return Number(left) > Number(right)
    case 'lt': return Number(left) < Number(right)
    case 'in': return Array.isArray(right) && right.includes(left)
    case 'includes': return Array.isArray(left) && left.includes(right)
    default: return false
  }
}

// logicRules: [{ when: [condition...], goTo: 'questionId' }]
export function resolveNext(question, answers, defaultNextId) {
  const rules = question?.logicRules || []
  for (const rule of rules) {
    const ok = (rule.when || []).every(c => evaluateCondition(c, answers))
    if (ok) return rule.goTo
  }
  return defaultNextId
}

export function getQuestionById(qn, id) {
  return qn.questions.find(q => q.id === id) || null
}

export function getFirstQuestion(qn) {
  return qn.questions.sort((a,b)=>a.order-b.order)[0]
}


