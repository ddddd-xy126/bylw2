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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "admin_activities",
    timestamps: false,
  }
);

// 添加虚拟字段 timestamp，映射到 createdAt
AdminActivity.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values.timestamp = values.createdAt;
  return values;
};

module.exports = AdminActivity;
