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
      type: DataTypes.ENUM("draft", "pending", "published", "stopped", "rejected"),
      defaultValue: "draft",
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    authorId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "作者ID",
    },
    authorName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "作者名称",
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "作者",
    },
    creatorId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "创建者ID",
    },
    participants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "参与者数量",
    },
    participantCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    responses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "回复数量",
    },
    responseCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      comment: "评分",
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
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
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "缩略图",
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
