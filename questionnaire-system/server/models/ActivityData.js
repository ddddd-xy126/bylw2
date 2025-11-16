const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ActivityData = sequelize.define(
  "ActivityData",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
      comment: "日期",
    },
    users: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "当日活跃用户数",
    },
    surveys: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "当日创建问卷数",
    },
    answers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "当日提交答案数",
    },
  },
  {
    tableName: "activity_data",
    timestamps: false,
    comment: "每日活动统计数据表",
  }
);

module.exports = ActivityData;
