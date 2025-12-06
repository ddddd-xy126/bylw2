const { Category } = require("../models");

// 获取所有分类
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [["displayOrder", "ASC"]],
    });

    // 前端期望直接数组,axios拦截器会解包data
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// 获取单个分类
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "分类不存在",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 通过 slug 获取分类
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "分类不存在",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 创建分类（管理员）
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;

    const category = await Category.create({
      name,
      slug,
      description,
    });

    res.status(201).json({
      success: true,
      message: "分类创建成功",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 更新分类（管理员）
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "分类不存在",
      });
    }

    await category.update({
      name,
      slug,
      description,
    });

    res.json({
      success: true,
      message: "分类更新成功",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 删除分类（管理员）
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "分类不存在",
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: "分类删除成功",
    });
  } catch (error) {
    next(error);
  }
};
