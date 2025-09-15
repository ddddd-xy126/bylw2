import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Report = sequelize.define(
    "Report",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      questionnaireId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      type: { type: DataTypes.STRING(60), allowNull: true },
      content: { type: DataTypes.JSON, allowNull: true },
      chartData: { type: DataTypes.JSON, allowNull: true },
    },
    { tableName: "reports" }
  );
  return Report;
};
