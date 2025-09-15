import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Favorite = sequelize.define(
    "Favorite",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      questionnaireId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    { tableName: "favorites" }
  );
  return Favorite;
};
