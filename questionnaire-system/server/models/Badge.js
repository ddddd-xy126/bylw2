const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Badge = sequelize.define(
  "Badge",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "徽章名称",
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "徽章描述",
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "徽章图标",
    },
    requirement: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "达成要求数量",
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "徽章类型：login_count, continuous_login, survey_count, create_count, publish_count, approved_count, favorite_count, comment_count, share_count, profile_complete, total_points, user_level",
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "获得该徽章奖励的积分",
    },
  },
  {
    tableName: "badges",
    timestamps: false,
    comment: "徽章表",
  }
);

module.exports = Badge;
