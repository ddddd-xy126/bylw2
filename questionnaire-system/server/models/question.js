import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Question = sequelize.define('Question', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    questionnaireId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    type: { type: DataTypes.ENUM('single', 'multiple', 'text', 'drag'), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    options: { type: DataTypes.JSON, allowNull: true },
    order: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 }
  }, { tableName: 'questions' })
  return Question
}


