const express = require("express");
const router = express.Router();
const { RecycleBin } = require("../models");
const { authenticate } = require("../middleware/auth");

// 获取回收站列表
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { userId } = req.query;

    const where = {};
    if (userId) {
      where.userId = userId;
    } else if (req.user.role !== "admin") {
      // 非管理员只能看到自己的回收站
      where.userId = req.user.id;
    }

    const items = await RecycleBin.findAll({
      where,
      order: [["deletedAt", "DESC"]],
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

// 添加到回收站（创建回收项）
router.post("/", authenticate, async (req, res, next) => {
  try {
    const itemData = req.body;

    // 基本校验
    if (!itemData || !itemData.originalId) {
      return res.status(400).json({
        success: false,
        message: "回收项数据不完整，缺少 originalId",
      });
    }

    // 判断是答题记录还是问卷
    const isAnswer = itemData.type === "answer";

    // 创建回收站记录
    const newItem = await RecycleBin.create({
      id: itemData.originalId, // 使用 originalId 作为主键
      surveyId: itemData.surveyId,
      title: isAnswer
        ? itemData.survey?.title || itemData.title || "未知问卷"
        : itemData.title || "未知问卷",
      description: isAnswer
        ? `答题记录 - ${itemData.survey?.title || "未知问卷"}`
        : itemData.description || "",
      category: isAnswer
        ? itemData.survey?.category || itemData.category || "未分类"
        : itemData.category || "未分类",
      originalStatus: isAnswer
        ? "answered"
        : itemData.status || itemData.originalStatus || "draft",
      questions: isAnswer
        ? itemData.answers?.length || 0
        : itemData.questions || 0,
      userId: itemData.userId,
      authorId: itemData.authorId || itemData.userId,
      deletedBy: req.user.id,
      deletedAt: itemData.deletedAt || new Date(),
      surveyData: itemData, // 保存完整数据以便恢复
    });

    res.json({
      success: true,
      data: newItem,
      message: "已移至回收站",
    });
  } catch (error) {
    next(error);
  }
});

// 恢复问卷
router.post("/:id/restore", authenticate, async (req, res, next) => {
  try {
    const item = await RecycleBin.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "回收站项不存在",
      });
    }

    // TODO: 实现恢复逻辑

    res.json({
      success: true,
      message: "恢复成功",
    });
  } catch (error) {
    next(error);
  }
});

// 永久删除
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const item = await RecycleBin.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "回收站项不存在",
      });
    }

    await item.destroy();

    res.json({
      success: true,
      message: "永久删除成功",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
