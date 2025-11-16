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
    },
    surveyId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    surveyTitle: DataTypes.STRING(200),
    category: DataTypes.STRING(100),
    author: DataTypes.STRING(50),
    description: DataTypes.TEXT,
    participants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0,
    },
    duration: DataTypes.INTEGER,
  },
  {
    tableName: "favorites",
    updatedAt: false,
  }
);

module.exports = Favorite;
