const express = require("express");
const router = express.Router();
const { Announcement } = require("../models");
const { Op } = require("sequelize");

// 获取公告列表（公开接口，无需认证）
router.get("/", async (req, res, next) => {
  try {
    const {
      isActive,
      _sort = "publishedAt",
      _order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};

    // 过滤激活状态
    if (isActive !== undefined) {
      where.isActive = isActive === "true" || isActive === true;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      order: [[_sort, _order.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个公告
router.get("/:id", async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "公告不存在",
      });
    }

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
