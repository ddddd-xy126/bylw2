// server/controllers/surveyController.js
// 问卷相关控制器
import { Op } from "sequelize";

export const getSurveys = async (req, res) => {
  try {
    const { Questionnaire, Category, User } = req.db;
    const { category, search } = req.query;

    const where = { status: "published" };
    if (category) where.categoryId = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const surveys = await Questionnaire.findAll({
      where,
      include: [
        { model: Category, attributes: ["name"] },
        { model: User, as: "creator", attributes: ["nickname"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ items: surveys });
  } catch (error) {
    console.error("getSurveys error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getSurveyDetail = async (req, res) => {
  try {
    const { Questionnaire, Question, Category, User } = req.db;
    const { id } = req.params;

    const survey = await Questionnaire.findByPk(id, {
      include: [
        { model: Category, attributes: ["name"] },
        { model: User, as: "creator", attributes: ["nickname"] },
        { model: Question, order: [["order", "ASC"]] },
      ],
    });

    if (!survey) return res.status(404).json({ message: "问卷不存在" });
    if (survey.status !== "published")
      return res.status(404).json({ message: "问卷未发布" });

    res.json(survey);
  } catch (error) {
    console.error("getSurveyDetail error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { Answer } = req.db;
    const { id } = req.params;
    const { answers, score } = req.body;

    const answer = await Answer.create({
      questionnaireId: id,
      userId: req.user.id,
      detail: { answers, submitTime: new Date(), score: score || 0 },
    });

    res.json({ id: answer.id, message: "提交成功" });
  } catch (error) {
    console.error("submitAnswer error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getSurveyComments = async (req, res) => {
  try {
    const { Comment, User } = req.db;
    const { id } = req.params;

    const comments = await Comment.findAll({
      where: { questionnaireId: id },
      include: [{ model: User, attributes: ["nickname"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ items: comments });
  } catch (error) {
    console.error("getSurveyComments error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const { Comment } = req.db;
    const { id } = req.params;
    const { rating, content } = req.body;

    const comment = await Comment.create({
      userId: req.user.id,
      questionnaireId: id,
      rating,
      content,
    });

    res.json({ id: comment.id, message: "评论成功" });
  } catch (error) {
    console.error("createComment error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};
