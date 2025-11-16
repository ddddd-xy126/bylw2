const express = require("express");
const router = express.Router();
const { Favorite, Survey, User } = require("../models");
const { authenticate } = require("../middleware/auth");

// 获取用户收藏列表
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { userId } = req.query;
    const requestUserId = userId || req.user.id;

    // 验证权限
    if (requestUserId !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "无权查看他人的收藏",
      });
    }

    const favorites = await Favorite.findAll({
      where: { userId: requestUserId },
      include: [
        {
          model: Survey,
          as: "survey",
          attributes: [
            "id",
            "title",
            "description",
            "category",
            "status",
            "participantCount",
            "averageRating",
            "createdAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
});

// 添加收藏
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { surveyId } = req.body;
    const userId = req.user.id;

    // 检查问卷是否存在
    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "问卷不存在",
      });
    }

    // 检查是否已收藏
    const existing = await Favorite.findOne({
      where: { userId, surveyId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "已经收藏过了",
      });
    }

    // 创建收藏
    const favorite = await Favorite.create({ userId, surveyId });

    // 更新问卷收藏数
    await survey.increment("favoriteCount");

    res.status(201).json({
      success: true,
      data: favorite,
      message: "收藏成功",
    });
  } catch (error) {
    next(error);
  }
});

// 取消收藏
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "收藏不存在",
      });
    }

    const surveyId = favorite.surveyId;
    await favorite.destroy();

    // 更新问卷收藏数
    const survey = await Survey.findByPk(surveyId);
    if (survey && survey.favoriteCount > 0) {
      await survey.decrement("favoriteCount");
    }

    res.json({
      success: true,
      message: "已取消收藏",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
