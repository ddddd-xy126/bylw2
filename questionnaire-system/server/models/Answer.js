const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Answer = sequelize.define(
  "Answer",
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
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    score: DataTypes.INTEGER,
    result: DataTypes.STRING(100),
    duration: DataTypes.INTEGER,
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "answers",
    timestamps: false,
  }
);

module.exports = Answer;
