const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PointHistory = sequelize.define(
  "PointHistory",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: DataTypes.STRING(200),
    type: {
      type: DataTypes.ENUM("earn", "spend"),
      defaultValue: "earn",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "point_histories",
    timestamps: false,
  }
);

module.exports = PointHistory;
