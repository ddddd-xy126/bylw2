// 简单个性化推荐：基于用户标签与历史答题

// userTags: ['career','psychology']
// history: [{ questionnaireId, tags:[], score }]
// candidates: [{ id, title, tags:[], popularity }]
export function recommend(userTags, history, candidates, limit = 10) {
  const viewed = new Set(history.map(h => h.questionnaireId))
  const scoreTag = (q) => (q.tags || []).reduce((s, t) => s + (userTags.includes(t) ? 2 : 0), 0)
  const scored = candidates
    .filter(c => !viewed.has(c.id))
    .map(c => ({
      item: c,
      s: scoreTag(c) + (c.popularity || 0) * 0.1
    }))
    .sort((a,b)=>b.s-a.s)
    .slice(0, limit)
    .map(x => x.item)
  return scored
}


