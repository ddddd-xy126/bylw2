const express = require("express");
const router = express.Router();
const { Badge } = require("../models");

// 获取所有徽章
router.get("/", async (req, res, next) => {
  try {
    const badges = await Badge.findAll({
      order: [["requirement", "ASC"]],
    });

    res.json(badges);
  } catch (error) {
    next(error);
  }
});

// 获取单个徽章
router.get("/:id", async (req, res, next) => {
  try {
    const badge = await Badge.findByPk(req.params.id);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "徽章不存在",
      });
    }

    res.json(badge);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
