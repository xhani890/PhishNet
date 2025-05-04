import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Template = sequelize.define('Template', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  html: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  modifiedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'modified_date'
  },
  envelopeSender: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'envelope_sender'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'phishing'
  },
  complexity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
    tableName: 'templates',
    timestamps: false
  });

  export { Template };