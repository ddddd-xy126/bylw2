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


