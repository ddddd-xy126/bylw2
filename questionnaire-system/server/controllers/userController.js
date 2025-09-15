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

// 用户收藏相关
export const getFavorites = async (req, res) => {
  try {
    const { Favorite, Questionnaire, Category } = req.db;
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Questionnaire,
          include: [{ model: Category, attributes: ["name"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ items: favorites });
  } catch (error) {
    console.error("getFavorites error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { Favorite } = req.db;
    const { surveyId } = req.params;

    const [favorite, created] = await Favorite.findOrCreate({
      where: { userId: req.user.id, questionnaireId: surveyId },
    });

    res.json({
      id: favorite.id,
      message: created ? "收藏成功" : "已收藏",
    });
  } catch (error) {
    console.error("addFavorite error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { Favorite } = req.db;
    const { surveyId } = req.params;

    const count = await Favorite.destroy({
      where: { userId: req.user.id, questionnaireId: surveyId },
    });

    res.json({
      message: count > 0 ? "取消收藏成功" : "未找到收藏记录",
    });
  } catch (error) {
    console.error("removeFavorite error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

// 用户答卷记录
export const getAnswers = async (req, res) => {
  try {
    const { Answer, Questionnaire } = req.db;
    const answers = await Answer.findAll({
      where: { userId: req.user.id },
      include: [{ model: Questionnaire, attributes: ["title"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ items: answers });
  } catch (error) {
    console.error("getAnswers error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

// 用户成就
export const getAchievements = async (req, res) => {
  try {
    const { Achievement } = req.db;
    const achievement = await Achievement.findOne({
      where: { userId: req.user.id },
    });
    res.json(achievement || { points: 0, badges: [] });
  } catch (error) {
    console.error("getAchievements error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

// 用户报告
export const getReports = async (req, res) => {
  try {
    const { Report, Questionnaire } = req.db;
    const reports = await Report.findAll({
      where: { userId: req.user.id },
      include: [{ model: Questionnaire, attributes: ["title"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ items: reports });
  } catch (error) {
    console.error("getReports error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};
