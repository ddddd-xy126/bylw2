export const getAllUsers = async (req, res) => {
  const { User } = req.db;
  const users = await User.findAll({
    attributes: ["id", "email", "nickname", "role"],
  });
  res.json({ items: users });
};

export const deleteSurvey = async (req, res) => {
  const { Questionnaire } = req.db;
  const { id } = req.params;
  const count = await Questionnaire.destroy({ where: { id } });
  if (count === 0) return res.status(404).json({ message: "问卷不存在" });
  res.json({ ok: true });
};
