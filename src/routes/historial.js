const historialRouter = require("express").Router();
const pg = require("../database");

historialRouter.get("/", (req, res) => {
  const query = `
  SELECT
    historial.id_historial as id,
    historial.username,
    caso_violencia.departamen as departament,
    caso_violencia.municipio as municipio,  
    caso_violencia.sexo as sexo,
    caso_violencia.ocupacion as ocupacion,
    caso_violencia.calidad_victima as calidad_victima,
    caso_violencia.situacion as situacion
  FROM
    historial
  INNER JOIN
    caso_violencia
  ON
    historial.fk_caso = caso_violencia.gid
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

historialRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = `
      DELETE FROM historial WHERE id_historial = \$1;
    `;
  pg.query(query, [id], (err, result) => {
    if (!err) {
      console.log(`Registro con ID ${id} eliminado`);
      res.sendStatus(204); 
    } else {
      console.log(err);
      res.sendStatus(500);
    }
  });
});

historialRouter.post("/", (req, res) => {
  const { id_usuario, username, fk_caso } = req.body;

  const getMaxIDQuery = "SELECT MAX(id_historial) AS lastID FROM historial";
  pg.query(getMaxIDQuery, (error, results) => {
    if (!error) {
      const lastID = results.rows[0].lastid;
      const newID = lastID ? lastID + 1 : 1;

      const insertQuery = `
      INSERT INTO historial (
        id_historial,
        username,
        fk_caso
      ) VALUES (\$1, \$2, \$3)
    `;
    
      const insertParams = [newID, username, fk_caso];
      pg.query(insertQuery, insertParams, (error, results) => {
        if (!error) {
          console.log(
            `Registro insertado con id ${newID}, username ${username} y fk_caso ${fk_caso}`
          );
          res.sendStatus(204); // Respuesta sin contenido
        } else {
          console.log(error);
          res.status(500).json({ msg: "Error en la Base de Datos" });
        }
      });
    } else {
      console.log(error);
      res.status(500).json({ msg: "Error de servidor" });
    }
  });
});


module.exports = historialRouter;
