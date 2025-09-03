import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.default.js";
import { Op } from "sequelize";

export const register = async (req, res) => {
  const { email, password, nickname } = req.body;
  const { User } = req.db;
  const existed = await User.findOne({ where: { email } });
  if (existed) return res.status(400).json({ message: "邮箱已注册" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, nickname });
  return res.json({ id: user.id });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { User } = req.db;
    // allow login by email or nickname
    const user = await User.findOne({
      where: { [Op.or]: [{ email }, { nickname: email }] },
    });
    if (!user) return res.status(400).json({ message: "用户不存在" });
    if (user.banned) return res.status(403).json({ message: "用户已被封禁" });
    if (!user.passwordHash)
      return res.status(400).json({ message: "无效的用户密码数据" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "密码错误" });
    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
      expiresIn: "7d",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("login error", e);
    return res.status(500).json({ message: "服务器内部错误" });
  }
};

export const profile = async (req, res) => {
  const { User } = req.db;
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: "未找到用户" });
  return res.json({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
  });
};
