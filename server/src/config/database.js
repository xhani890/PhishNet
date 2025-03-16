import dotenv from "dotenv";
dotenv.config();

console.log("🔍 DB_NAME:", process.env.DB_NAME);
console.log("🔍 DB_USER:", process.env.DB_USER);
console.log("🔍 DB_PASS:", process.env.DB_PASS ? "****" : "NOT FOUND!"); // Masked for security
console.log("🔍 DB_HOST:", process.env.DB_HOST);
console.log("🔍 DB_PORT:", process.env.DB_PORT);


import { Sequelize } from "sequelize"; // ✅ Import Sequelize

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT || 5432,
    logging: false,
});

export default sequelize;
