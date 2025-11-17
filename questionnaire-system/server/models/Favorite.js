const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Favorite = sequelize.define(
  "Favorite",
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
    surveyId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "问卷ID",
    },
  },
  {
    tableName: "favorites",
    updatedAt: false,
  }
);

module.exports = Favorite;
