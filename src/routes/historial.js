const historialRouter = require("express").Router();
const pg = require("../database");

historialRouter.get("/", (req, res) => {
  const query = `
    SELECT
        *
    FROM
        caso_violencia 
  ;`;

  pg.query(query, (err, rows, fields) => {
    if (!err) {
      // console.log(rows);
      const results = rows.rows;
      res.json(results);
    } else {
      console.log(err);
    }
  });
});

module.exports = historialRouter;
