import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  const { User } = req.db;
  const users = await User.findAll({
    attributes: ["id", "email", "nickname", "role", "banned"],
  });
  res.json({ items: users });
};

export const seedAdmin = async (req, res) => {
  // allowed only when env var ALLOW_ADMIN_SEED is set to 'true'
  const allow = process.env.ALLOW_ADMIN_SEED === "true";
  if (!allow)
    return res.status(403).json({ message: "seeding admin disabled" });

  const { User } = req.db;
  const adminEmail = req.body.email || "admin@example.com";
  const adminPassword = req.body.password || "admin123";

  const existed = await User.findOne({ where: { email: adminEmail } });
  if (existed) return res.json({ ok: false, message: "admin already exists" });

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const user = await User.create({
    email: adminEmail,
    passwordHash,
    nickname: "admin",
    role: "admin",
  });
  return res.json({ ok: true, id: user.id, email: user.email });
};

export const createSurvey = async (req, res) => {
  const { Questionnaire } = req.db;
  const { title, description } = req.body;
  const item = await Questionnaire.create({
    title,
    description,
    creatorId: req.user.id,
  });
  res.json({ id: item.id });
};

export const deleteSurvey = async (req, res) => {
  const { Questionnaire } = req.db;
  const { id } = req.params;
  const count = await Questionnaire.destroy({ where: { id } });
  if (count === 0) return res.status(404).json({ message: "问卷不存在" });
  res.json({ ok: true });
};

export const listQuestions = async (req, res) => {
  const { Question } = req.db;
  const items = await Question.findAll({
    where: { questionnaireId: req.query.qid || null },
  });
  res.json({ items });
};

export const createQuestion = async (req, res) => {
  const { Question } = req.db;
  const { questionnaireId, type, content, options, order } = req.body;
  const item = await Question.create({
    questionnaireId,
    type,
    content,
    options,
    order,
  });
  res.json({ id: item.id });
};

export const deleteQuestion = async (req, res) => {
  const { Question } = req.db;
  const { id } = req.params;
  const count = await Question.destroy({ where: { id } });
  if (count === 0) return res.status(404).json({ message: "题目不存在" });
  res.json({ ok: true });
};

export const banUser = async (req, res) => {
  const { User } = req.db;
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: "用户不存在" });
  user.banned = true;
  await user.save();
  res.json({ ok: true });
};

export const unbanUser = async (req, res) => {
  const { User } = req.db;
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: "用户不存在" });
  user.banned = false;
  await user.save();
  res.json({ ok: true });
};

// create or update a user (admin only)
export const createUser = async (req, res) => {
  try {
    const { User } = req.db;
    const { email, password, nickname, role } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    const existed = await User.findOne({ where: { email } });

    if (existed) {
      // update existing user; password is optional
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        existed.passwordHash = passwordHash;
      }
      if (nickname) existed.nickname = nickname;
      if (role) existed.role = role;
      existed.banned = false;
      await existed.save();
      return res.json({
        ok: true,
        id: existed.id,
        email: existed.email,
        role: existed.role,
      });
    }

    // creating new user requires password
    if (!password)
      return res
        .status(400)
        .json({ message: "password is required for new user" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      nickname: nickname || email.split("@")[0],
      role: role || "admin",
      banned: false,
    });
    return res.json({
      ok: true,
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ message: "internal server error" });
  }
};

// delete user by id (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { User } = req.db;
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "用户不存在" });
    await user.destroy();
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "internal server error" });
  }
};
