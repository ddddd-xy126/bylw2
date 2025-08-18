// 通用计分：按题目规则累计分数
// rule 示例：{ questionId: 'q1', type: 'sum'|'map', weight: 1, map: { A: 5, B: 3 } }
export function computeScore(rules, answers) {
  let total = 0
  for (const r of rules) {
    const val = answers[r.questionId]
    if (r.type === 'sum') {
      total += Number(val || 0) * (r.weight || 1)
    } else if (r.type === 'map') {
      const add = Array.isArray(val)
        ? val.reduce((s, v) => s + (r.map?.[v] || 0), 0)
        : (r.map?.[val] || 0)
      total += add * (r.weight || 1)
    }
  }
  return total
}

export function normalizeScore(score, max = 100) {
  return Math.max(0, Math.min(max, score))
}


