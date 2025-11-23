const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Report = sequelize.define(
  "Report",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "用户ID",
    },
    surveyId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "问卷ID",
    },
    answerId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "答案ID",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "报告标题",
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      comment: "报告内容",
    },
    surveyTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "问卷标题",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "问卷分类",
    },
    status: {
      type: DataTypes.ENUM("generating", "completed", "failed"),
      defaultValue: "generating",
      comment: "报告状态",
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "生成时间",
    },
  },
  {
    tableName: "reports",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["surveyId"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

module.exports = Report;
