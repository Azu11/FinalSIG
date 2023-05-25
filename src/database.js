const { Pool } = require("pg");
const { DB_HOST, DB_NAME, DB_PASS, DB_USER } = require("./config");

const pgpconnection = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: 5432,
});

pgpconnection.connect(function (err) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log("DB Conectada");
  }
});

module.exports = pgpconnection;
