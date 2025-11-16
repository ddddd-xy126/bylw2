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
    }

    const items = await RecycleBin.findAll({
      where,
      order: [["deletedAt", "DESC"]],
    });

    res.json(items);
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
