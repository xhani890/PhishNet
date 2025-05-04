import { Sequelize } from "sequelize";
import { config } from "dotenv";

config();

console.log("🔍 DB_NAME:", process.env.DB_NAME);
console.log("🔍 DB_USER:", process.env.DB_USER);
console.log("🔍 DB_PASSWORD:", process.env.DB_PASSWORD ? "****" : "NOT FOUND!");
console.log("🔍 DB_HOST:", process.env.DB_HOST);
console.log("🔍 DB_PORT:", process.env.DB_PORT);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT || 5432,
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: false // Since we're using existing tables with custom timestamp fields
    }
  }
);

export default sequelize;