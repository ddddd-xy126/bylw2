import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING(120), unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING(120), allowNull: false },
    nickname: { type: DataTypes.STRING(60), allowNull: true },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' }
  }, { tableName: 'users' })
  return User
}


