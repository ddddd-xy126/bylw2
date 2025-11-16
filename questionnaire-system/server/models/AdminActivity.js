const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AdminActivity = sequelize.define(
  "AdminActivity",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    adminName: DataTypes.STRING(50),
    title: DataTypes.STRING(200),
    description: DataTypes.TEXT,
    type: DataTypes.STRING(50),
  },
  {
    tableName: "admin_activities",
    updatedAt: false,
  }
);

module.exports = AdminActivity;
