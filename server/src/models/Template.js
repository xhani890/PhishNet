import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Template = sequelize.define('Template', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  html: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'phishing'
  },
  complexity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  envelopeSender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  modifiedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'templates',
  timestamps: true
});

// Add both default and named exports
export default Template;
export { Template };