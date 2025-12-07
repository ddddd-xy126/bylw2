const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Survey = sequelize.define(
  "Survey",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "创建者/作者ID",
    },
    // authorId 作为 userId 的别名，提高代码可读性
    authorId: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.userId;
      },
      set(value) {
        this.setDataValue("userId", value);
      },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: DataTypes.TEXT,
    category: DataTypes.STRING(100),
    categoryId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "问卷标签",
    },
    questions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "问题数量",
    },
    questionList: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "问卷设置",
    },
    status: {
      type: DataTypes.ENUM(
        "draft",
        "pending",
        "published",
        "stopped",
        "rejected"
      ),
      defaultValue: "draft",
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    participantCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "参与人数",
    },
    responseCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "回复数量",
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      comment: "平均评分",
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    favoriteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    duration: DataTypes.INTEGER,
    estimatedTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "预估时间(分钟)",
    },
    answerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "答案数量",
    },
    publishedAt: DataTypes.DATE,
  },
  {
    tableName: "surveys",
  }
);

module.exports = Survey;
