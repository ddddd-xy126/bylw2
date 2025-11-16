const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Comment = sequelize.define(
  "Comment",
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
    username: DataTypes.STRING(50),
    avatar: DataTypes.STRING(255),
    rating: DataTypes.DECIMAL(2, 1),
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "comments",
  }
);

module.exports = Comment;
