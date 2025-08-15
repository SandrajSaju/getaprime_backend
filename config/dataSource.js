const { DataSource } = require("typeorm");
const dotenv = require("dotenv");
const User = require("../models/User");
const Feature = require("../models/Feature");
const Tier = require("../models/Tier");

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // For dev only! Auto creates tables
  logging: false,
  entities: [User, Feature, Tier],
});

module.exports = {
    AppDataSource
}