const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserBadge = sequelize.define(
  "UserBadge",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "用户ID",
    },
    badgeId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "徽章ID (如果为空则使用id字段)",
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "进度百分比",
    },
    unlockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "解锁时间",
    },
  },
  {
    tableName: "user_badges",
    timestamps: false,
    comment: "用户徽章关联表(成就表)",
  }
);

module.exports = UserBadge;
