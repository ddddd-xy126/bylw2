import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Comment = sequelize.define(
    "Comment",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      questionnaireId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      rating: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "comments" }
  );
  return Comment;
};
