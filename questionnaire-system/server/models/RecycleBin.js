const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RecycleBin = sequelize.define(
  "RecycleBin",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      comment: "回收站项ID(原问卷ID)",
    },
    surveyId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "原问卷ID",
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "问卷标题",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "问卷描述",
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "问卷分类",
    },
    originalStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "删除前的状态",
    },
    questions: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "题目数量",
    },
    userId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "用户ID",
    },
    authorId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "作者ID",
    },
    surveyData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "完整的问卷数据",
    },
    deletedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "删除操作者ID",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "删除时间",
    },
  },
  {
    tableName: "recycle_bin",
    timestamps: false,
    comment: "回收站表",
  }
);

module.exports = RecycleBin;
