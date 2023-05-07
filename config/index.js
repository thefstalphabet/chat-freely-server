const dotenv = require("dotenv");
dotenv.config();

const { PORT, DB_URL, JWT_SECRET, NODE_ENV } = process.env;
module.exports = { PORT, DB_URL, JWT_SECRET, NODE_ENV };
