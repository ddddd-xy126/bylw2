export const list = async (req, res) => {
  const { Questionnaire } = req.db
  const items = await Questionnaire.findAll({ limit: 20, order: [['id', 'DESC']] })
  res.json({ items })
}

export const create = async (req, res) => {
  const { Questionnaire } = req.db
  const { title, description } = req.body
  const item = await Questionnaire.create({ title, description, creatorId: req.user.id })
  res.json({ id: item.id })
}

// 简化：按 ID 返回问卷 JSON（示例数据，后续可改为从 DB 组装 Question 列表返回）
export const getById = async (req, res) => {
  const { id } = req.params
  // 占位数据，前端执行跳转与计分
  const qn = {
    id: Number(id),
    title: '职业倾向评估（示例）',
    questions: [
      { id: 'q1', order: 1, type: 'single', content: '你更喜欢的工作方式？', options: [
        { label: '独立完成', value: 'A' }, { label: '团队协作', value: 'B' }
      ], logicRules: [ { when: [{ op: 'eq', key: 'q1', value: 'A' }], goTo: 'q2' } ] },
      { id: 'q2', order: 2, type: 'multiple', content: '你擅长的技能（多选）', options: [
        { label: '编程', value: 'code' }, { label: '沟通', value: 'comm' }, { label: '设计', value: 'design' }
      ] },
      { id: 'q3', order: 3, type: 'text', content: '请简要描述你的理想职业' }
    ]
  }
  res.json(qn)
}


