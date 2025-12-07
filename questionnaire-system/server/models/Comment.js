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
    rating: DataTypes.DECIMAL(2, 1),
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "comments",
  }
);

module.exports = Comment;
