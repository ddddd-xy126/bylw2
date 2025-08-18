import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Answer = sequelize.define('Answer', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    questionnaireId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    detail: { type: DataTypes.JSON, allowNull: false }
  }, { tableName: 'answers' })
  return Answer
}


