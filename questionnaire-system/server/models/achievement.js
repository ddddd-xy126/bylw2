import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Achievement = sequelize.define(
    "Achievement",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      points: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
      badges: { type: DataTypes.JSON, allowNull: true },
    },
    { tableName: "achievements" }
  );
  return Achievement;
};
