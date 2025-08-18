import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Questionnaire = sequelize.define('Questionnaire', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('draft', 'pending', 'published', 'closed', 'deleted'), defaultValue: 'draft' },
    creatorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  }, { tableName: 'questionnaires' })
  return Questionnaire
}


